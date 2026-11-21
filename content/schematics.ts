/**
 * Architecture diagrams as data. One definition feeds two renderers: static
 * SVG (components/schematic/schematic-svg.tsx) and WebGL (gl-scene.ts).
 *
 * Coordinates are grid units: x to the right, y down the page, z up off the
 * board. Every node also appears as a list item next to the diagram, so the
 * `note` is what a screen-reader or no-canvas visitor gets.
 */

export type NodeKind = "source" | "process" | "store" | "gate" | "human" | "sink";

export type SchematicNode = {
  id: string;
  label: string;
  kind: NodeKind;
  pos: [x: number, y: number, z: number];
  note: string;
};

export type SchematicEdge = {
  from: string;
  to: string;
  /** `data` flows forward; `control` is feedback or a command (drawn dashed). */
  kind: "data" | "control";
};

/** Where the system refuses: a stub out of a node that ends in a cross. */
export type Refusal = { from: string; dir: [dx: number, dy: number]; label: string };

export type Schematic = {
  id: string;
  title: string;
  nodes: SchematicNode[];
  edges: SchematicEdge[];
  refusals?: Refusal[];
};

export const heroLoop: Schematic = {
  id: "control-loop",
  title: "A closed control loop: goal, decide, build, ship, measure, and feed the measurement back",
  nodes: [
    { id: "goal", label: "Goal", kind: "source", pos: [0, 1, 0], note: "What the system is supposed to achieve." },
    { id: "decide", label: "Decide", kind: "gate", pos: [2.5, 1, 0.6], note: "Compare the goal with what was measured." },
    { id: "build", label: "Build", kind: "process", pos: [5, 1, 0], note: "Make the change." },
    { id: "ship", label: "Ship", kind: "process", pos: [7.5, 1, 0], note: "Put it in front of users." },
    { id: "users", label: "Users", kind: "sink", pos: [10, 1, 0], note: "The people the system is for." },
    { id: "measure", label: "Measure", kind: "store", pos: [5, 3.6, 0], note: "Record what actually happened." },
  ],
  edges: [
    { from: "goal", to: "decide", kind: "data" },
    { from: "decide", to: "build", kind: "data" },
    { from: "build", to: "ship", kind: "data" },
    { from: "ship", to: "users", kind: "data" },
    { from: "ship", to: "measure", kind: "data" },
    { from: "measure", to: "decide", kind: "control" },
  ],
};

