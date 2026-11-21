/** Skill names exactly as the evidence ledger spells them. `core` = ledger level expert or strong. */
export const skillGroups: { label: string; core: string[]; working?: string[] }[] = [
  { label: "Languages", core: ["TypeScript", "JavaScript"], working: ["Python", "SQL"] },
  {
    label: "Front end",
    core: ["React", "Next.js", "Server-Side Rendering", "React Native"],
    working: ["Three.js", "Tailwind CSS"],
  },
  {
    label: "Back end and data",
    core: ["Payload CMS", "Node.js", "GraphQL", "REST API design", "PostgreSQL", "MongoDB", "Zod"],
    working: ["FastAPI", "SQLite", "AWS"],
  },
  {
    label: "AI and LLM systems",
    core: [],
    working: [
      "LLM application development",
      "Retrieval-augmented generation (RAG)",
      "Model Context Protocol (MCP)",
      "AI coding agent workflows",
    ],
  },
  {
    label: "Real-time and IoT",
    core: ["MQTT", "WebSockets", "Event-driven architecture", "IoT / edge devices"],
    working: ["Node-RED"],
  },
  {
    label: "SEO and answer engines",
    core: [
      "Technical SEO",
      "Structured data / JSON-LD",
      "Core Web Vitals",
      "Programmatic SEO",
      "Internationalization",
      "GEO / AEO (AI search)",
    ],
  },
  {
    label: "Measurement and testing",
    core: ["Experimentation & measurement", "GA4 & analytics instrumentation", "Automated testing"],
    working: ["Playwright", "pytest"],
  },
];
