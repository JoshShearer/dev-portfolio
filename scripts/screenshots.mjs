// Review aid: `npm run shots` (after a build) writes screenshots of the key
// states to .shots/, and prints console errors and whether WebGL came up.
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { serveOut } from "./serve-out.mjs";

const dir = ".shots";
await mkdir(dir, { recursive: true });
const { server, url } = await serveOut();
const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"] });
const errors = [];

async function open(path, { width = 1440, height = 900, scheme = "light", reducedMotion = "no-preference", forceGl = reducedMotion !== "reduce" } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, reducedMotion });
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`${path}: ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`${path}: ${e.message}`));
  // Headless Chromium renders in software, which the site treats as "no GPU".
  // ?gl=1 forces the WebGL path so it can be photographed.
  await page.goto(url + path + (forceGl ? "?gl=1" : ""), { waitUntil: "networkidle" });
  return page;
}
const gl = (page) => page.locator(".sch-gl-canvas--on").count();
const settle = (page, ms = 1800) => page.waitForTimeout(ms);

let p = await open("/");
await settle(p);
console.log("home hero webgl canvases:", await gl(p));
await p.screenshot({ path: `${dir}/home-hero.png` });
for (const [i, slug] of ["job-radar", "shroomspy", "mushroom-oracle"].entries()) {
  await p.locator(`a[href="/work/${slug}"]`).first().evaluate((el) => el.scrollIntoView({ block: "center" }));
  await settle(p, 4000);
  await p.screenshot({ path: `${dir}/home-work-${i + 1}-${slug}.png` });
}
console.log("home webgl canvases after scroll:", await gl(p));

p = await open("/", { scheme: "dark" });
await settle(p);
await p.screenshot({ path: `${dir}/home-hero-dark.png` });

p = await open("/work/job-radar");
await p.locator(".sch-box").scrollIntoViewIfNeeded();
await settle(p, 2500);
console.log("case webgl canvases:", await gl(p));
await p.locator("figure button").nth(6).hover();
await settle(p, 600);
await p.locator("figure").evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - 80));
await settle(p, 400);
await p.screenshot({ path: `${dir}/case-job-radar-webgl.png` });

p = await open("/work/job-radar", { reducedMotion: "reduce" });
await settle(p, 800);
console.log("case webgl canvases with reduced motion (want 0):", await gl(p));
const soft = await open("/work/job-radar", { forceGl: false });
await settle(soft, 2500);
console.log("case webgl canvases on a software renderer (want 0):", await gl(soft));
await p.locator("figure button").nth(6).hover();
await p.locator("figure").evaluate((el) => scrollTo(0, el.getBoundingClientRect().top + scrollY - 80));
await p.screenshot({ path: `${dir}/case-job-radar-svg.png` });

for (const slug of ["shroomspy", "basemyhome", "loopstring", "mushroom-oracle"]) {
  p = await open(`/work/${slug}`, { reducedMotion: "reduce" });
  await p.locator("figure").screenshot({ path: `${dir}/case-${slug}-svg.png` });
}

p = await open("/", { width: 390, height: 844 });
await settle(p);
console.log("mobile overflow px (want 0):", await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
await p.screenshot({ path: `${dir}/mobile-home.png`, fullPage: true });
p = await open("/work/job-radar", { width: 390, height: 844 });
await settle(p, 2500);
console.log("mobile case overflow px (want 0):", await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
await p.locator("figure").screenshot({ path: `${dir}/mobile-case-figure.png` });

console.log("console errors:", errors.length ? errors : "none");
await browser.close();
server.close();
