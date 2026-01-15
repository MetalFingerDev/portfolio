import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type SystemManager from "../systems";

export class Ship {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  private width: number;
  private height: number;
  private lastHyperSpaceMs = 0;
  private static readonly HYPERSPACE_COOLDOWN_MS = 800;

  constructor(domElement: HTMLCanvasElement, initialTarget?: THREE.Vector3) {
    this.width = domElement.width || window.innerWidth;
    this.height = domElement.height || window.innerHeight;

    const desiredFar = 1e9;
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      desiredFar
    );
    this.camera.position.set(0, 0, 50);
    this.camera.name = "ship-camera";

    this.controls = new OrbitControls(this.camera, domElement);
    if (initialTarget) this.controls.target.copy(initialTarget);
    this.controls.update();
  }

  handleResize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  update() {
    this.controls.update();
  }

  focusOn(target: THREE.Object3D, distance: number = 50) {
    const pos = new THREE.Vector3();
    target.getWorldPosition(pos);
    this.camera.position.copy(pos).add(new THREE.Vector3(0, 0, distance));
    this.controls.target.copy(pos);
    this.controls.update();
  }

  // Visual scale helpers: animate camera zoom and clamp controls to simulate
  // the ship being scaled down (instead of scaling the entire scene).
  private _baseMaxDistance?: number;
  private _zoomAnimId?: number;

  public setVisualScale(targetZoom: number, durationMs: number = 600) {
    // store base maxDistance once so repeated animations use the same baseline
    if (this._baseMaxDistance === undefined)
      this._baseMaxDistance = this.controls.maxDistance;

    const startZoom = this.camera.zoom;
    const baseMax = this._baseMaxDistance;
    const startTime = performance.now();

    if (this._zoomAnimId) cancelAnimationFrame(this._zoomAnimId);

    const tick = (t: number) => {
      const elapsed = t - startTime;
      const v = Math.min(1, elapsed / durationMs);
      const zoom = startZoom + (targetZoom - startZoom) * v;
      this.camera.zoom = zoom;
      this.camera.updateProjectionMatrix();

      // Keep maxDistance proportional to zoom so controls remain usable
      this.controls.maxDistance = baseMax * zoom;

      if (v < 1) this._zoomAnimId = requestAnimationFrame(tick);
      else this._zoomAnimId = undefined;
    };

    this._zoomAnimId = requestAnimationFrame(tick);
  }

  public applyTeleport(position: THREE.Vector3, animate: boolean = false) {
    if (!animate) {
      this.camera.position.copy(position);
      this.controls.update();
      return;
    }

    const start = this.camera.position.clone();
    const dest = position.clone();
    const startTime = performance.now();
    const duration = 300;

    const tick = (t: number) => {
      const elapsed = t - startTime;
      const v = Math.min(1, elapsed / duration);
      this.camera.position.lerpVectors(start, dest, v);
      this.controls.update();
      if (v < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  hyperSpace(
    system: string,
    stage: SystemManager,
    visualization: any,
    overlay: any
  ) {
    const now = performance.now();
    if (now - this.lastHyperSpaceMs < Ship.HYPERSPACE_COOLDOWN_MS) return;

    this.lastHyperSpaceMs = now;

    // 1. Trigger the system switch in the manager
    stage.load(system);

    // 2. Reset the Ship/Camera to center the new system
    this.controls.target.set(0, 0, 0);

    // Arrival distance varies depending on destination so we don't immediately
    // trigger the inverse automatic hyperspace check.
    const arrivalDistance =
      system === "interstellar-space"
        ? 2000
        : system === "solar-system"
        ? 400
        : system === "milky-way"
        ? 1500
        : system === "laniakea-super-cluster"
        ? 3000
        : system === "kbc-void"
        ? 5000
        : 1000;

    this.camera.position.set(0, 0, arrivalDistance);
    this.controls.maxDistance = arrivalDistance * 4;
    this.controls.update();

    if (visualization && visualization.updateVisibleObjects) {
      visualization.updateVisibleObjects(stage.current);
    }

    if (overlay) {
      overlay.update(system, (stage.current?.group.scale.x as number) ?? 1);
    }

    console.log(
      `Synthesizing jump to: ${system} (arrive at ${arrivalDistance})`
    );
  }
}

export class InputHandler {
  private ship: Ship;
  private stage: SystemManager;
  private visualization: any;
  private overlay: any;

  constructor(
    ship: Ship,
    stage: SystemManager,
    visualization: any,
    overlay: any
  ) {
    this.ship = ship;
    this.stage = stage;
    this.visualization = visualization;
    this.overlay = overlay;
  }

  handleKey(key: string) {
    const k = key.toLowerCase();
    switch (k) {
      case "l":
        // Toggle LOD if the stage exposes a method; safe-guarded
        if ((this.stage as any).toggleLOD) (this.stage as any).toggleLOD();
        break;
      case "s":
        // FIX: Cycle through ALL systems loaded in test.ts
        const systems = [
          "laniakea-super-cluster",
          "kbc-void",
          "milky-way",
          "interstellar-space",
          "solar-system",
        ];

        // Safe check for current ID
        const currentId =
          (this.stage as any).getActiveSystem?.() || "laniakea-super-cluster";

        // Find current index and calculate next
        const currentIndex = systems.indexOf(currentId);
        // If current system isn't in list (or -1), start at 0 (laniakea)
        const nextIndex = (currentIndex + 1) % systems.length;

        this.ship.hyperSpace(
          systems[nextIndex],
          this.stage,
          this.visualization,
          this.overlay
        );
        break;
      case "t":
        // Traverse to the next named object using visualization.traverse
        if (this.visualization && this.visualization.traverse)
          this.visualization.traverse(this.ship);
        break;
      case "+":
      case "=":
        // Smooth increase of current region scale (10% step)
        if ((this.stage as any).animateCurrentSystemScaleBy)
          (this.stage as any).animateCurrentSystemScaleBy(1.1, 400);
        break;
      case "-":
      case "_":
        // Smooth decrease of current region scale (≈10% step)
        if ((this.stage as any).animateCurrentSystemScaleBy)
          (this.stage as any).animateCurrentSystemScaleBy(1 / 1.1, 400);
        break;
      default:
        break;
    }
  }
}
