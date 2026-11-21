// Minimal static server for out/, with Firebase-style clean URLs. Used by build scripts only.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".pdf": "application/pdf" };

export function serveOut(root = "out") {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    const candidates = path.endsWith("/") ? [join(path, "index.html")] : [path, `${path}.html`];
    for (const c of candidates) {
      try {
        const body = await readFile(join(root, c));
        res.writeHead(200, { "Content-Type": types[extname(c)] ?? "application/octet-stream" });
        return res.end(body);
      } catch {}
    }
    res.writeHead(404).end(await readFile(join(root, "404.html")).catch(() => "Not found"));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}
