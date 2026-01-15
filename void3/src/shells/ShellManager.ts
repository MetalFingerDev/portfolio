import * as THREE from "three";
import type SystemManager from "../systems";
import type { Ship } from "../controls";

export interface ShellConfig {
  innerRadius: number;
  outerRadius: number;
  innerId: string; // system id mapped to inner shell
  centerId: string; // center system id
  outerId: string; // system id mapped to outer shell
  margin?: number; // safety margin from boundaries
  cooldownMs?: number; // debounce between cross events
}

export default class ShellManager {
  private stage: SystemManager;
  private ship: Ship;
  private cfg: ShellConfig;
  private lastCrossMs = 0;

  // Optional scene reference where the visual shells will be added
  private scene?: THREE.Scene;
  private innerShell?: THREE.Mesh;
  private centerShell?: THREE.Mesh;
  private outerShell?: THREE.Mesh;

  constructor(
    stage: SystemManager,
    ship: Ship,
    cfg: ShellConfig,
    scene?: THREE.Scene
  ) {
    this.stage = stage;
    this.ship = ship;
    this.cfg = Object.assign({ margin: 10, cooldownMs: 1000 }, cfg);
    this.scene = scene;

    if (this.scene) this.createShells();
  }

  private createShells() {
    if (!this.scene) return;

    const innerR = this.cfg.innerRadius;
    const outerR = this.cfg.outerRadius;
    const centerR = (innerR + outerR) / 2;

    const geomInner = new THREE.SphereGeometry(innerR, 48, 32);
    const geomCenter = new THREE.SphereGeometry(centerR, 48, 32);
    const geomOuter = new THREE.SphereGeometry(outerR, 48, 32);

    const matInner = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      depthWrite: false,
    });

    const matCenter = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      depthWrite: false,
    });

    const matOuter = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      depthWrite: false,
    });

    this.innerShell = new THREE.Mesh(geomInner, matInner);
    this.centerShell = new THREE.Mesh(geomCenter, matCenter);
    this.outerShell = new THREE.Mesh(geomOuter, matOuter);

    this.innerShell.name = "shell-inner";
    this.centerShell.name = "shell-center";
    this.outerShell.name = "shell-outer";

    // add to scene
    this.scene.add(this.innerShell);
    this.scene.add(this.centerShell);
    this.scene.add(this.outerShell);
  }

  private flashShell(which: "inner" | "outer") {
    const mesh = which === "inner" ? this.innerShell : this.outerShell;
    if (!mesh) return;
    const mat = mesh.material as THREE.MeshBasicMaterial;
    const start = mat.opacity;
    const peak = Math.min(0.3, start + 0.25);
    const dur = 400;
    const startTime = performance.now();

    const tick = (t: number) => {
      const elapsed = t - startTime;
      const v = Math.min(1, elapsed / dur);
      // simple ease-out
      const eased = 1 - Math.pow(1 - v, 2);
      mat.opacity = start + (peak - start) * (1 - Math.abs(eased * 2 - 1));
      if (v < 1) requestAnimationFrame(tick);
      else mat.opacity = start;
    };

    requestAnimationFrame(tick);
  }

  public destroy() {
    [this.innerShell, this.centerShell, this.outerShell].forEach((m) => {
      if (!m || !this.scene) return;
      m.geometry.dispose();
      const mat = m.material as any;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose && x.dispose());
      else mat.dispose && mat.dispose();
      this.scene.remove(m);
    });
    this.innerShell = this.centerShell = this.outerShell = undefined;
  }

  /** Called every frame with delta seconds */
  public update(_delta: number) {
    const pos = this.ship.camera.position;
    const r = pos.length();
    const now = performance.now();
    if (now - this.lastCrossMs < (this.cfg.cooldownMs ?? 1000)) return;

    // crossed inward past innerRadius
    if (r < (this.cfg.innerRadius ?? 0)) {
      this.lastCrossMs = now;
      const dir = pos.clone().normalize();
      this.onCross("inward", dir);
      return;
    }

    // crossed outward past outerRadius
    if (r > (this.cfg.outerRadius ?? Infinity)) {
      this.lastCrossMs = now;
      const dir = pos.clone().normalize();
      this.onCross("outward", dir);
      return;
    }
  }

  private onCross(direction: "inward" | "outward", dir: THREE.Vector3) {
    const margin = this.cfg.margin ?? 10;

    if (direction === "inward") {
      // Teleport to the opposite (outer) boundary just inside it
      const targetRadius = Math.max(
        this.cfg.outerRadius - margin,
        this.cfg.innerRadius + 1
      );
      const newPos = dir.clone().multiplyScalar(targetRadius);

      // perform teleport & visual scale
      this.ship.applyTeleport(newPos, true);
      this.ship.setVisualScale(0.3, 600);

      // Load the inner neighbor system (the user wanted the "inner" region to be loaded when crossing inward)
      this.stage.load(this.cfg.innerId);

      // Highlight shells briefly (optional visual feedback)
      this.flashShell("inner");

      // optional: update visible objects and overlay
      if ((this.stage as any).onScaleChange)
        (this.stage as any).onScaleChange(
          this.cfg.innerId,
          (this.stage as any).getActiveSystemId?.()
        );
    } else {
      // outward -> move to inner boundary just outside it
      const targetRadius = Math.min(
        this.cfg.innerRadius + margin,
        this.cfg.outerRadius - 1
      );
      const newPos = dir.clone().multiplyScalar(targetRadius);

      this.ship.applyTeleport(newPos, true);
      this.ship.setVisualScale(0.3, 600);

      this.stage.load(this.cfg.outerId);

      this.flashShell("outer");

      if ((this.stage as any).onScaleChange)
        (this.stage as any).onScaleChange(
          this.cfg.outerId,
          (this.stage as any).getActiveSystemId?.()
        );
    }
  }
}
