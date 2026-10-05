# Architecture and decisions

## Product boundary

A small evidence desk that separates claim, source excerpt and reviewer judgment. Attaching a URL never changes a claim to supported automatically.

The main screen is a working surface. No signup, billing or API setup blocks the task. Samples are explicitly fictional, without invented usage metrics.

## State and rules

src/core.js owns pure domain operations and validators. src/app.js owns DOM events and persistence. src/ui.js supplies escaping, language, clipboard/download helpers and backup envelopes. Static semantic HTML, responsive CSS and visible keyboard focus support access.

Source presence and review completion are separate metrics. Numeric and absolute-wording flags are reading prompts rather than confidence scores. An inconclusive result is valid without a source, avoiding pressure to manufacture evidence just to finish a checklist.

Rule tests run without a browser. Browser acceptance separately checks wiring, labels, form actions, persistence and offline loading.

## Privacy and ownership

No service receives input text. Automatic requests are same-origin public app files. Each service worker caches its own shell and only intercepts GET requests within its project scope. Names prevent accidental collisions. They are not a security boundary: Pages projects under one account share an origin and can technically access each other’s browser storage. Use local serving on separate origins for stronger separation.

Dynamic HTML uses escaping; user text is data. HTTP/HTTPS links reject credentials and executable protocols and use noopener/noreferrer. CSP disallows remote and inline scripts. Browser extensions and clipboard managers remain outside the app’s control.

Backups carry app identity and version. Import checks size and records before asking to replace data. Veil Paste has no backups because saving its private map would defeat session-only processing.

## Portability

Modern browser APIs and ES modules; zero runtime packages. A static build copies only public files and the license to dist. Pages publishing follows validation. ZIPs include runnable app files and license; local serving avoids file-protocol module restrictions.

## Limits

No automatic web fetch, truth score, plagiarism detection or citation existence check. Review statuses are user assessments. A source can itself be wrong, and a quoted passage may not support the claim.

Future work is in [ROADMAP.md](ROADMAP.md). Add services only for concrete capabilities and document changed privacy boundaries.
