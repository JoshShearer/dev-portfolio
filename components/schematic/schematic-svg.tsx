import type { NodeKind, Schematic } from "@/content/schematics";
import { NODE_R, bounds, edgeSegment, nodeNumber, stubEnd, stubStart } from "./layout";

const U = 64; // pixels per grid unit in the viewBox
const R = NODE_R * U;

/** The outline for each kind of node, centred on 0,0. */
function Glyph({ kind }: { kind: NodeKind }) {
  switch (kind) {
    case "source":
      return <circle r={R} />;
    case "process":
      return <rect x={-R} y={-R * 0.82} width={R * 2} height={R * 1.64} rx={5} />;
    case "store":
      return (
        <>
          <rect x={-R} y={-R * 0.86} width={R * 2} height={R * 1.72} rx={2} />
          <line x1={-R} x2={R} y1={-R * 0.4} y2={-R * 0.4} />
        </>
      );
    case "gate":
      return <path d={`M0 ${-R * 1.12} L${R * 1.12} 0 L0 ${R * 1.12} L${-R * 1.12} 0 Z`} />;
    case "human":
      return (
        <>
          <circle r={R} />
          <circle r={R * 0.36} className="sch-dot" />
        </>
      );
    case "sink":
      return (
        <>
          <rect x={-R} y={-R} width={R * 2} height={R * 2} />
          <rect x={-R * 0.55} y={-R * 0.55} width={R * 1.1} height={R * 1.1} />
        </>
      );
  }
}

/**
 * A schematic as static SVG. This is the version in the HTML: what crawlers,
 * no-JS and reduced-motion visitors see, and the poster the canvas fades in over.
 *
 * `labels`: "full" shows a number and a name under each node (names hide on
 * narrow screens, where the adjacent list carries them); "names" shows names
 * only, at a size that survives a phone; "none" is a bare thumbnail.
 */
export function SchematicSvg({
  schematic: s,
  labels = "full",
  active,
  className = "",
}: {
  schematic: Schematic;
  labels?: "full" | "names" | "none";
  active?: string | null;
  className?: string;
}) {
  const b = bounds(s);
  const padX = labels === "none" ? 0.8 : 1.25;
  const padTop = 0.9;
  const padBottom = labels === "none" ? 0.9 : 1.35;
  const x0 = (b.minX - padX) * U;
  const y0 = (b.minY - padTop) * U;
  const w = (b.maxX - b.minX + padX * 2) * U;
  const h = (b.maxY - b.minY + padTop + padBottom) * U;
  const arrow = `arrow-${s.id}`;

  return (
    <svg
      viewBox={`${x0} ${y0} ${w} ${h}`}
      role="img"
      aria-label={`Diagram. ${s.title}.`}
      className={`sch sch--${labels} ${className}`}
    >
      <defs>
        <marker id={arrow} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M1 1 L9 5 L1 9" className="sch-arrow" />
        </marker>
      </defs>

      {s.edges.map((e) => {
        const [[x1, y1], [x2, y2]] = edgeSegment(s, e);
        const lit = active && (e.from === active || e.to === active);
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={x1 * U}
            y1={y1 * U}
            x2={x2 * U}
            y2={y2 * U}
            markerEnd={`url(#${arrow})`}
            className={`sch-edge ${e.kind === "control" ? "sch-edge--control" : ""} ${lit ? "sch-lit" : ""}`}
          />
        );
      })}

      {(s.refusals ?? []).map((r) => {
        const [sx, sy] = stubStart(s, r);
        const [ex, ey] = stubEnd(s, r);
        const c = 7;
        const below = r.dir[1] > 0.5;
        const above = r.dir[1] < -0.5;
        return (
          <g key={`${r.from}-${r.label}`} className="sch-refusal">
            <line x1={sx * U} y1={sy * U} x2={ex * U} y2={ey * U} />
            <path
              d={`M${ex * U - c} ${ey * U - c} L${ex * U + c} ${ey * U + c} M${ex * U - c} ${ey * U + c} L${ex * U + c} ${ey * U - c}`}
            />
            {labels !== "none" && (
              <text
                x={ex * U + (above || below ? 0 : r.dir[0] > 0 ? 14 : -14)}
                y={ey * U + (below ? 26 : above ? -16 : 4)}
                textAnchor={above || below ? "middle" : r.dir[0] > 0 ? "start" : "end"}
                className="sch-label sch-label--name"
              >
                {r.label}
              </text>
            )}
          </g>
        );
      })}

      {s.nodes.map((n, i) => (
        <g
          key={n.id}
          transform={`translate(${n.pos[0] * U} ${n.pos[1] * U})`}
          className={`sch-node ${active === n.id ? "sch-lit" : ""}`}
        >
          <Glyph kind={n.kind} />
          {labels !== "none" && (
            <text y={R + 24} textAnchor="middle" className="sch-label">
              {labels === "full" && <tspan className="sch-num">{nodeNumber(i)}</tspan>}
              <tspan className="sch-label--name" dx={labels === "full" ? 6 : 0}>
                {n.label}
              </tspan>
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
