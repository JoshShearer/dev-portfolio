# Portfolio rebuild spec

Status: approved 2026-11-21, with the decisions in section 12 recorded. Based on an audit of this repo (`dev` and `master`) and of `~/Documents/Dev/job-radar`.

## 1. Goal

Replace the current site with one that gets Josh Shearer interviews for senior roles. A hiring manager or engineer should, within 30 seconds on a phone, know what he does, see proof, and reach the résumé or his email. A longer visit should show how he thinks about systems.

The site is itself a work sample. Josh's headline skills include technical SEO and Core Web Vitals, so a slow or unindexable WebGL site would contradict the résumé. The rule that follows from this: **the content is fast static HTML, and the 3D is an enhancement on top of it, never a gate in front of it.**

Success is measured by:

- Every page complete and readable with JavaScript disabled.
- Lighthouse mobile on the home page and one case study: performance ≥ 95, accessibility 100, SEO 100.
- The 3D layer runs at 60 fps on an integrated-GPU laptop and degrades by itself on weak devices.
- Every factual claim on the site traces to a verified entry in the evidence ledger (section 4).

## 2. Why a clean rebuild

Nothing in the current code is worth carrying forward.

| Finding | Detail |
|---|---|
| The live site is three years stale | `joshshearer.org` and `joshshearer.co` both serve a build last modified 2023-11-27, titled "Josh's Dev Page". That is the React 17 / MUI / Create React App version on `master`. |
| `dev` is an unfinished port of another project's template | Six of seven pages render only their own component name. The landing page renders a joke FAQ. The last commit is 2024-12-24. |
| `dev` cannot build | The header imports `assets/magLogoPrimaryDark60.png` and the footer imports `assets/LS_Logo.png`; neither exists. `package-lock.json` is gitignored. |
| Dead code | `src/App.js` is the old MUI app. 26 `test.js` stubs import a Rematch store and a test helper that do not exist, and no test runner is installed. `src/mailgun.js` and `src/plans.js` belong to ShroomSpy. |
| Wrong identity | `robots.txt` points at the ShroomSpy sitemap. The footer's LinkedIn link goes to the ShroomSpy company page. Icons are mushrooms. The README says `.org`, the meta tags and sitemap say `.co`. The favicon `href` is a source path that does not resolve. |
| Broken behavior | The dark-mode toggle sets state nothing reads. Nav links mix absolute and relative paths. |
| Asset weight | 40 MB of tracked images, most of them template stock (team photos, product shots). The AVIF files are larger than the JPEGs they were made from (up to 5.3 MB). |
| Secrets hygiene | The local `.env` holds 27 keys for other projects, all with the `VITE_` prefix, which inlines any referenced key into the client bundle. The file is not committed. The new site needs no secrets at all. |
| Deploy is not reproducible | `firebase.json`, `.firebaserc` and `.github/` are gitignored. |
| Unused dependencies | firebase, daisyui, openai, headlessui, react-switch, react-firebase-hooks and others. |

Keep: the domain, the headshot (`src/assets/images/faces/Josh.png`, to be re-exported small), and the git history.

## 3. Audience and positioning

Target lanes, in priority order (from the job-radar search strategy):

1. Senior full-stack / platform engineering
2. AI-enabled product engineering
3. Solutions engineering
4. Growth engineering / technical SEO
5. Proptech / 3D / IoT

Readers are a recruiter (15 seconds, wants title, location, stack, résumé), a hiring manager (2 minutes, wants proof of ownership and outcomes), and an engineer on the panel (5 minutes or more, wants to see how a real system is put together).

Positioning: an engineer who builds closed-loop systems, meaning software that is measured, verified, and honest about what it knows. This is the thread through the whole career: control systems engineering, a 200-experiment SEO program with baselines and grading windows, and an LLM pipeline that removes any sentence it cannot trace to evidence.

Hero copy (approved):

> **Josh Shearer**: senior full-stack engineer, Austin, TX.
> I build software that closes the loop: measured, verified, and honest about what it knows.

Proof strip under the hero, each item from a verified ledger claim:

- 200+ measured SEO experiments (`b-shroomspy-5`)
- Three.js viewer tuned to load in under 3 seconds (`b-basemyhome-2`)
- An LLM pipeline where unverifiable sentences are removed (`p-jr-4`)
- Platform uptime above 99% with zero deal-blocking P1 incidents (`b-basemyhome-3`)

## 4. Content and the truth rule

Source of record: `job-radar/config/candidate/evidence.yaml`. It is private and stays out of this repo.

