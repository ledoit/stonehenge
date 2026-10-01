# Stonehenge

Repo: **`ledoit/stonehenge`**. Vercel project: **`stonehenge`**.

Canonical hub: **https://koalasalmon.com**

The apex site is a **studio table** — distinct product objects on a shallow architectural plate. The 3D world fills the viewport; click an object to bring it forward, then enter. The lattice is curated: only complete, live surfaces. Quell is first.

**Lattice:** objects mirror [`src/data/projects.ts`](./src/data/projects.ts). Off-lattice: **Kaiser** (music console, hidden deploy).

**Stack:** Vite + TypeScript + Three.js (no React, no Next). Static WebGL, deployed on Vercel.

## Dev

```bash
npm install
npm run dev
```

Phil tests the Vercel preview URL, not local `npm run dev`.

## Controls

- Slow dolly / orbit around the table (pointer look, drag, wheel)
- Hover an object — HUD index, name, tag
- Click — object comes forward; click again, Enter, or the Enter chip to go in
- `1`–`9` / arrows — present an object · Esc — put it back

## Canonical URLs

| Product | URL |
|---------|-----|
| Hub | https://koalasalmon.com |
| Quell | https://quell.koalasalmon.com |
| Freeze | https://freeze.koalasalmon.com |
| Prisma | https://prisma.koalasalmon.com |
| Strob | https://strob.koalasalmon.com |
| Vecchio | https://vecchio.koalasalmon.com |
| Paid | https://paid.koalasalmon.com |
| Matrix Maze | https://matrix-maze.koalasalmon.com |
| Inferno | https://inferno.koalasalmon.com |
| JobJeeves | https://jobjeeves.koalasalmon.com |

Off-table: Kaiser at `kaiser.koalasalmon.com`.

See [docs/DNS.md](./docs/DNS.md) and [docs/VERCEL.md](./docs/VERCEL.md).

## License

All Rights Reserved © Philippe Ledoit
