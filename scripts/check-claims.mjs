// Checks that every ledgerId in content/ exists in the job-radar evidence
// ledger and is not marked `verified: false`.
//
//   JR_EVIDENCE=~/Documents/Dev/job-radar/config/candidate/evidence.yaml npm run check:claims
//
// The ledger is private, so this is a local check; without JR_EVIDENCE it skips.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ledgerPath = process.env.JR_EVIDENCE;
if (!ledgerPath) {
  console.log("check:claims skipped (set JR_EVIDENCE to the evidence ledger path)");
  process.exit(0);
}

// The ledger is regular enough to read without a YAML parser: each entry
// starts with `- id: x`, and a `verified:` line, if any, follows before the next id.
const verified = new Map();
let current = null;
for (const line of readFileSync(ledgerPath.replace(/^~/, process.env.HOME), "utf8").split("\n")) {
  const id = line.match(/^\s*-?\s*id:\s*(\S+)/);
  if (id) {
    current = id[1];
    verified.set(current, true);
    continue;
  }
  const v = line.match(/^\s*verified:\s*(true|false)/);
  if (v && current) verified.set(current, v[1] === "true");
}

const used = new Map();
for (const file of readdirSync("content").filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join("content", file), "utf8");
  const ids = [
    ...[...src.matchAll(/ledgerId:\s*"([^"]+)"/g)].map((m) => m[1]),
    ...[...src.matchAll(/ledgerIds:\s*\[([^\]]*)\]/g)].flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1])),
  ];
  for (const id of ids) used.set(id, file);
}

const problems = [];
for (const [id, file] of used) {
  if (!verified.has(id)) problems.push(`${file}: ${id} is not in the ledger`);
  else if (!verified.get(id)) problems.push(`${file}: ${id} is marked verified: false`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`check:claims ok (${used.size} ledger ids)`);