- The site keeps its own typed content files under `content/`, seeded once from the ledger.
- Every factual statement (numbers, technologies, scope, titles, dates) carries the ledger id it came from.
- Only `verified: true` claims are used. As of this audit that excludes `b-basemyhome-5`, `b-loopstring-12` and `b-learning-solutions-1`.
- `npm run check:claims` compares the ids in `content/` against the ledger when `JR_EVIDENCE` points at it, and fails on an id that is missing or unverified. It is a local check, since CI cannot see the ledger.
- Compensation, preferences and anything from `personal.yaml` never appear in this repo.

Confidentiality: BaseMyHome has shut down and may be shown in full, including screenshots, viewer captures and code excerpts (source material is in `~/Documents/Dev/BaseMyHome-Platform-Root`). NHIMM is a current contract and is described in text only, at architecture level, with no screenshots or internal names.

Any screenshot of Job Radar comes from a seeded demo database, never from real applications.

## 5. Pages

| Route | Purpose |
|---|---|
| `/` | Hero, selected work, experience, capabilities, about, contact |
| `/work/[slug]` | One case study per flagship project |
| `/resume` | HTML résumé with a print stylesheet and a PDF download |
| 404 | Short, with links home and to work |

Home page sections, in order:

1. **Hero.** Name, positioning line, proof strip, three actions: Résumé, Email, GitHub. LinkedIn in the nav.
2. **Selected work.** Five case-study cards, each with a one-line outcome and its schematic (section 7).
3. **Experience.** A timeline from the ledger: NHIMM, BaseMyHome, ShroomSpy, LoopString, Robo Browser, Valin, ARES. Two or three claims each. The Valin and ARES entries stay, since they support the solutions-engineering lane and the controls background.
4. **Capabilities.** Skills grouped by ledger category, showing only `expert` and `strong` by default. No percentage bars.
5. **About.** Three short paragraphs on the path from controls engineer to sales engineer to founder and engineer. Headshot. B.S. Electrical Engineering, Washington State University.
6. **Contact.** Email link, GitHub, LinkedIn. No form and no backend.

Case studies, in order:

| Slug | Lane it serves | Core of the story |
|---|---|---|
| `job-radar` | AI product, architecture | Deterministic ranking, one budgeted model gateway, an allowlist verifier, a form filler that refuses to submit. Public repo. |
| `shroomspy` | Full-stack, growth / SEO | Next.js and Payload CMS marketplace built and run solo; the experiment protocol and SEO data warehouse. |
| `basemyhome` | Platform, 3D | Owning a React, Python and PostgreSQL platform; integrating the Three.js viewer. Show the real product: screenshots and a capture of the viewer. |
| `loopstring` | IoT, programmatic SEO | Event-driven platform over MQTT and WebSockets; pre-rendering that fixed indexation on 102 of 103 routes. |
| `mushroom-oracle` | AI product | Hybrid retrieval (FTS5 plus vectors, rank fusion) exposed as an MCP server with cited answers. |

Each case study follows one template: the problem, the constraints, the system (interactive schematic), three to five decisions with the reasoning, outcomes with numbers, stack, links.

A compact "Also built" list on the home page covers the NHIMM token gateway, Local TTS Reader (open source), Read Me Offline, Venture Lab and claude-workflow.

Redirect the old routes: `/resume-page` to `/resume`, `/projects-page` to `/#work`, `/profile-page` and `/landing-page` and `/technical-page` to `/`.

## 6. Design direction

Concept: **the living schematic.** The visual language is an engineering drawing, like the P&ID and control-loop diagrams from Josh's first career. Thin precise lines, labelled nodes, and one accent color that appears only where a signal is moving. The 3D is not decoration. Each scene is the real architecture of the thing being described.

Principles:

- Quiet by default. Large type, generous whitespace, one accent, no gradients, no glow or bloom, no particles.
- One memorable thing per page: the schematic.
- Motion means something: a pulse travels where data travels, and stops where the system refuses.

Tokens (starting point, to be tuned in the design pass):

| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | `#F3F4F1` | `#0E1114` | page background |
| `--sheet` | `#FBFCFA` | `#151A1F` | cards, raised surfaces |
| `--ink` | `#14181D` | `#E6E9EC` | text |
| `--pencil` | `#5B6570` | `#97A1AC` | secondary text, node labels |
| `--rule` | `#CDD3CF` | `#2A323A` | hairlines, schematic traces |
| `--signal` | `#C23A18` | `#FF6A3D` | live pulses, primary action, focus ring |

