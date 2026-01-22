import * as THREE from "three";
import { Region } from "./Region";

/**
 * Handles LOD transitions and the "Hyperspace" coordinate shifts.
 */
export class RegionManager {
  private regions = new Set<Region>();
  public activeRegion: Region | null = null;

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
    listener: (ev: { previous: Region | null; next: Region | null }) => void,
  ) {
    this._transitionListeners.add(listener);
  }

  public offTransition(
    listener: (ev: { previous: Region | null; next: Region | null }) => void,
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
    const tempPos = new THREE.Vector3();

    for (const region of this.regions) {
      // Optimization: Check distance using world position
      region.getWorldPosition(tempPos);
      const dist = tempPos.distanceTo(camPos);

      const isCurrentlyActive = region === this.activeRegion;
      const effectiveThreshold = isCurrentlyActive ? region.exit : region.entry;

      if (dist < effectiveThreshold) {
        if (!bestCandidate || region.entry < bestCandidate.entry) {
          bestCandidate = region;
        }
      }
    }

    if (bestCandidate !== this.activeRegion) {
      this.transitionTo(bestCandidate);
    }

    // Update all regions
    for (const region of this.regions) {
      region.update(delta); // Now works because of the change in CelestialBody

      // Only update LOD for visible regions to save performance
      if (region === this.activeRegion || region.visible) {
        region.traverse((obj) => {
          if (obj instanceof THREE.LOD) {
            obj.update(camera);
          }
        });
      }
    }
  }

  private transitionTo(next: Region | null): void {
    const previous = this.activeRegion;

    if (previous) {
      // We no longer toggle detail states here; LOD handles visual detail.
      previous.dispatchEvent({ type: "exit" } as any);
    }

    if (next) {
      next.dispatchEvent({ type: "enter" } as any);
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
