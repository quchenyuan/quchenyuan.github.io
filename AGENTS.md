# Repository rules

- Node 26 (`.nvmrc`). CI and the server preview must use the same major.
- Dependency versions are pinned exactly; keep `package-lock.json` in sync. Do not
  bump dependencies as part of unrelated work.
- Run git only on the server, inside `/srv/blog-next`. Never drive git from the Mac.
- This repository is public. Never commit secrets, private notes, or the old gated
  content. Never run `git add -A`; stage the post and its image directory explicitly.
- `npm run build` must pass before a push.
- The reader site ships zero client JavaScript. Do not add scripts for features CSS
  can handle.
- Fonts are self-hosted. Do not add CDN font or stylesheet requests.
- A published slug is permanent. Do not rename a post file after it is live.
- The old repository `quchenyuan/blog` and its deployment are out of scope. Do not
  modify, migrate, or delete anything there from this repository.
