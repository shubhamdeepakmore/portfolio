# Shubham More — Portfolio

Personal portfolio website for a PMO (Project Management Officer) professional.
Plain HTML / CSS / JavaScript — **no build step, no framework**. What you see in
the repo is exactly what gets served.

## Project structure

```
index.html            Main single-page site (markup only)
articles.html         Writing hub page
article-*.html        Individual article pages
pmp-badge.png         PMP badge image
Shubham_More_CV.pdf   Downloadable CV

css/                  Styles, split by concern (loaded in order by index.html)
  base-mobile.css       Early mobile overrides
  variables.css         Colour palette + font + theme tokens
  base.css              Resets, typography, layout primitives
  nav.css               Top navigation
  nav-dropdown.css      Nav dropdown menus + scrollspy
  misc.css              Reveal-on-scroll, print styles
  overrides.css         Palette accent overrides
  components.css        Shared components (toggles, business card, animations)
  sections/             One file per page section (hero, dashboard, skills, …)

js/                   Behaviour, split by feature (loaded at end of <body>)
  dashboard.js          Programme Controls dashboard
  sqcdpi.js             SQCDPI donuts + dashboard view switcher
  skills.js             Skills category filter
  glass-pill.js         Sliding glass-pill toggle utility
  timeline.js           Timeline animations + float cards
  business-card.js      Flip business card
  animations.js         Count-up numbers, tenure bars, scrollspy
  nav.js                Mobile burger menu
```

## Editing

- **Change a colour or font:** `css/variables.css`
- **Change a section's look:** the matching file in `css/sections/`
- **Change how a feature behaves:** the matching file in `js/`

Just save the file and refresh the browser — there is nothing to compile.

## Local preview

Open `index.html` directly in a browser, or (recommended, so paths resolve
exactly like production) run any simple static server from the project root.

## Deployment

Hosted on Netlify, deployed automatically from this GitHub repository.
`netlify.toml` tells Netlify to publish the repo root with no build command —
pushing to the `main` branch publishes the site.
