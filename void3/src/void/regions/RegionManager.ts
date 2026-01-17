import * as THREE from "three";
import { Region } from "./Region";

/**
 * Handles LOD transitions and the "Hyperspace" coordinate shifts.
 */
export class RegionManager {
  private regions = new Set<Region>();
  public activeRegion: Region | null = null;

  // Configuration
  public log = true;

  // Simple transition listeners (avoid depending on THREE.EventDispatcher typing)
  private _transitionListeners: Set<
    (ev: { previous: Region | null; next: Region | null }) => void
  > = new Set();

  public register(region: Region): void {
    this.regions.add(region);
  }

  public unregister(region: Region): void {
    this.regions.delete(region);
    if (this.activeRegion === region) this.activeRegion = null;
  }

  /**
   * Returns a snapshot array of all registered regions. Useful for consumers
   * (like the Ship) that need to inspect shells/radii.
   */
  public getRegions(): Region[] {
    return Array.from(this.regions);
  }

  // Simple subscribe/unsubscribe helpers for the 'transition' event.
  public onTransition(
    listener: (ev: { previous: Region | null; next: Region | null }) => void
  ) {
    this._transitionListeners.add(listener);
  }

  public offTransition(
    listener: (ev: { previous: Region | null; next: Region | null }) => void
  ) {
    this._transitionListeners.delete(listener);
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
    const previous = this.activeRegion;

    if (previous) {
      // We no longer toggle detail states here; LOD handles visual detail.
      previous.dispatchEvent({ type: "exit" } as any);
      if (this.log) console.info(`[RegionManager] Exiting: ${previous.name}`);
    }

    if (next) {
      next.dispatchEvent({ type: "enter" } as any);
      if (this.log)
        console.info(
          `[RegionManager] Entering: ${next.name} (entryRadius=${next.entryRadius}, exitRadius=${next.exitRadius})`
        );
    }

    // Notify external listeners about the transition (previous may be null)
    for (const l of this._transitionListeners) {
      try {
        l({ previous, next });
      } catch (e) {
        // swallow listener errors to avoid breaking manager
      }
    }

    this.activeRegion = next;
  }
}

// Export a singleton instance for app-wide use
export const regionManager = new RegionManager();
