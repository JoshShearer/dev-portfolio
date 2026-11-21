/** Site-wide facts. Claims about Josh carry their evidence-ledger id (docs/SPEC.md section 4). */

export type Claim = { text: string; ledgerId: string };

export const site = {
  name: "Josh Shearer",
  role: "Senior full-stack engineer",
  location: "Austin, TX",
  url: "https://joshshearer.co",
  tagline: "I build software that closes the loop: measured, verified, and honest about what it knows.",
  description:
    "Josh Shearer is a senior full-stack engineer in Austin, TX, working in TypeScript, React and Next.js, and on LLM systems whose output is verified before anyone reads it.",
  github: "https://github.com/JoshShearer",
  linkedin: "https://www.linkedin.com/in/joshshearer",
  email: "ShearerJosh@protonmail.com" as string | null,
  resumePdf: "/josh-shearer-resume.pdf",
} as const;

export const proof: Claim[] = [
  { text: "200+ measured SEO experiments", ledgerId: "b-shroomspy-5" },
  { text: "Three.js viewer tuned to load in under 3 seconds", ledgerId: "b-basemyhome-2" },
  { text: "An LLM pipeline where unverifiable sentences are removed", ledgerId: "p-jr-4" },
  { text: "Platform uptime above 99% with zero deal-blocking P1 incidents", ledgerId: "b-basemyhome-3" },
];

export const education: { school: string; credential: string; year: string; ledgerId: string }[] = [
  {
    school: "Washington State University",
    credential: "B.S. Electrical Engineering, minor in Computer Engineering",
    year: "2009",
    ledgerId: "edu-wsu",
  },
];

/** The About section. Each paragraph lists the ledger entries it rests on. */
export const about: { text: string; ledgerIds: string[] }[] = [
  {
    text: "I started as a control systems engineer, designing instrumentation and programming Siemens PLCs and HMIs for federal infrastructure projects. In that work a system either holds its setpoint or it does not, and you find out by measuring.",
    ledgerIds: ["role-ares", "b-ares-1", "edu-wsu"],
  },
  {
    text: "I then spent six years as a sales engineer, growing an industrial account base from $2M to $4M and staying on call to troubleshoot the systems I had sold. It taught me to explain a technical trade-off to the person paying for it.",
    ledgerIds: ["role-valin", "b-valin-1", "b-valin-5"],
  },
  {
    text: "Since 2022 I have built software full time: two products of my own, a lead role owning a proptech platform, and now contract work on a security gateway. The habit from controls engineering stayed. I want the feedback loop closed, whether that is an SEO experiment graded against a baseline or a language model whose sentences are checked against evidence.",
    ledgerIds: ["role-loopstring", "role-shroomspy", "role-basemyhome", "role-nhimm", "b-shroomspy-5", "p-jr-4"],
  },
];
