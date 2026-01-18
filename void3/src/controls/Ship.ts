import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { regionManager } from "../void/regions/RegionManager";
import { Region } from "../void/regions/Region";
import Overlay from "../ui/overlay";

export default class Ship {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  private width: number;
  private height: number;

  // Region-aware behavior
  public regionAware: boolean = true;
  public focusOnEntry: boolean = false; // auto-focus when entering a region
  public focusOnExit: boolean = false; // auto-focus when exiting a region
  public notifyOnTransition: boolean = false; // show HUD notifications on enter/exit
  public smoothingEnabled: boolean = true;
  public smoothingDurationMs: number = 1000;

  private _defaultFar: number;
  private _regionTransitionHandler?: (ev: any) => void;

  private overlay?: Overlay;
  private _ownsOverlay: boolean = false;

  // Smooth camera transition state
  private _lerpActive: boolean = false;
  private _lerpStartTime: number = 0;
  private _lerpDuration: number = 0;
  private _lerpStartCam: THREE.Vector3 = new THREE.Vector3();
  private _lerpEndCam: THREE.Vector3 = new THREE.Vector3();
  private _lerpStartTarget: THREE.Vector3 = new THREE.Vector3();
  private _lerpEndTarget: THREE.Vector3 = new THREE.Vector3();
  private _lastFarCheckPos: THREE.Vector3 = new THREE.Vector3();

  constructor(
    domElement: HTMLCanvasElement,
    initialTarget?: THREE.Vector3,
    opts?: {
      regionAware?: boolean;
      overlay?: Overlay;
      focusOnEntry?: boolean;
      focusOnExit?: boolean;
      notifyOnTransition?: boolean;
      smoothingEnabled?: boolean;
      smoothingDurationMs?: number;
    },
  ) {
    this.width = domElement.width || window.innerWidth;
    this.height = domElement.height || window.innerHeight;

    const desiredFar = 1e9;
    this._defaultFar = desiredFar;
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      desiredFar,
    );
    this.camera.position.set(0, 0, 50);
    this.camera.name = "ship-camera";

    this.controls = new OrbitControls(this.camera, domElement);
    if (initialTarget) this.controls.target.copy(initialTarget);
    this.controls.update();

    // Initialize last far-check position so we don't run adjustCameraFar immediately
    this._lastFarCheckPos.copy(this.camera.position);

    this.regionAware = opts?.regionAware ?? true;
    this.focusOnEntry = opts?.focusOnEntry ?? false;
    this.focusOnExit = opts?.focusOnExit ?? false;
    this.notifyOnTransition = opts?.notifyOnTransition ?? false;
    this.smoothingEnabled = opts?.smoothingEnabled ?? true;
    this.smoothingDurationMs = opts?.smoothingDurationMs ?? 1000;

    this.overlay = opts?.overlay;
    if (this.notifyOnTransition && !this.overlay) {
      this.overlay = new Overlay();
      this._ownsOverlay = true;
    }

