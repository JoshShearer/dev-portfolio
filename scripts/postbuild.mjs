// Runs after `next build`, against the static export in out/:
//   1. prints /resume to out/josh-shearer-resume.pdf, so the PDF is always the
//      same content as the HTML résumé;
//   2. screenshots each /og/<slug> page to out/og/<slug>.png (Open Graph
//      images), then removes those build-only pages from the export;
//   3. checks that every Open Graph image the exported pages reference exists
//      and decodes.
// The build fails if any of this is incomplete.
import { readdir, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import { caseStudies } from "../content/work.ts";
import { serveOut } from "./serve-out.mjs";

// Every card the site needs, from the content rather than from whatever was exported.
const slugs = ["home", ...caseStudies.map((c) => c.slug)];

const { server, url } = await serveOut();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: "light" });

  // serveOut answers a missing route with the 404 page, so check both the status and the content.
  const open = async (path, selector) => {
    const res = await page.goto(url + path, { waitUntil: "networkidle" });
    if (!res?.ok()) throw new Error(`postbuild: ${path} returned ${res?.status()}`);
    if (!(await page.locator(selector).count())) throw new Error(`postbuild: ${path} has no ${selector}`);
  };

  await open("/resume", "#resume");
  await page.pdf({ path: "out/josh-shearer-resume.pdf", format: "Letter", printBackground: false });

  const exported = new Set(await readdir("out/og").catch(() => []));
  const missing = slugs.filter((slug) => !exported.has(`${slug}.html`));
  if (missing.length) throw new Error(`postbuild: no Open Graph card page for: ${missing.join(", ")}`);

  for (const slug of slugs) {
    await open(`/og/${slug}`, "#og");
    await page.locator("#og").screenshot({ path: `out/og/${slug}.png` });
  }
  for (const f of await readdir("out/og")) if (!f.endsWith(".png")) await rm(`out/og/${f}`, { recursive: true });

  const pages = (await readdir("out", { recursive: true })).filter((f) => f.endsWith(".html"));
  const referenced = new Set(slugs.map((slug) => `/og/${slug}.png`));
  for (const f of pages) {
    const html = await readFile(join("out", f), "utf8");
    for (const [, src] of html.matchAll(/<meta (?:property="og|name="twitter):image" content="([^"]+)"/g)) {
      referenced.add(new URL(src, url).pathname);
    }
  }
  const broken = [];
  for (const path of referenced) {
    const png = await readFile(join("out", path), "base64").catch(() => null);
    const decodes = png && (await page.evaluate(async (data) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      return img.decode().then(() => true, () => false);
    }, png));
    if (!decodes) broken.push(path);
  }
  if (broken.length) throw new Error(`postbuild: Open Graph images missing or unreadable: ${broken.join(", ")}`);

  console.log(`postbuild: résumé PDF and ${slugs.length} Open Graph images written`);
} finally {
  await browser.close();
  server.close();
}
