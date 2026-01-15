import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";
import { Star } from "./CelestialBodies";

export class LocalFluff extends Region implements CelestialBody {
  constructor(
    innerBoundary: number,
    outerBoundary: number,
    starCount: number = 200
  ) {
    super();
    this.name = "LocalFluff";

    for (let i = 0; i < starCount; i++) {
      // 1. Randomize Star Properties
      // Variation in size (0.5 to 2.0) and random faint colors
      const size = 0.5 + Math.random() * 1.5;
      const color = new THREE.Color().setHSL(Math.random(), 0.4, 0.8);

      const star = new Star(0.5, size, color.getHex());

      // 2. Calculate Position (Uniform distribution within a spherical shell)
      // We use the cube root method to ensure stars are not clumped near the center
      // R = cbrt(random * (R_out^3 - R_in^3) + R_in^3)
      const rVal =
        Math.random() *
          (Math.pow(outerBoundary, 3) - Math.pow(innerBoundary, 3)) +
        Math.pow(innerBoundary, 3);
      const r = Math.cbrt(rVal);

      // Random spherical angles
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      star.position.set(x, y, z);

      // 3. Register Body
      this.add(star);
      // We can push to bodies if we want them to have specific updates,
      // but for static background stars, it's not strictly necessary unless they animate.
      // (this.bodies array usage depends on if Star needs update calls)
      (star as any).group = star;
      this.bodies.push(star);
    }
  }

  setDetail(_isHighDetail: boolean): void {}
  update(_delta: number): void {}

  destroy(): void {
    this.bodies.forEach((b) => b.destroy());
    if (this.parent) this.parent.remove(this);
  }
}
