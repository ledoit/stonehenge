import { projects } from "./data/projects";
import { createField } from "./scene/field";

// Canonical host — *.vercel.app / www → menhir-holdings.com
(() => {
  const host = window.location.hostname;
  if (host === "menhir-holdings.com") return;
  if (host.endsWith(".vercel.app") || host === "www.menhir-holdings.com") {
    const next = new URL(window.location.href);
    next.hostname = "menhir-holdings.com";
    next.protocol = "https:";
    window.location.replace(next.toString());
  }
})();

const canvas = document.querySelector<HTMLCanvasElement>("#field")!;
const reticle = document.querySelector<HTMLElement>("#reticle");
const hud = document.querySelector<HTMLElement>("#hud")!;
const hudIndex = document.querySelector<HTMLElement>("#hud-index")!;
const hudName = document.querySelector<HTMLElement>("#hud-name")!;
const hudTag = document.querySelector<HTMLElement>("#hud-tag")!;
const veil = document.querySelector<HTMLElement>("#veil")!;
const a11y = document.querySelector<HTMLUListElement>("#a11y-list")!;
const hint = document.querySelector<HTMLElement>("#hud-hint");
const rail = document.querySelector<HTMLElement>(".rail");

const field = createField(canvas);

const mobile =
  window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;

if (mobile) field.setCompactFraming(true);

for (const [i, p] of projects.entries()) {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = p.href;
  a.textContent = `${i + 1}. ${p.name} — ${p.tagline}`;
  li.appendChild(a);
  a11y.appendChild(li);
}

function hostLabel(href: string): string {
  try {
    return new URL(href).host;
  } catch {
    return href;
  }
}

function showHud(index: number | null) {
  if (index === null) {
    hud.classList.remove("is-hot");
    return;
  }
  const p = projects[index]!;
  hudIndex.textContent = `${String(index + 1).padStart(2, "0")} · ${hostLabel(p.href)}`;
  hudName.textContent = p.name;
  hudTag.textContent = p.tagline;
  hud.classList.add("is-hot");
}

function focusStone(index: number, face = false) {
  if (face) field.faceStone(index);
  else field.setFocus(index);
  showHud(index);
}

let opening = false;
let pointerId: number | null = null;
let down = { x: 0, y: 0 };
let last = { x: 0, y: 0 };
let lastT = 0;
let dragged = false;
/** Recent samples for fling velocity (rad/s). */
const samples: { t: number; x: number }[] = [];
const DRAG_PX = mobile ? 12 : 8;
/** Radians of ring rotation per pixel of horizontal swipe. */
const RAD_PER_PX = (Math.PI * 2) / (Math.min(window.innerWidth, 420) * 1.15);

function syncFacingHud() {
  const idx = field.facingIndex();
  if (field.getFocus() !== idx) {
    field.setFocus(idx);
    showHud(idx);
  }
}

