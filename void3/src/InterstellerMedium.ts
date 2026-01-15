import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";

export class InterstellarMedium extends Region implements CelestialBody {
  private particles: THREE.Points;

  constructor(boundaryRadius: number, particleCount: number = 20000) {
    super();
    this.name = "InterstellarMedium";

    // geometry to hold particle positions
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Generate random point inside a sphere of boundaryRadius
      // We use cube root of random() for uniform distribution within the sphere volume
      const r = boundaryRadius * Math.cbrt(Math.random());
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation: White to faint Blue/Purple
      // 80% chance of white/grey, 20% chance of subtle color
      if (Math.random() > 0.8) {
        color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.8); // Blue/Purple tints
      } else {
        color.setHSL(0, 0, Math.random() * 0.5 + 0.3); // Grey/White
      }

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Material for the dust
    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.add(this.particles);
  }

  setDetail(_isHighDetail: boolean): void {}

  update(delta: number): void {
    // Slowly rotate the entire dust field for a dynamic effect
    this.particles.rotation.y += 0.005 * delta;
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);
    // Resource disposal is handled by Region's disposeHierarchy
  }
}
