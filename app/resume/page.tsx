import type { Metadata } from "next";
import { period, roles } from "@/content/experience";
import { education, site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { alsoBuilt, caseStudies } from "@/content/work";

export const metadata: Metadata = {
  title: "Résumé",
  description: `Résumé of ${site.name}, ${site.role.toLowerCase()} in ${site.location}.`,
  alternates: { canonical: "/resume" },
};

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className="tag mt-10 border-b border-rule pb-2 print:mt-6">{children}</h2>;
}

// The PDF at site.resumePdf is this page printed at build time
// (scripts/resume-pdf.mjs), so the two cannot disagree.
export default function ResumePage() {
  const projects = caseStudies.filter((c) => c.ledgerId.startsWith("proj-"));
  const openSource = alsoBuilt.filter((p) => p.resume);
  return (
    <div id="resume" className="mx-auto max-w-3xl px-6 py-16 sm:px-10 print:max-w-none print:p-0">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="display text-4xl sm:text-5xl print:text-3xl">{site.name}</h1>
          <p className="mt-2 text-lg">{site.role}</p>
          <p className="mt-1 text-sm text-pencil">
            {site.location} · {site.url.replace("https://", "")} · {site.linkedin.replace("https://www.", "")} ·{" "}
            {site.github.replace("https://", "")}
            {site.email ? ` · ${site.email}` : ""}
          </p>
        </div>
        <a href={site.resumePdf} className="link print:hidden" download>
          Download PDF
        </a>
      </header>

      <Heading>Experience</Heading>
      {roles.map((r) => (
        <section key={r.ledgerId} className="mt-5 break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6">
            <h3 className="font-semibold">
              {r.title}, <span className="font-normal">{r.company}</span>
            </h3>
            <p className="tag">{period(r)}</p>
          </div>
          {r.claims.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem] marker:text-pencil">
              {r.claims.map((c) => (
                <li key={c.ledgerId}>{c.text}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <Heading>Projects</Heading>
      {projects.map((p) => (
        <section key={p.slug} className="mt-5 break-inside-avoid">
          <h3 className="font-semibold">{p.title}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[0.95rem] marker:text-pencil">
            {p.built.slice(0, 3).map((b) => (
              <li key={b.ledgerId}>{b.text}</li>
            ))}
          </ul>
        </section>
      ))}

      {openSource.length > 0 && (
        <>
          <Heading>Open source</Heading>
          {openSource.map((p) => (
            <section key={p.ledgerId} className="mt-5 break-inside-avoid print:mt-2">
              <h3 className="font-semibold">
                {p.name}
                {p.href && (
                  <span className="font-normal text-pencil"> · {p.href.replace("https://", "")}</span>
                )}
              </h3>
              <p className="mt-1 text-[0.95rem]">{p.text}</p>
            </section>
          ))}
        </>
      )}

      <Heading>Skills</Heading>
      <dl className="mt-4 space-y-2 text-[0.95rem]">
        {skillGroups.map((g) => (
          <div key={g.label} className="grid gap-x-4 sm:grid-cols-[11rem_1fr] print:grid-cols-[11rem_1fr]">
            <dt className="font-semibold">{g.label}</dt>
            <dd>{[...g.core, ...(g.working ?? [])].join(", ")}</dd>
          </div>
        ))}
      </dl>

      <Heading>Education</Heading>
      {education.map((e) => (
        <p key={e.ledgerId} className="mt-4 text-[0.95rem]">
          {e.credential}, {e.school}, {e.year}
        </p>
      ))}
    </div>
  );
}
