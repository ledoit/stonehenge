# Menhir Holdings — dev / prod workflow

Standard pattern for all Vercel-hosted products. Cursor rule: `Menhir Holdings/.cursor/rules/menhir-dev-deploy.mdc`.

## URLs

| | Branch | URL |
|--|--------|-----|
| **Production** | `main` | `{product}.menhir-holdings.com` |
| **Dev staging** | `dev` | `{product}.menhir-holdings.com/dev/` |

Examples:
- Matrix Maze prod: https://matrix-maze.menhir-holdings.com/play/
- Matrix Maze dev: https://matrix-maze.menhir-holdings.com/dev/

Framework apps (Next/Vite at repo root): `/dev` is a second build output or preview deploy — see each repo's `docs/DEV.md`.

## Agent workflow (always)

1. **Push after each pass** — never leave testable work local-only.
2. **Linear** — open/reference `MT-###` on Menhir Tech; branch `ledoit/mt-###-slug`.
3. **PR to `dev` first** — test on `/dev/` URL; promote `dev` → `main` for production.
4. **CI on `dev`** — GitHub Action builds artifacts (`dev/` folder) so you don't run builds locally for staging.

## Linear integration

- GitHub ↔ Linear: branch names with `mt-###` auto-link PRs.
- Issue states: Backlog → In Progress when branch pushed → Done when merged to `main`.
- Comment deploy URLs on the issue when CI finishes.

## Hidden / internal tools

| Tool | URL | Stone? |
|------|-----|--------|
| Kaiser (audio preview) | kaiser.menhir-holdings.com | No |

## DNS

Add `dev` path builds on same project domain — no extra CNAME for `/dev/`. Optional `dev.{product}` subdomain only if a product needs branch-isolated hosting without path routing.

See per-product `docs/DEV.md` and `stonehenge/docs/DNS.md`.
