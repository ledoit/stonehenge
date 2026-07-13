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
const hud = document.querySelector<HTMLElement>("#hud")!;
const hudIndex = document.querySelector<HTMLElement>("#hud-index")!;
const hudName = document.querySelector<HTMLElement>("#hud-name")!;
const hudTag = document.querySelector<HTMLElement>("#hud-tag")!;
const veil = document.querySelector<HTMLElement>("#veil")!;
const a11y = document.querySelector<HTMLUListElement>("#a11y-list")!;

const field = createField(canvas);

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
let dragged = false;
const DRAG_PX = 8;

function syncFacingHud() {
  const idx = field.facingIndex();
  if (field.getFocus() !== idx) {
    field.setFocus(idx);
    showHud(idx);
  }
}

async function openProject(index: number) {
  if (opening) return;
  opening = true;
  focusStone(index, true);
  veil.classList.add("is-entering");
  await field.enter(index);
  window.location.href = projects[index]!.href;
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

canvas.addEventListener("pointerdown", (e) => {
  if (pointerId !== null) return;
  pointerId = e.pointerId;
  dragged = false;
  down = { x: e.clientX, y: e.clientY };
  last = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  field.setDragging(true);

  const hit = field.pick(e.clientX, e.clientY);
  if (hit !== null) focusStone(hit);
});

canvas.addEventListener("pointermove", (e) => {
  if (pointerId === e.pointerId) {
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };

    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_PX) {
      dragged = true;
    }

    if (dragged) {
      field.orbit(dx, dy);
      syncFacingHud();
    }
    return;
  }

  // Free-look: cursor position orbits the full ring — no click required
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

  if (!dragged) {
    const hit = field.pick(e.clientX, e.clientY) ?? field.getFocus() ?? field.facingIndex();
    void openProject(hit);
  } else {
    syncFacingHud();
  }
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 40 : 1;
    field.orbit(e.deltaX * scale * 0.45, e.deltaY * scale * 0.45);
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
    const cur = field.getFocus() ?? field.facingIndex();
    const next =
      e.key === "ArrowRight"
        ? (cur + 1) % projects.length
        : (cur - 1 + projects.length) % projects.length;
    focusStone(next, true);
    return;
  }

  if (e.key === "Enter" || e.key === " ") {
    const cur = field.getFocus() ?? field.facingIndex();
    e.preventDefault();
    void openProject(cur);
  }
});

// Start facing first stone
focusStone(0, true);