function restoreFromExit() {
  opening = false;
  pointerId = null;
  dragged = false;
  samples.length = 0;
  veil.classList.remove("is-entering");
  field.abortEnter();
  const idx = field.getFocus() ?? field.facingIndex();
  focusStone(idx, true);
  field.renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("pageshow", (e) => {
  restoreFromExit();
  if (e.persisted) {
    const gl = field.renderer.getContext();
    if (gl.isContextLost()) {
      window.location.reload();
    }
  }
});

window.addEventListener("pagehide", () => {
  if (opening) veil.classList.remove("is-entering");
});

async function openProject(index: number) {
  if (opening) return;
  opening = true;
  focusStone(index, true);
  veil.classList.add("is-entering");
  try {
    await field.enter(index);
    window.location.assign(projects[index]!.href);
  } catch {
    restoreFromExit();
  }
}

function pointerNorm(e: PointerEvent) {
  const rect = canvas.getBoundingClientRect();
  const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  return {
    nx: Math.max(-1, Math.min(1, nx)),
    ny: Math.max(-1, Math.min(1, ny)),
  };
}

function stepStone(dir: 1 | -1) {
  const cur = field.getFocus() ?? field.facingIndex();
  const next = (cur + dir + projects.length) % projects.length;
  focusStone(next, true);
}

function pushSample(x: number, t: number) {
  samples.push({ x, t });
  while (samples.length > 6) samples.shift();
}

function flingVelocity(): number {
  if (samples.length < 2) return 0;
  const a = samples[0]!;
  const b = samples[samples.length - 1]!;
  const dt = (b.t - a.t) / 1000;
  if (dt < 0.012) return 0;
  // Finger right → ring turns opposite (same as dragYaw sign)
  return -((b.x - a.x) * RAD_PER_PX) / dt;
}

if (hint) {
  hint.textContent = mobile
    ? "swipe the circle · tap to enter"
    : "move to turn · click or enter to open";
}
if (rail && mobile) {
  rail.innerHTML =
    "<span>flick to spin</span><span class=\"rail__sep\">·</span><span>tap enter</span>";
}

if (reticle && !mobile) {
  const showReticle = () => reticle.classList.add("is-active");
  const hideReticle = () => reticle.classList.remove("is-active");
  const moveReticle = (x: number, y: number) => {
    reticle.style.left = `${x}px`;
    reticle.style.top = `${y}px`;
  };

  window.addEventListener("pointermove", (e) => {
    moveReticle(e.clientX, e.clientY);
    showReticle();
  });
  window.addEventListener("pointerleave", hideReticle);
  document.addEventListener("mouseleave", hideReticle);
}

canvas.addEventListener("pointerdown", (e) => {
  if (pointerId !== null || opening) return;
  pointerId = e.pointerId;
  dragged = false;
  down = { x: e.clientX, y: e.clientY };
  last = { x: e.clientX, y: e.clientY };
  lastT = performance.now();
  samples.length = 0;
  pushSample(e.clientX, lastT);
  canvas.setPointerCapture(e.pointerId);
  field.setDragging(true);

  if (!mobile) {
    const hit = field.pick(e.clientX, e.clientY);
    if (hit !== null) focusStone(hit);
  }
});

canvas.addEventListener("pointermove", (e) => {
  if (opening) return;

  if (pointerId === e.pointerId) {
    const now = performance.now();
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };
    lastT = now;

    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_PX) {
      dragged = true;
    }

    if (dragged) {
      if (mobile) {
        // Horizontal drag turns the whole henge; vertical ignored for orbit
        field.dragYaw(-dx * RAD_PER_PX);
        pushSample(e.clientX, now);
        syncFacingHud();
      } else {
        field.orbit(dx, dy);
        syncFacingHud();
      }
    }
    return;
  }

  if (mobile) return;

  const { nx, ny } = pointerNorm(e);
  field.setLook(nx, ny);

  const hit = field.pick(e.clientX, e.clientY);
  if (hit !== null) {
    focusStone(hit);
  } else {
    syncFacingHud();
  }
});

function endPointer(e: PointerEvent) {
  if (pointerId !== e.pointerId) return;
  field.setDragging(false);
  try {
    canvas.releasePointerCapture(e.pointerId);
  } catch {
    /* already released */
  }
  pointerId = null;

  if (opening) return;

  if (mobile) {
    if (dragged) {
      pushSample(e.clientX, performance.now());
      field.flingYaw(flingVelocity());
      // HUD follows during coast via rAF poll
      return;
    }
    void openProject(field.getFocus() ?? field.facingIndex());
    return;
  }

  if (!dragged) {
    const hit = field.pick(e.clientX, e.clientY) ?? field.getFocus() ?? field.facingIndex();
    void openProject(hit);
  } else {
    syncFacingHud();
  }
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

// Keep HUD in sync while the ring is coasting / snapping
if (mobile) {
  const syncLoop = () => {
    if (!opening) syncFacingHud();
    requestAnimationFrame(syncLoop);
  };
  requestAnimationFrame(syncLoop);
}

canvas.addEventListener(
  "wheel",
  (e) => {
    if (mobile || opening) return;
    e.preventDefault();
    const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 40 : 1;
    field.orbit(e.deltaX * scale * 1.8, e.deltaY * scale * 1.8);
    syncFacingHud();
  },
  { passive: false },
);

window.addEventListener("keydown", (e) => {
  if (opening) return;

  if (e.key >= "1" && e.key <= String(projects.length)) {
    focusStone(Number(e.key) - 1, true);
    return;
  }

  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    e.preventDefault();
    stepStone(e.key === "ArrowRight" ? 1 : -1);
    return;
  }

  if (e.key === "Enter" || e.key === " ") {
    const cur = field.getFocus() ?? field.facingIndex();
    e.preventDefault();
    void openProject(cur);
  }
});

focusStone(0, true);
