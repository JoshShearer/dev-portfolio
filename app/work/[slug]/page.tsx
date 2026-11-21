import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/chrome";
import { site } from "@/content/site";
import { caseStudies, getCaseStudy } from "@/content/work";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const c = getCaseStudy((await params).slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.summary,
    alternates: { canonical: `/work/${c.slug}` },
    openGraph: { type: "article", title: c.title, description: c.summary, url: `/work/${c.slug}` },
  };
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-t border-rule py-12 lg:grid-cols-[11rem_1fr]">
      <h2 className="tag">{label}</h2>
      <div className="max-w-[42rem]">{children}</div>
    </section>
  );
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  if (!c) notFound();
  const i = caseStudies.indexOf(c);
  const next = caseStudies[(i + 1) % caseStudies.length];

  return (
    <article className="mx-auto max-w-6xl px-6 sm:px-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CreativeWork",
              name: c.title,
              description: c.summary,
              url: `${site.url}/work/${c.slug}`,
              author: { "@id": `${site.url}/#person` },
              keywords: c.stack.join(", "),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Work", item: `${site.url}/#work` },
                { "@type": "ListItem", position: 3, name: c.title },
              ],
            },
          ],
        }}
      />

      <header className="pb-14 pt-16 sm:pt-24">
        <p className="tag">
          <Link href="/#work" className="hover:text-ink">
            Work
          </Link>{" "}
          / {c.lane}
        </p>
        <h1 className="display mt-6 text-[clamp(2.75rem,8vw,6rem)]">{c.title}</h1>
        <p className="mt-6 max-w-[40rem] text-xl leading-snug sm:text-2xl">{c.summary}</p>
        <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
          <div>
            <dt className="tag">Role</dt>
            <dd className="mt-1">{c.role}</dd>
          </div>
          <div>
            <dt className="tag">Period</dt>
            <dd className="mt-1">{c.period}</dd>
          </div>
        </dl>
      </header>

      <Block label="The problem">
        <p className="text-lg">{c.problem}</p>
      </Block>

      <Block label="What I built">
        <ul className="space-y-4">
          {c.built.map((b) => (
            <li key={b.ledgerId + b.text.slice(0, 12)}>{b.text}</li>
          ))}
        </ul>
      </Block>

      {c.decisions && (
        <Block label="Decisions">
          <ol className="space-y-8">
            {c.decisions.map((d, n) => (
              <li key={d.title} className="grid grid-cols-[2rem_1fr] gap-2">
                <span className="tag pt-1.5 text-signal">{String(n + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-lg font-semibold">{d.title}</h3>
                  <p className="mt-2 text-pencil">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Block>
      )}

      <Block label="Outcomes">
        <ul>
          {c.outcomes.map((o) => (
            <li key={o.ledgerId + o.text.slice(0, 12)} className="border-b border-rule py-4 first:pt-0">
              {o.text}
            </li>
          ))}
        </ul>
      </Block>

      <Block label="Stack">
        <ul className="flex flex-wrap gap-2">
          {c.stack.map((s) => (
            <li key={s} className="tag rounded-full border border-rule px-3 py-1.5">
              {s}
            </li>
          ))}
        </ul>
        {c.links.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-8">
            {c.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Block>

      <nav aria-label="Next case study" className="border-t border-rule py-14">
        <p className="tag">Next</p>
        <Link href={`/work/${next.slug}`} className="display mt-3 inline-block text-3xl hover:text-signal sm:text-5xl">
          {next.title} <span aria-hidden="true">→</span>
        </Link>
      </nav>
    </article>
  );
}
