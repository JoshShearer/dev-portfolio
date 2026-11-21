# joshshearer.co

Josh Shearer's portfolio. A static Next.js site; the 3D layer is an enhancement over complete HTML.

`docs/SPEC.md` is the plan: goals, design direction, the schematic system, budgets and phases.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build      # static export to out/
```

Hosting is Firebase Hosting, serving `out/` (`firebase.json`).

Archivo is used under the SIL Open Font License (`app/fonts/ARCHIVO-OFL.txt`).
