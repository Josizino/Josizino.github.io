# Jose Matos — Personal Portfolio

Personal portfolio website for Jose Matos, Cybersecurity Management student at Nova Southeastern University (graduating May 2026).

**Live site:** [josematos.dev](https://josematos.dev) *(update this URL once deployed)*

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

### Option A — Username site (recommended, clean URL)

1. Create a GitHub repo named exactly **`YOUR_USERNAME.github.io`**
2. Push this folder to the `main` branch:

```bash
cd portfolio-website
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_USERNAME.github.io.git
git push -u origin main
```

3. Go to **Settings → Pages** and confirm Source is set to `main` / `/ (root)`
4. Your site is live at `https://YOUR_USERNAME.github.io` within ~60 seconds

### Option B — Project site (any repo name)

Same steps as above but use any repo name. Your site will be at:
`https://YOUR_USERNAME.github.io/REPO_NAME/`

*(All links are relative so both options work without any code changes.)*

---

## Custom Domain (optional)

1. Create a file named `CNAME` in this folder containing just your domain:
   ```
   josematos.dev
   ```
2. Point your domain's DNS to GitHub Pages (see [GitHub docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site))
3. Enable "Enforce HTTPS" in repo Settings → Pages

---

## Local Development

No build step needed — pure HTML/CSS/JS.

```bash
# Python (built-in)
python3 -m http.server 3000

# Then open http://localhost:3000
```

---

## Tech

- Pure HTML5 / CSS3 / Vanilla JS — no frameworks, no dependencies
- Google Fonts: Inter + JetBrains Mono
- Particle canvas animation (custom, `js/main.js`)
- Fully responsive — mobile, tablet, desktop
- Accessible — semantic HTML, ARIA labels, keyboard navigable
