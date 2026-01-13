import * as THREE from "three";
import { getModel } from "./utils";
import { qualityThresholdMultiplier, onQualityChange } from "./quality";

export type LODSpec = {
  path?: string; // optional GLTF path
  mesh?: THREE.Object3D; // optional pre-built mesh
  thresholdPx: number; // pixel size threshold to use this LOD
  preload?: boolean; // whether to preload this level
};

export default class LODHelper extends THREE.Group {
  private specs: LODSpec[];
  private currentIndex = -1;
  private lastCheck = 0;
  private throttleMs = 200;
  private radius: number; // approximate radius in world units
  private camera?: THREE.PerspectiveCamera;

  constructor(specs: LODSpec[], radius = 1) {
    super();
    // sort high->low thresholds
    this.specs = specs.slice().sort((a, b) => b.thresholdPx - a.thresholdPx);
    this.radius = radius;

    // optional preload
    this.specs.forEach((s) => {
      if (s.preload && s.path) {
        // start load but don't add yet
        getModel(s.path).catch(() => {});
      }
    });

    // auto-subscribe to global quality changes so LOD updates immediately when quality toggles
    this.subscribeToQuality();
  }

  public setCamera(cam: THREE.PerspectiveCamera) {
    this.camera = cam;
    // pick level immediately when a camera is set
    this.update(performance.now());
  }

  // React to quality changes so the LOD picks can update immediately
  private qualityUnsub?: () => void;
  public subscribeToQuality() {
    this.qualityUnsub = onQualityChange(() => {
      // schedule an immediate update
      this.update(performance.now());
    });
  }

  public unsubscribeQuality() {
    if (this.qualityUnsub) this.qualityUnsub();
    this.qualityUnsub = undefined;
  }

  public async update(now = performance.now()) {
    if (!this.camera) return;
    if (now - this.lastCheck < this.throttleMs) return;
    this.lastCheck = now;

    const worldPos = new THREE.Vector3();
    this.getWorldPosition(worldPos);

    const distance = this.camera.position.distanceTo(worldPos);
    if (distance === 0) return;

    // project approximate pixel size from radius
    const height = window.innerHeight;
    const fov = (this.camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const projScale = height / 2 / Math.tan(fov / 2);
    const pixelSize = (this.radius / distance) * projScale;

    // Apply global quality multiplier to thresholds (higher multiplier → fewer high-detail selections)
    const mult = qualityThresholdMultiplier();

    let chosen = -1;
    for (let i = 0; i < this.specs.length; i++) {
      if (pixelSize >= this.specs[i].thresholdPx * mult) {
        chosen = i;
        break;
      }
    }

    if (chosen === -1) chosen = this.specs.length - 1; // fallback to lowest LOD

    if (chosen !== this.currentIndex) {
      await this.setLevel(chosen);
    }
  }

  private async setLevel(index: number) {
    this.clear();
    this.currentIndex = index;

    const spec = this.specs[index];
    if (!spec) return;

    if (spec.mesh) {
      this.add(spec.mesh.clone());
      return;
    }
    if (spec.path) {
      try {
        const model = await getModel(spec.path);
        this.add(model.clone());
      } catch (e) {
        // fallback: nothing
      }
    }
  }

  public destroy() {
    this.unsubscribeQuality();
    this.clear();
  }
}
