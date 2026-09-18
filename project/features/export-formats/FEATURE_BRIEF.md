# Feature Brief: Export formats: image, video, GIF (incl. server-side rendering for social share)

GitHub issue #134. Issue body reproduced verbatim below.

---

## Summary
Support exporting an algorithm's output as a static image, video, and GIF (the GIF specifically for sharing to Reddit/social).

## Server-side rendering
Client-side export isn't enough for social share previews — need SSR to render an image/GIF server-side.

- **Abuse risk**: SSR rendering must be bounded — a malicious/huge algorithm (e.g. millions of nodes) could exhaust server compute. Needs node/complexity limits.
- **Time limit**: if deployed to Cloudflare edge workers, there's a hard max execution time per request — rendering must respect that (relates to the deploy-decision issue).

## Scope
- [ ] Export as image
- [ ] Export as video
- [ ] Export as GIF
- [ ] Server-side rendering path for social share images/GIFs
- [ ] Compute/complexity guardrails for SSR rendering

Replaces the "Export formats" items from #129 and the "Social shares and server side rendering" section of the offline-instructions notes.
