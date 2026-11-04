# Contributing to Threshold

Thanks for wanting to help. Threshold is small on purpose, so the best contributions keep it that way.

## Good first contributions
- **A new fact** for a reason in `src/content.js`. It must come from published research: add the citation to `docs/research-sources.md`, and keep the fact readable in about five seconds.
- **A new mini-activity** in `src/app.js` (`activities`). It should take 15 seconds or less, need no account, and save nothing.
- **A new pixel flower** in `src/pixels.js`: add a grid and palette to `FLOWERS` and it rotates into the garden automatically.
- Accessibility fixes, and translations of the copy.

## Guidelines
- No tracking, analytics or network calls beyond fonts.
- No shame language. The "still want to open" path must always stay one tap away.
- Keep it build-free: plain HTML, CSS and JavaScript.
- If you change any file listed in `sw.js`, bump `CACHE`.

## Running
```bash
python3 -m http.server 8000
```

Open a pull request with a screenshot or GIF of the change.
