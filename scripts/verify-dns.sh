#!/usr/bin/env bash
# Quick DNS smoke check for Menhir product subdomains.
# Usage: ./scripts/verify-dns.sh

set -euo pipefail

PRODUCTS=(
  matrix-maze strob vecchio jobjeeves paid gamma inferno vega kaiser diaries freeze
)

echo "Checking CNAME targets (Cloudflare DNS only)..."
for sub in "${PRODUCTS[@]}"; do
  host="${sub}.menhir-holdings.com"
  if cname=$(dig +short CNAME "$host" 2>/dev/null | head -1); then
    if [[ -n "$cname" ]]; then
      echo "OK  $host -> $cname"
    else
      a=$(dig +short A "$host" 2>/dev/null | head -1)
      if [[ -n "$a" ]]; then
        echo "OK  $host -> A $a"
      else
        echo "MISS $host (no CNAME/A record)"
      fi
    fi
  fi
done

echo
echo "Checking apex + www..."
for host in menhir-holdings.com www.menhir-holdings.com; do
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
