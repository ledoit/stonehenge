export type Project = {
  id: string;
  name: string;
  tagline: string;
  href: string;
  glow: string;
  height: number;
};

export const projects: Project[] = [
  {
    id: "matrix-maze",
    name: "Matrix Maze",
    tagline: "A labyrinth that remembers how you move",
    href: "https://matrix-maze.menhir-holdings.com",
    glow: "#7ec8a3",
    height: 3.4,
  },
  {
    id: "strob",
    name: "Strob",
    tagline: "One pulse. Every screen. Live color for rooms",
    href: "https://strob.menhir-holdings.com",
    glow: "#e8a87c",
    height: 2.9,
  },
  {
    id: "vecchio",
    name: "Vecchio",
    tagline: "Shared text that arrives before you finish typing",
    href: "https://vecchio.menhir-holdings.com",
    glow: "#c4b5a0",
    height: 3.1,
  },
  {
    id: "jobjeeves",
    name: "JobJeeves",
    tagline: "Résumé meets role — match what actually matters",
    href: "https://jobjeeves.menhir-holdings.com",
    glow: "#9bb7d4",
    height: 3.6,
  },
  {
    id: "paid",
    name: "Paid",
    tagline: "Morning clarity for people who get things done",
    href: "https://paid.menhir-holdings.com",
    glow: "#d4c48c",
    height: 2.7,
  },
  {
    id: "gamma",
    name: "Gamma",
    tagline: "Harmonic palettes cut from spectral math",
    href: "https://gamma.menhir-holdings.com",
    glow: "#e0a0a8",
    height: 3.2,
  },
];
