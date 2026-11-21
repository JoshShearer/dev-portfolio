// Prints the built /resume page to out/josh-shearer-resume.pdf, so the PDF is
// always the same content as the HTML résumé. Runs after `next build`.
import { chromium } from "playwright";
import { serveOut } from "./serve-out.mjs";

const { server, url } = await serveOut();
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`${url}/resume`, { waitUntil: "networkidle" });
  await page.pdf({ path: "out/josh-shearer-resume.pdf", format: "Letter", printBackground: false });
  console.log("wrote out/josh-shearer-resume.pdf");
} finally {
  await browser.close();
  server.close();
}
