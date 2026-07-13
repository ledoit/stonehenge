# DNS — menhir-holdings.com (Cloudflare)

Leave **Zoho Mail** alone: MX, SPF, DKIM, `zb04905990` — always **DNS only** (grey cloud).

After these are saved, Vercel issues certs. Start **DNS only**; optional orange-cloud later with SSL = **Full (strict)**.

## Add these records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `76.76.21.21` | DNS only |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only |
| CNAME | `matrix-maze` | `cname.vercel-dns.com` | DNS only |
| CNAME | `strob` | `cname.vercel-dns.com` | DNS only |
| CNAME | `vecchio` | `cname.vercel-dns.com` | DNS only |
| CNAME | `jobjeeves` | `cname.vercel-dns.com` | DNS only |
| CNAME | `paid` | `cname.vercel-dns.com` | DNS only |
| CNAME | `gamma` | `cname.vercel-dns.com` | DNS only |
| CNAME | `vega` | `cname.vercel-dns.com` | DNS only |

## Remove

| Action | Name |
|--------|------|
| Delete CNAME | `syncstation` |

## Legacy aliases

Each product’s `*.vercel.app` host 301s to its `*.menhir-holdings.com` canonical URL (via `vercel.json` redirects).

## Already on Vercel (awaiting DNS)

| Hostname | Project |
|----------|---------|
| `menhir-holdings.com` + `www` | `menhir-holdings` |
| `matrix-maze.menhir-holdings.com` | `matrix-maze` |
| `strob.menhir-holdings.com` | `strob` |
| `vecchio.menhir-holdings.com` | `vecchio` |
| `jobjeeves.menhir-holdings.com` | `jobjeeves` |
| `paid.menhir-holdings.com` | `paid` |
| `gamma.menhir-holdings.com` | `gamma` |
| `vega.menhir-holdings.com` | `vega` (was already assigned) |
