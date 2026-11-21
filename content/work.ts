import type { Claim } from "./site";

export type CaseStudy = {
  slug: string;
  title: string;
  lane: string;
  /** One line for the card and the page header. */
  summary: string;
  role: string;
  period: string;
  ledgerId: string;
  problem: string;
  built: Claim[];
  /** Design decisions with reasoning. Only where the reasoning is on record. */
  decisions?: { title: string; body: string }[];
  outcomes: Claim[];
  stack: string[];
  links: { label: string; href: string }[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "job-radar",
    title: "Job Radar",
    lane: "AI product engineering",
    summary:
      "A job search assistant that ranks postings without a model, pays for model judgement only where it is earned, and removes any sentence it cannot trace to evidence.",
    role: "Sole designer and developer",
    period: "2026 – Now",
    ledgerId: "proj-job-radar",
    problem:
      "Language models write fluent application material, and fluent is the problem: a cover letter can claim a technology, a team size or a metric the candidate never had. A tool that helps with a job search has to be cheap to run every day and unable to say something untrue on the candidate's behalf.",
    built: [
      {
        ledgerId: "p-jr-1",
        text: "A local-first assistant in TypeScript that ingests public ATS job-board APIs, normalizes and deduplicates postings, and ranks them with deterministic scoring before any model is involved.",
      },
      {
        ledgerId: "p-jr-2",
        text: "A single gateway for every paid Anthropic API call. It addresses requests by a hash of their exact prompt, reserves worst-case cost against run, day and month budgets before calling, and receipts every outcome including refusals and schema failures.",
      },
      {
        ledgerId: "p-jr-4",
        text: "An allowlist verifier for model-written resume and cover-letter text. It removes any sentence whose numbers, technologies, scope or qualifiers do not trace to a cited claim in the candidate's evidence file.",
      },
      {
        ledgerId: "p-jr-6",
        text: "A Playwright form filler that types prepared answers into employer application forms but never submits, and refuses demographic questions, attestations and any value the candidate has not configured.",
      },
    ],
    decisions: [
      {
        title: "Rank with arithmetic, judge with a model",
        body: "Deduplication, parsing, eligibility, scoring and ranking are deterministic code, so they run over the whole index on every pass and can be audited when a ranking looks wrong. A model is used only for semantic fit and for wording, and only on the best-ranked few.",
      },
      {
        title: "Facts are append-only; state is a fold",
        body: "Posting versions, sweeps, events, model calls and mail are never updated. Application state is derived by folding events in the order they happened, so an old email cannot undo a newer rejection. Derived values are stored under the hash of their exact inputs, which makes staleness a non-question.",
      },
      {
        title: "Reserve the money before spending it",
        body: "The gateway reserves the worst-case cost of a call against three budgets in one database transaction, and refuses the call if it could cross a ceiling. A call that returns no usage data is counted at its reserved worst case, never as zero.",
      },
      {
        title: "Strictness costs polish, never truth",
        body: "A resume rewrite that fails verification reverts to the candidate's own wording. A cover-letter sentence that fails is removed and listed for review. Because reverting is always available, the verifier can stay strict.",
      },
      {
        title: "Refusals are features",
        body: "The form filler stops before submit. It leaves a field blank rather than guess, and an unset value is treated as unknown rather than given a default. These refusals are pinned by tests that drive a real Chromium.",
      },
    ],
    outcomes: [
      {
        ledgerId: "p-jr-3",
        text: "All model output is validated with Zod before storage, and the JSON Schema sent to the API is generated from the same definitions, so malformed output is rejected and logged, never stored.",
      },
      {
        ledgerId: "p-jr-5",
        text: "Application state is an append-only event store in SQLite, derived by folding events in occurrence order.",
      },
      {
        ledgerId: "p-jr-7",
        text: "Architecture rules (dependency direction, no wall-clock reads in domain code) and refusal behavior are enforced by an automated test suite, including tests that drive a real Chromium.",
      },
    ],
    stack: ["TypeScript", "Node.js", "SQLite", "Anthropic API", "Zod", "Playwright", "Vitest"],
    // The repository link is added once docs/SPEC.md decision 5 is resolved.
    links: [],
  },
  {
    slug: "shroomspy",
    title: "ShroomSpy",
    lane: "Full-stack and growth engineering",
    summary:
      "A mushroom marketplace I designed, built and run alone, with an SEO program run as 200+ measured experiments.",
    role: "Founder & Head of Technology",
    period: "2023 – Now",
    ledgerId: "role-shroomspy",
    problem:
      "A content-heavy marketplace lives or dies on organic search, and most SEO work is unfalsifiable: a change ships, traffic moves, and nobody can say why. I wanted every change to be an experiment with a baseline and a grade.",
    built: [
      {
        ledgerId: "b-shroomspy-1",
        text: "ShroomSpy.com end to end on a TypeScript stack: Next.js 16 (App Router, SSR / ISR), Payload CMS, MongoDB, AWS / CloudFront, Stripe and three-locale i18n, from concept to production.",
      },
      {
        ledgerId: "b-shroomspy-3",
        text: "Payload beforeChange and validation hooks that auto-fill SEO and Open Graph defaults and reject malformed slugs, canonical URLs and JSON-LD before publish, with route-based rendering from a Pages collection over GraphQL into shared Next.js templates.",
      },
      {
        ledgerId: "b-shroomspy-5",
        text: "A formal SEO experiment protocol: hypothesis pinning, 28-day baselines, 60-day grading windows, automated grading and confounder detection.",
      },
      {
        ledgerId: "b-shroomspy-6",
        text: "A longitudinal SEO data warehouse in SQLite with automated daily ingest from Google Search Console, GA4, PageSpeed / CrUX and Microsoft Clarity, making ranking and traffic changes measurable rather than anecdotal.",
      },
      {
        ledgerId: "b-shroomspy-16",
        text: "The site chatbot, on OpenAI function calling: a first call with forced tool use picks among six search tools over the CMS collections and writes the queries, and a second call answers from the retrieved results.",
      },
    ],
    outcomes: [
      {
        ledgerId: "b-shroomspy-5",
        text: "200+ tracked experiments measured against Search Console, GA4, CrUX and Clarity data.",
      },
      {
        ledgerId: "b-shroomspy-10",
        text: "Eliminated trailing-slash 308 redirects (about 750 ms saved) and automated 301 redirects for historical slug changes to preserve link equity.",
      },
      {
        ledgerId: "b-shroomspy-7",
        text: "Re-architected a monolithic sitemap into a sitemap index with per-collection children plus a rescue sitemap.",
      },
      {
        ledgerId: "b-shroomspy-12",
        text: "An AI-crawler allowlist, llms.txt / ai.txt navigation files and structured citations for visibility in AI answer engines.",
      },
    ],
    stack: ["TypeScript", "Next.js", "Payload CMS", "MongoDB", "GraphQL", "AWS / CloudFront", "Stripe", "SQLite"],
    links: [{ label: "shroomspy.com", href: "https://shroomspy.com" }],
  },
  {
    slug: "basemyhome",
    title: "BaseMyHome",
    lane: "Platform and 3D",
    summary:
      "Lead developer for an AI-driven 3D real-estate sales platform: owned the application platform and brought a Three.js viewer into it.",
    role: "Lead Application Platform Developer",
    period: "2025 – 2026",
    ledgerId: "role-basemyhome",
    problem:
      "A startup selling real estate through an interactive 3D experience needs the viewer and the business application to behave as one product, and needs the platform to stay up while deals are in progress.",
    built: [
      {
        ledgerId: "b-basemyhome-1",
        text: "The full application platform end to end: a custom React front end on a Python API backend over PostgreSQL, delivering features from product spec to production at startup velocity.",
      },
      {
        ledgerId: "b-basemyhome-2",
        text: "The integration of a Three.js / WebGL 3D viewer into the platform workflow, with real-time interaction between the viewer and the core app.",
      },
    ],
    outcomes: [
      { ledgerId: "b-basemyhome-2", text: "Viewer load tuned to under 3 seconds." },
      { ledgerId: "b-basemyhome-3", text: "Platform uptime above 99% with zero deal-blocking P1 incidents." },
      {
        ledgerId: "b-basemyhome-4",
        text: "Platform-wide issues root-caused independently, within a sub-4-hour resolution SLA on critical bugs.",
      },
    ],
    stack: ["React", "TypeScript", "Three.js / WebGL", "Python", "PostgreSQL"],
    links: [],
  },
  {
    slug: "loopstring",
    title: "LoopString Automation",
    lane: "IoT and programmatic SEO",
    summary:
      "No-code automation as a service: phone apps talking to Linux edge devices in real time, and a marketing site rebuilt so search engines could read it.",
    role: "Founder & Head of Technology",
    period: "2022 – Now",
    ledgerId: "role-loopstring",
    problem:
      "Automation is priced out of reach for small and mid-size businesses. Lowering that barrier meant a platform where a phone, the cloud and a device on a shop floor exchange events in real time, and a single-page marketing site that Google could index.",
    built: [
      {
        ledgerId: "b-loopstring-1",
        text: "A no-code automation-as-a-service platform: a TypeScript web app, React Native iOS / Android clients and a Linux-device hardware layer.",
      },
      {
        ledgerId: "b-loopstring-2",
        text: "An event-driven IoT platform connecting the React Native clients to Linux edge devices over MQTT and WebSockets, with Node-RED flow orchestration for real-time device control and telemetry.",
      },
      {
        ledgerId: "b-loopstring-3",
        text: "The TypeScript web app and Node.js communication APIs bridging cloud services and on-device automation.",
      },
      {
        ledgerId: "b-loopstring-8",
        text: "JSON-LD across page templates behind schema-validation gates, plus llms.txt AI-crawler navigation and IndexNow submission.",
      },
    ],
    outcomes: [
      {
        ledgerId: "b-loopstring-4",
        text: "Playwright full-page pre-rendering fixed Search Console crawled-not-indexed across 102 of 103 SPA routes.",
      },
      {
        ledgerId: "b-loopstring-7",
        text: "Orphan-page indexation fixed with internal-link navigation and per-page lastmod: indexed URLs in Search Console went from 24 of 130 to 100+.",
      },
      {
        ledgerId: "b-loopstring-10",
        text: "35+ template-driven landing pages from shared scaffolding: 16 competitor comparison pages, 16 vertical use-case pages and broad search-term landings.",
      },
      {
        ledgerId: "b-loopstring-9",
        text: "Diagnosed a 100%-failing Google Indexing API integration and replaced it with an honest, operator-gated re-enable runbook.",
      },
    ],
    stack: ["TypeScript", "React Native", "Node.js", "MQTT", "WebSockets", "Node-RED", "Firebase", "Playwright"],
    links: [],
  },
  {
    slug: "mushroom-oracle",
    title: "Mushroom Oracle",
    lane: "AI product engineering",
    summary:
      "A research evidence server for mycology: hybrid retrieval over 321 sources, exposed as an MCP server that cites every factual claim or says it lacks the evidence.",
    role: "Sole designer and developer",
    period: "2026 – Now",
    ledgerId: "proj-mushroom-oracle",
    problem:
      "ShroomSpy publishes cultivation guidance, and a wrong temperature or substrate ratio is worse than no answer. The site's factual content needed a source that answers only from the research literature and admits when the literature is silent.",
    built: [
      {
        ledgerId: "p-oracle-1",
        text: "A retrieval-augmented generation pipeline in TypeScript that extracts text from PDF, EPUB and DOCX research documents, chunks it with overlap, enriches each chunk with LLM-extracted metadata, and embeds it with OpenAI text-embedding-3-small into SQLite.",
      },
      {
        ledgerId: "p-oracle-2",
        text: "Hybrid retrieval combining FTS5 lexical search and sqlite-vec vector search with Reciprocal Rank Fusion.",
      },
      {
        ledgerId: "p-oracle-3",
        text: "An MCP server with 14 tools, including question answering, evidence search and claim fact-checking. Answers are generated only from retrieved passages, with a citation for every factual claim, and report insufficient evidence rather than speculate.",
      },
    ],
    outcomes: [
      { ledgerId: "p-oracle-2", text: "A corpus of 321 sources and about 20,600 chunks." },
      {
        ledgerId: "p-oracle-4",
        text: "The Oracle is the required source for ShroomSpy's factual content: constants and claims in species pages, growing guides and cultivation calculators must be oracle-sourced rather than guessed.",
      },
    ],
    stack: ["TypeScript", "SQLite", "FTS5", "sqlite-vec", "OpenAI embeddings", "Model Context Protocol"],
    links: [],
  },
];

export const alsoBuilt: { name: string; text: string; ledgerId: string; href?: string }[] = [
  {
    name: "Odoo token-exchange gateway",
    ledgerId: "p-oap-1",
    text: "A Python / FastAPI gateway that holds one privileged Odoo credential, issues scoped and revocable ones, and fails closed.",
  },
  {
    name: "Local TTS Reader",
    ledgerId: "p-tts-1",
    text: "An open-source Obsidian plugin that reads notes aloud entirely on device, with no cloud speech engine, telemetry or API keys.",
    href: "https://github.com/JoshShearer/Note-Reader-Local",
  },
  {
    name: "Read Me Offline",
    ledgerId: "p-rmo-1",
    text: "A React Native Android app that extracts articles on the phone and reads them aloud offline with the device's own speech engine. In development.",
    href: "https://github.com/JoshShearer/Read-Me",
  },
  {
    name: "Venture Lab",
    ledgerId: "p-vl-1",
    text: "A React and Hono app that tags every claim with an evidence type and strength, so AI-generated hypotheses are never presented as market evidence.",
  },
  {
    name: "claude-workflow",
    ledgerId: "p-cw-1",
    text: "A shared Claude Code workflow of lifecycle commands, agents, skills and hooks that each project links to.",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
