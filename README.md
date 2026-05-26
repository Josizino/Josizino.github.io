# Jose Matos — Personal Portfolio

Personal portfolio website for Jose Matos, Cybersecurity Management student at Nova Southeastern University (graduating May 2026).

**Live site:** [josizino.github.io](https://josizino.github.io)

---

## Pages

| File | Description |
|---|---|
| `index.html` | Main portfolio — about, skills, experience, projects, contact |
| `resume.html` | Printable / PDF resume with inline download button |
| `linkedin.html` | LinkedIn profile optimization guide with copy-ready content |
| `404.html` | Custom not-found page |

## Assets

```
css/style.css          — All styles
js/main.js             — Particles, scroll animations, typing effect
favicon.svg            — SVG favicon
Jose_Matos_Resume.docx — Downloadable one-page resume
```

---

## Deploy to GitHub Pages

### Step 1 — Create the repo on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Name the repo exactly: **`Josizino.github.io`**
3. Set to **Public**
4. Leave all checkboxes unchecked (no README, no .gitignore)
5. Click **Create repository**

### Step 2 — Push from Terminal

```bash
cd /Users/josematos/portfolio-website
git remote add origin https://github.com/Josizino/Josizino.github.io.git
git push -u origin main
```

When prompted for a password, use a **Personal Access Token** (not your GitHub password):  
GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → check `repo` scope → copy and paste as password.

### Step 3 — Enable Pages

1. Go to `github.com/Josizino/Josizino.github.io` → **Settings → Pages**
2. Source: **Deploy from a branch → main → / (root)**
3. Click **Save**

Site goes live at **https://josizino.github.io** within ~60 seconds.

---

## Updating the site

```bash
cd /Users/josematos/portfolio-website
git add .
git commit -m "Describe your change"
git push
```

GitHub Pages rebuilds automatically — live in ~30 seconds.

---

## Custom Domain (optional)

1. Create a `CNAME` file containing your domain:
   ```
   yourdomain.com
   ```
2. Configure your DNS to point to GitHub Pages
3. Enable "Enforce HTTPS" in repo Settings → Pages

---

## Tech

- Pure HTML5 / CSS3 / Vanilla JS — no frameworks, no dependencies
- Google Fonts: Inter + JetBrains Mono
- Particle canvas animation (custom)
- Fully responsive — mobile, tablet, desktop
- Accessible — semantic HTML, ARIA labels, keyboard navigable
