import {
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  LineDashedMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { NodeKind, Schematic } from "@/content/schematics";
import { NODE_R, bounds, edgeSegment, nodeNumber, stubEnd, stubStart } from "./layout";

/**
 * The WebGL rendering of one or more schematics: the same data as the SVG,
 * drawn as a board in perspective with pulses travelling along the traces.
 *
 * Loaded by dynamic import only (see use-gl-scene.ts), so three.js never
 * blocks first paint. Several schematics are laid side by side and the camera
 * glides from one to the next (`setActiveIndex`).
 */

export type GlSceneOptions = {
  container: HTMLElement;
  schematics: Schematic[];
  labels: "full" | "names" | "none";
  /** Hover highlighting and drag-to-turn. Parallax is always on. */
  interactive: boolean;
  onHover?: (nodeId: string | null) => void;
  /** Called once the first frame is on screen. */
  onReady?: () => void;
  /** Called if the device cannot hold 30 fps; the scene has disposed itself. */
  onFallback?: () => void;
};

const H = 0.14; // token thickness
const ELEV = 0.75; // world height per unit of node z
const SPACING = 20; // distance between schematics on the board
const PITCH = 0.92; // camera elevation angle, radians
const SLOW_FRAME_MS = 34;

type Pulse = { mesh: Mesh; a: Vector3; b: Vector3; len: number; phase: number; dies: boolean };
type Label = { el: HTMLElement; at: Vector3 };
type Board = {
  centre: Vector3;
  /** Corners of the volume that must stay in frame, labels included. */
  corners: Vector3[];
  size: { w: number; d: number };
  dist: number;
  labels: HTMLElement;
  nodes: Map<string, { outline: LineSegments[]; edges: Line[] }>;
};

function tokenGeometries(kind: NodeKind): { fill: BufferGeometry[]; solid?: BufferGeometry } {
  const r = NODE_R;
  switch (kind) {
    case "source":
      return { fill: [new CylinderGeometry(r, r, H, 40)] };
    case "process":
      return { fill: [new BoxGeometry(r * 2, H, r * 1.64)] };
    case "store": {
      const lower = new CylinderGeometry(r, r, H * 1.6, 40);
      const upper = new CylinderGeometry(r, r, H * 1.6, 40).translate(0, H * 1.9, 0);
      return { fill: [lower, upper] };
    }
    case "gate":
      return { fill: [new BoxGeometry(r * 1.55, H * 1.6, r * 1.55).rotateY(Math.PI / 4)] };
    case "human":
      return {
        fill: [new CylinderGeometry(r, r, H, 40)],
        solid: new SphereGeometry(r * 0.42, 24, 16).translate(0, H / 2 + r * 0.42, 0),
      };
    case "sink":
      return {
        fill: [new BoxGeometry(r * 2, H, r * 2), new BoxGeometry(r * 1.1, H, r * 1.1).translate(0, H, 0)],
      };
  }
}

export class GlScene {
  private o: GlSceneOptions;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(30, 1, 0.1, 400);
  private canvas: HTMLCanvasElement;
  private labelLayer: HTMLElement;
  private boards: Board[] = [];
  private pulses: Pulse[] = [];
  private labels: Label[] = [];
  private pickable: Mesh[] = [];
  private disposables: { dispose(): void }[] = [];

  private mat = {
    fill: new MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 }),
    solid: new MeshBasicMaterial(),
    ink: new LineBasicMaterial(),
    lit: new LineBasicMaterial(),
    trace: new LineBasicMaterial(),
    dashed: new LineDashedMaterial({ dashSize: 0.14, gapSize: 0.12 }),
    refusal: new LineBasicMaterial(),
    pulse: new MeshBasicMaterial(),
    grid: new PointsMaterial({ size: 1.6, sizeAttenuation: false }),
    rule: new LineBasicMaterial(),
  };

  private active = 0;
  private activeNode: string | null = null;
  private target = new Vector3();
  private dist = 20;
  private yaw = 0;
  private pitch = PITCH;
  private dragYaw = 0;
  private pointer = new Vector2(0, 0);
  private wantYaw = 0;
  private wantPitch = PITCH;

  private raf = 0;
  private running = false;
  private visible = false;
  private last = 0;
  private time = 0;
  private ready = false;
  private disposed = false;
  private frames = 0;
  private slowSum = 0;
  private demoted = false;
  private cleanup: (() => void)[] = [];

  constructor(options: GlSceneOptions) {
    this.o = options;
    const { container } = options;

    this.renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setClearAlpha(0);
    this.canvas = this.renderer.domElement;
    this.canvas.setAttribute("aria-hidden", "true");
    this.canvas.className = "sch-gl-canvas";
    this.labelLayer = document.createElement("div");
    this.labelLayer.className = `sch-gl-labels sch-gl-labels--${options.labels}`;
    this.labelLayer.setAttribute("aria-hidden", "true");
    container.append(this.canvas, this.labelLayer);

    options.schematics.forEach((s, i) => this.build(s, i));
    this.applyTheme();
    this.resize();

    const b = this.boards[0];
    this.target.copy(b.centre);
    this.dist = b.dist;
    this.setActiveIndex(0);
    this.listen();
  }

  // ---- construction -------------------------------------------------------

  private keep<T extends { dispose(): void }>(x: T): T {
    this.disposables.push(x);
    return x;
  }

  private build(s: Schematic, index: number) {
    const b = bounds(s);
    const cx = (b.minX + b.maxX) / 2;
    const cy = (b.minY + b.maxY) / 2;
    const ox = index * SPACING;
    const world = (x: number, y: number, z = 0) => new Vector3(x - cx + ox, z * ELEV, y - cy);

    const labelGroup = document.createElement("div");
    labelGroup.className = "sch-gl-group";
    this.labelLayer.append(labelGroup);
    const board: Board = {
      centre: new Vector3(ox, 0, 0.25),
      corners: [b.minX - 1.15, b.maxX + 1.15].flatMap((x) =>
        [b.minY - 0.75, b.maxY + 1.25].flatMap((y) => [world(x, y, 0), world(x, y, 1)]),
      ),
      size: { w: b.maxX - b.minX + 2.6, d: b.maxY - b.minY + 2.9 },
      dist: 20,
      labels: labelGroup,
      nodes: new Map(),
    };
    this.boards.push(board);

    // Drafting grid: a dot at every grid unit under the board.
    const dots: number[] = [];
    for (let x = Math.floor(b.minX) - 1; x <= Math.ceil(b.maxX) + 1; x++)
      for (let y = Math.floor(b.minY) - 1; y <= Math.ceil(b.maxY) + 1; y++) {
        const p = world(x, y);
        dots.push(p.x, -0.01, p.z);
      }
    const grid = this.keep(new BufferGeometry());
    grid.setAttribute("position", new Float32BufferAttribute(dots, 3));
    this.scene.add(new Points(grid, this.mat.grid));

    for (const [i, n] of s.nodes.entries()) {
      const at = world(n.pos[0], n.pos[1], n.pos[2]);
      const group = new Group();
      group.position.copy(at).setY(at.y + H / 2);
      const entry = { outline: [] as LineSegments[], edges: [] as Line[] };
      board.nodes.set(n.id, entry);

      const geo = tokenGeometries(n.kind);
      for (const g of geo.fill) {
        const mesh = new Mesh(this.keep(g), this.mat.fill);
        mesh.userData = { nodeId: n.id, board: index };
        const outline = new LineSegments(this.keep(new EdgesGeometry(g, 30)), this.mat.ink);
        group.add(mesh, outline);
        entry.outline.push(outline);
        this.pickable.push(mesh);
      }
      if (geo.solid) group.add(new Mesh(this.keep(geo.solid), this.mat.solid));
      this.scene.add(group);

      // A raised node stands on a thin post, so its height reads as height.
      if (at.y > 0) {
        const post = this.keep(new BufferGeometry().setFromPoints([new Vector3(at.x, 0, at.z), at.clone()]));
        this.scene.add(new Line(post, this.mat.rule));
      }

      const el = document.createElement("div");
      el.className = "sch-gl-label";
      el.innerHTML = `<span class="sch-gl-num"></span><span class="sch-gl-name"></span>`;
      (el.children[0] as HTMLElement).textContent = nodeNumber(i);
      (el.children[1] as HTMLElement).textContent = n.label;
      labelGroup.append(el);
      this.labels.push({ el, at: new Vector3(at.x, 0, at.z + NODE_R + 0.32) });
    }

    const height = (id: string) => s.nodes.find((n) => n.id === id)!.pos[2] * ELEV + H / 2;

    for (const [i, e] of s.edges.entries()) {
      const [[x1, y1], [x2, y2]] = edgeSegment(s, e);
      const a = world(x1, y1).setY(height(e.from));
      const c = world(x2, y2).setY(height(e.to));
      const geo = this.keep(new BufferGeometry().setFromPoints([a, c]));
      const line = new Line(geo, e.kind === "control" ? this.mat.dashed : this.mat.trace);
      line.computeLineDistances();
      line.userData = { base: line.material };
      this.scene.add(line);
      board.nodes.get(e.from)!.edges.push(line);
      board.nodes.get(e.to)!.edges.push(line);

      const head = new Mesh(this.keep(new ConeGeometry(0.06, 0.2, 12)), this.mat.solid);
      head.position.copy(c);
      head.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), c.clone().sub(a).normalize());
      this.scene.add(head);

      this.addPulse(a, c, (i * 0.37 + index * 0.21) % 1, false);
    }

    for (const [i, r] of (s.refusals ?? []).entries()) {
      const [sx, sy] = stubStart(s, r);
      const [ex, ey] = stubEnd(s, r);
      const y = height(r.from);
      const a = world(sx, sy).setY(y);
      const c = world(ex, ey).setY(y);
      this.scene.add(new Line(this.keep(new BufferGeometry().setFromPoints([a, c])), this.mat.refusal));
      const k = 0.13;
      const cross = this.keep(
        new BufferGeometry().setFromPoints([
          new Vector3(c.x - k, y, c.z - k),
          new Vector3(c.x + k, y, c.z + k),
          new Vector3(c.x - k, y, c.z + k),
          new Vector3(c.x + k, y, c.z - k),
        ]),
      );
      this.scene.add(new LineSegments(cross, this.mat.refusal));
      this.addPulse(a, c, (i * 0.53 + 0.4) % 1, true);

      const el = document.createElement("div");
      el.className = "sch-gl-label sch-gl-label--refusal";
      el.textContent = r.label;
      labelGroup.append(el);
      const out = c.clone().sub(a).normalize().multiplyScalar(0.3);
      this.labels.push({ el, at: new Vector3(c.x + out.x, 0, c.z + out.z + 0.22) });
    }
  }

  private addPulse(a: Vector3, b: Vector3, phase: number, dies: boolean) {
    if (!this.pulseGeo) this.pulseGeo = this.keep(new SphereGeometry(0.065, 12, 8));
    const mesh = new Mesh(this.pulseGeo, this.mat.pulse);
    this.scene.add(mesh);
    this.pulses.push({ mesh, a, b, len: a.distanceTo(b), phase, dies });
  }
  private pulseGeo?: SphereGeometry;

  // ---- public -------------------------------------------------------------

  setActiveIndex(i: number) {
    this.active = Math.max(0, Math.min(this.boards.length - 1, i));
    this.boards.forEach((b, n) => b.labels.classList.toggle("sch-gl-group--on", n === this.active));
    this.dragYaw = 0;
  }

  setActiveNode(id: string | null) {
    if (id === this.activeNode) return;
    const board = this.boards[this.active];
    const set = (nodeId: string | null, lit: boolean) => {
      const entry = nodeId && board.nodes.get(nodeId);
      if (!entry) return;
      for (const o of entry.outline) o.material = lit ? this.mat.lit : this.mat.ink;
      for (const e of entry.edges) e.material = lit ? this.mat.lit : e.userData.base;
    };
    set(this.activeNode, false);
    set(id, true);
    this.activeNode = id;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    for (const fn of this.cleanup) fn();
    for (const d of this.disposables) d.dispose();
    for (const m of Object.values(this.mat)) m.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
    this.labelLayer.remove();
  }

  // ---- runtime ------------------------------------------------------------

  private applyTheme = () => {
    const css = getComputedStyle(document.documentElement);
    const c = (name: string) => new Color(css.getPropertyValue(name).trim() || "#888");
    this.mat.fill.color = c("--sheet");
    this.mat.solid.color = c("--ink");
    this.mat.ink.color = c("--ink");
    this.mat.lit.color = c("--signal");
    this.mat.trace.color = c("--pencil");
    this.mat.dashed.color = c("--pencil");
    this.mat.refusal.color = c("--signal");
    this.mat.pulse.color = c("--signal");
    this.mat.grid.color = c("--rule");
    this.mat.rule.color = c("--rule");
  };

  private resize = () => {
    const { clientWidth: w, clientHeight: h } = this.o.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // The closest distance at which every corner of a board is still in frame.
    const probe = this.camera.clone();
    const p = new Vector3();
    const fits = (b: Board, dist: number) => {
      probe.position.set(b.centre.x, Math.sin(PITCH) * dist, b.centre.z + Math.cos(PITCH) * dist);
      probe.lookAt(b.centre);
      probe.updateMatrixWorld();
      return b.corners.every((c) => {
        p.copy(c).project(probe);
        return Math.abs(p.x) < 0.96 && Math.abs(p.y) < 0.94;
      });
    };
    for (const b of this.boards) {
      let near = 2;
      let far = 150;
      for (let i = 0; i < 14; i++) {
        const mid = (near + far) / 2;
        if (fits(b, mid)) far = mid;
        else near = mid;
      }
      b.dist = far;
    }
  };

  private listen() {
    const { container } = this.o;
    const on = <K extends keyof HTMLElementEventMap>(
      el: HTMLElement | Document,
      type: K | "visibilitychange",
      fn: (e: never) => void,
    ) => {
      el.addEventListener(type, fn as EventListener, { passive: true });
      this.cleanup.push(() => el.removeEventListener(type, fn as EventListener));
    };

    const ro = new ResizeObserver(this.resize);
    ro.observe(container);
    const io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      this.sync();
    });
    io.observe(container);
    const mo = new MutationObserver(this.applyTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", this.applyTheme);
    this.cleanup.push(
      () => ro.disconnect(),
      () => io.disconnect(),
      () => mo.disconnect(),
      () => mq.removeEventListener("change", this.applyTheme),
    );
    on(document, "visibilitychange", () => this.sync());

    let dragging = false;
    let lastX = 0;
    const raycaster = new Raycaster();
    const pick = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      const ndc = new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, this.camera);
      const hit = raycaster.intersectObjects(this.pickable, false).find((h) => h.object.userData.board === this.active);
      return (hit?.object.userData.nodeId as string | undefined) ?? null;
    };

    on(container, "pointermove", (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      this.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1);
      if (!this.o.interactive) return;
      if (dragging) {
        this.dragYaw = Math.max(-0.6, Math.min(0.6, this.dragYaw - (e.clientX - lastX) * 0.005));
        lastX = e.clientX;
        return;
      }
      const id = pick(e);
      container.style.cursor = id ? "pointer" : "grab";
      this.o.onHover?.(id);
    });
    on(container, "pointerleave", () => {
      this.pointer.set(0, 0);
      dragging = false;
      if (this.o.interactive) this.o.onHover?.(null);
    });
    if (this.o.interactive) {
      on(container, "pointerdown", (e: PointerEvent) => {
        if (e.pointerType === "touch") {
          this.o.onHover?.(pick(e)); // a tap selects; dragging stays with page scroll
          return;
        }
        dragging = true;
        lastX = e.clientX;
        container.style.cursor = "grabbing";
      });
      on(container, "pointerup", () => {
        dragging = false;
        container.style.cursor = "grab";
      });
    }
  }

  private sync() {
    const should = this.visible && !document.hidden && !this.disposed;
    if (should && !this.running) {
      this.running = true;
      this.last = 0;
      this.frames = 0;
      this.slowSum = 0;
      this.raf = requestAnimationFrame(this.frame);
    } else if (!should && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  private frame = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.frame);
    const dt = this.last ? Math.min(now - this.last, 100) : 16;
    this.last = now;
    this.time += dt / 1000;
    const ease = 1 - Math.exp(-dt / 220);

    // Camera: ease toward the active board, with a few degrees of pointer parallax.
    const board = this.boards[this.active];
    this.target.lerp(board.centre, ease);
    this.dist += (board.dist - this.dist) * ease;
    this.wantYaw = this.pointer.x * 0.12 + this.dragYaw;
    this.wantPitch = PITCH - this.pointer.y * 0.05;
    this.yaw += (this.wantYaw - this.yaw) * ease;
    this.pitch += (this.wantPitch - this.pitch) * ease;
    const flat = Math.cos(this.pitch) * this.dist;
    this.camera.position.set(
      this.target.x + Math.sin(this.yaw) * flat,
      this.target.y + Math.sin(this.pitch) * this.dist,
      this.target.z + Math.cos(this.yaw) * flat,
    );
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();

    // Pulses: travel a trace, pause, repeat. On a refusal stub they shrink out at the cross.
    for (const p of this.pulses) {
      const period = (p.len + 1.6) / 0.9;
      const along = ((this.time / period + p.phase) % 1) * (p.len + 1.6);
      const t = along / p.len;
      if (t > 1) {
        p.mesh.visible = false;
        continue;
      }
      p.mesh.visible = true;
      p.mesh.position.lerpVectors(p.a, p.b, t);
      const s = p.dies ? Math.min(1, (1 - t) * 4) : Math.min(1, t * 8, (1 - t) * 8);
      p.mesh.scale.setScalar(Math.max(s, 0.001));
    }

    this.renderer.render(this.scene, this.camera);
    this.placeLabels();

    if (!this.ready) {
      this.ready = true;
      this.canvas.classList.add("sch-gl-canvas--on");
      this.labelLayer.classList.add("sch-gl-labels--on");
      this.o.onReady?.();
    }
    this.watchFrameRate(dt);
  };

  private v = new Vector3();
  private placeLabels() {
    const w = this.o.container.clientWidth;
    const h = this.o.container.clientHeight;
    for (const l of this.labels) {
      this.v.copy(l.at).project(this.camera);
      const x = (this.v.x * 0.5 + 0.5) * w;
      const y = (-this.v.y * 0.5 + 0.5) * h;
      l.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, 0)`;
    }
  }

  /** Too slow: first drop to 1x pixels, then hand back to the SVG. */
  private watchFrameRate(dt: number) {
    this.frames++;
    if (this.frames <= 10) return; // warm-up: shader compile, first layout
    this.slowSum += dt;
    if (this.frames < 50) return;
    const avg = this.slowSum / 40;
    this.frames = 0;
    this.slowSum = 0;
    if (avg <= SLOW_FRAME_MS) return;
    if (!this.demoted && this.renderer.getPixelRatio() > 1) {
      this.demoted = true;
      this.renderer.setPixelRatio(1);
      this.resize();
      return;
    }
    this.dispose();
    this.o.onFallback?.();
  }
}
