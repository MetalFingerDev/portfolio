import * as THREE from "three";

// 1. Define the custom event map
export interface RegionEventMap extends THREE.Object3DEventMap {
  enter: { type: "enter" };
  exit: { type: "exit" };
}

/**
 * A smart base class that handles hierarchy, orbital physics, and lifecycle management.
 */
export abstract class CelestialBody extends THREE.Group {
  name: string;
  mesh?: THREE.Mesh | THREE.Object3D;
  group?: THREE.Group | THREE.Object3D;
  lod?: THREE.LOD;
  point?: THREE.Points;

  public abstract setCamera(camera: THREE.Camera): void;
  public readonly isStar?: boolean;
  public readonly isPlanet?: boolean;

  public angle: number = Math.random() * Math.PI * 2;
  public orbit: number = 0;
  public velocity: number = 0;

  constructor(name: string) {
    super();
    this.name = name;
  }

  public abstract create(): void;

  /**
   * Public entry point for the update loop.
   */
  public update(delta: number): void {
    if (this.onUpdate) this.onUpdate(delta);
  }

  protected onUpdate?(delta: number): void;
  protected onDestroy?(): void;

  public destroy(): void {
    if (this.onDestroy) this.onDestroy();
    if (this.parent) this.parent.remove(this);
  }
}

/**
 * Updated Region Class
 * Now properly extends CelestialBody and implements its contract.
 */
export class Region extends CelestialBody {
  // Required by CelestialBody interface
  public readonly isStar = false;
  public readonly isPlanet = false;

  public bodies: CelestialBody[] = [];
  public cfg: any;

  public entryRadius: number;
  public exitRadius: number;
  public radius: number;

  private _debugEntryShell?: THREE.Mesh;
  private _debugExitShell?: THREE.Mesh;

  public isHighDetail: boolean = false;
  private _isUpdating = false;

  constructor(cfg?: any) {
    // Pass name to the CelestialBody constructor
    super(cfg?.name || "Unnamed Region");

    this.cfg = cfg || {};
    this.entryRadius = cfg?.entryRadius || cfg?.radius || 1000;
    this.exitRadius = cfg?.exitRadius || this.entryRadius * 1.1;
    this.radius = cfg?.radius ?? this.entryRadius;

    // In this pattern, we call create() to initialize visuals
    this.create();
  }

  /**
   * Implementation of CelestialBody.create()
   */
  public create(): void {
    if (this.cfg?.debugShells) {
      this.toggleDebugShells(true);
    }
    // Any other region-specific setup (e.g. background stars, ambient light) goes here
  }

  /**
   * Implementation of CelestialBody.onUpdate()
   * This is called by the main loop logic (assuming your engine calls update on bodies)
   */
  protected onUpdate(delta: number): void {
    if (this._isUpdating) return;
    this._isUpdating = true;

    try {
      for (const body of this.bodies) {
        // Now calling the public update() method defined in the base class
        body.update(delta);
      }
    } finally {
      this._isUpdating = false;
    }
  }

  /**
   * Implementation of CelestialBody.onDestroy()
   * Handles specific GPU cleanup before the base class removes it from the scene.
   */
  protected onDestroy(): void {
    // 1. Destroy all child celestial bodies
    this.bodies.forEach((b) => b.destroy());
    this.bodies = [];

    // 2. Dispose of Geometries and Materials
    this.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose());
        } else {
          object.material?.dispose();
        }
      }
    });
  }

  // --- Region Specific Methods ---

  public toggleDebugShells(show: boolean = true) {
    const ensureMeshes = () => {
      if (!this._debugEntryShell) {
        const g = new THREE.SphereGeometry(this.entryRadius, 32, 16);
        const m = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          wireframe: true,
          transparent: true,
          opacity: 0.2,
        });
        this._debugEntryShell = new THREE.Mesh(g, m);
        this.add(this._debugEntryShell);
      }

      if (!this._debugExitShell) {
        const g = new THREE.SphereGeometry(this.exitRadius, 32, 16);
        const m = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
          transparent: true,
          opacity: 0.1,
        });
        this._debugExitShell = new THREE.Mesh(g, m);
        this.add(this._debugExitShell);
      }
    };

    if (show) {
      ensureMeshes();
      if (this._debugEntryShell) this._debugEntryShell.visible = true;
      if (this._debugExitShell) this._debugExitShell.visible = true;
    } else {
      if (this._debugEntryShell) this._debugEntryShell.visible = false;
      if (this._debugExitShell) this._debugExitShell.visible = false;
    }
  }

  public setCamera(camera: THREE.Camera): void {
    for (const body of this.bodies) {
      if (body.setCamera) {
        body.setCamera(camera);
      }
    }
  }
}
