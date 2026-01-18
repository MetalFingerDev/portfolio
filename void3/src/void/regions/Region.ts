import * as THREE from "three";

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
  group?: THREE.Group;

  public abstract setCamera(camera: THREE.Camera): void;
  public readonly isStar?: boolean;
  public readonly isPlanet?: boolean;

  public angle: number = Math.random() * Math.PI * 2;
  public orbit: number = 0;
  public velocity: number = 0;

  /**
   * @param name The name of the body
   * @param parent (Optional) The CelestialBody this object orbits around.
   */
  constructor(name: string, parent?: CelestialBody | THREE.Object3D) {
    super();
    this.name = name;
    if (parent) {
      parent.add(this);
    }
  }

  public abstract create(): void;

  /**
   * Public entry point for the update loop.
   * Handles:
   * 1. Orbital Physics (Positioning relative to parent)
   * 2. Custom Logic (onUpdate)
   * 3. Recursive Updates (Children)
   */
  public update(delta: number): void {
    if (this.orbit > 0 && this.velocity !== 0) {
      this.angle += this.velocity * delta;
      this.position.x = Math.cos(this.angle) * this.orbit;
      this.position.z = Math.sin(this.angle) * this.orbit;
    }
    if (this.onUpdate) this.onUpdate(delta);
    for (const child of this.children) {
      if (child instanceof CelestialBody) {
        child.update(delta);
      }
    }
  }

  protected onUpdate?(delta: number): void;

  protected onDestroy?(): void;

  public destroy(): void {
    if (this.onDestroy) this.onDestroy();
    for (const child of this.children) {
      if (child instanceof CelestialBody) child.destroy();
    }
    if (this.parent) this.parent.remove(this);
  }
}

/**
 * Region Class
 * Acts as the root container.
 */
export class Region extends CelestialBody {
  public readonly isStar = false;
  public readonly isPlanet = false;

  public config: any;
  public entry: number;
  public exit: number;
  public radius: number;

  private _debugEntry?: THREE.Mesh;
  private _debugExit?: THREE.Mesh;

  constructor(config?: any) {
    super(config?.name || "Unnamed Region");

    this.config = config || {};
    this.entry = config?.entry || config?.radius || 1000;
    this.exit = config?.exit || this.entry * 1.1;
    this.radius = config?.radius ?? this.entry;

    this.create();
  }

  public create(): void {
    if (this.config?.debugShells) {
      this.toggleDebug(true);
    }
  }

  protected onUpdate(_delta: number): void {
    // Region-level logic can use the delta if needed; default is a no-op
  }

  protected onDestroy(): void {
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

  public toggleDebug(show: boolean = true) {
    const debugMeshes = () => {
      if (!this._debugEntry) {
        const g = new THREE.SphereGeometry(this.entry, 32, 16);
        const m = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          wireframe: true,
          transparent: true,
          opacity: 0.2,
        });
        this._debugEntry = new THREE.Mesh(g, m);
        this.add(this._debugEntry);
      }

      if (!this._debugExit) {
        const g = new THREE.SphereGeometry(this.exit, 32, 16);
        const m = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          wireframe: true,
          transparent: true,
          opacity: 0.1,
        });
        this._debugExit = new THREE.Mesh(g, m);
        this.add(this._debugExit);
      }
    };

    if (show) {
      debugMeshes();
      if (this._debugEntry) this._debugEntry.visible = true;
      if (this._debugExit) this._debugExit.visible = true;
    } else {
      if (this._debugEntry) this._debugEntry.visible = false;
      if (this._debugExit) this._debugExit.visible = false;
    }
  }

  public setCamera(camera: THREE.Camera): void {
    this.traverse((child) => {
      if (child instanceof CelestialBody && child !== this) {
        child.setCamera(camera);
      }
    });
  }
}
