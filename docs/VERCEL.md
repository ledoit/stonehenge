# Menhir — Vercel & GitHub

_Last updated: 2026-09-10_

**Decision: deploy from GitHub, not local CLI.** Push to `main` → production.

**Canonical hub:** https://menhir-holdings.vercel.app  
`menhir-holdings.com` is unpaid — leftover DNS may still resolve; do not bookmark it, and do not redirect `*.vercel.app` to it.

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
| Canonical hub | https://menhir-holdings.vercel.app |

## Published lattice (front-facing)

| GitHub | Vercel | Canonical URL | Other alias |
|--------|--------|---------------|-------------|
| [stonehenge](https://github.com/menhir-holdings/stonehenge) | `stonehenge` | https://menhir-holdings.vercel.app | stonehenge-menhir-holdings.vercel.app |
| [quell](https://github.com/menhir-holdings/quell) | `quellcube` | https://quellcube.vercel.app | quellcube-menhir-holdings.vercel.app |
| [freeze](https://github.com/menhir-holdings/freeze) | `freeze` | https://freeze-lilac.vercel.app | freeze-menhir-holdings.vercel.app |
| [Gamma](https://github.com/menhir-holdings/Gamma) | `gamma` | https://gamma-three-lime.vercel.app | gamma-menhir-holdings.vercel.app · gammacolor.vercel.app |
| [Strob](https://github.com/menhir-holdings/Strob) | `strob` | https://strob-menhir-holdings.vercel.app | strob.vercel.app *(must not 308 to unpaid domain)* |
| [Vecchio](https://github.com/menhir-holdings/Vecchio) | `vecchio` | https://vecchio-menhir-holdings.vercel.app | vecchi.vercel.app |
| [paid](https://github.com/menhir-holdings/paid) | `paid` | https://paid-menhir-holdings.vercel.app | paid-eight.vercel.app |
| [Matrix-Maze](https://github.com/menhir-holdings/Matrix-Maze) | `matrix-maze` | https://matmaz.vercel.app | matrix-maze-kappa.vercel.app → matmaz |
| [inferno](https://github.com/menhir-holdings/inferno) | `inferno` | https://inferno-ruby.vercel.app | inferno-menhir-holdings.vercel.app |

Do **not** 308 product `*.vercel.app` hosts to `{product}.menhir-holdings.com` while the domain is unpaid.

## Local category map (workstation)

Vercel/GitHub are per-repo; paths below are Menhir Holdings checkout layout only:

| Category | Products |
|----------|----------|
| `Web/` | stonehenge, menhir-web, Eido, Freeze, Sable |
| `Flow/` | Silo, jobjeeves, Paid, Vecchio, phrased, resumes |
| `Visual/` | Vantage, Holo, Dawk, Mangaphile, photoport, vega |
| `Eng/` | Augur, Kerf, Azum, Zipp |
| `Game/` | Quell, Matrix-Maze, Diaries, Inferno, Suplex, Erudite, Gamolingo |
| `Audio/` | Kaiser (`composition/` + `console/` + `shared/`), Kithara |
| `Color/` | Gamma, Strob, RobRoss |
| `Car/` | Bucephalus |

## Deployment protection (SSO)

Vercel **Deployment Protection → Vercel Authentication (SSO)** was blocking public product URLs with **403**. SSO is **disabled** on lattice projects (2026-07-22). New projects: `npx vercel@54 project protection disable "$p" --sso --scope menhir-holdings`.

## Hobby plan — private GitHub org

Hobby cannot auto-deploy from **private** `menhir-holdings` repos. CI may show Vercel check failures even when code is fine. Options: Pro team, public repo, or manual `vercel deploy --prod` from a linked local tree.

## DNS vs Vercel nameservers

`menhir-holdings.com` used **Cloudflare** nameservers. Product CNAMEs in Cloudflare are leftover until a domain is paid again. Hub bookmark is the Vercel alias above.

## Retired / not on the circle

| Project | Notes |
|---------|-------|
| SyncStation | Deleted — Strob/Vecchio standalone again |
| BOB | Deleted — Vega is the website/gallery product |
| enjoyments_vectorized | Deleted with RnD |
| Gnomon / Echo / Horizon / Scour | Wiped or canceled |
| JobJeeves | Frontend shell without a durable API — off-circle |
| Diaries | Complete OSRS tool; off-circle by taste |
| Vega | Parked (Clerk / Blob) — off-circle |
| Erudite, Suplex | Live aliases exist; WASM surface blank in QC — off-circle |
| Vantage, Silo, Gamolingo, menhir-web | Not production / supplier baptism |

## Hidden / internal tools (not on portal)

| GitHub | Vercel | Canonical URL | Notes |
|--------|--------|---------------|-------|
| [kaiser](https://github.com/menhir-holdings/kaiser) | `kaiser` | https://kaiser-mu.vercel.app | Music stem preview. Not in `src/data/projects.ts`. |

`stonehenge/kaiser/` is a mirror stub — edit `Audio/Kaiser` / `menhir-holdings/kaiser`.

## Other Vercel projects (not on apex portal)

`eido`, `menhir-web`, `vantage`, `silo`, `mangaphile`, `musa`, `scenepeek`, `sandscope`, `bucephalus`, `pygmalion`, `reno-studios-com`, `mina-yu-portfolio`, `ledoit`, `movie-mash`, `college-cns`, `wall-street-beater`, `erudite`, `suplex`, `gamolingo`
