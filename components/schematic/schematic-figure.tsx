"use client";

import { useEffect, useRef, useState } from "react";
import type { Schematic } from "@/content/schematics";
import { nodeNumber } from "./layout";
import { SchematicSvg } from "./schematic-svg";
import { useGlScene } from "./use-gl-scene";

/**
 * One schematic: the SVG in the HTML, the WebGL scene faded in over it when
 * the device can take it, and optionally the list of nodes beside it. The list
 * is the accessible form of the diagram; pointing at either highlights the other.
 */
export function SchematicFigure({
  schematic,
  variant,
}: {
  schematic: Schematic;
  /** `hero`: names only, no list. `case`: numbered, interactive, with the list. */
  variant: "hero" | "case";
}) {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [schematics] = useState(() => [schematic]);
  const { scene, live } = useGlScene(box, {
    schematics,
    labels: variant === "hero" ? "names" : "full",
    interactive: variant === "case",
    onHover: setActive,
  });

  useEffect(() => {
    scene.current?.setActiveNode(active);
  }, [active, scene]);

  return (
    <figure>
      <div ref={box} className="sch-box">
        <SchematicSvg
          schematic={schematic}
          labels={variant === "hero" ? "names" : "full"}
          active={active}
          className={live ? "sch--under" : ""}
        />
      </div>
      {variant === "case" && (
        <figcaption>
          <ol className="mt-8 grid gap-x-8 text-sm sm:grid-cols-2 lg:grid-cols-3" onMouseLeave={() => setActive(null)}>
            {schematic.nodes.map((n, i) => (
              <li key={n.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(n.id)}
                  onFocus={() => setActive(n.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive(n.id)}
                  aria-pressed={active === n.id}
                  className={`grid h-full w-full cursor-pointer grid-cols-[1.75rem_1fr] content-start gap-1 border-t border-rule py-3 text-left ${
                    active === n.id ? "text-signal" : ""
                  }`}
                >
                  <span className="tag pt-0.5 text-inherit">{nodeNumber(i)}</span>
                  <span>
                    <span className="font-semibold">{n.label}</span>
                    <span className={`mt-0.5 block ${active === n.id ? "text-ink" : "text-pencil"}`}>{n.note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
          {(schematic.refusals?.length ?? 0) > 0 && (
            <p className="tag mt-4 normal-case tracking-normal">
              <span className="text-signal">✕</span> marks where the system refuses.
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
