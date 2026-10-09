# Uditha Balalla — Portfolio

A single-page portfolio for an AI Product Designer, built in React with Motion.
The whole site is one motion piece: a WebGL particle system runs behind every
page and, as you scroll, builds the story of an AI product, chapter by chapter.

## Stack
- **Vite + React + TypeScript**
- **Tailwind CSS** (design tokens in `tailwind.config.js`)
- **Motion** (`motion/react`) — every animation: reveals, scroll-linked effects,
  springs, shared-layout nav highlight, page transitions
- **Lenis** — smooth scrolling, driven by Motion's frame loop so scroll-linked
  animations read the scroll position in the same frame
- **Raw WebGL** — the story field (~11k GPU particles, no three.js)
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
### The story field
[`StoryField.tsx`](src/components/story/StoryField.tsx) is one WebGL particle
system, fixed behind every page and mounted once in [`App.tsx`](src/App.tsx).
As you scroll, the same particles take each chapter's form apart and **build
the next one**: they assemble from the bottom up, swirl in flight and settle
crisp. Scroll back and the form deconstructs. A caption
([`StoryCaption.tsx`](src/components/story/StoryCaption.tsx)) names each
chapter.

| Chapter | Section | Form |
|---|---|---|
| 01 Noise | Hero | a turbulent nebula; the cursor stirs it |
| 02 Intelligence | About | a neural network, with pulses flowing through it |
| 03 Craft | Skills | a geodesic dome, built ring by ring |
| 04 Journey | Experience | a rising double helix with a milestone per role |
| 05 Product | Work, case studies | an exploded interface: window, layout, content, AI assistant |
| 06 People | Contact | the word "hello." |

- A section picks its chapter by spreading `storyScene(n)` onto its root
  ([`story.ts`](src/components/story/story.ts), which also holds the chapter
  titles and lines).
- The forms are procedural, in [`shapes.ts`](src/components/story/shapes.ts).
  Each point also carries a position along its shape's path, which the shader
  turns into travelling pulses of light.
- Where each form sits, how big and bright it is, and how it moves are the
  `SCENES` at the top of `StoryField.tsx`, with `mobile` overrides per scene.
- The cursor parts the particles and tilts the form; a click sends a ring of
  light; the page opens with every particle bursting out of a single point.

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
- `.lens-surface` + [`trackLens`](src/components/ui/lens.ts) — cards with a
  soft glow that follows the cursor (Skills, Contact socials). Skill cards swing
  up into place like pieces being set.
- [`ScrambleText`](src/components/ui/ScrambleText.tsx) — the Contact heading
  decodes itself from random glyphs, as the particles spell "hello.".
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
- The story field ([`StoryField.tsx`](src/components/story/StoryField.tsx))
  recolours live on theme switch: **dark** = cyan→violet glow on black
  (additive), **light** = deep teal→indigo ink on paper.
- ⚠️ Editing `tailwind.config.js` requires a **dev-server restart** to recompile
  the color tokens (Vite doesn't hot-reload that file).

## Notes
- Respects `prefers-reduced-motion` from one flag in `lib/motion.ts`: the
  story field shows each chapter's form as a still frame, and content appears
  without movement (`MotionConfig reducedMotion="always"` in `App.tsx`). **On Windows this follows Settings → Accessibility → Visual
  effects → Animation effects**, so with that off you'll see the still version.
- To preview full motion locally regardless of that setting, open the dev
  server with `?motion` (e.g. `http://localhost:5173/?motion`). This switch is
  compiled out of production builds.
- The story field pauses in hidden tabs, caps device pixel ratio at 2, scales
  its particle count to the device (11k / 8k / 5k), and degrades to a plain
  background if WebGL is unavailable or the context is lost.
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
