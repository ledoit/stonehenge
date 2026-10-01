export type Project = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  glow: string;
  height: number;
};

/** Canonical hub. */
export const hubUrl = "https://koalasalmon.com";

/**
 * Presentable lattice. Off-table: Kaiser (hidden), Suplex (blank WASM),
 * Vega (skeleton), Vantage/Silo/Gamolingo/menhir-web (not on the table).
 */
export const projects: Project[] = [
  {
    id: "quell",
    name: "Quell",
    tagline: "OLL / PLL flashcards. One toggle, one Next.",
    href: "https://quell.koalasalmon.com",
    glow: "#d4c4a8",
    height: 3.6,
  },
  {
    id: "freeze",
    name: "Freeze",
    tagline: "Pause every tab with one click.",
    href: "https://freeze.koalasalmon.com",
    glow: "#6ec8e0",
    height: 3.2,
  },
  {
    id: "prisma",
    name: "Prisma",
    tagline: "Harmonic palettes from spectral math.",
    href: "https://prisma.koalasalmon.com",
    glow: "#d74242",
    height: 3.05,
  },
  {
    id: "strob",
    name: "Strob",
    tagline: "Party lighting plot. One desk, many walls.",
    href: "https://strob.koalasalmon.com",
    glow: "#ff3d8a",
    height: 3.25,
  },
  {
    id: "vecchio",
    name: "Vecchio",
    tagline: "Shared text across devices. One code, many screens.",
    href: "https://vecchio.koalasalmon.com",
    glow: "#c4a574",
    height: 3.1,
  },
  {
    id: "paid",
    name: "Paid",
    tagline: "Morning work planner. Thirty-minute blocks.",
    href: "https://paid.koalasalmon.com",
    glow: "#e8d5a3",
    height: 3.0,
  },
  {
    id: "matrix-maze",
    name: "Matrix Maze",
    tagline: "Eight-level labyrinth. Web and desktop.",
    href: "https://matrix-maze.koalasalmon.com",
    glow: "#4ad46a",
    height: 3.35,
  },
  {
    id: "inferno",
    name: "Inferno",
    tagline: "LoL fight reads under motor load.",
    href: "https://inferno.koalasalmon.com",
    glow: "#ff5a1f",
    height: 3.45,
  },
  {
    id: "jobjeeves",
    name: "JobJeeves",
    tagline: "Hiring desk. File, screen, packet.",
    href: "https://jobjeeves.koalasalmon.com",
    glow: "#3d5c4a",
    height: 3.15,
  },
];
