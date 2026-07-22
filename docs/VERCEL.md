# Menhir — Vercel & GitHub

_Last updated: 2026-07-16_

**Decision: deploy from GitHub, not local CLI.** Push to `main` → production.

Agent protocol (`do this` / `push` / `fix this`) lives in the workstation Cursor rule under `Menhir Holdings/.cursor/rules/` — not in this repo. This file is the deploy lattice only.

Scope all CLI calls:

```bash
npx vercel@54 <command> --scope menhir-holdings
```

## Team

| Item | Value |
|------|-------|
| Vercel team | `menhir-holdings` |
| GitHub | `menhir-holdings` |
| Canonical domain | `*.menhir-holdings.com` |

## Published lattice (front-facing)

| GitHub | Vercel | Canonical URL | Legacy alias |
|--------|--------|---------------|--------------|
| [stonehenge](https://github.com/menhir-holdings/stonehenge) | `stonehenge` | https://menhir-holdings.com | stonehenge-menhir-tech.vercel.app · menhir-holdings.vercel.app |
| [Matrix-Maze](https://github.com/menhir-holdings/Matrix-Maze) | `matrix-maze` | https://matrix-maze.menhir-holdings.com | matrix-maze-kappa.vercel.app |
| [Strob](https://github.com/menhir-holdings/Strob) | `strob` | https://strob.menhir-holdings.com | strob.vercel.app |
| [Vecchio](https://github.com/menhir-holdings/Vecchio) | `vecchio` | https://vecchio.menhir-holdings.com | vecchi.vercel.app |
| [JobJeeves](https://github.com/menhir-holdings/JobJeeves) | `jobjeeves` | https://jobjeeves.menhir-holdings.com | jobjeeves.vercel.app |
| [paid](https://github.com/menhir-holdings/paid) | `paid` | https://paid.menhir-holdings.com | paid-eight.vercel.app |
| [Gamma](https://github.com/menhir-holdings/Gamma) | `gamma` | https://gamma.menhir-holdings.com | gammacolor.vercel.app |
| [Vega](https://github.com/menhir-holdings/Vega) | `vega` | https://vega.menhir-holdings.com | vega-chi-ten.vercel.app |
| [inferno](https://github.com/menhir-holdings/inferno) | `inferno` | https://inferno.menhir-holdings.com | inferno-ruby.vercel.app |

## Retired

| Project | Notes |
|---------|-------|
| SyncStation | Deleted — Strob/Vecchio standalone again |
| BOB | Deleted — Vega is the website/gallery product |
| enjoyments_vectorized | Deleted with RnD |

## Hidden / internal tools (not on portal)

| GitHub | Vercel | Canonical URL | Notes |
|--------|--------|---------------|-------|
| [kaiser](https://github.com/menhir-holdings/kaiser) | `kaiser` | https://kaiser.menhir-holdings.com | Music stem preview. Own public repo (Hobby cannot Git-connect private org repos). Not in `src/data/projects.ts`. Alias: kaiser-mu.vercel.app |

`stonehenge/kaiser/` is a mirror stub — edit `Website/Kaiser` / `menhir-holdings/kaiser`.

## Other Vercel projects (not on apex portal)

`eido`, `mangaphile`, `musa`, `scenepeek`, `sandscope`, `bucephalus`, `pygmalion`, `reno-studios-com`, `mina-yu-portfolio`, `ledoit`, `movie-mash`, `college-cns`, `wall-street-beater`
