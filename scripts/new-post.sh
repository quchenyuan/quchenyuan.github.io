#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 <slug> <title> <description> [category]" >&2
  echo "category is a slug from src/categories.ts" >&2
  exit 2
}

[ "$#" -eq 3 ] || [ "$#" -eq 4 ] || usage

slug=$1
title=$2
description=$3

[[ $slug =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || {
  echo "slug must be lowercase ASCII kebab-case: $slug" >&2
  exit 2
}

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
file="$root/src/content/posts/$slug.md"

[ ! -e "$file" ] || {
  echo "already exists: $file" >&2
  exit 1
}

category=${4:-}
if [ -n "$category" ]; then
  [[ $category =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] || {
    echo "category must be lowercase ASCII kebab-case: $category" >&2
    exit 2
  }
  grep -qE "^[[:space:]]*slug: '$category',?$" "$root/src/categories.ts" || {
    echo "unknown category: $category (add it to src/categories.ts first)" >&2
    exit 2
  }
fi

yaml_quote() {
  local value=$1
  value=${value//\'/\'\'}
  printf "'%s'" "$value"
}

mkdir -p "$root/public/images/$slug"
{
  printf -- '---\n'
  printf 'title: %s\n' "$(yaml_quote "$title")"
  printf 'description: %s\n' "$(yaml_quote "$description")"
  printf 'date: %s\n' "$(TZ=Asia/Shanghai date +%F)"
  [ -z "$category" ] || printf 'category: %s\n' "$category"
  printf -- '---\n\n\n'
} > "$file"

printf '%s\n' "$file"
