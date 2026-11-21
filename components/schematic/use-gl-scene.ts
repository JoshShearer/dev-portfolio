"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { GlScene, GlSceneOptions } from "./gl-scene";

/**
 * WebGL is an enhancement. Skip it for reduced motion, Save-Data, no WebGL,
 * or a software renderer (no GPU: every frame would be a long main-thread
 * task). `?gl=1` forces it on and `?gl=0` off, for testing.
 */
let verdict: boolean | undefined;
function wantsGl(): boolean {
  return (verdict ??= probeGl());
}

function probeGl(): boolean {
  const forced = new URLSearchParams(location.search).get("gl");
  if (forced === "1") return true;
  if (forced === "0") return false;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData) return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

/**
 * Mounts a GlScene into `container` once it is near the viewport and the
 * browser is idle. Returns the scene (for setActive calls) and whether the
 * canvas is showing, so the caller can fade the SVG underneath.
 */
export function useGlScene(
  container: RefObject<HTMLElement | null>,
  options: Omit<GlSceneOptions, "container" | "onReady" | "onFallback">,
) {
  const scene = useRef<GlScene | null>(null);
  const [live, setLive] = useState(false);
  const opts = useRef(options);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let cancelled = false;

    // The capability probe creates a WebGL context, so it too waits for idle.
    const start = () =>
      !cancelled &&
      wantsGl() &&
      import("./gl-scene")
        .then(({ GlScene }) => {
          if (cancelled) return;
          scene.current = new GlScene({
            ...opts.current,
            container: el,
            onReady: () => setLive(true),
            onFallback: () => {
              scene.current = null;
              setLive(false);
            },
          });
        })
        .catch((error) => {
          // No WebGL context after all, or the scene failed to build: the SVG stays.
          console.warn("Schematic: staying on SVG.", error);
        });

    // Wait for the page to finish loading, then for the figure to come near
    // the viewport, then for an idle moment.
    const whenIdle = () => {
      if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 1500 });
      else setTimeout(start, 200);
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (document.readyState === "complete") whenIdle();
        else addEventListener("load", whenIdle, { once: true });
      },
      { rootMargin: "300px" },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      io.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [container]);

  return { scene, live };
}
