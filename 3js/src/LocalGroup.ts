import * as THREE from "three";
import type {
  data,
  IRegion,
  ICelestialBody,
  GALAXY_DATA as _GALAXY,
} from "./config";
import { GALAXY_DATA } from "./config";
import { lyToScene } from "./conversions";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";

export class LocalGroup implements IRegion {
  public cfg: data;
  public group: THREE.Group = new THREE.Group();
  public bodies: ICelestialBody[] = [];

  constructor(cfg: data) {
    this.cfg = cfg;
    this.initializeLocalGroup();
  }

  private initializeLocalGroup(): void {
    GALAXY_DATA.forEach((galaxy) => {
      const galaxyMesh = this.createGalaxyDisc(galaxy);

      // Calculate scaled position
      const scaleX = lyToScene(galaxy.coords.x) / (this.cfg.Ratio || 1);
      const scaleY = lyToScene(galaxy.coords.y) / (this.cfg.Ratio || 1);
      const scaleZ = lyToScene(galaxy.coords.z) / (this.cfg.Ratio || 1);

      // Apply Offset specifically to the Milky Way placeholder if needed
      const offsetX = galaxy.name === "Milky Way" ? this.cfg.Offset || 0 : 0;

      galaxyMesh.position.set(scaleX + offsetX, scaleY, scaleZ);

      // Add Label
      const labelDiv = document.createElement("div");
      labelDiv.className = "galaxy-label";
      labelDiv.textContent = galaxy.name;
      labelDiv.style.color = "white";
      labelDiv.style.fontSize = "12px";
      labelDiv.style.fontFamily = "sans-serif";
      labelDiv.style.padding = "2px 5px";
      labelDiv.style.background = "rgba(0,0,0,0.5)";

      const label = new CSS2DObject(labelDiv);
      label.position.set(0, lyToScene(galaxy.size / 2) / this.cfg.Ratio, 0);
      galaxyMesh.add(label);

      this.group.add(galaxyMesh);
    });
  }

  private createGalaxyDisc(data: any): THREE.Mesh {
    const radius = lyToScene(data.size / 2) / this.cfg.Ratio;
    const thickness = radius * 0.05;

    const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    geometry.rotateX(Math.PI / 2);

    const material = new THREE.MeshBasicMaterial({
      color: data.color,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = data.name;
    return mesh;
  }

  public update(delta: number): void {
    this.group.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.rotation.z += delta * 0.02;
      }
    });
  }

  destroy(): void {
    this.bodies.forEach((b) => {
      try {
        b.destroy();
      } catch (e) {}
    });

    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
  }

  setDetail(_isHighDetail: boolean): void {
    // LocalGroup currently doesn't support LOD switching — noop
  }

  public setCamera(camera: THREE.PerspectiveCamera): void {
    this.group.userData.camera = camera;
  }
}
