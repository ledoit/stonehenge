export type Project = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  glow: string;
  height: number;
};

/** Canonical hub while menhir-holdings.com is unpaid. */
export const hubUrl = "https://menhir-holdings.vercel.app";

/**
 * Presentable lattice — live vercel.app. Diaries off-circle (Phil).
 * Off-circle: Kaiser (hidden), Erudite/Suplex (blank WASM), JobJeeves (API shell),
 * Vega (parked), Vantage/Silo/Gamolingo/menhir-web (not production), shelved work.
 */
export const projects: Project[] = [
  {
    id: "quell",
    name: "Quell",
    tagline: "OLL / PLL flashcards. One toggle, one Next.",
    href: "https://quellcube.vercel.app",
    glow: "#d4c4a8",
    height: 3.6,
  },
  {
    id: "freeze",
    name: "Freeze",
    tagline: "Pause every tab with one click.",
    href: "https://freeze-lilac.vercel.app",
    glow: "#6ec8e0",
    height: 3.2,
  },
  {
    id: "gamma",
    name: "Gamma",
    tagline: "Harmonic palettes from spectral math.",
    href: "https://gamma-three-lime.vercel.app",
    glow: "#d74242",
    height: 3.05,
  },
  {
    id: "strob",
    name: "Strob",
    tagline: "Live-synced mood lights. One controller, many viewers.",
    href: "https://strob-menhir-holdings.vercel.app",
    glow: "#ff3d8a",
    height: 3.25,
  },
  {
    id: "vecchio",
    name: "Vecchio",
    tagline: "Shared text across devices. One code, many screens.",
    href: "https://vecchio-menhir-holdings.vercel.app",
    glow: "#c4a574",
    height: 3.1,
  },
  {
    id: "paid",
    name: "Paid",
    tagline: "Morning work planner. Thirty-minute blocks.",
    href: "https://paid-menhir-holdings.vercel.app",
    glow: "#e8d5a3",
    height: 3.0,
  },
  {
    id: "matrix-maze",
    name: "Matrix Maze",
    tagline: "Eight-level labyrinth. Web and desktop.",
    href: "https://matmaz.vercel.app",
    glow: "#4ad46a",
    height: 3.35,
  },
  {
    id: "inferno",
    name: "Inferno",
    tagline: "LoL fight reads under motor load.",
    href: "https://inferno-ruby.vercel.app",
    glow: "#ff5a1f",
    height: 3.45,
  },
];
