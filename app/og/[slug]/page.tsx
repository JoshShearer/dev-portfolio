import type { Metadata } from "next";
import { SchematicSvg } from "@/components/schematic/schematic-svg";
import { heroLoop, schematics } from "@/content/schematics";
import { site } from "@/content/site";
import { caseStudies, getCaseStudy } from "@/content/work";

// Build-only pages: scripts/postbuild.mjs screenshots #og into out/og/<slug>.png
// (the Open Graph image) and then deletes these pages from the export.
export const metadata: Metadata = { robots: { index: false } };

export function generateStaticParams() {
  return [{ slug: "home" }, ...caseStudies.map((c) => ({ slug: c.slug }))];
}

export default async function OgCard({ params }: PageProps<"/og/[slug]">) {
  const { slug } = await params;
  const c = getCaseStudy(slug);
  return (
    <div
      id="og"
      data-theme="light"
      className="fixed left-0 top-0 z-50 flex h-[630px] w-[1200px] flex-col justify-between bg-paper p-16 text-ink"
    >
      <div>
        <p className="tag">{c ? `${site.name} / ${c.lane}` : `${site.role} / ${site.location}`}</p>
        <p className="display mt-5 text-[84px]">{c ? c.title : site.name}</p>
      </div>
      <div className="w-[760px] self-end">
        <SchematicSvg schematic={c ? schematics[c.slug] : heroLoop} labels="none" />
      </div>
    </div>
  );
}
