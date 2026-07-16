# Menhir Holdings — agent / deploy workflow

Cursor rule (authoritative): `Menhir Holdings/.cursor/rules/menhir-dev-deploy.mdc`.

## Surfaces

| Role | Surface |
|------|---------|
| Agent trigger | `Menhir Holdings/` folder on disk |
| Delivery | GitHub org `menhir-holdings` |
| Source of truth | Linear **Menhir Tech** (`MT-###`) |

## Commands

| Phil says | Agent does |
|-----------|------------|
| **do this** (or any implement prompt) | Branch → implement → commit → push → open PR → hand Vercel preview URL → Linear SoT to **In Review** |
| **push** | Merge/promote PR; Linear **Done** when on prod; reply with live URL |
| **push + do this next** | `push`, then start a new `do this` loop |
| **fix this** | Patch current branch/PR; refresh Linear; stay **In Review** |

Phil must **not** need a local build to test. Hand the Vercel **PR preview URL**.

## Branches / URLs

| | Branch | URL |
|--|--------|-----|
| **Production** | `main` | `{product}.menhir-holdings.com` |
| **In-flight testing** | PR branch | `*.vercel.app` preview |

Examples:

- Matrix Maze prod: https://matrix-maze.menhir-holdings.com/
- Stonehenge apex: https://menhir-holdings.com

## Linear

- Branch: `ledoit/mt-###-short-slug`
- States: Backlog/Todo → **In Progress** on branch push → **In Review** when PR + preview URL exist → **Done** on `main`
- Issue must carry PR URL + preview URL as SoT

## Hidden / internal tools

| Tool | URL | Stone? |
|------|-----|--------|
| Kaiser (audio preview) | https://kaiser.menhir-holdings.com | No |

See `docs/DNS.md` and `docs/VERCEL.md`.
