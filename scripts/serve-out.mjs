// Minimal static server for out/, with Firebase-style clean URLs. Used by build scripts only.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { gzipSync } from "node:zlib";

const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2", ".txt": "text/plain", ".xml": "application/xml", ".pdf": "application/pdf" };

export function serveOut(root = "out", port = 0) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    const candidates = path.endsWith("/") ? [join(path, "index.html")] : [path, `${path}.html`];
    for (const c of candidates) {
      try {
        const body = await readFile(join(root, c));
        const type = types[extname(c)] ?? "application/octet-stream";
        // Compress text like the real host does, so measurements are honest.
        const zip = /^(text|application\/xml)/.test(type) && /gzip/.test(req.headers["accept-encoding"] ?? "");
        res.writeHead(200, { "Content-Type": type, ...(zip ? { "Content-Encoding": "gzip" } : {}) });
        return res.end(zip ? gzipSync(body) : body);
      } catch {}
    }
    res.writeHead(404).end(await readFile(join(root, "404.html")).catch(() => "Not found"));
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve({ server, url: `http://127.0.0.1:${server.address().port}` })));
}
