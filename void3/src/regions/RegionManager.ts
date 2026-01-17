import * as THREE from "three";
import { Region } from "./Region";

/**
 * Handles LOD transitions and the "Hyperspace" coordinate shifts.
 */
export class RegionManager {
  private regions = new Set<Region>();
  public activeRegion: Region | null = null;

  // Configuration
  public hysteresis = 1.1;
  public log = true;

  public register(region: Region): void {
    this.regions.add(region);
  }

  public unregister(region: Region): void {
    this.regions.delete(region);
    if (this.activeRegion === region) this.activeRegion = null;
  }

  /**
   * Evaluates camera position and updates LOD/Animations.
   */
  public update(camera: THREE.Camera, delta: number): void {
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);

    let bestCandidate: Region | null = null;

    for (const region of this.regions) {
      const regionPos = new THREE.Vector3();
      region.getWorldPosition(regionPos);
      const dist = regionPos.distanceTo(camPos);

      const isCurrentlyActive = region === this.activeRegion;
      // Use the Region's specific shells: exitRadius if currently active, otherwise entryRadius
      const effectiveThreshold = isCurrentlyActive
        ? region.exitRadius
        : region.entryRadius;

      // Nested Logic: choose the region with the smallest entryRadius that contains the camera
      if (dist < effectiveThreshold) {
        if (!bestCandidate || region.entryRadius < bestCandidate.entryRadius) {
          bestCandidate = region;
        }
      }
    }

    // 4. Handle Transitions (we keep enter/exit events for semantic purposes,
    // but we no longer toggle details here — Three.js LOD will manage geometry levels)
    if (bestCandidate !== this.activeRegion) {
      this.transitionTo(bestCandidate);
    }

    // 5. Update all regions (animations, orbits, etc.) and let any THREE.LOD instances
    // inside each region decide which level to show based on camera distance.
    for (const region of this.regions) {
      region.update(delta);
      region.traverse((obj) => {
        if (obj instanceof THREE.LOD) {
          // Let the LOD instance pick the correct level for this camera
          obj.update(camera);
        }
      });
    }
  }

  private transitionTo(next: Region | null): void {
    if (this.activeRegion) {
      // We no longer toggle detail states here; LOD handles visual detail.
      this.activeRegion.dispatchEvent({ type: "exit" } as any);
      if (this.log)
        console.info(`[RegionManager] Exiting: ${this.activeRegion.name}`);
    }

    if (next) {
      next.dispatchEvent({ type: "enter" } as any);
      if (this.log)
        console.info(
          `[RegionManager] Entering: ${next.name} (entryRadius=${next.entryRadius}, exitRadius=${next.exitRadius})`
        );
    }

    this.activeRegion = next;
  }
}