Theme follows the operating system, with a working toggle that persists.

Type: Archivo variable (the face Job Radar's own UI uses, so the two read as one body of work), with the expanded width for display sizes and normal width for body. IBM Plex Mono for node tags, dates and data. Both self-hosted, subset, `font-display: swap`. Body text 17 to 18 px with a 40 rem measure.

Layout: a 12-column grid with wide margins. On desktop the schematic occupies the right half of the hero and sits beside each work section. On mobile it sits above the text at reduced height. Text never overlays a moving canvas.

## 7. The 3D layer

### One data model, two renderers

Each schematic is plain data (`content/schematics.ts`):

```ts
type Schematic = {
  id: string;
  title: string; // the diagram's accessible description
  nodes: {
    id: string;
    label: string;
    kind: "source" | "process" | "store" | "gate" | "human" | "sink";
    pos: [number, number, number]; // grid units; z lifts a node off the board
    note: string; // one sentence, shown in the DOM
  }[];
  edges: { from: string; to: string; kind: "data" | "control" }[];
  refusals?: { from: string; dir: [number, number]; label: string }[];
};
```

A refusal is a stub out of a node that ends in a cross: the place where the system says no.

- `SchematicSvg` renders it to static SVG at build time. This is what crawlers, no-JS visitors, reduced-motion users and devices without a GPU get, and it is the poster the canvas fades in over, so there is no layout shift.
- `GlScene` renders the same data in WebGL after the page has loaded.

On case studies the node list is rendered as real HTML under the diagram. The canvas is `aria-hidden`; keyboard and screen-reader users use the list, and focusing a list item highlights its node.

### Scenes

- **Hero: the control loop.** Goal, decide, build, ship, measure, with a feedback trace closing the loop. Pulses circulate. The pointer tilts the board a few degrees.
- **Home work list.** On wide screens a sticky panel beside the list shows the schematic of the card nearest the middle of the viewport. In WebGL the five schematics sit side by side and the camera glides between them. There is no scroll hijacking. On narrow screens each card carries its own static diagram.
- **Case study.** The project's schematic, interactive: hover or focus a node to highlight it and its edges; drag to turn the board within limits.

On the Job Radar schematic, pulses die at three crosses: the budget gateway (over budget), the verifier (untraceable sentence) and the form filler (never submits). Nothing reaches the employer except through the human node.

### Implementation

- Plain three.js in one class (`components/schematic/gl-scene.ts`), not React Three Fiber: the scene is small and imperative, and this keeps the 3D chunk to about 134 kB gzip. No post-processing.
- Nodes are flat-shaded tokens with ink outlines; traces are lines; pulses are small spheres. Labels are HTML positioned over the canvas each frame, so text stays sharp and follows the theme.
- The 3D chunk loads by dynamic import after the `load` event, on idle, and only when the figure is near the viewport.
- Device pixel ratio is clamped to 1.75. Rendering stops when the canvas is off screen or the tab is hidden.
- A frame-time monitor drops to 1x pixels, then falls back to the SVG, if the device cannot hold 30 fps.
- The SVG stays, and three.js never loads, when: WebGL 2 is unavailable, the renderer is software (no GPU), `prefers-reduced-motion` is set, or Save-Data is on. `?gl=1` and `?gl=0` override this for testing.

## 8. Stack and architecture

- **Next.js App Router, static export, TypeScript strict.** This is Josh's headline stack and it produces plain static HTML. Astro would ship less JavaScript but would not demonstrate the stack the résumé leads with. Use current stable versions and confirm them at scaffold time.
- **Tailwind CSS** driven by the CSS variables in section 6. No component library.
- **Typed `.ts` content files** for profile, experience, skills and case studies. Every case study has the same shape, and every claim carries its ledger id, which `check:claims` reads.
- **No runtime backend, no Firebase SDK, no environment variables.**
- **Résumé PDF** generated at build time by Playwright printing `/resume`, so the HTML and PDF cannot disagree.
- **Hosting:** static files on Firebase Hosting (the domain is already attached), with `firebase.json` committed this time.
- **CI on GitHub Actions:** typecheck, lint, build, link check, Lighthouse CI against the budgets in section 10, then a preview deploy on pull requests and a production deploy on `master`.

```
app/                  layout, pages, metadata, sitemap, robots
components/           UI
components/schematic/ schematic-svg, gl-scene, layout math, the figure and work-board wrappers
content/              site.ts, experience.ts, skills.ts, work.ts, schematics/*.ts
scripts/              check-claims, postbuild (résumé PDF and Open Graph images), screenshots
public/               fonts, headshot, llms.txt
```

## 9. SEO and answer-engine readiness

The site should show the practice it describes.

- `joshshearer.co` is canonical. `joshshearer.org` redirects to it with a 301, path preserved.
- Unique title and description per page. Open Graph images generated at build from each page's SVG schematic.
- JSON-LD: `Person` and `WebSite` on home, `ProfilePage` on about content, `CreativeWork` or `SoftwareSourceCode` plus `BreadcrumbList` on case studies. Validated in CI.
- Generated `sitemap.xml` with real `lastmod`, a correct `robots.txt`, and an `llms.txt` that lists the pages and summarizes each.
- Semantic HTML with one `h1` per page.
- Analytics: none yet. The live site carries no tag, and the two IDs in the old `dev` branch came from another project's template. Add one GA4 tag, loaded on idle, once Josh names the property.

## 10. Budgets

| Measure | Budget | Measured 2026-11-21 (Lighthouse mobile, local) |
|---|---|---|
| LCP, mobile, throttled 4G | under 1.8 s; the LCP element is hero text, never the canvas | 0.8 to 0.9 s |
| CLS | under 0.02 | 0 |
| Lighthouse performance | 95 or more | home 93 to 95, case study 92 to 94, résumé 96 |
| Lighthouse accessibility, best practices, SEO | 100 | 100 on all three |
| JavaScript before the 3D chunk | 110 kB gzip or less | about 175 kB; missed, see below |
| 3D chunk, lazy | 200 kB gzip or less | 134 kB |
| Page transfer without 3D | 600 kB or less | about 300 kB |
| Frame rate | 60 fps on an integrated-GPU laptop; 30 fps floor before fallback | not yet measured on real hardware |
| Accessibility | WCAG 2.2 AA: contrast, visible focus, full keyboard path, reduced-motion respected | automated checks pass; no manual screen-reader pass yet |

The JavaScript budget was set before choosing the framework and is not reachable on Next.js: the App Router runtime alone is about 170 kB. Its cost shows up as roughly 250 to 350 ms of blocking time while React hydrates, which is what holds performance just under 95 on the larger pages. Lighthouse runs on a machine without a GPU, so it measures the SVG path.

Lighthouse CI (`lighthouserc.json`) fails the build below performance 90, accessibility 100, SEO 100, or over the LCP and CLS budgets.

## 11. Phases

Each phase ends in something deployable.

**Phase 0: reset.** Start a new project from scratch in its own directory (`~/Documents/Dev/dev-portfolio`) with fresh git history. Scaffold the stack, tokens, fonts and CI. Commit the hosting config. Nothing is pushed until the site is approved; it then replaces the contents of the existing GitHub repository.
Done when: an empty styled shell deploys to a preview URL from CI.

**Phase 1: the complete site without 3D.** All content files, every page, résumé HTML and PDF, SEO, redirects.
Done when: every page reads well with JavaScript off, the budgets pass, and `check:claims` passes. This phase alone is a better site than the live one and can go to production.

**Phase 2: schematics as SVG.** The data model, the five project schematics and the hero loop, rendered to SVG and used for Open Graph images.
Done when: every schematic is legible at 360 px wide and each node appears in the adjacent list.

**Phase 3: WebGL.** The scene renderer, hero interaction, home scroll choreography, case-study interaction, quality fallback.
Done when: frame-rate budgets hold on the test devices, the fallback triggers correctly, and Lighthouse scores have not moved from phase 1.

**Phase 4: launch.** Cross-browser and real-device pass (Safari iOS, Chrome Android, Firefox), copy edit, production deploy, the `.org` to `.co` redirect, Search Console sitemap submission, and updating the README and the GitHub repo homepage (both currently say `.org`).

## 12. Decisions

| # | Decision | Outcome |
|---|---|---|
| 1 | Canonical domain | Decided: `joshshearer.co` |
| 2 | Hosting | Decided: Firebase Hosting |
| 3 | Hero copy in section 3 | Decided: approved as drafted |
| 4 | What may be shown for past employers | Decided: BaseMyHome unrestricted; NHIMM text only |
| 5 | Resolve the job-radar repository item from the 2026-11-21 audit before the site links to that repo | Open. Link withheld until resolved |
| 6 | Where to rebuild | Decided: a new directory with fresh history, pushed to replace the existing GitHub repository once approved |

## 13. Out of scope

A blog, a CMS, a contact form, authentication, i18n, a custom 3D model or avatar, sound, and any page that requires WebGL to read.
