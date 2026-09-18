# Jose Matos - Portfolio

Personal portfolio for Jose Matos, Cybersecurity Management graduate
(Nova Southeastern University, May 2026).

**Live:** [josizino.github.io](https://josizino.github.io)

---

## Concept

A cybersecurity engineer's personal race-control system. The motorsport theme
is the creative identity only: nothing on the site claims racing results,
professional motorsport roles, or affiliations.

Every readout on the race-control console is real and describes the visit
itself (time on page, current section, scroll distance, live input trace).
Skill bars count where a skill has actually been used; they are not
proficiency scores.

## Stack

Static HTML, CSS, and JavaScript modules. No build step. Deployed from `main`
by GitHub Pages.

- **Animation:** [Anime.js](https://animejs.com/) 4.5.0, vendored at
  `js/vendor/anime.esm.min.js` (MIT). Verified against the npm registry's
  sha512 integrity before vendoring; file sha256
  `a19015a1a92d52025a2fb6703b6d67eadd1cc2aeaf880770e96e04cf6aa07be1`.
- **Type:** Saira (condensed display, on its width axis), Archivo (body),
  JetBrains Mono (data), from Google Fonts.
- **Palette:** graphite and carbon ground, electric red accent, green and amber
  used only for real status.

## Files

| Path | What it is |
|---|---|
| `index.html` | The portfolio, including the inline car silhouette sprite |
| `css/tokens.css` | Every colour, type, space, shape, and motion token |
| `css/base.css` | Reset, typography, layout, shared components, motion states |
| `css/sections.css` | Nav, hero console, and each section's composition |
| `css/cars.css` | Racing lines, track map, car layers and their static states |
| `js/app.js` | Entry: core UI first, then loads motion through a dynamic import |
| `js/ui/nav.js` | Sticky nav, active section, mobile menu |
| `js/ui/contact.js` | Validated contact form that hands off to the visitor's email app |
| `js/motion/index.js` | One Anime.js scope that owns every animation |
| `js/motion/intro.js` | Start-up sequence |
| `js/motion/reveal.js` | Scroll reveals and the timeline progress rail |
| `js/motion/interactions.js` | Hover, press, menu, and form feedback |
| `js/motion/telemetry.js` | Console readouts and the live input trace |
| `js/motion/cars.js` | Hero passes, section passes, track map, project line, distant pack |
| `assets/projects/` | Project screenshots |
| `og-image.jpg`, `favicon.svg`, `404.html` | Social card, tab icon, not-found page |
| `Jose_Matos_Resume.pdf` | Downloadable resume |
| `resume.html`, `linkedin.html` | Older standalone pages, not linked from the site |

## How the motion system is built

- **Progressive enhancement.** Content is visible without JavaScript. An inline
  script in `<head>` adds `js`; if Anime.js has not taken over within 2.5 s it
  adds `no-motion` and nothing stays hidden. Core UI (`nav.js`, `contact.js`)
  never depends on the animation library.
- **One scope.** `motion/index.js` creates an Anime.js `createScope` with media
  queries for reduced motion and wide screens. When either changes, the scope
  reverts its animations, runs each module's cleanup, and rebuilds.
- **Module contract.** Each motion module is `fn(ctx) => cleanup`. The library
  arrives through `ctx.anime`, so it is imported in exactly one place.
- **No scroll listeners of our own.** Triggers use IntersectionObserver;
  scrubbed values (distance readout, timeline rail, project line car) use
  Anime.js `onScroll`.
- **Reduced motion.** No intro, no reveals, no cars in motion: every car is
  parked on its line and the track map is fully drawn.

## Conventions

- Colour comes only from `css/tokens.css`.
- Status colours are semantic: green = live or active, amber = in development.
- Car silhouettes are original drawings proportioned from real class dimensions
  (1 unit = 1 cm) and always face right; direction is flipped in the scene.

## Local preview

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>. Modules need http; opening `index.html` from disk
shows the static fallback.
