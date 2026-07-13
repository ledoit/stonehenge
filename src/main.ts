import { projects } from "./data/projects";
import { createField } from "./scene/field";

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
  a.textContent = `${i + 1}. ${p.name} (${p.canonical}) — ${p.tagline}`;
  li.appendChild(a);
  a11y.appendChild(li);
}

function showHud(index: number | null) {
  if (index === null) {
    hud.classList.remove("is-hot");
    return;
  }
  const p = projects[index]!;
  hudIndex.textContent = p.canonical;
  hudName.textContent = p.name;
  hudTag.textContent = p.tagline;
  hud.classList.add("is-hot");
}

let lastPointer = { x: 0, y: 0 };
let moved = false;
let opening = false;

async function openProject(index: number) {
  if (opening) return;
  opening = true;
  field.setFocus(index);
  showHud(index);
  veil.classList.add("is-entering");
  await field.enter(index);
  window.location.href = projects[index]!.href;
}

canvas.addEventListener("pointerdown", (e) => {
  moved = false;
  lastPointer = { x: e.clientX, y: e.clientY };
  canvas.setPointerCapture(e.pointerId);
  field.setDragging(true);
});

canvas.addEventListener("pointermove", (e) => {
  const dx = e.clientX - lastPointer.x;
  const dy = e.clientY - lastPointer.y;
  if (Math.hypot(dx, dy) > 4) moved = true;
  field.setPointer(dx, dy);
  lastPointer = { x: e.clientX, y: e.clientY };

  if (!field.getFocus() || !moved) {
    const hit = field.pick(e.clientX, e.clientY);
    field.setFocus(hit);
    showHud(hit);
  }
});

canvas.addEventListener("pointerup", (e) => {
  field.setDragging(false);
  field.setPointer(0, 0);
  if (!moved) {
    const hit = field.pick(e.clientX, e.clientY);
    if (hit !== null) void openProject(hit);
  }
});

canvas.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    field.orbit(e.deltaX + e.deltaY * 0.25, e.deltaY);
  },
  { passive: false },
);

window.addEventListener("keydown", (e) => {
  if (e.key >= "1" && e.key <= "6") {
    const index = Number(e.key) - 1;
    if (projects[index]) {
      field.setFocus(index);
      showHud(index);
    }
    return;
  }
  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
    const cur = field.getFocus() ?? -1;
    const next =
      e.key === "ArrowRight"
        ? (cur + 1) % projects.length
        : (cur - 1 + projects.length) % projects.length;
    field.setFocus(next);
    showHud(next);
    return;
  }
  if (e.key === "Enter") {
    const cur = field.getFocus();
    if (cur !== null) void openProject(cur);
  }
});

// Gentle intro focus on first stone after settle
window.setTimeout(() => {
  if (field.getFocus() === null) {
    field.setFocus(0);
    showHud(0);
  }
}, 900);
