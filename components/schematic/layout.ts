import type { Refusal, Schematic, SchematicEdge, SchematicNode } from "@/content/schematics";

/** Layout math shared by the SVG and WebGL renderers, in grid units. */

export const NODE_R = 0.42; // node glyph radius
export const STUB_LEN = 1.35; // refusal stub length, centre to cross

export type Pt = [number, number];

export function nodeById(s: Schematic, id: string): SchematicNode {
  const n = s.nodes.find((n) => n.id === id);
  if (!n) throw new Error(`schematic ${s.id}: unknown node ${id}`);
  return n;
}

export function bounds(s: Schematic) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const n of s.nodes) {
    xs.push(n.pos[0]);
    ys.push(n.pos[1]);
  }
  for (const r of s.refusals ?? []) {
    const [x, y] = stubEnd(s, r);
    xs.push(x);
    ys.push(y);
  }
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/**
 * The drawn segment for an edge: trimmed to the node glyphs, and shifted
 * sideways when the opposite edge also exists so the two do not overlap.
 */
export function edgeSegment(s: Schematic, e: SchematicEdge): [Pt, Pt] {
  const a = nodeById(s, e.from).pos;
  const b = nodeById(s, e.to).pos;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const paired = s.edges.some((o) => o.from === e.to && o.to === e.from);
  const off = paired ? 0.16 : 0;
  const ox = -uy * off;
  const oy = ux * off;
  const trim = NODE_R + 0.12;
  return [
    [a[0] + ux * trim + ox, a[1] + uy * trim + oy],
    [b[0] - ux * (trim + 0.1) + ox, b[1] - uy * (trim + 0.1) + oy],
  ];
}

function unit(dir: [number, number]): Pt {
  const len = Math.hypot(dir[0], dir[1]) || 1;
  return [dir[0] / len, dir[1] / len];
}

export function stubStart(s: Schematic, r: Refusal): Pt {
  const n = nodeById(s, r.from).pos;
  const [ux, uy] = unit(r.dir);
  return [n[0] + ux * (NODE_R + 0.12), n[1] + uy * (NODE_R + 0.12)];
}

export function stubEnd(s: Schematic, r: Refusal): Pt {
  const n = nodeById(s, r.from).pos;
  const [ux, uy] = unit(r.dir);
  return [n[0] + ux * STUB_LEN, n[1] + uy * STUB_LEN];
}

export function nodeNumber(i: number): string {
  return String(i + 1).padStart(2, "0");
}
