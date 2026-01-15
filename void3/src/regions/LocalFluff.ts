import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";
import { Star } from "../stellar/Star";

export class LocalFluff extends Region implements CelestialBody {
  constructor(
    innerBoundary: number,
    outerBoundary: number,
    starCount: number = 100
  ) {
    super();
    this.name = "LocalFluff";

    for (let i = 0; i < starCount; i++) {
      const size = 0.5 + Math.random() * 1.5;
      const color = new THREE.Color().setHSL(Math.random(), 0.4, 0.8);
      const star = new Star(0.5, size, color.getHex(), false);

      const rVal =
        Math.random() *
          (Math.pow(outerBoundary, 3) - Math.pow(innerBoundary, 3)) +
        Math.pow(innerBoundary, 3);
      const r = Math.cbrt(rVal);

      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      star.position.set(x, y, z);

      this.add(star);
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
