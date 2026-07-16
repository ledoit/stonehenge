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
| **do this** (or any implement prompt) | Branch → implement → commit → push → open PR → hand clickable test URL (preview or `/dev/`) → Linear SoT to **In Review** |
| **push** | Merge/promote PR; Linear **Done** when on prod; reply with live URL |
| **push + do this next** | `push`, then start a new `do this` loop |
| **fix this** | Patch current branch/PR; refresh Linear; stay **In Review** |

Phil must **not** need a local build to test. Prefer:

1. `{product}.menhir-holdings.com/dev/` when that path exists
2. Else Vercel PR preview URL

## Branches / URLs

| | Branch | URL |
|--|--------|-----|
| **Production** | `main` | `{product}.menhir-holdings.com` |
| **Dev staging** | `dev` | `{product}.menhir-holdings.com/dev/` |

Examples:

- Matrix Maze prod: https://matrix-maze.menhir-holdings.com/play/
- Matrix Maze dev: https://matrix-maze.menhir-holdings.com/dev/

Stonehenge apex: https://menhir-holdings.com — PRs use Vercel preview until a `dev` staging path exists.

## Linear

- Branch: `ledoit/mt-###-short-slug`
- States: Backlog/Todo → **In Progress** on branch push → **In Review** when PR + test URL exist → **Done** on `main`
- Issue must carry PR URL + test URL as SoT

## Hidden / internal tools

| Tool | URL | Stone? |
|------|-----|--------|
| Kaiser (audio preview) | https://kaiser.menhir-holdings.com | No |

See `docs/DNS.md` and `docs/VERCEL.md`.
