import * as THREE from "three";
import { Region } from "./Region";
import { RegionManager } from "./RegionManager";
import { Star } from "../stellar";
import { Planet } from "../planetary";

const regionManager = new RegionManager();

export class SolarSystem extends Region {
  public sun: Star;
  public planets: Record<string, Planet> = {};
  constructor(cfg?: any) {
    super({ ...cfg, radius: 2000 });

    this.name = "solar-system";
    regionManager.register(this);

    // --- SUN ---
    this.sun = new Star(5000, 5, 0xfff3ef);
    this.sun.name = "Sun";
    this.add(this.sun);
    this.bodies.push(this.sun);

    // --- PLANETS CONFIGURATION ---
    const planetData = [
      { name: "Mercury", color: 0xaaaaaa, scale: 0.8 },
      { name: "Venus", color: 0xe3bb76, scale: 1.2 },
      { name: "Earth", color: 0x2233ff, scale: 1.3 },
      { name: "Mars", color: 0xff3300, scale: 1.0 },
      { name: "Jupiter", color: 0xd8ca9d, scale: 3.5 },
      { name: "Saturn", color: 0xead6b8, scale: 3.0 },
      { name: "Uranus", color: 0xbbe1e4, scale: 2.2 },
      { name: "Neptune", color: 0x6081ff, scale: 2.1 },
    ];

    let currentDist = 8;

    planetData.forEach((data) => {
      const p = new Planet(data.name, data.color, data.scale, currentDist);

      this.add(p);
      this.bodies.push(p);
      this.planets[data.name.toLowerCase()] = p;

      currentDist += 10 + data.scale * 1.2;
    });

    // --- SYSTEM SHELL ---
    // Add a large, inward-facing shell so the interior appears rebeccapurple
    const shellRadius = cfg?.shellRadius ?? 800; // configurable via constructor cfg
    const shellGeom = new THREE.SphereGeometry(shellRadius, 64, 32);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x663399, // rebeccapurple
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      opacity: 0.98,
    });
    const shell = new THREE.Mesh(shellGeom, shellMat);
    shell.name = "solar-shell";
    this.add(shell);
    // store reference for later tweaks
    (this as any).shell = shell;
  }

  // Ensure we unregister when the solar system is destroyed
  public destroy(): void {
    try {
      regionManager.unregister(this);
    } catch (e) {}
    super.destroy();
  }

  public get mercury() {
    return this.planets["mercury"];
  }
  public get venus() {
    return this.planets["venus"];
  }
  public get earth() {
    return this.planets["earth"];
  }
  public get mars() {
    return this.planets["mars"];
  }
  public get jupiter() {
    return this.planets["jupiter"];
  }
  public get saturn() {
    return this.planets["saturn"];
  }
  public get uranus() {
    return this.planets["uranus"];
  }
  public get neptune() {
    return this.planets["neptune"];
  }
}
