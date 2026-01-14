import * as THREE from "three";
import Star from "../stellar";
import Planet from "../planetary";
import type { PlanetConfig } from "../planetary";
import SystemManager, { BaseSystem } from "../systems";

// Minimal, self-contained systems that act as "regions" for the SystemManager
// Each system exposes a `group: THREE.Group` and implements `init`/`update`/`destroy`.

export class SolarSystem extends BaseSystem {
  constructor(manager: SystemManager, config?: any) {
    super(manager, config);
    this.group.name = "solar-system";
  }

  init(params?: any) {
    // Use ratio if provided by the loader (defaults to 1)
    const ratio = (params && params.ratio) || 1;

    // HIGH DETAIL: Sun using the shared Star class for consistent behavior
    const sun = new Star(5, 109, 0xffff00);
    sun.name = "Sun";
    this.group.add(sun);

    // Config-driven planetary list
    const planets: PlanetConfig[] = [
      {
        name: "Mercury",
        radiusMeters: 2439700,
        distanceAU: 0.39,
        eccentricity: 0.2056,
        angleDeg: 0,
        rotationSpeedRadPerSec: 1.24e-6,
        obliquityDeg: 0.034,
        color: 0x8c7853,
      },
      {
        name: "Venus",
        radiusMeters: 6051800,
        distanceAU: 0.72,
        eccentricity: 0.0068,
        angleDeg: 0,
        rotationSpeedRadPerSec: -2.99e-7, // retrograde
        obliquityDeg: 177.4,
        color: 0xffc649,
        hasAtmosphere: true,
      },
      {
        name: "Earth",
        radiusMeters: 6371000,
        distanceAU: 1.0,
        eccentricity: 0.0167,
        angleDeg: 0,
        rotationSpeedRadPerSec: 7.29e-5,
        obliquityDeg: 23.5,
        texturePath: "earth.jpg",
        hasClouds: true,
        cloudMapPath: "04_earthcloudmap.png",
        cloudAlphaPath: "05_earthcloudmaptrans.png",
        hasAtmosphere: true,
      },
      {
        name: "Mars",
        radiusMeters: 3389000,
        distanceAU: 1.52,
        eccentricity: 0.0934,
        angleDeg: 0,
        rotationSpeedRadPerSec: 7.08e-5,
        obliquityDeg: 25.19,
        texturePath: "mars.jpg",
        hasClouds: false,
        hasAtmosphere: true,
      },
      {
        name: "Jupiter",
        radiusMeters: 69911000,
        distanceAU: 5.2,
        eccentricity: 0.0489,
        angleDeg: 0,
        rotationSpeedRadPerSec: 1.76e-4,
        obliquityDeg: 3.13,
        color: 0xd8ca9d,
        hasAtmosphere: true,
      },
      {
        name: "Saturn",
        radiusMeters: 58232000,
        distanceAU: 9.54,
        eccentricity: 0.0557,
        angleDeg: 0,
        rotationSpeedRadPerSec: 1.64e-4,
        obliquityDeg: 26.73,
        color: 0xfad5a5,
        hasAtmosphere: true,
      },
      {
        name: "Uranus",
        radiusMeters: 25362000,
        distanceAU: 19.19,
        eccentricity: 0.0472,
        angleDeg: 0,
        rotationSpeedRadPerSec: -1.01e-4,
        obliquityDeg: 97.77,
        color: 0x4fd0e7,
        hasAtmosphere: true,
      },
      {
        name: "Neptune",
        radiusMeters: 24622000,
        distanceAU: 30.07,
        eccentricity: 0.0086,
        angleDeg: 0,
        rotationSpeedRadPerSec: 1.08e-4,
        obliquityDeg: 28.32,
        color: 0x4b70dd,
        hasAtmosphere: true,
      },
      {
        name: "Pluto",
        radiusMeters: 1188300,
        distanceAU: 39.48,
        eccentricity: 0.2488,
        angleDeg: 0,
        rotationSpeedRadPerSec: 1.14e-5,
        obliquityDeg: 122.53,
        color: 0x8c7853,
      },
    ];

    // Create planets from config
    for (const config of planets) {
      new Planet(config, ratio, sun);
    }
  }

  initPlaceholder() {
    // LOW DETAIL: represent the Sun as a simplified Star so it matches interstellar stars
    const luminosity = 1.2;
    const radius = 1.5;
    const color = 0xffcc00;

    // clear any previous placeholder content and add a Star instance
    this.placeholder.clear();
    const sun = new Star(luminosity, radius, color);
    sun.name = "Sun";
    this.placeholder.add(sun);
  }

  update(delta: number) {
    // Simple rotation for the sun
    this.group.children.forEach((c) => (c.rotation.y += 0.1 * delta));
  }

  destroy() {
    this.group.clear();
    this.placeholder.clear();
  }
}

export class InterstellarSpace extends BaseSystem {
  constructor(manager: SystemManager, config?: any) {
    super(manager, config);
    this.group.name = "interstellar-space";
  }

  init(_params?: any) {
    const starCount = 100; // Keep this reasonable for performance
    const spread = 400; // The volume of space to scatter them in

    for (let i = 0; i < starCount; i++) {
      // 1. Randomize Star Properties
      const luminosity = 0.5 + Math.random() * 1.5;
      const radius = 0.8 + Math.random() * 0.5;

      // 2. Random HSL color favoring valid star colors
      const hue = Math.random() * 0.15 + (Math.random() > 0.8 ? 0.6 : 0); // Yellow/Red or Blue
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

      // 3. Create the Star Instance
      const star = new Star(luminosity, radius, color);

      // 4. Position randomly in 3D space
      star.position.set(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread
      );

      // 5. Add to the System Group
      this.group.add(star);
    }
  }

  initPlaceholder() {
    // Low-detail starfield using Points for performance
    const count = 300;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.6 });
    const points = new THREE.Points(geom, mat);
    points.name = "starfield-placeholder";
    this.placeholder.add(points);
  }

  update(delta: number) {
    super.update(delta);

    // Optional: Slow rotation for all stars to make them feel alive
    this.group.children.forEach((child) => {
      child.rotation.y += delta * 0.05;
    });
  }
}

export function registerer(manager: SystemManager) {
  manager.register("solar-system", SolarSystem as any);
  manager.register("interstellar-space", InterstellarSpace as any);

  // connect neighborhoods
  manager.connect("solar-system", "interstellar-space");
}

export default registerer;
