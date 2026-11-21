"use client";

import { useEffect, useRef, useState } from "react";
import type { Schematic } from "@/content/schematics";
import { SchematicSvg } from "./schematic-svg";
import { useGlScene } from "./use-gl-scene";

/**
 * The panel beside the home page's work list. It shows the schematic of
 * whichever card (`[data-work-card]`) is nearest the middle of the viewport.
 * In WebGL all the schematics sit on one board and the camera glides between
 * them; without it the SVG simply swaps.
 */
export function WorkBoard({ schematics }: { schematics: Schematic[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const { scene, live } = useGlScene(box, { schematics, labels: "none", interactive: false });

  useEffect(() => {
    const cards = [...document.querySelectorAll<HTMLElement>("[data-work-card]")];
    if (!cards.length) return;
    let queued = false;
    const update = () => {
      queued = false;
      const mid = innerHeight / 2;
      let best = 0;
      let bestGap = Infinity;
      cards.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        const gap = Math.abs((r.top + r.bottom) / 2 - mid);
        if (gap < bestGap) {
          bestGap = gap;
          best = i;
        }
      });
      setIndex(best);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    scene.current?.setActiveIndex(index);
  }, [index, scene, live]);

  return (
    <div ref={box} className="sch-box sch-box--panel" aria-hidden="true">
      <SchematicSvg
        key={schematics[index].id}
        schematic={schematics[index]}
        labels="none"
        className={`sch--fit ${live ? "sch--under" : "sch--swap"}`}
      />
    </div>
  );
}
