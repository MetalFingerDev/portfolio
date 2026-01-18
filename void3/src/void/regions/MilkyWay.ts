import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";
import { Star } from "../stellar";

export class MilkyWay extends Region implements CelestialBody {
  public mesh: THREE.Mesh;

  constructor(cfg?: any) {
    const thickness = 20000;
    const radius = 400000;
    super({ ...cfg, radius });

    this.name = "MilkyWay";

    const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);

    const material = new THREE.MeshBasicMaterial({
      color: 0x4b0082,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);

    // --- SHELL ---
    // Add a large, inward-facing shell to enclose the galaxy (configurable via cfg.shellRadius)
    const shellRadius = cfg?.shellRadius ?? radius + thickness;
    const shellGeom = new THREE.SphereGeometry(shellRadius, 64, 32);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x4b0082,
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      opacity: 0.98,
    });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    shell.name = "milkyway-shell";
    this.add(shell);
    // store reference for later tweaks
    (this as any).shell = shell;

    this.populateStars(cfg?.starCount ?? 1000);

    this.position.set(200000, 0, 0);
  }

  public create(): void {
    // No-op: MilkyWay initializes synchronously in constructor
  }

  private populateStars(starCount: number) {
    for (let i = 0; i < starCount; i++) {
      const radialDistance = 400000 * Math.sqrt(Math.random());
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 20000;

      const x = radialDistance * Math.cos(angle);
      const z = radialDistance * Math.sin(angle);

      const star = new Star(1.5, 100, 0xffcc00);
      star.position.set(x, height, z);
      this.add(star);

      this.bodies.push(star);
    }
  }

  update(delta: number): void {
    this.rotation.y += 0.0001 * delta;
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);
    this.traverse((child) => {
      if ((child as any).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            (mesh.material as THREE.Material[]).forEach((m) => m.dispose());
          } else {
            (mesh.material as THREE.Material).dispose();
          }
        }
      }
    });

    super.destroy();
  }
}
