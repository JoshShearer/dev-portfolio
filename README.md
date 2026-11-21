# joshshearer.co

Josh Shearer's portfolio. A static Next.js site; the 3D layer is an enhancement over complete HTML.

`docs/SPEC.md` is the plan: goals, design direction, the schematic system, budgets and phases.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build      # static export to out/, plus the résumé PDF and Open Graph images
npm run shots      # screenshots of the key states into .shots/ (after a build)
JR_EVIDENCE=path/to/evidence.yaml npm run check:claims
```

The build needs a Chromium for Playwright (`npx playwright install chromium`).

## How it is put together

- `content/` holds everything the site says, as typed data. Each claim carries the id of the evidence-ledger entry it comes from, and `check:claims` verifies those ids.
- `content/schematics.ts` holds the architecture diagrams as data. `components/schematic/` renders them twice: static SVG in the HTML, and a three.js scene loaded afterwards on devices with a GPU.
- Add `?gl=1` or `?gl=0` to any URL to force the WebGL scene on or off.

Hosting is Firebase Hosting, serving `out/` (`firebase.json`).

Archivo is used under the SIL Open Font License (`app/fonts/ARCHIVO-OFL.txt`).
