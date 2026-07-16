# DNS — menhir-holdings.com (Cloudflare)

Leave **Zoho Mail** alone: MX, SPF, DKIM, `zb04905990` — always **DNS only** (grey cloud).

**Canonical hub URL:** `https://menhir-holdings.com` (apex, no `www`).  
`www`, `stonehenge-menhir-tech.vercel.app`, and legacy `menhir-holdings.vercel.app` should redirect there.

(`stonehenge.vercel.app` is taken outside this team — use the `*-menhir-tech` alias.)


Proxy column = Cloudflare **DNS only** (grey cloud) until certs are green. Optional orange-cloud later with SSL = **Full (strict)**.

## Hub (update to Vercel’s new target)

Vercel’s IP expansion: prefer the project-specific CNAME below. Old `A 76.76.21.21` / `cname.vercel-dns.com` still work but are legacy.

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `3b1305dd97e170ad.vercel-dns-017.com` | DNS only |
| CNAME | `www` | `3b1305dd97e170ad.vercel-dns-017.com` | DNS only |

Cloudflare supports CNAME on `@` (CNAME flattening). If you still have `A @ → 76.76.21.21`, **replace** it with the CNAME above.

## Product subdomains

If a product’s Vercel Domains screen shows a **new** `*.vercel-dns-017.com` target, use that. Otherwise `cname.vercel-dns.com` is fine until Vercel prompts you.

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `matrix-maze` | `cname.vercel-dns.com` *(or Vercel’s shown target)* | DNS only |
| CNAME | `strob` | same | DNS only |
| CNAME | `vecchio` | same | DNS only |
| CNAME | `jobjeeves` | same | DNS only |
| CNAME | `paid` | same | DNS only |
| CNAME | `gamma` | same | DNS only |
| CNAME | `inferno` | same | DNS only |
| CNAME | `vega` | same | DNS only |
| CNAME | `kaiser` | same | DNS only |

## Remove

| Action | Name |
|--------|------|
| Delete CNAME | `syncstation` |

## Redirects

| From | To |
|------|-----|
| `www.menhir-holdings.com` | `https://menhir-holdings.com` |
| `stonehenge-menhir-tech.vercel.app` | `https://menhir-holdings.com` |
| `menhir-holdings.vercel.app` (legacy) | `https://menhir-holdings.com` |
| `{product}.vercel.app` | `https://{product}.menhir-holdings.com` |
