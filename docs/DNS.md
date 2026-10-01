# DNS — koalasalmon.com

Stonehenge is the apex. Each hosted project is a subdomain. Cloudflare zone `koalasalmon.com` is the DNS source of truth. Records stay grey-cloud until the certificate is green.

`menhir-holdings.com` is mail only (Zoho MX, SPF, DKIM, `zb04905990`). Do not point product hosts at it. Do not touch those mail records.

`ledoit.dev` does not resolve. It is not in this map.

| Host | Project |
|------|---------|
| koalasalmon.com, www | stonehenge |
| quell.koalasalmon.com | quellcube |
| freeze.koalasalmon.com | freeze |
| prisma.koalasalmon.com | gamma (repo and folder are Prisma; Vercel project rename follows) |
| strob.koalasalmon.com | strob |
| vecchio.koalasalmon.com | vecchio |
| paid.koalasalmon.com | paid |
| matrix-maze.koalasalmon.com | matrix-maze |
| inferno.koalasalmon.com | inferno |
| jobjeeves.koalasalmon.com | jobjeeves |
| kaiser.koalasalmon.com | kaiser |

Do not 308 `*.vercel.app` preview hosts to the apex.
