import * as THREE from "three";
import SystemManager from "../systems";
import type { System } from "../systems";

// Minimal, self-contained systems that act as "regions" for the SystemManager
// Each system exposes a `group: THREE.Group` and implements `init`/`update`/`destroy`.

class SolarSystem implements System {
  public group = new THREE.Group();
  private sun?: THREE.Mesh;
  constructor(_manager: SystemManager, _config?: any) {
    this.group.name = "solar-system";
  }

  init(_params?: any) {
    const geo = new THREE.SphereGeometry(1, 24, 24);
    const mat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
    this.sun = new THREE.Mesh(geo, mat);
    this.sun.name = "Sun";
    this.group.add(this.sun);

    // simple orbit marker for a planet
    const planetGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const planetMat = new THREE.MeshBasicMaterial({ color: 0x33aaff });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planet.position.set(3, 0, 0);
    planet.name = "Planet";
    this.group.add(planet);
  }

  update(delta: number) {
    if (this.sun) this.sun.rotation.y += 0.2 * delta;
    // rotate planets (all children except the sun)
    this.group.children.forEach((c) => {
      if (c.name !== "Sun") c.rotateY(0.5 * delta);
    });
  }

  destroy() {
    this.group.clear();
  }
}

class InterstellarSpace implements System {
  public group = new THREE.Group();
  private points?: THREE.Points;

  constructor(_manager: SystemManager, _config?: any) {
    this.group.name = "interstellar-space";
  }

  init(_params?: any) {
    // simple starfield using Points
    const count = 500;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 });
    this.points = new THREE.Points(geom, mat);
    this.points.name = "starfield";
    this.group.add(this.points);
  }

  update(_delta: number) {
    if (this.points) this.points.rotation.y += 0.01;
  }

  destroy() {
    this.group.clear();
  }
}

export function registerer(manager: SystemManager) {
  manager.register("solar-system", SolarSystem as any);
  manager.register("interstellar-space", InterstellarSpace as any);
}

export default registerer;
