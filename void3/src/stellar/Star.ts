import * as THREE from "three";
import { type CelestialBody } from "../regions/Region";

/**
 * Simple Star with a visible Mesh and an optional Light
 */
export class Star extends THREE.Group implements CelestialBody {
  public light?: THREE.PointLight;
  public mesh: THREE.Mesh;

  /**
   * @param intensity Light intensity (only used if hasLight is true)
   * @param radius Visual scale
   * @param color Color hex
   * @param hasLight Whether to create a THREE.PointLight for this star (default: true)
   */
  constructor(
    intensity: number = 1,
    radius: number = 1,
    color: number = 0xffffff,
    hasLight: boolean = true
  ) {
    super();
    this.name = "Star";

    const geometry = new THREE.SphereGeometry(1, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);

    // Only add a costly PointLight when explicitly requested (e.g., the Sun).
    if (hasLight) {
      this.light = new THREE.PointLight(color, intensity, 0);
      this.add(this.light);
    }

    // Create a single-point Points fallback that appears as a small white dot
    // on screen (constant pixel size) so stars remain visible from far away
    // without increasing size with distance.
    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );
    const pointMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2, // pixels
      sizeAttenuation: false, // keep constant screen size regardless of distance
      depthTest: true,
      transparent: true,
      opacity: 1,
    });
    const point = new THREE.Points(pointGeom, pointMat);
    point.name = "star-point";
    // Start hidden for high-detail default
    point.visible = false;
    this.add(point);

    this.scale.setScalar(radius);
  }

  // Toggle between a high-detail mesh (close-up) and a constant-size Point (far-away)
  public setDetail(isHighDetail: boolean): void {
    // If high detail: show mesh (and light if present), hide point
    // If low detail: show point, hide mesh/light
    const point = this.getObjectByName("star-point") as
      | THREE.Points
      | undefined;

    // Mesh is the visual sphere we created earlier
    if (this.mesh) this.mesh.visible = !!isHighDetail;

    if (this.light) this.light.visible = !!isHighDetail;

    if (point) point.visible = !isHighDetail;
  }

  update(_delta: number): void {}

  destroy(): void {
    // remove self from parent
    if (this.parent) this.parent.remove(this);

    // dispose geometry/materials
    this.traverse((child: any) => {
      if (child.geometry && typeof child.geometry.dispose === "function") {
        try {
          child.geometry.dispose();
        } catch (e) {}
      }
      if (child.material) {
        try {
          if (Array.isArray(child.material))
            child.material.forEach((m: any) => m.dispose());
          else child.material.dispose();
        } catch (e) {}
      }
    });
  }
}
