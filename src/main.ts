import { projects } from "./data/projects";
import { createField } from "./scene/field";

const canvas = document.querySelector<HTMLCanvasElement>("#field")!;
const reticle = document.querySelector<HTMLElement>("#reticle");
const hud = document.querySelector<HTMLElement>("#hud")!;
const hudIndex = document.querySelector<HTMLElement>("#hud-index")!;
const hudName = document.querySelector<HTMLElement>("#hud-name")!;
const hudTag = document.querySelector<HTMLElement>("#hud-tag")!;
const hudEnter = document.querySelector<HTMLButtonElement>("#hud-enter")!;
const veil = document.querySelector<HTMLElement>("#veil")!;
const a11y = document.querySelector<HTMLUListElement>("#a11y-list")!;
const hint = document.querySelector<HTMLElement>("#hud-hint");

const field = createField(canvas);

const mobile = window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;

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

function syncHud() {
  showHud(field.getPresented() ?? field.getFocus());
}

function hoverPiece(index: number | null) {
  if (field.getPresented() !== null) {
    field.setFocus(index ?? field.getPresented());
    return;
  }
  field.setFocus(index);
  showHud(index);
}

function presentPiece(index: number | null) {
  field.present(index);
  if (index !== null) field.setFocus(index);
  syncHud();
}

let opening = false;
let pointerId: number | null = null;
let down = { x: 0, y: 0 };
let last = { x: 0, y: 0 };
let dragged = false;
const DRAG_PX = mobile ? 12 : 8;

function restoreFromExit() {
  opening = false;
  pointerId = null;
  dragged = false;
  veil.classList.remove("is-entering");
  field.abortEnter();
  const idx = field.getPresented() ?? field.getFocus();
  presentPiece(idx);
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
  presentPiece(index);
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

function stepPiece(dir: 1 | -1) {
  const cur = field.getPresented() ?? field.getFocus() ?? 0;
  const next = (cur + dir + projects.length) % projects.length;
  presentPiece(next);
}

if (hint) {
  hint.textContent = mobile ? "tap an object · enter" : "click an object · enter";
}

hudEnter.addEventListener("click", (e) => {
  e.stopPropagation();
  const cur = field.getPresented() ?? field.getFocus();
  if (cur !== null) void openProject(cur);
});

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
  canvas.setPointerCapture(e.pointerId);
  field.setDragging(true);
});

canvas.addEventListener("pointermove", (e) => {
  if (opening) return;

  if (pointerId === e.pointerId) {
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    last = { x: e.clientX, y: e.clientY };

    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > DRAG_PX) {
      dragged = true;
    }

    if (dragged) {
      field.orbit(dx, dy);
    }
    return;
  }

  if (mobile) return;

  const { nx, ny } = pointerNorm(e);
  field.setLook(nx, ny);

  const hit = field.pick(e.clientX, e.clientY);
  hoverPiece(hit);
});

canvas.addEventListener("pointerleave", () => {
  if (mobile || pointerId !== null || opening) return;
  field.releaseLook();
  if (field.getPresented() === null) hoverPiece(null);
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

  if (dragged) {
    field.releaseLook();
    return;
  }

  const hit = field.pick(e.clientX, e.clientY);
  const current = field.getPresented();

  if (hit === null) {
    presentPiece(null);
    return;
  }

  if (hit === current) {
    void openProject(hit);
    return;
  }

  presentPiece(hit);
}

canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);

canvas.addEventListener(
  "wheel",
  (e) => {
    if (mobile || opening) return;
    e.preventDefault();
    const scale = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 40 : 1;
    field.orbit(e.deltaX * scale * 1.8, e.deltaY * scale * 1.8);
  },
  { passive: false },
);

window.addEventListener("keydown", (e) => {
  if (opening) return;

  if (e.key >= "1" && e.key <= String(projects.length)) {
    presentPiece(Number(e.key) - 1);
    return;
  }

  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    e.preventDefault();
    stepPiece(e.key === "ArrowRight" ? 1 : -1);
    return;
  }

  if (e.key === "Escape") {
    presentPiece(null);
    return;
  }

  if (e.key === "Enter" || e.key === " ") {
    const cur = field.getPresented() ?? field.getFocus();
    if (cur === null) return;
    e.preventDefault();
    void openProject(cur);
  }
});
