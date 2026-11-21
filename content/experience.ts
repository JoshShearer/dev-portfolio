import type { Claim } from "./site";

export type Role = {
  ledgerId: string;
  company: string;
  title: string;
  start: string; // YYYY-MM
  end: string | null; // null = present
  context?: string;
  /** `featured` claims show on the home page; all show on the résumé. */
  claims: (Claim & { featured?: boolean })[];
};

export const roles: Role[] = [
  {
    ledgerId: "role-nhimm",
    company: "NHIMM",
    title: "Software Developer (Contract)",
    start: "2026-08",
    end: null,
    claims: [
      {
        featured: true,
        ledgerId: "p-oap-1",
        text: "Built a Python / FastAPI token-exchange gateway for Odoo 18 that holds one privileged credential and issues scoped, independently revocable credentials to internal applications.",
      },
      {
        ledgerId: "p-oap-2",
        text: "Implemented an ordered twelve-step request check gating each call by instance, company, model and method, with per-credential and global concurrency limits and a per-instance circuit breaker.",
      },
      {
        featured: true,
        ledgerId: "p-oap-3",
        text: "Made the gateway fail closed: it refuses to forward any request whose audit-log entry cannot be written.",
      },
      {
        ledgerId: "p-oap-4",
        text: "Tracked a negative security test suite as a ledger in pytest, covering 64 of 66 specified refusal cases.",
      },
    ],
  },
  {
    ledgerId: "role-basemyhome",
    company: "BaseMyHome",
    title: "Lead Application Platform Developer",
    start: "2025-11",
    end: "2026-05",
    context: "AI-driven 3D real-estate sales platform.",
    claims: [
      {
        featured: true,
        ledgerId: "b-basemyhome-1",
        text: "Owned the application platform end to end: a custom React front end on a Python API over PostgreSQL, from product spec to production.",
      },
      {
        featured: true,
        ledgerId: "b-basemyhome-2",
        text: "Integrated a Three.js / WebGL 3D viewer into the platform workflow, wired real-time interaction between the viewer and the core app, and tuned viewer load to under 3 seconds.",
      },
      {
        featured: true,
        ledgerId: "b-basemyhome-3",
        text: "Held platform uptime above 99% with zero deal-blocking P1 incidents.",
      },
      {
        ledgerId: "b-basemyhome-4",
        text: "Root-caused platform-wide issues independently and met a sub-4-hour resolution SLA on critical bugs.",
      },
    ],
  },
  {
    ledgerId: "role-shroomspy",
    company: "ShroomSpy",
    title: "Founder & Head of Technology",
    start: "2023-07",
    end: null,
    context: "Next.js and Payload CMS mushroom marketplace.",
    claims: [
      {
        featured: true,
        ledgerId: "b-shroomspy-1",
        text: "Designed, built and operate ShroomSpy.com end to end on a TypeScript stack: Next.js 16 (App Router, SSR / ISR), Payload CMS, MongoDB, AWS / CloudFront, Stripe and three-locale i18n.",
      },
      {
        featured: true,
        ledgerId: "b-shroomspy-5",
        text: "Designed a formal SEO experiment protocol (hypothesis pinning, 28-day baselines, 60-day grading windows, automated grading, confounder detection) and ran 200+ tracked experiments against Search Console, GA4, CrUX and Clarity data.",
      },
      {
        ledgerId: "b-shroomspy-2",
        text: "Modeled the Payload CMS backend (collections, access control, content models, REST / GraphQL APIs) behind CMS-driven page layouts and reusable content blocks.",
      },
      {
        ledgerId: "b-shroomspy-6",
        text: "Stood up a longitudinal SEO data warehouse in SQLite with automated daily ingest from Google Search Console, GA4, PageSpeed / CrUX and Microsoft Clarity.",
      },
      {
        ledgerId: "b-shroomspy-13",
        text: "Drove origin-wide cold-render TTFB reduction (collapsed barrier pipelines, a server-side caching layer, the Next.js 16 migration) and kept pages under Googlebot's 2 MB render limit.",
      },
      {
        ledgerId: "b-shroomspy-12",
        text: "Built an AI-crawler allowlist, llms.txt / ai.txt navigation files and structured citations to improve visibility in AI answer engines.",
      },
      {
        ledgerId: "b-shroomspy-16",
        text: "Built the site chatbot on OpenAI function calling: a first call with forced tool use picks among six search tools over the CMS collections, and a second call answers from the retrieved results.",
      },
    ],
  },
  {
    ledgerId: "role-loopstring",
    company: "LoopString Automation",
    title: "Founder & Head of Technology",
    start: "2022-01",
    end: null,
    context: "No-code automation as a service.",
    claims: [
      {
        featured: true,
        ledgerId: "b-loopstring-2",
        text: "Built an event-driven IoT platform connecting React Native iOS / Android clients to Linux edge devices over MQTT and WebSockets, with Node-RED flow orchestration for real-time device control and telemetry.",
      },
      {
        featured: true,
        ledgerId: "b-loopstring-4",
        text: "Built Playwright full-page pre-rendering that fixed Search Console crawled-not-indexed across 102 of 103 SPA routes.",
      },
      {
        ledgerId: "b-loopstring-3",
        text: "Architected the TypeScript web app and Node.js communication APIs bridging cloud services and on-device automation.",
      },
      {
        ledgerId: "b-loopstring-10",
        text: "Built 35+ template-driven landing pages from shared scaffolding, each with BreadcrumbList JSON-LD and prerendered HTML for indexability.",
      },
      {
        ledgerId: "b-loopstring-7",
        text: "Fixed orphan-page indexation with internal-link navigation and per-page lastmod (Search Console: 24 of 130 URLs indexed to 100+).",
      },
    ],
  },
  {
    ledgerId: "role-robobrowser",
    company: "Robo Browser",
    title: "Full-Stack Consultant",
    start: "2022-01",
    end: "2023-08",
    claims: [
      {
        featured: true,
        ledgerId: "b-robobrowser-1",
        text: "Modernized automated-browser tooling in JavaScript / TypeScript and introduced enforced naming and directory standards to keep the codebase maintainable.",
      },
    ],
  },
  {
    ledgerId: "role-learning-solutions",
    company: "Learning Solutions",
    title: "Technology Consultant",
    start: "2019-01",
    end: "2022-01",
    claims: [],
  },
  {
    ledgerId: "role-valin",
    company: "Valin Corporation",
    title: "Sales Engineer / Account Manager",
    start: "2012-01",
    end: "2018-01",
    claims: [
      {
        featured: true,
        ledgerId: "b-valin-1",
        text: "Grew a $2M to $4M industrial account base across semiconductor, aerospace, defense and data-center clients.",
      },
      { ledgerId: "b-valin-3", text: "Won and managed multiple $1M+ projects." },
      {
        featured: true,
        ledgerId: "b-valin-5",
        text: "Was on call to troubleshoot the systems I sold in the field: mostly hardware, and also control systems with a software component.",
      },
    ],
  },
  {
    ledgerId: "role-ares",
    company: "ARES Corporation",
    title: "Control Systems Engineer",
    start: "2010-01",
    end: "2012-01",
    claims: [
      {
        featured: true,
        ledgerId: "b-ares-1",
        text: "Instrumentation and control design (P&ID development, instrument selection, Siemens S7 / WinCC PLC and HMI programming) for federal infrastructure projects.",
      },
    ],
  },
];

export function period(role: Pick<Role, "start" | "end">): string {
  const y = (s: string) => s.slice(0, 4);
  const end = role.end ? y(role.end) : "Now";
  return y(role.start) === end ? end : `${y(role.start)} – ${end}`;
}
