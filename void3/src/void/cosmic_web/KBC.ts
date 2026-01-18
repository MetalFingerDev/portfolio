import * as THREE from 'three';
import { Region } from '@/void/regions';

// Helper to track spheres for collision detection
interface SphereDef {
  position: THREE.Vector3;
  radius: number;
}

export class KBC extends Region {
  private structureGroup: THREE.Group = new THREE.Group();

  // Data arrays for InstancedMeshes
  // Tier 1: The Outer "Cover" Spheres
  private tier1Spheres: SphereDef[] = [];
  // Tier 2: The 10 Spheres inside Tier 1
  private tier2Spheres: SphereDef[] = [];
  // Tier 3: The 5 Spheres inside the largest Tier 2
  private tier3Spheres: SphereDef[] = [];

  constructor() {
    super({
      name: 'KBC Void Nested Structure',
      radius: 1000000,
      entry: 1000000,
      exit: 1200000,
      debugShells: false,
    });
    this.add(this.structureGroup);
  }

  public async build(onProgress?: (msg: string) => void): Promise<void> {
    if (onProgress) onProgress('Calculating Nested Hierarchy...');

    // Reset arrays
    this.tier1Spheres = [];
    this.tier2Spheres = [];
    this.tier3Spheres = [];

    await new Promise((r) => setTimeout(r, 10));

    // 1. Calculate all positions logically first
    this.calculateHierarchy();

    // 2. Render the results using InstancedMesh
    this.renderHierarchy();

    if (onProgress) onProgress('Structure Rendered.');
  }

  private calculateHierarchy(): void {
    // --- STEP 1: Generate Outer "Cover" Spheres (Reduced Count) ---
    // We try to place 40 systems.
    const rootCount = 40;

    for (let i = 0; i < rootCount; i++) {
      // Try to find a valid spot in the Void
      const root = this.findValidPosition({
        containerPos: new THREE.Vector3(0, 0, 0),
        containerRadius: this.radius,
        minSize: 80000,
        maxSize: 150000,
        siblings: this.tier1Spheres, // Check against other roots
        maxAttempts: 100,
      });

      if (root) {
        this.tier1Spheres.push(root);

        // --- STEP 2: Generate 10 Spheres INSIDE this Root ---
        const children: SphereDef[] = [];
        const childCount = 10;

        for (let j = 0; j < childCount; j++) {
          const child = this.findValidPosition({
            containerPos: root.position,
            containerRadius: root.radius, // Must stay inside root
            minSize: root.radius * 0.1, // Relative size
            maxSize: root.radius * 0.25,
            siblings: children, // Check against current siblings
            maxAttempts: 50,
          });

          if (child) {
            children.push(child);
            this.tier2Spheres.push(child);
          }
        }

        // --- STEP 3: The "Final Sphere" (Largest Child) gets 5 Sub-spheres ---
        if (children.length > 0) {
          // Find the largest child to be the container
          children.sort((a, b) => b.radius - a.radius);
          const finalSphere = children[0]; // The biggest one

          const grandChildren: SphereDef[] = [];
          const grandChildCount = 5;

          for (let k = 0; k < grandChildCount; k++) {
            const grandChild = this.findValidPosition({
              containerPos: finalSphere.position,
              containerRadius: finalSphere.radius,
              minSize: finalSphere.radius * 0.15,
              maxSize: finalSphere.radius * 0.3,
              siblings: grandChildren,
              maxAttempts: 50,
            });

            if (grandChild) {
              grandChildren.push(grandChild);
              this.tier3Spheres.push(grandChild);
            }
          }
        }
      }
    }
  }

  /**
   * Generic function to find a non-intersecting position inside a container
   */
  private findValidPosition(params: {
    containerPos: THREE.Vector3;
    containerRadius: number;
    minSize: number;
    maxSize: number;
    siblings: SphereDef[];
    maxAttempts: number;
  }): SphereDef | null {
    const { containerPos, containerRadius, minSize, maxSize, siblings, maxAttempts } = params;
    const tempPos = new THREE.Vector3();

    for (let i = 0; i < maxAttempts; i++) {
      // 1. Generate Random Radius
      const r = minSize + Math.random() * (maxSize - minSize);

      // 2. Generate Random Position inside Container
      // We limit the spawn radius to (containerRadius - r) to ensure it stays fully inside
      const spawnRadius = containerRadius - r;
      if (spawnRadius <= 0) continue; // Item too big for container

      const randR = Math.pow(Math.random(), 1 / 3) * spawnRadius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      tempPos.set(
        randR * Math.sin(phi) * Math.cos(theta),
        randR * Math.sin(phi) * Math.sin(theta),
        randR * Math.cos(phi)
      );

      // Offset by container world position
      tempPos.add(containerPos);

      // 3. Collision Check (Dart Throwing)
      let collision = false;

      // Check against siblings (separation)
      for (const sibling of siblings) {
        const distSq = tempPos.distanceToSquared(sibling.position);
        const minGap = r + sibling.radius;
        if (distSq < minGap * minGap) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        return { position: tempPos.clone(), radius: r };
      }
    }

    return null; // Failed to find spot
  }

  private renderHierarchy(): void {
    const geometry = new THREE.SphereGeometry(1, 16, 12);
    const dummy = new THREE.Object3D();

    // --- Render Tier 1 (Outer Shells) ---
    // Faint, large, enveloping
    if (this.tier1Spheres.length > 0) {
      const mat1 = new THREE.MeshBasicMaterial({
        color: 0x3366ff,
        opacity: 0.1,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh1 = new THREE.InstancedMesh(geometry, mat1, this.tier1Spheres.length);

      this.tier1Spheres.forEach((sphere, i) => {
        dummy.position.copy(sphere.position);
        dummy.scale.setScalar(sphere.radius);
        dummy.updateMatrix();
        mesh1.setMatrixAt(i, dummy.matrix);
      });
      mesh1.instanceMatrix.needsUpdate = true;
      this.structureGroup.add(mesh1);
    }

    // --- Render Tier 2 (Inner Spheres) ---
    // Brighter, distinct
    if (this.tier2Spheres.length > 0) {
      const mat2 = new THREE.MeshBasicMaterial({
        color: 0x5599ff,
        opacity: 0.4,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh2 = new THREE.InstancedMesh(geometry, mat2, this.tier2Spheres.length);

      this.tier2Spheres.forEach((sphere, i) => {
        dummy.position.copy(sphere.position);
        dummy.scale.setScalar(sphere.radius);
        dummy.updateMatrix();
        mesh2.setMatrixAt(i, dummy.matrix);
      });
      mesh2.instanceMatrix.needsUpdate = true;
      this.structureGroup.add(mesh2);
    }

    // --- Render Tier 3 (Core Spheres) ---
    // Bright white/hot cores
    if (this.tier3Spheres.length > 0) {
      const mat3 = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh3 = new THREE.InstancedMesh(geometry, mat3, this.tier3Spheres.length);

      this.tier3Spheres.forEach((sphere, i) => {
        dummy.position.copy(sphere.position);
        dummy.scale.setScalar(sphere.radius);
        dummy.updateMatrix();
        mesh3.setMatrixAt(i, dummy.matrix);
      });
      mesh3.instanceMatrix.needsUpdate = true;
      this.structureGroup.add(mesh3);
    }
  }
}
