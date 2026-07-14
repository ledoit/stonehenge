# Menhir — Vercel & GitHub

_Last updated: 2026-07-13_

**Decision: deploy from GitHub, not local CLI.** Push to `main` → production.

Scope all CLI calls:

```bash
npx vercel@54 <command> --scope menhir-tech
```

## Team

| Item | Value |
|------|-------|
| Vercel team | `menhir-tech` |
| GitHub | `ledoit` |
| Canonical domain | `*.menhir-holdings.com` |

## Published lattice (front-facing)

| GitHub | Vercel | Canonical URL | Legacy alias |
|--------|--------|---------------|--------------|
| [stonehenge](https://github.com/ledoit/stonehenge) | `stonehenge` | https://menhir-holdings.com | stonehenge-menhir-tech.vercel.app · menhir-holdings.vercel.app |
| [Matrix-Maze](https://github.com/ledoit/Matrix-Maze) | `matrix-maze` | https://matrix-maze.menhir-holdings.com | matrix-maze-kappa.vercel.app |
| [Strob](https://github.com/ledoit/Strob) | `strob` | https://strob.menhir-holdings.com | strob.vercel.app |
| [Vecchio](https://github.com/ledoit/Vecchio) | `vecchio` | https://vecchio.menhir-holdings.com | vecchi.vercel.app |
| [JobJeeves](https://github.com/ledoit/JobJeeves) | `jobjeeves` | https://jobjeeves.menhir-holdings.com | jobjeeves.vercel.app |
| [paid](https://github.com/ledoit/paid) | `paid` | https://paid.menhir-holdings.com | paid-eight.vercel.app |
| [Gamma](https://github.com/ledoit/Gamma) | `gamma` | https://gamma.menhir-holdings.com | gammacolor.vercel.app |
| [Vega](https://github.com/ledoit/Vega) | `vega` | https://vega.menhir-holdings.com | vega-chi-ten.vercel.app |

## Retired

| Project | Notes |
|---------|-------|
| SyncStation | Deleted — Strob/Vecchio standalone again |
| BOB | Deleted — Vega is the website/gallery product |
| enjoyments_vectorized | Deleted with RnD |

## Other Vercel projects (not on apex portal)

`eido`, `mangaphile`, `musa`, `scenepeek`, `sandscope`, `bucephalus`, `pygmalion`, `reno-studios-com`, `mina-yu-portfolio`, `ledoit`, `movie-mash`, `college-cns`, `wall-street-beater`
