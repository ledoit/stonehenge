import { MusicPreview } from "./music.ts";
import type { ProjectConfig } from "./types.ts";
import { STEM_NAMES, type StemName } from "./types.ts";

const PROJECTS = [
  { id: "matrix-maze", configPath: "/projects/matrix-maze/project.json" },
] as const;

const engine = new MusicPreview();
const stemVolumes = new Map<StemName, number>(
  STEM_NAMES.map((name) => [name, name === "base" ? 0.9 : 0.5]),
);
let sfxLevel = 1;

const app = document.getElementById("app");
if (!app) throw new Error("#app missing");
const root = app;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function btn(label: string, onClick: () => void): HTMLButtonElement {
  const button = el("button", "ctl", label);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function fieldset(label: string): { root: HTMLFieldSetElement; body: HTMLDivElement } {
  const root = el("fieldset", "blk");
  const legend = el("legend", "blk__hd", label);
  const body = el("div", "blk__bd");
  root.append(legend, body);
  return { root, body };
}

function row(cells: HTMLElement[]): HTMLDivElement {
  const line = el("div", "row");
  line.append(...cells);
  return line;
}

function cell(content: HTMLElement | string, className = "row__cell"): HTMLDivElement {
  const node = el("div", className);
  if (typeof content === "string") node.textContent = content;
  else node.append(content);
  return node;
}

function statusLine(): HTMLParagraphElement {
  return el("p", "stat", "init…");
}

function render(): void {
  root.innerHTML = "";
  const status = statusLine();

  const header = el("header", "hdr");
  header.append(el("h1", "hdr__title", "kaiser"), el("p", "hdr__sub", "music preview"));

  const projectBlk = fieldset("project");
  const projectSelect = el("select", "ctl ctl--select");
  for (const project of PROJECTS) {
    const option = el("option");
    option.value = project.id;
    option.textContent = project.id;
    projectSelect.append(option);
  }
  projectSelect.addEventListener("change", () => void loadSelectedProject(projectSelect, status));
  projectBlk.body.append(projectSelect);

  const stemsBlk = fieldset("stems");
  for (const name of STEM_NAMES) {
    const vol = stemVolumes.get(name) ?? 0.5;
    const slider = el("input", "ctl ctl--range") as HTMLInputElement;
    slider.type = "range";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.01";
    slider.value = String(vol);
    slider.addEventListener("input", () => {
      const value = Number(slider.value);
      stemVolumes.set(name, value);
      volRead.textContent = value.toFixed(2);
      engine.setStemVolume(name, value);
    });

    const volRead = el("span", "vol", vol.toFixed(2));
    const play = btn("play", () => void engine.playStem(name, Number(slider.value)));
    const stop = btn("stop", () => engine.stopStem(name));

    stemsBlk.body.append(
      row([
        cell(name, "row__label"),
        cell(play),
        cell(stop),
        cell(slider, "row__range"),
        cell(volRead, "row__vol"),
      ]),
    );
  }

  const mixBlk = fieldset("level mix");
  const mixStop = btn("stop", () => engine.stopMix());
  mixBlk.body.append(row([cell("all", "row__label"), cell(mixStop)]));

  for (let level = 1; level <= 8; level += 1) {
    const lvl = level;
    const play = btn(`L${lvl}`, () => void engine.playMix(lvl));
    mixBlk.body.append(row([cell(`level ${lvl}`, "row__label"), cell(play)]));
  }

  const sfxBlk = fieldset("sfx");
  const levelInput = el("input", "ctl ctl--num") as HTMLInputElement;
  levelInput.type = "number";
  levelInput.min = "1";
  levelInput.max = "8";
  levelInput.value = String(sfxLevel);
  levelInput.addEventListener("change", () => {
    sfxLevel = Math.max(1, Math.min(8, Number(levelInput.value) || 1));
    levelInput.value = String(sfxLevel);
  });
  const sfxPlay = btn("level_complete", () => void engine.playLevelComplete(sfxLevel));
  sfxBlk.body.append(
    row([
      cell("level_complete", "row__label"),
      cell(levelInput),
      cell(sfxPlay),
    ]),
  );

  root.append(header, status, projectBlk.root, stemsBlk.root, mixBlk.root, sfxBlk.root);
  void loadSelectedProject(projectSelect, status);
}

async function loadSelectedProject(
  select: HTMLSelectElement,
  status: HTMLParagraphElement,
): Promise<void> {
  const entry = PROJECTS.find((p) => p.id === select.value) ?? PROJECTS[0];
  status.textContent = `loading ${entry.id}…`;

  try {
    const response = await fetch(entry.configPath);
    if (!response.ok) throw new Error(`${response.status}`);
    const config = (await response.json()) as ProjectConfig;
    const basePath = entry.configPath.replace(/\/project\.json$/, "");
    await engine.loadProject(config, basePath);
    const source = engine.fallbackActive ? "procedural fallback" : "ogg stems";
    status.textContent = `${config.name} · ${source}`;
  } catch (error) {
    status.textContent = `load failed: ${String(error)}`;
  }
}

render();
