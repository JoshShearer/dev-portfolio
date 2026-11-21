import type { Metadata } from "next";
import Link from "next/link";
import { ContactLinks, JsonLd, Section } from "@/components/chrome";
import { period, roles } from "@/content/experience";
import { about, education, proof, site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { SchematicFigure } from "@/components/schematic/schematic-figure";
import { SchematicSvg } from "@/components/schematic/schematic-svg";
import { WorkBoard } from "@/components/schematic/work-board";
import { heroLoop, schematics } from "@/content/schematics";
import { alsoBuilt, caseStudies } from "@/content/work";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/", images: ["/og/home.png"] },
};

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "WebSite", "@id": `${site.url}/#site`, url: site.url, name: site.name },
            {
              "@type": "Person",
              "@id": `${site.url}/#person`,
              name: site.name,
              url: site.url,
              image: `${site.url}/josh-shearer.webp`,
              jobTitle: site.role,
              description: site.description,
              address: { "@type": "PostalAddress", addressLocality: "Austin", addressRegion: "TX" },
              alumniOf: education.map((e) => ({ "@type": "CollegeOrUniversity", name: e.school })),
              sameAs: [site.github, site.linkedin],
            },
          ],
        }}
      />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:px-10 sm:pb-28 sm:pt-24">
        <p className="tag">
          {site.role} / {site.location}
        </p>
        <h1 className="display mt-6 text-[clamp(3rem,10vw,7.5rem)]">{site.name}</h1>
        <p className="mt-8 max-w-[34rem] text-xl leading-snug sm:text-2xl">{site.tagline}</p>

        <ul className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <li>
            <Link
              href="/resume"
              className="inline-block bg-ink px-5 py-3 font-medium text-paper hover:bg-signal"
            >
              Résumé
            </Link>
          </li>
          <li>
            <a href="#work" className="link">
              Selected work
            </a>
          </li>
          <li>
            <a href={site.github} className="link">
              GitHub
            </a>
          </li>
        </ul>

        <div className="mt-14 max-w-4xl sm:mt-16">
          <SchematicFigure schematic={heroLoop} variant="hero" />
        </div>

        <ul className="mt-12 grid max-w-4xl gap-x-10 border-t border-rule sm:grid-cols-2">
          {proof.map((item, i) => (
            <li key={item.ledgerId} className="flex gap-4 border-b border-rule py-4">
              <span className="tag pt-1">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-pencil">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <Section id="work" index="01" label="Selected work">
        <div className="grid gap-12 lg:grid-cols-[1fr_27rem]">
          <ol>
            {caseStudies.map((c) => (
              <li key={c.slug} data-work-card className="border-b border-rule first:border-t">
                <Link href={`/work/${c.slug}`} className="group block py-8 lg:py-12">
                  <p className="tag flex justify-between gap-4">
                    <span>{c.lane}</span>
                    <span className="whitespace-nowrap">{c.period}</span>
                  </p>
                  <h3 className="display mt-3 text-3xl group-hover:text-signal sm:text-5xl">{c.title}</h3>
                  <p className="mt-4 max-w-[38rem] text-pencil">{c.summary}</p>
                  {/* Below lg there is no side panel, so each card carries its own diagram. */}
                  <div className="mt-6 max-w-md lg:hidden">
                    <SchematicSvg schematic={schematics[c.slug]} labels="none" />
                  </div>
                  <p className="tag mt-5 text-ink group-hover:text-signal">
                    Read the case study <span aria-hidden="true">→</span>
                  </p>
                </Link>
              </li>
            ))}
          </ol>
          <div className="hidden lg:block">
            <div className="sticky top-[32vh]">
              <WorkBoard schematics={caseStudies.map((c) => schematics[c.slug])} />
            </div>
          </div>
        </div>

        <h3 className="tag mt-16">Also built</h3>
        <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
          {alsoBuilt.map((p) => (
            <li key={p.ledgerId} className="border-b border-rule py-5">
              <p className="font-semibold">
                {p.href ? (
                  <a href={p.href} className="link">
                    {p.name}
                  </a>
                ) : (
                  p.name
                )}
              </p>
              <p className="mt-2 text-sm text-pencil">{p.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="experience" index="02" label="Experience">
        <ol>
          {roles.map((r) => (
            <li
              key={r.ledgerId}
              className="grid gap-2 border-b border-rule py-7 first:border-t sm:grid-cols-[8rem_1fr] sm:gap-8"
            >
              <p className="tag pt-1">{period(r)}</p>
              <div>
                <h3 className="text-lg font-semibold">
                  {r.title}, <span className="font-normal">{r.company}</span>
                </h3>
                {r.context && <p className="mt-1 text-sm text-pencil">{r.context}</p>}
                <ul className="mt-3 max-w-[40rem] space-y-2 text-pencil">
                  {r.claims
                    .filter((c) => c.featured)
                    .map((c) => (
                      <li key={c.ledgerId}>{c.text}</li>
                    ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="capabilities" index="03" label="Capabilities">
        <dl className="grid gap-x-10 sm:grid-cols-2">
          {skillGroups.map((g) => (
            <div key={g.label} className="border-b border-rule py-5">
              <dt className="font-semibold">{g.label}</dt>
              <dd className="mt-2">
                {g.core.length > 0 && <p>{g.core.join(", ")}</p>}
                {g.working && (
                  <p className="mt-1 text-sm text-pencil">
                    {g.core.length > 0 ? "Also: " : ""}
                    {g.working.join(", ")}
                  </p>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="about" index="04" label="About">
        <div className="grid gap-10 md:grid-cols-[1fr_14rem]">
          <div className="max-w-[40rem] space-y-5 text-lg">
            {about.map((p) => (
              <p key={p.ledgerIds.join()}>{p.text}</p>
            ))}
            {education.map((e) => (
              <p key={e.ledgerId} className="tag pt-2">
                {e.credential} / {e.school} / {e.year}
              </p>
            ))}
          </div>
          {/* A plain img: one small local file needs none of next/image's client code. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/josh-shearer.webp"
            alt="Josh Shearer"
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            className="aspect-square w-40 object-cover grayscale md:w-full"
          />
        </div>
      </Section>

      <Section id="contact" index="05" label="Contact">
        <p className="display max-w-[30rem] text-3xl sm:text-5xl">Hiring for a senior role? Get in touch.</p>
        <ContactLinks className="mt-8 text-lg" />
      </Section>
    </>
  );
}
