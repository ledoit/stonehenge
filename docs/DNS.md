# DNS — menhir-holdings.com (unpaid)

**Canonical hub URL:** https://menhir-holdings.vercel.app

The custom domain is **not paid**. Do not redirect `menhir-holdings.vercel.app` (or other Vercel aliases) to `menhir-holdings.com`. Leave PR preview hosts alone.

If leftover Cloudflare records still resolve `*.menhir-holdings.com` to Vercel, treat that as accident, not the bookmark.

Leave **Zoho Mail** alone if those records still exist: MX, SPF, DKIM, `zb04905990` — always **DNS only** (grey cloud).

## When a domain is paid again

Prefer the project-specific Vercel CNAME target from the Domains screen (often `*.vercel-dns-017.com`). Cloudflare supports CNAME on `@` (CNAME flattening).

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | Vercel project DNS target | DNS only |
| CNAME | `www` | same | DNS only |

Then: apex = hub, `www` → apex, product subdomains → each Vercel project. Until then, product stones use `*.vercel.app` aliases in [`src/data/projects.ts`](../src/data/projects.ts).

## Product aliases (current)

| Product | Bookmark |
|---------|----------|
| Hub | https://menhir-holdings.vercel.app |
| Quell | https://quellcube.vercel.app |
| Freeze | https://freeze-lilac.vercel.app |
| Gamma | https://gamma-three-lime.vercel.app |
| Diaries | https://diaries-gray.vercel.app |
| Matrix Maze | https://matmaz.vercel.app |
| Inferno | https://inferno-ruby.vercel.app |
| Kaiser (hidden) | https://kaiser-mu.vercel.app |

Avoid aliases that **308 to `{product}.menhir-holdings.com`** (Strob, Vecchio, Paid, some Gamma hosts).

## Redirects

| From | To |
|------|----|
| none | vercel.app hub is canonical |

Do not restore `menhir-holdings.vercel.app` → `menhir-holdings.com` until the domain is paid and certs are green.