export const schematics: Record<string, Schematic> = {
  "job-radar": {
    id: "job-radar",
    title: "Job Radar architecture: postings are ranked without a model, paid calls pass a budget gate, written text passes a verifier, and only the human submits",
    nodes: [
      { id: "boards", label: "Job boards", kind: "source", pos: [0, 1, 0], note: "Public ATS job-board APIs, rate-limited per host." },
      { id: "sweep", label: "Sweep", kind: "process", pos: [2.5, 1, 0], note: "Fetches each board, then normalizes and deduplicates postings." },
      { id: "facts", label: "Fact store", kind: "store", pos: [5, 1, 0], note: "Append-only SQLite: posting versions, sweeps, events, model calls, mail." },
      { id: "rank", label: "Rank", kind: "process", pos: [7.5, 1, 0], note: "Deterministic scoring over the whole index. No model involved." },
      { id: "gateway", label: "Budget gateway", kind: "gate", pos: [10, 1, 0.7], note: "Reserves the worst-case cost against run, day and month budgets before any paid call." },
      { id: "model", label: "Model", kind: "process", pos: [10, 3.6, 0], note: "Judges fit and drafts wording, only for the best-ranked postings." },
      { id: "verifier", label: "Verifier", kind: "gate", pos: [7.5, 3.6, 0.7], note: "Checks every sentence's numbers, technologies and scope against the claims it cites." },
      { id: "evidence", label: "Evidence ledger", kind: "store", pos: [5, 5.6, 0], note: "The only source of claims about the candidate." },
      { id: "materials", label: "Materials", kind: "store", pos: [5, 3.6, 0], note: "Immutable generations of a resume, cover letter and form answers." },
      { id: "fill", label: "Form filler", kind: "process", pos: [2.5, 5.6, 0], note: "Types approved answers into the employer's form in an ordinary browser, then stops." },
      { id: "human", label: "You", kind: "human", pos: [2.5, 3.6, 0], note: "Reviews, approves and is the only one who submits." },
      { id: "employer", label: "Employer", kind: "sink", pos: [0, 3.6, 0], note: "Receives an application only through the human." },
    ],
    edges: [
      { from: "boards", to: "sweep", kind: "data" },
      { from: "sweep", to: "facts", kind: "data" },
      { from: "facts", to: "rank", kind: "data" },
      { from: "rank", to: "gateway", kind: "data" },
      { from: "gateway", to: "model", kind: "data" },
      { from: "model", to: "verifier", kind: "data" },
      { from: "evidence", to: "verifier", kind: "control" },
      { from: "verifier", to: "materials", kind: "data" },
      { from: "materials", to: "human", kind: "data" },
      { from: "materials", to: "fill", kind: "data" },
      { from: "fill", to: "human", kind: "data" },
      { from: "human", to: "employer", kind: "data" },
    ],
    refusals: [
      { from: "gateway", dir: [1, 0], label: "over budget" },
      { from: "verifier", dir: [0.8, 1], label: "untraceable sentence" },
      { from: "fill", dir: [-1, 0], label: "never submits" },
    ],
  },

  shroomspy: {
    id: "shroomspy",
    title: "ShroomSpy architecture: validated content flows from the CMS to the site, and search data flows back through an experiment grader",
    nodes: [
      { id: "editor", label: "Editor", kind: "human", pos: [0, 1, 0], note: "Writes content and picks the next experiment." },
      { id: "hooks", label: "Publish hooks", kind: "gate", pos: [2.5, 1, 0.7], note: "Payload hooks fill SEO defaults and reject malformed slugs, canonical URLs and JSON-LD." },
      { id: "cms", label: "Payload CMS", kind: "store", pos: [5, 1, 0], note: "Collections, access control and content models over MongoDB, served by REST and GraphQL." },
      { id: "next", label: "Next.js", kind: "process", pos: [7.5, 1, 0], note: "App Router templates rendered with SSR and ISR, in three locales." },
      { id: "search", label: "Search engines", kind: "sink", pos: [10, 1, 0], note: "Search and AI answer engines crawl the pages, sitemaps and llms.txt." },
      { id: "signals", label: "Search data", kind: "source", pos: [10, 3.8, 0], note: "Google Search Console, GA4, CrUX and Microsoft Clarity." },
      { id: "warehouse", label: "SEO warehouse", kind: "store", pos: [6.7, 3.8, 0], note: "SQLite, with automated daily ingest from every source." },
      { id: "grader", label: "Experiment grader", kind: "process", pos: [3.3, 3.8, 0], note: "28-day baselines, 60-day grading windows, automated grading and confounder detection." },
    ],
    edges: [
      { from: "editor", to: "hooks", kind: "data" },
      { from: "hooks", to: "cms", kind: "data" },
      { from: "cms", to: "next", kind: "data" },
      { from: "next", to: "search", kind: "data" },
      { from: "search", to: "signals", kind: "data" },
      { from: "signals", to: "warehouse", kind: "data" },
      { from: "warehouse", to: "grader", kind: "data" },
      { from: "grader", to: "editor", kind: "control" },
    ],
    refusals: [{ from: "hooks", dir: [0, -1], label: "invalid: not published" }],
  },

  basemyhome: {
    id: "basemyhome",
    title: "BaseMyHome architecture: a React application and a Three.js viewer exchanging events in real time, over a Python API and PostgreSQL",
    nodes: [
      { id: "buyer", label: "Buyer", kind: "human", pos: [0, 1.2, 0], note: "Explores a property and moves through the sale." },
      { id: "app", label: "React app", kind: "process", pos: [3.3, 1.2, 0], note: "The custom front end that carries the platform workflow." },
      { id: "viewer", label: "3D viewer", kind: "process", pos: [3.3, 3.8, 0.9], note: "Three.js / WebGL, tuned to load in under 3 seconds." },
      { id: "api", label: "Python API", kind: "process", pos: [6.6, 1.2, 0], note: "The backend the front end talks to." },
      { id: "db", label: "PostgreSQL", kind: "store", pos: [10, 1.2, 0], note: "The platform's system of record." },
    ],
    edges: [
      { from: "buyer", to: "app", kind: "data" },
      { from: "app", to: "viewer", kind: "control" },
      { from: "viewer", to: "app", kind: "data" },
      { from: "app", to: "api", kind: "data" },
      { from: "api", to: "db", kind: "data" },
    ],
  },

  loopstring: {
    id: "loopstring",
    title: "LoopString architecture: phone and web clients reach Linux edge devices through Node.js APIs and MQTT, with telemetry flowing back",
    nodes: [
      { id: "apps", label: "Mobile apps", kind: "source", pos: [0, 1.2, 0], note: "React Native clients on iOS and Android." },
      { id: "web", label: "Web app", kind: "source", pos: [0, 3.8, 0], note: "The TypeScript web app where automations are set up." },
      { id: "api", label: "Node.js APIs", kind: "process", pos: [3.3, 2.5, 0], note: "Communication APIs bridging cloud services and on-device automation, over WebSockets." },
      { id: "mqtt", label: "MQTT", kind: "process", pos: [6.6, 2.5, 0.7], note: "Event-driven messaging between the cloud and the devices." },
      { id: "device", label: "Edge device", kind: "process", pos: [10, 2.5, 0], note: "A Linux device running Node-RED flows for control and telemetry." },
      { id: "equipment", label: "Equipment", kind: "sink", pos: [10, 5, 0], note: "The sensors and actuators being automated." },
    ],
    edges: [
      { from: "apps", to: "api", kind: "data" },
      { from: "web", to: "api", kind: "data" },
      { from: "api", to: "mqtt", kind: "control" },
      { from: "mqtt", to: "api", kind: "data" },
      { from: "mqtt", to: "device", kind: "control" },
      { from: "device", to: "mqtt", kind: "data" },
      { from: "device", to: "equipment", kind: "control" },
    ],
  },

  "mushroom-oracle": {
    id: "mushroom-oracle",
    title: "Mushroom Oracle architecture: documents are chunked and embedded into SQLite, and an MCP server answers only from retrieved, cited passages",
    nodes: [
      { id: "docs", label: "Research docs", kind: "source", pos: [0, 1, 0], note: "321 sources in PDF, EPUB and DOCX." },
      { id: "chunk", label: "Extract + chunk", kind: "process", pos: [3.3, 1, 0], note: "Text extraction and overlapping chunks, each enriched with LLM-extracted metadata." },
      { id: "embed", label: "Embed", kind: "process", pos: [6.6, 1, 0], note: "OpenAI text-embedding-3-small." },
      { id: "store", label: "SQLite", kind: "store", pos: [10, 1, 0], note: "About 20,600 chunks, indexed by FTS5 and sqlite-vec." },
      { id: "client", label: "MCP client", kind: "human", pos: [0, 3.8, 0], note: "An assistant or author asking a question or checking a claim." },
      { id: "mcp", label: "MCP server", kind: "process", pos: [3.3, 3.8, 0], note: "14 tools, including question answering, evidence search and fact-checking." },
      { id: "retrieve", label: "Hybrid retrieval", kind: "process", pos: [6.6, 3.8, 0], note: "Lexical and vector search combined with Reciprocal Rank Fusion." },
      { id: "cite", label: "Citation gate", kind: "gate", pos: [10, 3.8, 0.7], note: "An answer is built only from retrieved passages, with a citation for every factual claim. Without evidence it says so." },
    ],
    edges: [
      { from: "docs", to: "chunk", kind: "data" },
      { from: "chunk", to: "embed", kind: "data" },
      { from: "embed", to: "store", kind: "data" },
      { from: "client", to: "mcp", kind: "data" },
      { from: "mcp", to: "retrieve", kind: "data" },
      { from: "store", to: "retrieve", kind: "data" },
      { from: "retrieve", to: "cite", kind: "data" },
    ],
    refusals: [{ from: "cite", dir: [0, 1], label: "no evidence" }],
  },
};
