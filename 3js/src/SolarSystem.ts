import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { PLANET_DATA, type region, type data } from "./config";
import { AU_SCENE, SUN_RADIUS } from "./units";
import Earth from "./Earth";
import Sun from "./Sun";

const ENTIRE_SCENE = 0;

export class SolarSystem implements region {
  public group: THREE.Group = new THREE.Group();
  private static sphereGeo = new THREE.SphereGeometry(1, 64, 64);
  private updatables: { update: (delta: number) => void }[] = [];

  constructor(cfg: data) {
    this.group.position.x = cfg.Offset || 0;
    this.init(cfg.Ratio);
  }

  private createLabel(text: string, yOffset: number): CSS2DObject {
    const div = document.createElement("div");
    div.className = "solar-label";
    div.textContent = text;
    div.style.cssText = `
      color: rgba(255, 255, 255, 0.8);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      letter-spacing: 1px;
      text-transform: uppercase;
      pointer-events: none;
    `;
    const label = new CSS2DObject(div);
    label.position.set(0, yOffset, 0);
    return label;
  }

  private init(ratio: number) {
    // 1. Realistic Sun (Scaled by Ratio)
    const sunRadius = SUN_RADIUS * ratio;
    const sun = new Sun(this.group, {
      radius: sunRadius,
      detailed: true,
      position: new THREE.Vector3(0, 0, 0),
    });
    sun.sunGroup.name = "Sun";
    this.updatables.push(sun);

    // Sun label
    const sunLabel = this.createLabel("Sun", sunRadius * 1.5);
    this.group.add(sunLabel);

    // 2. Realistic Planets
    PLANET_DATA.forEach((planet) => {
      const a = planet.distance * AU_SCENE * ratio; // Semi-major axis
      const e = planet.eccentricity;
      const b = a * Math.sqrt(1 - e * e); // Semi-minor axis
      const focusOffset = a * e; // Distance from center to focus (where Sun is)

      // 1. Create Orbital Marker (The Ellipse)
      const curve = new THREE.EllipseCurve(
        -focusOffset,
        0, // Center is offset so focus is at (0,0)
        a,
        b, // Radii
        0,
        2 * Math.PI, // Full circle
        false,
        0
      );

      const points = curve.getPoints(128);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      orbitGeo.rotateX(Math.PI / 2); // Lay flat on XZ plane

      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x4444ff, // Soft blue instead of harsh white
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending, // Makes it "glow" against the black background
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      this.group.add(orbitLine);

      // 2. Calculate Position for Jan 1, 2026
      const angleRad = THREE.MathUtils.degToRad(planet.angle);

      // Keplerian position relative to focus
      // r = a(1-e^2) / (1 + e*cos(theta))
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
      const posX = r * Math.cos(angleRad);
      const posZ = r * Math.sin(angleRad);

      const planetSize = planet.size * ratio;

      if (planet.name === "Earth") {
        const earth = new Earth(ratio);
        earth.group.name = "Earth";
        earth.group.position.set(posX, 0, posZ);
        this.group.add(earth.group);
        this.updatables.push(earth);
      } else {
        const mat = new THREE.MeshStandardMaterial({
          color: planet.color,
          roughness: 0.9, // Higher roughness stops the "glistening"
          metalness: 0.0,
        });
        const mesh = new THREE.Mesh(SolarSystem.sphereGeo, mat);

        mesh.layers.set(ENTIRE_SCENE); // Ensure it's on Layer 0
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = planet.name;
        mesh.scale.setScalar(planetSize);
        mesh.position.set(posX, 0, posZ);
        this.group.add(mesh);
      }

      // Position Labels
      const label = this.createLabel(planet.name, planetSize * 3);
      label.position.set(posX, 0, posZ);
      this.group.add(label);
    });
  }

  public update(delta: number) {
    this.updatables.forEach((item) => item.update(delta));
  }

  public destroy() {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    });
  }
}
