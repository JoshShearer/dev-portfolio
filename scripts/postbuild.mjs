// Runs after `next build`, against the static export in out/:
//   1. prints /resume to out/josh-shearer-resume.pdf, so the PDF is always the
//      same content as the HTML résumé;
//   2. screenshots each /og/<slug> page to out/og/<slug>.png (Open Graph
//      images), then removes those build-only pages from the export.
import { readdir, rm } from "node:fs/promises";
import { chromium } from "playwright";
import { serveOut } from "./serve-out.mjs";

const { server, url } = await serveOut();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: "light" });

  await page.goto(`${url}/resume`, { waitUntil: "networkidle" });
  await page.pdf({ path: "out/josh-shearer-resume.pdf", format: "Letter", printBackground: false });

  const slugs = (await readdir("out/og")).filter((f) => f.endsWith(".html")).map((f) => f.slice(0, -5));
  for (const slug of slugs) {
    await page.goto(`${url}/og/${slug}`, { waitUntil: "networkidle" });
    await page.locator("#og").screenshot({ path: `out/og/${slug}.png` });
  }
  for (const f of await readdir("out/og")) if (!f.endsWith(".png")) await rm(`out/og/${f}`, { recursive: true });
  console.log(`postbuild: résumé PDF and ${slugs.length} Open Graph images written`);
} finally {
  await browser.close();
  server.close();
}
