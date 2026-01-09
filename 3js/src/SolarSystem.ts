import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { PLANET_DATA, type region, type data } from "./config";
import { AU_SCENE, SUN_RADIUS } from "./conversions";
import Earth from "./Earth";
import Sun from "./Sun";

const ENTIRE_SCENE = 0;

export class SolarSystem implements region {
  public group: THREE.Group = new THREE.Group();
  public cfg: data;
  private static sphereGeo = new THREE.SphereGeometry(1, 64, 64);
  private updatables: { update: (delta: number) => void }[] = [];

  constructor(cfg: data) {
    this.cfg = cfg;
    this.group.position.x = cfg.Offset || 0;
    this.init(cfg.Ratio);
    this.createStarShell(cfg.Ratio);
  }

  private createStarShell(ratio: number): void {
    const shellRadius = (this.cfg.Dist * 100) / ratio; // Massive distance = no parallax
    const starCount = 10000;

    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = shellRadius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = shellRadius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = shellRadius * Math.cos(phi);

      // Uniform Color Logic
      const color = new THREE.Color().setHSL(
        0.6 + Math.random() * 0.05,
        0.8,
        0.5 + Math.random() * 0.4
      );
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5, // Match size with Fluff
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false, // Keeps stars as 1.5px dots regardless of distance
      blending: THREE.AdditiveBlending,
    });

    const starShell = new THREE.Points(geometry, material);
    this.group.add(starShell);
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
    const sunRadius = SUN_RADIUS * ratio;
    const sun = new Sun(this.group, {
      radius: sunRadius,
      detailed: true,
      position: new THREE.Vector3(0, 0, 0),
    });
    sun.sunGroup.name = "Sun";
    this.updatables.push(sun);

    const sunLabel = this.createLabel("Sun", sunRadius * 1.5);
    this.group.add(sunLabel);

    PLANET_DATA.forEach((planet) => {
      const a = planet.distance * AU_SCENE * ratio;
      const e = planet.eccentricity;
      const b = a * Math.sqrt(1 - e * e);
      const focusOffset = a * e;

      const curve = new THREE.EllipseCurve(
        -focusOffset,
        0,
        a,
        b,
        0,
        2 * Math.PI,
        false,
        0
      );

      const points = curve.getPoints(128);
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      orbitGeo.rotateX(Math.PI / 2);

      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x4444ff,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      this.group.add(orbitLine);

      const angleRad = THREE.MathUtils.degToRad(planet.angle);

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
          roughness: 0.9,
          metalness: 0.0,
        });
        const mesh = new THREE.Mesh(SolarSystem.sphereGeo, mat);

        mesh.layers.set(ENTIRE_SCENE);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.name = planet.name;
        mesh.scale.setScalar(planetSize);
        mesh.position.set(posX, 0, posZ);
        this.group.add(mesh);
      }

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
