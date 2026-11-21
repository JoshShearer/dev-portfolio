import { site } from "@/content/site";
import { caseStudies } from "@/content/work";

export const dynamic = "force-static";

// A plain-text map of the site for AI crawlers (llmstxt.org).
export function GET() {
  const body = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Pages",
    "",
    `- [Home](${site.url}/): positioning, selected work, experience, capabilities, about, contact`,
    `- [Résumé](${site.url}/resume): full experience, projects, skills and education`,
    "",
    "## Case studies",
    "",
    ...caseStudies.map((c) => `- [${c.title}](${site.url}/work/${c.slug}): ${c.summary}`),
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
