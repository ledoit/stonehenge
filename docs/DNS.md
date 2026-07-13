# DNS — menhir-holdings.com

Leave **Zoho Mail** records alone (MX, SPF, DKIM, `zb04905990`). Always **DNS only** (grey cloud) for mail.

## Apex hub (this project)

Add in Cloudflare after the Vercel project shows the domains:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `@` | `76.76.21.21` | DNS only first |
| CNAME | `www` | `cname.vercel-dns.com` | DNS only first |

Or CNAME-flatten `@` → `cname.vercel-dns.com` if your Cloudflare plan supports it.

## Product subdomains (canonical public URLs)

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `matrix-maze` | `cname.vercel-dns.com` | DNS only first |
| CNAME | `strob` | `cname.vercel-dns.com` | DNS only first |
| CNAME | `vecchio` | `cname.vercel-dns.com` | DNS only first |
| CNAME | `jobjeeves` | `cname.vercel-dns.com` | DNS only first |
| CNAME | `paid` | `cname.vercel-dns.com` | DNS only first |
| CNAME | `gamma` | `cname.vercel-dns.com` | DNS only first |
| CNAME | `vega` | `cname.vercel-dns.com` | DNS only first |

## Remove after SyncStation retirement

| Action | Name |
|--------|------|
| Delete CNAME | `syncstation` |

After apex SSL is green in Vercel, you may optionally orange-cloud proxy with Cloudflare SSL = **Full (strict)**.
