# Uditha Balalla — Portfolio

A single-page portfolio for an AI Product Designer, built in React with Motion.
The whole site is one motion piece: a particle field runs behind every page and
resolves from noise into signal as you scroll through the résumé.

## Stack
- **Vite + React + TypeScript**
- **Tailwind CSS** (design tokens in `tailwind.config.js`)
- **Motion** (`motion/react`) — every animation: reveals, scroll-linked effects,
  springs, shared-layout nav highlight, page transitions
- **Lenis** — smooth scrolling, driven by Motion's frame loop so scroll-linked
  animations read the scroll position in the same frame
- **Canvas 2D** — the particle field (no WebGL dependency)
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

### Project images
Set `coverImage` on a project (a path under `public/`) to replace its gradient
placeholder, and `image` / `imageAlt` on any of its `sections` to illustrate
the case study. See the dispatcher console project for an example.

## Sections
Navbar (with theme toggle) · Hero (interactive particle field) · About (marquee + stats) · Skills · Experience & Education · Selected Work · Contact · Footer

## The motion system: "signal from noise"
### The particle field
[`SignalField.tsx`](src/components/field/SignalField.tsx) is one 2D canvas,
fixed behind every page and mounted once in [`App.tsx`](src/App.tsx), so it
carries on across sections and route changes. Particles drift through a flow
field (the noise). Around the cursor they snap onto a lattice and link into a
network (the signal), then dissolve back, leaving a trail. A click sends a ring
of order outward. With no cursor (touch) the lens wanders on its own.
- **Scrolling travels through it**: loose particles parallax at three depths,
  the lattice plane drifts at 0.12× the page, and fast scrolling stretches the
  particles into streaks.
- **Each section sets a mood** by spreading `fieldMood(intensity, order)` onto
  its root: how present the field is, and how much of it has crystallised onto
  the lattice. Moods blend smoothly across section boundaries. They run from
  pure noise in the hero (`1, 0`) to a fully settled grid behind Contact
  (`0.85, 1`); behind dense copy the field and the cursor lens dim down.
- Lattice points are slots holding one particle each, so it fills into a clean
  grid; links come from lattice neighbours, so a fully settled screen stays
  cheap (about 1.5 ms a frame with ~950 particles).
- Tunables are the constants at the top of the file; colours per theme are in
  `PALETTES` there.

### The rest of the language
Shared timing lives in [`lib/motion.ts`](src/lib/motion.ts): one expo-out
curve, a few spring presets, and `focusIn` — the signature reveal, where content
comes into focus (rising, fading in, un-blurring), echoing the field.
- [`Reveal`](src/components/ui/Reveal.tsx) / [`SplitReveal`](src/components/ui/SplitReveal.tsx)
  — focus-in reveals for blocks and word-masked headlines.
- [`SectionIntro`](src/components/ui/SectionIntro.tsx) — numbered chapter
  markers (01–05) whose rule draws itself.
- [`ScrollWords`](src/components/ui/ScrollWords.tsx) — the About paragraph
  lights up word by word with the scroll. [`CountUp`](src/components/ui/CountUp.tsx)
  counts the stats in.
- `.lens-surface` + [`trackLens`](src/components/ui/lens.ts) — cards that reveal
  the field's dotted lattice under the cursor (Skills, Contact socials).
- [`Marquee`](src/components/ui/Marquee.tsx) speeds up, leans and reverses with
  scroll velocity.
- Experience timelines draw themselves as you scroll; project covers open from
  an inset window as they scroll in, drift in parallax, and show a "View case
  study" pill that trails the cursor.
- The navbar's active highlight slides between links (shared layout), and the
  bar tucks away while you scroll down.
- Hero: rotating serif accent word (`hero.rotating` in
  [`content.ts`](src/data/content.ts), colours `ACCENTS` in
  [`Hero.tsx`](src/components/Hero.tsx)), cursor depth parallax, spotlight
  (`--hero-glow` in [`index.css`](src/index.css)), magnetic buttons.

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
- The particle field ([`SignalField.tsx`](src/components/field/SignalField.tsx))
  recolours live on theme switch: **dark** = cyan→violet glow on black
  (additive), **light** = deep teal→indigo on paper.
- ⚠️ Editing `tailwind.config.js` requires a **dev-server restart** to recompile
  the color tokens (Vite doesn't hot-reload that file).

## Notes
- Respects `prefers-reduced-motion` from one flag in `lib/motion.ts`: the
  particle field renders one still frame (re-tinted per section), and content
  appears without movement (`MotionConfig reducedMotion="always"` in `App.tsx`). **On Windows this follows Settings → Accessibility → Visual
  effects → Animation effects**, so with that off you'll see the still version.
- To preview full motion locally regardless of that setting, open the dev
  server with `?motion` (e.g. `http://localhost:5173/?motion`). This switch is
  compiled out of production builds.
- The particle field pauses in hidden tabs, caps device pixel ratio at 2,
  batches its draw calls, and is wrapped in an error boundary so a rendering
  failure degrades to a plain background.
- Scroll reveals **replay** every time an element re-enters the viewport. Pass
  `once` to a `<Reveal>`/`<SplitReveal>` to play it only the first time.
- Client-side navigation (e.g. Home → a project page → back) resets scroll to
  the top (see [`useRouteScrollFix.ts`](src/hooks/useRouteScrollFix.ts)), and
  the new page comes into focus. `scrollToHash()` also calls
  `lenis.resize()` before scrolling, since Lenis caches the page's scroll
  limit and a stale (too-small) limit from a shorter previous page would
  otherwise clamp the scroll short of its target.
- Deploy anywhere static: Vercel, Netlify, or GitHub Pages (`dist/`). Since
  this is a client-side-routed SPA, configure your host to rewrite unknown
  paths (e.g. `/work/website-qa`) back to `index.html`.
