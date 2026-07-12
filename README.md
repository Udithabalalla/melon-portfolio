# Portfolio — Product Manager & UX Designer

An elegant, single-page portfolio inspired by the Framer "Majd" template, rebuilt
in React with GSAP scroll animations.

## Stack
- **Vite + React + TypeScript**
- **Tailwind CSS** (design tokens in `tailwind.config.js`)
- **GSAP + ScrollTrigger** — all scroll reveals, parallax, marquee, magnetic hover
- **Lenis** — smooth scrolling, synced to GSAP's ticker
- Self-hosted fonts: Space Grotesk (display), Inter (body), Instrument Serif (accents)

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Editing content
**All copy, projects, and links live in one file:** [`src/data/content.ts`](src/data/content.ts).
Change the name, role, bio, stats, project details, and social links there — no
component edits needed.

### Swapping project cover images
Each project currently uses a placeholder gradient. To use a real image, open
[`src/components/ProjectCard.tsx`](src/components/ProjectCard.tsx) and
[`src/pages/ProjectDetail.tsx`](src/pages/ProjectDetail.tsx) and replace the
`data-cover-inner` / `data-detail-cover-inner` gradient `<div>`s with an `<img>`
(put files in `public/`).

## Sections
Navbar (with theme toggle) · Hero (interactive particle field) · About (marquee + stats) · Skills · Experience & Education · Selected Work · Contact · Footer

## Project case studies (`/work/:slug`)
Each project card has a **Read More** button linking to a full case-study page —
back link, tag pills, a client/role/timeline/tools meta grid, overview,
challenge/approach/results, deep-dive sections, and prev/next project navigation.
- Routing is client-side via `react-router-dom` (`src/App.tsx`).
- Case-study copy lives alongside each project's other fields in
  [`src/data/content.ts`](src/data/content.ts) (`tags`, `client`, `timeline`,
  `overview`, `challenge`, `approach`, `results`, `sections`).
- Add a project: append an entry to the `projects` array with a unique `slug` —
  the card, detail page, and prev/next navigation all pick it up automatically.

## Theming (light / dark)
- Toggle lives in the navbar; choice is saved to `localStorage` and defaults to
  the visitor's system preference. An inline script in `index.html` applies the
  theme before first paint (no flash).
- Colors are driven by CSS variables in [`src/index.css`](src/index.css)
  (`--bg`, `--fg`, `--muted`, …) and mapped to Tailwind tokens (`ink`, `paper`,
  `muted`, `surface`, `line`). Change a value there and both themes update.
- The WebGL particle field ([`ParticleField.tsx`](src/components/ParticleField.tsx))
  has a per-theme config: **dark** = luminous blues on black (additive glow),
  **light** = multicolour confetti on white (normal blend).
- ⚠️ Editing `tailwind.config.js` requires a **dev-server restart** to recompile
  the color tokens (Vite doesn't hot-reload that file).

## Notes
- Respects `prefers-reduced-motion` — the particle field renders one static
  frame and all scroll animations disable gracefully.
- The particle field is lazy-loaded (separate chunk), pauses when the tab is
  hidden, releases its GL context on unmount, and is wrapped in an error
  boundary so a WebGL failure degrades to a static background.
- Scroll reveals **replay** every time a section re-enters the viewport (not
  just once) — see `toggleActions: "play none none reverse"` in
  [`Reveal.tsx`](src/components/ui/Reveal.tsx) / `SplitReveal.tsx` / `ProjectCard.tsx` / `Skills.tsx`.
  Pass `once` to a `<Reveal>`/`<SplitReveal>` if you want a specific element to
  play only the first time instead.
- Client-side navigation (e.g. Home → a project page → back) resets scroll to
  the top and calls `ScrollTrigger.refresh()` (see
  [`useRouteScrollFix.ts`](src/hooks/useRouteScrollFix.ts)) so trigger
  positions are recalculated for the new page. `scrollToHash()` also calls
  `lenis.resize()` before scrolling, since Lenis caches the page's scroll
  limit and a stale (too-small) limit from a shorter previous page would
  otherwise clamp the scroll short of its target.
- Deploy anywhere static: Vercel, Netlify, or GitHub Pages (`dist/`). Since
  this is a client-side-routed SPA, configure your host to rewrite unknown
  paths (e.g. `/work/website-qa`) back to `index.html`.