    if (this.regionAware) {
      this._regionTransitionHandler = (ev: any) => this._onRegionTransition(ev);
      regionManager.onTransition(this._regionTransitionHandler);
      // Ensure starting far plane is adequate
      this.adjustCameraFar();
    }
  }

  handleResize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  update() {
    // Progress any smooth camera transition
    if (this._lerpActive) {
      const now = performance.now();
      const tRaw = Math.min(
        1,
        (now - this._lerpStartTime) / this._lerpDuration,
      );
      // easeInOutQuad
      const t = tRaw < 0.5 ? 2 * tRaw * tRaw : -1 + (4 - 2 * tRaw) * tRaw;

      this.camera.position.lerpVectors(this._lerpStartCam, this._lerpEndCam, t);
      const curTarget = new THREE.Vector3().lerpVectors(
        this._lerpStartTarget,
        this._lerpEndTarget,
        t,
      );
      this.controls.target.copy(curTarget);
      this.controls.update();

      if (tRaw >= 1) {
        this._lerpActive = false;
      }
    } else {
      this.controls.update();
    }

    // 2. ONLY adjust far plane if the camera has moved significantly
    // to save matrix update performance.
    if (
      this.regionAware &&
      this.camera.position.distanceTo(this._lastFarCheckPos) > 100
    ) {
      this.adjustCameraFar();
      this._lastFarCheckPos.copy(this.camera.position);
    }

    // 3. Propagate the camera to the active region for LOD/Billboarding
    if (regionManager.activeRegion) {
      regionManager.activeRegion.setCamera(this.camera);
    }
  }

  focusOn(target: THREE.Object3D, distance: number = 50) {
    const pos = new THREE.Vector3();
    target.getWorldPosition(pos);
    this.camera.position.copy(pos).add(new THREE.Vector3(0, 0, distance));
    this.controls.target.copy(pos);
    this.controls.update();
  }

  /**
   * Focus the camera on a Region, and set sensible OrbitControls limits
   */
  public focusOnRegion(
    region: Region,
    factor: number = 1.2,
    durationMs?: number,
  ) {
    const center = new THREE.Vector3();
    region.getWorldPosition(center);
    const radius = Math.max(region.entryRadius ?? 0, region.exitRadius ?? 0);
    const distance = Math.max(50, radius * factor);

    // Compute final camera position using current camera direction so we don't jump to a fixed axis
    const endCam = this.computeFocusPosition(center, distance);
    const endTarget = center.clone();

    // Limits so zoom behaves sensibly for tiny/big regions (apply immediately)
    this.controls.minDistance = Math.max(1, distance * 0.02);
    this.controls.maxDistance = Math.max(
      distance * 2,
      this.controls.maxDistance || distance * 2,
    );

    const dur =
      durationMs ?? (this.smoothingEnabled ? this.smoothingDurationMs : 0);
    if (dur && dur > 0) {
      this.startSmoothFocus(endCam, endTarget, dur);
    } else {
      this.camera.position.copy(endCam);
      this.controls.target.copy(endTarget);
      this.controls.update();
    }

    // Make sure the camera far plane can encompass region
    this.adjustCameraFar();
  }

  /**
   * Ensure camera.far is large enough to encompass any registered region's shell
   */
  private adjustCameraFar() {
    const camPos = new THREE.Vector3();
    this.camera.getWorldPosition(camPos);

    let requiredFar = this._defaultFar;
    const margin = 1000; // small safety margin

    for (const r of regionManager.getRegions()) {
      const center = new THREE.Vector3();
      r.getWorldPosition(center);
      const distToCenter = center.distanceTo(camPos);
      const shellRadius = Math.max(r.exitRadius ?? 0, r.entryRadius ?? 0);
      const candidate = distToCenter + shellRadius + margin;
      if (candidate > requiredFar) requiredFar = candidate;
    }

    // Update only if changed to avoid unnecessary matrix updates
    if (this.camera.far !== requiredFar) {
      this.camera.far = requiredFar;
      (this.camera as THREE.PerspectiveCamera).updateProjectionMatrix();
    }
  }

  private computeFocusPosition(
    center: THREE.Vector3,
    distance: number,
  ): THREE.Vector3 {
    const pos = new THREE.Vector3();
    this.camera.getWorldPosition(pos);
    const dir = pos.clone().sub(center);
    if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
    dir.normalize();
    return center.clone().add(dir.multiplyScalar(distance));
  }

  private startSmoothFocus(
    endCam: THREE.Vector3,
    endTarget: THREE.Vector3,
    durationMs: number,
  ) {
    this._lerpActive = true;
    this._lerpStartTime = performance.now();
    this._lerpDuration = Math.max(1, durationMs);
    this._lerpStartCam.copy(this.camera.position);
    this._lerpEndCam.copy(endCam);
    this._lerpStartTarget.copy(this.controls.target);
    this._lerpEndTarget.copy(endTarget);
  }

  private _onRegionTransition(ev: {
    previous: Region | null;
    next: Region | null;
  }) {
    // Ev contains previous and next
    try {
      const prev: Region | null = ev?.previous ?? null;
      const next: Region | null = ev?.next ?? null;

      // Immediately inform the new active region about the camera
      if (next) {
        try {
          next.setCamera(this.camera);
        } catch (e) {}
      }

      // Update overlay main info with the current region we're in (or none)
      try {
        if (this.overlay) {
          this.overlay.update(
            next?.name ?? null,
            next ? next.entryRadius : prev ? prev.entryRadius : null,
          );
        }
      } catch (e) {}

      // Optional notifications
      if (this.notifyOnTransition && this.overlay) {
        try {
          let msg = "";
          if (prev && next) msg = `Transition: ${prev.name} → ${next.name}`;
          else if (next) msg = `Entered: ${next.name}`;
          else if (prev) msg = `Exited: ${prev.name}`;

          if (msg) (this.overlay as any).notify(msg, 4000);
        } catch (e) {}
      }

      const dur = this.smoothingEnabled ? this.smoothingDurationMs : 0;

      // Auto-focus when entering a region
      if (this.focusOnEntry && next) {
        try {
          this.focusOnRegion(next, 1.2, dur);
        } catch (e) {}
      }

      // Auto-focus on exit (focus outward from previous region)
      if (this.focusOnExit && !next && prev) {
        try {
          // Slightly larger factor to give some space when focusing out
          this.focusOnRegion(prev, 1.4, dur);
        } catch (e) {}
      }

      // Adjust far plane regardless
      this.adjustCameraFar();
    } catch (e) {}
  }

  /**
   * Clean up listeners when the Ship is disposed
   */
  public dispose() {
    // Cancel any in-progress camera transition
    this._lerpActive = false;

    if (this._regionTransitionHandler) {
      regionManager.offTransition(this._regionTransitionHandler);
      this._regionTransitionHandler = undefined;
    }

    if (this._ownsOverlay && this.overlay) {
      try {
        (this.overlay as any).destroy?.();
      } catch (e) {}
      this.overlay = undefined;
      this._ownsOverlay = false;
    }
  }
}
