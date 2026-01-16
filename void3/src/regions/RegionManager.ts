import * as THREE from "three";

/**
 * RegionManager selects a single "active" region (smallest containing region)
 * and sets only that region to high detail. It also calls `update(delta)` on
 * all registered regions to keep animations ticking.
 */
export class RegionManager {
  private regions = new Set<any>();
  private current: any | null = null;
  public hysteresis = 1.1;

  // Enable console logs for LOD events and debugging
  public log: boolean = true; // brief info-level logs (enter/exit)
  public verbose: boolean = false; // frame-level debug logs

  register(region: any) {
    this.regions.add(region);
  }

  unregister(region: any) {
    this.regions.delete(region);
    if (this.current === region) this.current = null;
  }

  update(camera: THREE.Camera | undefined, delta: number) {
    if (!camera) return;

    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);

    let candidate: any | null = null;

    for (const r of this.regions) {
      const hyster = r === this.current ? this.hysteresis : 1.0;

      // Precompute positions and distances for logging and fallback
      const pos = new THREE.Vector3();
      r.getWorldPosition(pos);
      const dsq = pos.distanceToSquared(camPos);
      const thresholdSq = r.radius * r.radius * hyster * hyster;

      if (this.verbose) {
        const dist = Math.sqrt(dsq);
        const threshold = Math.sqrt(thresholdSq);
        console.debug(
          `[RegionManager] consider ${r.name || "(anon)"} dist=${dist.toFixed(
            1
          )} threshold=${threshold.toFixed(1)} radius=${r.radius}`
        );
      }

      let inside = false;
      if (typeof r.isCameraInside === "function") {
        inside = r.isCameraInside(camera, hyster);
      } else {
        inside = dsq < thresholdSq;
      }

      if (inside) {
        if (!candidate || r.radius < candidate.radius) candidate = r;
      }
    }

    if (candidate !== this.current) {
      if (this.current) {
        try {
          this.current.setDetail(false);
          if (this.log)
            console.info(
              `[RegionManager] setDetail OFF -> ${
                this.current.name || "(anon)"
              } (radius=${this.current.radius})`
            );
        } catch {}
        this.current.dispatchEvent?.({ type: "exit" });
      }
      if (candidate) {
        try {
          candidate.setDetail(true);
          if (this.log)
            console.info(
              `[RegionManager] setDetail ON  -> ${
                candidate.name || "(anon)"
              } (radius=${candidate.radius})`
            );
        } catch {}
        candidate.dispatchEvent?.({ type: "enter" });
      }
      if (this.log)
        console.info(
          `[RegionManager] active region -> ${candidate?.name || "none"}`
        );
      this.current = candidate;
    }

    // Call update on all regions (safe-guard per region)
    for (const r of this.regions) {
      try {
        if (typeof r.update === "function") r.update(delta);
      } catch (err) {
        console.error("Region update error", err);
      }
    }
  }
}

export const regionManager = new RegionManager();
