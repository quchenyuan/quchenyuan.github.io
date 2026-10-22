# Repository rules

- Node 26 (`.nvmrc`). CI and the server preview must use the same major.
- Dependency versions are pinned exactly; keep `package-lock.json` in sync. Do not
  bump dependencies as part of unrelated work.
- Run git only on the server, inside `/srv/blog-next`. Never drive git from the Mac.
- This repository is public. Never commit secrets, private notes, or the old gated
  content. Never run `git add -A`; stage the post and its image directory explicitly.
- `npm run build` must pass before a push.
- The reader site ships zero client JavaScript. Do not add scripts for features CSS
  can handle. HTML pages under `public/html/` must be stripped of scripts before import.
- Fonts are self-hosted. Do not add CDN font or stylesheet requests.
- A published slug is permanent, for posts and categories. Do not rename a post file
  or a category slug after it is live.
- Categories are a maintained registry in `src/categories.ts`, not directories.
  Markdown uses the optional `category` frontmatter field; HTML uses the optional
  `meta.json.category`. Unknown category slugs must fail validation. Category pages
  (`/categories/<slug>/`) aggregate both content kinds; the home page shows the
  registry as cards.
- Markdown posts live in `src/content/posts/`. Complete rendered HTML documents live
  in `public/html/<slug>/index.html` and are copied verbatim to `/html/<slug>/`.
  Before importing, strip admin/login, comments, analytics, editor links, gated or
  private links, and old canonical/OG URLs. Keep page assets relative inside the
  folder; `_`-prefixed directories are skipped by the `/html/` index.
- Markdown posts go to `/posts/`, RSS and the home page. HTML pages are listed on
  `/html/` and their category page, and are not in RSS.
- The old repository `quchenyuan/blog` and its deployment are out of scope. Do not
  modify, migrate, or delete anything there from this repository.
