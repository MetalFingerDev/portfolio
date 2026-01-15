import * as THREE from "three";
import { type CelestialBody } from "./Region";

export class Shell extends THREE.Group implements CelestialBody {
  public interior: THREE.Mesh;
  public middle: THREE.Mesh;
  public exterior: THREE.Mesh;

  constructor(innerRadius: number) {
    super();
    this.name = "Shells";

    // Common "Glow" Material settings
    const baseMat = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.15,
      side: THREE.DoubleSide, // Visible from inside
      depthWrite: false, // Important for nested transparent objects
      blending: THREE.AdditiveBlending, // Makes it look like light/energy
      wireframe: false, // Set to true if you want a grid look instead
    });

    // 1. Interior Shell (Blue) - Just past Neptune
    const innerGeo = new THREE.SphereGeometry(innerRadius, 64, 32);
    this.interior = new THREE.Mesh(innerGeo, baseMat.clone());
    (this.interior.material as THREE.MeshBasicMaterial).color.setHex(0x00ffff); // Cyan
    this.add(this.interior);

    // 2. Middle Shell (Purple) - 10x larger
    const midGeo = new THREE.SphereGeometry(innerRadius * 10, 64, 32);
    this.middle = new THREE.Mesh(midGeo, baseMat.clone());
    (this.middle.material as THREE.MeshBasicMaterial).color.setHex(0xff00ff); // Magenta
    (this.middle.material as THREE.MeshBasicMaterial).opacity = 0.1; // Fainter
    this.add(this.middle);

    // 3. Exterior Shell (Yellow) - 100x larger (Power of 10)
    const extGeo = new THREE.SphereGeometry(innerRadius * 100, 64, 32);
    this.exterior = new THREE.Mesh(extGeo, baseMat.clone());
    (this.exterior.material as THREE.MeshBasicMaterial).color.setHex(0xffff00); // Yellow
    (this.exterior.material as THREE.MeshBasicMaterial).opacity = 0.05; // Very faint
    this.add(this.exterior);
  }

  setDetail(_isHighDetail: boolean): void {}

  update(delta: number): void {
    // Rotate shells slowly in opposite directions for a "sci-fi" effect
    this.interior.rotation.y += 0.02 * delta;
    this.middle.rotation.y -= 0.005 * delta;
    this.exterior.rotation.y += 0.001 * delta;
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);
    // Geometries/Materials will be cleaned up by the Region's destroy logic
    // provided this object is added to the scene graph.
  }
}
