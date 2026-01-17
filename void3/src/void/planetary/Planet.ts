import * as THREE from "three";
import { type CelestialBody } from "../regions/Region";

/**
 * Planet with Level of Detail (LOD)
 * Switches between Point geometry (low detail) and Icosahedron geometry (high detail)
 */
export class Planet extends THREE.Group implements CelestialBody {
  private mesh?: THREE.Mesh;
  private point: THREE.Points;
  private lod: THREE.LOD;
  private highPlaceholder: THREE.Group | null = null;
  private orbitAngle: number = Math.random() * Math.PI * 2; // Random start position

  private config: {
    name: string;
    color: number;
    size: number;
    orbitRadius: number;
    orbitSpeed: number;
  };

  constructor(
    name: string = "Unnamed",
    color: number = 0xffffff,
    size: number = 1,
    orbitRadius?: number,
    orbitSpeed?: number
  ) {
    super();
    this.name = name || "Planet";

    // Hardcoded default orbital values if none are provided
    this.config = {
      name,
      color,
      size,
      orbitRadius: orbitRadius ?? 8 + Math.random() * 20, // Use provided orbitRadius if given; default closer to star
      orbitSpeed: orbitSpeed ?? 0.2 + Math.random() * 0.5, // Use provided orbitSpeed if given
    };

    // LOD instance to manage levels
    this.lod = new THREE.LOD();
    this.add(this.lod);

    // 1. Low Detail: Point Geometry
    // We use a single point at the origin of the group
    const pointGeom = new THREE.BufferGeometry();
    pointGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([0, 0, 0], 3)
    );

    const pointMat = new THREE.PointsMaterial({
      color: color,
      size: 1.5, // Slightly larger so low-detail points are visible
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
    });

    this.point = new THREE.Points(pointGeom, pointMat);
    this.point.name = `${this.name}-point`;

    // Register low-detail level; use a reasonable distance threshold based on size
    const lowDetailDistance = Math.max(50, size * 30);
    this.lod.addLevel(this.point, lowDetailDistance);

    // Register a high-detail placeholder (distance 0) so we can lazily create
    // the real high-detail mesh only when it's needed.
    this.highPlaceholder = new THREE.Group();
    this.highPlaceholder.name = `${this.name}-high-placeholder`;
    this.lod.addLevel(this.highPlaceholder, 0);

    // Position the planet at its initial orbit placement using configured radius
    const x = Math.cos(this.orbitAngle) * this.config.orbitRadius;
    const z = Math.sin(this.orbitAngle) * this.config.orbitRadius;
    this.position.set(x, 0, z);

    // Ensure high-detail mesh is available on demand, but do not force creation
    // at construction time (let LOD or callers request it via `setDetail(true)`).
  }

  // Removed setDetail: LOD manages visual detail. High-detail assets are created
  // lazily when the LOD's high-detail slot becomes visible (see update()).

  /**
   * Lazily creates the high-detail Icosahedron geometry
   */
  private ensureHighDetailAssets(): void {
    if (this.mesh) return;

    const { color, size } = this.config;

    const geometry = new THREE.IcosahedronGeometry(1, 6);
    // 1. Change to MeshStandardMaterial to react to lights and cast/receive shadows
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.35, // make surfaces a bit shinier so they reflect the star
      metalness: 0.2,
      flatShading: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.scale.setScalar(size);
    this.mesh.name = `${this.name}-mesh`;

    // 2. Enable casting and receiving
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Register the high-detail level at distance 0 (closest)
    this.lod.addLevel(this.mesh, 0);

    // Remove placeholder if it exists
    if (this.highPlaceholder) {
      try {
        this.lod.remove(this.highPlaceholder);
      } catch (e) {}
      this.highPlaceholder = null;
    }
  }

  update(delta: number): void {
    // If the high-detail placeholder is visible, create the real assets lazily
    if (this.highPlaceholder && this.highPlaceholder.visible && !this.mesh) {
      this.ensureHighDetailAssets();
    }

    // 1. Self-Rotation (Day/Night cycle)
    if (this.mesh && this.mesh.visible) {
      this.mesh.rotation.y += 0.5 * delta;
    }

    // 2. AUTOMATIC ORBIT LOGIC
    // Look for a "Star" sibling in the same parent group
    if (this.parent) {
      const sun = this.parent.children.find(
        (child: any) => (child as any).isStar
      );

      if (sun) {
        // Update the angle based on speed
        this.orbitAngle += this.config.orbitSpeed * delta;

        // Calculate circular position relative to the Star
        const x = Math.cos(this.orbitAngle) * this.config.orbitRadius;
        const z = Math.sin(this.orbitAngle) * this.config.orbitRadius;

        // Apply position (Relative to parent, which the Star also shares)
        this.position.set(
          sun.position.x + x,
          sun.position.y,
          sun.position.z + z
        );
      }
    }
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);

    // Dispose Point assets
    this.point.geometry.dispose();
    (this.point.material as THREE.Material).dispose();

    // Dispose Mesh assets if they were created
    if (this.mesh) {
      this.mesh.geometry.dispose();
      (this.mesh.material as THREE.Material).dispose();
    }
  }
}
