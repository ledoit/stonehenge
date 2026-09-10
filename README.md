# Menhir Holdings

Repo / Vercel project: **`stonehenge`**.

Canonical hub while the custom domain is unpaid: **https://menhir-holdings.vercel.app**

(`menhir-holdings.com` is not the bookmark. Do not redirect vercel.app hosts to it.)

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
- `1`–`8` / arrows — present an object · Esc — put it back

## Canonical URLs

| Product | URL |
|---------|-----|
| Hub | https://menhir-holdings.vercel.app |
| Quell | https://quellcube.vercel.app |
| Freeze | https://freeze-lilac.vercel.app |
| Gamma | https://gamma-three-lime.vercel.app |
| Strob | https://strob-menhir-holdings.vercel.app |
| Vecchio | https://vecchio-menhir-holdings.vercel.app |
| Paid | https://paid-menhir-holdings.vercel.app |
| Matrix Maze | https://matmaz.vercel.app |
| Inferno | https://inferno-ruby.vercel.app |

Off-table (not presentable as a public object): Kaiser (`kaiser-mu.vercel.app`).

See [docs/DNS.md](./docs/DNS.md) and [docs/VERCEL.md](./docs/VERCEL.md).

## License

All Rights Reserved © Menhir Holdings
