# kaiser

Music preview console for game stems. Hidden deploy — not listed on the stonehenge portal.

## Local

```bash
cd kaiser
npm install
npm run dev
```

Build:

```bash
npm run build
```

OGG stems are optional. Drop files under `public/projects/<project-id>/audio/` matching paths in that project's `project.json`. Missing files trigger the same procedural fallback as Matrix Maze `music.js`.

## Vercel (manual)

Kaiser is a **sub-app** inside the `stonehenge` repo. It is not a separate Vercel project in the published lattice.

1. Open the **stonehenge** project in Vercel (team `menhir-holdings`).
2. **Settings → General → Root Directory** → set to `kaiser` for a dedicated kaiser deployment, **or** add a second Vercel project pointing at the same repo with Root Directory `kaiser` (recommended if the hub must stay at repo root).
3. **Settings → Domains** → add `kaiser.koalasalmon.com`.
4. Copy the CNAME target Vercel shows (usually `cname.vercel-dns.com` or `*.vercel-dns-017.com`).
5. In Cloudflare, add the CNAME (see `../docs/DNS.md`).
6. Push to `main` — production deploy follows the stonehenge GitHub link.

## Adding a project

1. Create `public/projects/<id>/project.json` (copy matrix-maze layout).
2. Add audio under `public/projects/<id>/audio/`.
3. Register the id in `src/main.ts` `PROJECTS` array.

## Matrix Maze stems

Expected OGG paths (relative to project folder):

- `audio/music/matrix_maze_base.ogg`
- `audio/music/matrix_maze_pressure.ogg`
- `audio/music/matrix_maze_chase.ogg`
- `audio/music/matrix_maze_dread.ogg`
- `audio/sfx/level_complete.ogg`

`accent` is always synthesized at runtime.

**Canonical repo:** https://github.com/ledoit/kaiser-console (Hobby plan cannot Git-connect private org repos). Local agent path: `Website/Kaiser`.
