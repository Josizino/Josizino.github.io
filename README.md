# Jose Matos - Portfolio

Personal portfolio for Jose Matos, Cybersecurity Management graduate
(Nova Southeastern University, May 2026).

**Live:** [josizino.github.io](https://josizino.github.io)

---

## Stack

Static HTML, CSS, and vanilla JavaScript. No build step, no dependencies,
no framework. Deployed straight from `main` by GitHub Pages.

- **Type:** Archivo (variable, width + weight axes) and IBM Plex Mono, via Google Fonts
- **Design language:** aerospace / instrumentation. Navy ground, measured
  hairline grids, monospace data columns
- **Palette:** Red Bull Racing. Navy, RB red, sun-disc yellow

## Files

| Path | What it is |
|---|---|
| `index.html` | The portfolio. Single page, nine sections |
| `404.html` | Not-found page, shares the same token layer |
| `resume.html` | Standalone printable resume (see Known issues) |
| `linkedin.html` | Private LinkedIn copy guide. Not linked from the site |
| `css/tokens.css` | Every colour, type, space, shape, and motion token |
| `css/base.css` | Reset, typography, layout primitives, shared components, motion |
| `css/sections.css` | Per-section composition and all responsive collapse rules |
| `js/main.js` | Sticky nav, scroll reveals, active link, mobile menu, footer year |
| `og-image.jpg` | 1200x630 social card |
| `favicon.svg` | Tab icon |
| `Jose_Matos_Resume.pdf` | The downloadable resume |

## Conventions

**Colour is single-sourced from `css/tokens.css`.** Nothing else in the
project should hardcode a hex value.

Two accents, and they are not interchangeable:

- `--accent` (Red Bull red) is **structural** - fills, rules, borders, and
  display type. It measures 3.8:1 on the navy ground, which clears WCAG AA
  for large text but not for body text. Never put it on small text.
- `--signal` (sun-disc yellow) is 12.6:1 and carries every small piece of
  accent text: labels, tags, inline emphasis, the focus ring.

**No scroll listeners.** Everything that reacts to scroll position uses
IntersectionObserver. The sticky nav keys off a zero-height sentinel
(`#top`) rather than measuring `scrollY`.

**Motion is opt-in per element** via `.reveal` (scroll) and `.enter`
(page load, staggered with `--i`). Both collapse under
`prefers-reduced-motion`, in CSS and again in JS.

## Local preview

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173>.

## Deploying

```bash
git add . && git commit -m "Describe the change" && git push
```

GitHub Pages rebuilds from `main` automatically, usually within a minute.
GitHub's CDN caches CSS and JS aggressively; if a change does not appear,
confirm with `curl -s https://josizino.github.io/css/tokens.css | head`
before assuming the deploy failed.

## Known issues

- **`resume.html` contradicts `index.html`.** It lists the Cari-Med role as
  "IT Intern, 2024" and NCAE as "2024 - 2025", where the portfolio says
  "Junior IT Staff, December 2024 - June 2026" and "August 2025 - May 2026".
  It also still uses the old light theme and Inter. It is not linked from
  the portfolio. Either correct and restyle it, or delete it.
- **Project links point at the GitHub profile,** not at the StintMind or
  Project Ejay repositories, because those URLs are not recorded anywhere
  in this project.
- **No project screenshots.** The case studies carry no visual evidence.
