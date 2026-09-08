# Menhir — Vercel & GitHub

_Last updated: 2026-09-08_

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
| [diaries](https://github.com/menhir-holdings/diaries) | `diaries` | https://diaries.menhir-holdings.com | diaries-menhir-holdings.vercel.app |
| [freeze](https://github.com/menhir-holdings/freeze) | `freeze` | https://freeze.menhir-holdings.com | freeze-lilac.vercel.app |

## Local category map (workstation)

Vercel/GitHub are per-repo; paths below are Menhir Holdings checkout layout only:

| Category | Products |
|----------|----------|
| `Web/` | stonehenge, menhir-web, Eido, Freeze |
| `Flow/` | Silo, jobjeeves, Paid, Vecchio, phrased, resumes |
| `Visual/` | Vantage, Holo, Dawk, Mangaphile, photoport, vega |
| `Hub/` | Zipp (leftover; category TBD) |
| `Employment/` | Azum, Kerf (leftover; category TBD) |
| `Game/` | Matrix-Maze, Diaries, Inferno, Suplex, Erudite, osrs-autoclicker |
| `Audio/` | Kaiser (`composition/` + `console/` + `shared/`), Kithara |
| `Color/` | Gamma, Strob, RobRoss |
| `Car/` | Bucephalus |
| `FinTech/` | Augur |

## Deployment protection (SSO)

Vercel **Deployment Protection → Vercel Authentication (SSO)** was blocking public product URLs with **403**. SSO is **disabled** on all lattice projects (2026-07-22):

```bash
for p in freeze stonehenge diaries inferno kaiser matrix-maze jobjeeves gamma paid strob vecchio vega; do
  npx vercel@latest project protection disable "$p" --sso --scope menhir-holdings
done
```

New projects: run the same `protection disable` after linking, or public URLs will 403.

## Hobby plan — private GitHub org

Hobby cannot auto-deploy from **private** `menhir-holdings` repos. CI may show Vercel check failures even when code is fine. Options: Pro team, public repo, or manual `vercel deploy --prod` from a linked local tree.

## DNS vs Vercel nameservers

`menhir-holdings.com` uses **Cloudflare** nameservers. Product CNAMEs live in Cloudflare (`docs/DNS.md`), not Vercel DNS — records added via `vercel dns add` only apply after switching NS to Vercel.

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

`eido`, `menhir-web`, `vantage`, `silo`, `mangaphile`, `musa`, `scenepeek`, `sandscope`, `bucephalus`, `pygmalion`, `reno-studios-com`, `mina-yu-portfolio`, `ledoit`, `movie-mash`, `college-cns`, `wall-street-beater`
