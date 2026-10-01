#!/usr/bin/env bash
# DNS smoke check for koalasalmon.com.
# Usage: ./scripts/verify-dns.sh

set -euo pipefail

echo "Canonical hub: https://koalasalmon.com/"
echo

HOSTS=(
  koalasalmon.com
  www.koalasalmon.com
  quell.koalasalmon.com
  freeze.koalasalmon.com
  prisma.koalasalmon.com
  strob.koalasalmon.com
  vecchio.koalasalmon.com
  paid.koalasalmon.com
  matrix-maze.koalasalmon.com
  inferno.koalasalmon.com
  jobjeeves.koalasalmon.com
  kaiser.koalasalmon.com
)

for host in "${HOSTS[@]}"; do
  cname=$(dig +short CNAME "$host" 2>/dev/null | head -1)
  a=$(dig +short A "$host" 2>/dev/null | head -1)
  if [[ -n "$cname" ]]; then
    echo "OK  $host -> $cname"
  elif [[ -n "$a" ]]; then
    echo "OK  $host -> A $a"
  else
    echo "MISS $host"
  fi
done
