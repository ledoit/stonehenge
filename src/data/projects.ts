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
 * Presentable lattice only — live vercel.app, complete enough to stand next to Quell.
 * Off-circle: Kaiser (hidden), Erudite/Suplex (blank WASM), Strob/Vecchio (PartyKit +
 * custom-domain redirects), JobJeeves (API shell), Paid (personal), Vega (parked),
 * Vantage/Silo/Gamolingo/menhir-web (not production), shelved work.
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
    id: "diaries",
    name: "Diaries",
    tagline: "Elite diaries, UIM Secretary, stats checker.",
    href: "https://diaries-gray.vercel.app",
    glow: "#d4b44a",
    height: 3.15,
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
