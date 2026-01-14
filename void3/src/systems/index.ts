import * as THREE from "three";

/**
 * Flexible system configuration. Specific systems can extend the generic
 * parameter to provide stricter typing when needed.
 */
export type SystemConfig<T = Record<string, any>> = T & {
  position?: THREE.Vector3;
  scale?: number;
};

/**
 * Minimal contract for systems integrated into the manager.
 */
export interface System {
  group: THREE.Group;
  placeholder?: THREE.Group;
  init?(params?: any): void;
  initPlaceholder?(): void;
  update(delta: number): void;
  destroy?(): void;
  onEnter?(): void;
  onExit?(): void;
}

export abstract class BaseSystem implements System {
  public group: THREE.Group;
  public placeholder: THREE.Group; // low-detail representation

  protected manager: SystemManager;
  protected config: SystemConfig;

  constructor(manager: SystemManager, config: SystemConfig = {}) {
    this.manager = manager;
    this.config = config;

    // Container for high-detail content
    this.group = new THREE.Group();
    // Low-detail placeholder to use at distant LODs
    this.placeholder = new THREE.Group();

    // Default: Placeholder is hidden initially
    this.placeholder.visible = false;

    // apply basic config to both
    if (config.position) {
      this.group.position.copy(config.position);
      this.placeholder.position.copy(config.position);
    }
    if (typeof config.scale === "number") {
      this.group.scale.setScalar(config.scale);
      this.placeholder.scale.setScalar(config.scale);
    }

    const name = (config as any).name ?? "system";
    this.group.name = name;
    this.placeholder.name = `${name}-placeholder`;
  }

  abstract init(params?: any): void;
  abstract initPlaceholder(): void;

  public update(delta: number): void {
    // Only update the visible one to save CPU
    if (this.group.visible) {
      this.group.children.forEach((c: any) => c.update && c.update(delta));
    } else if (this.placeholder.visible) {
      this.placeholder.children.forEach(
        (c: any) => c.update && c.update(delta)
      );
    }
  }

  public setLOD(isActive: boolean) {
    if (isActive) {
      // HIGH DETAIL
      this.group.visible = true;
      this.placeholder.visible = false;
    } else {
      // LOW DETAIL (Neighbor View)
      this.group.visible = false;
      this.placeholder.visible = true;
    }
  }

  public destroy(): void {
    // Dispose both
    [this.group, this.placeholder].forEach((g) => {
      g.traverse((object: any) => {
        if (object.isMesh) {
          const mesh = object as THREE.Mesh;
          if (
            mesh.geometry &&
            typeof (mesh.geometry as any).dispose === "function"
          ) {
            (mesh.geometry as any).dispose();
          }

          const material = mesh.material as any;
          if (Array.isArray(material)) {
            material.forEach((m: any) => this.disposeMaterial(m));
          } else if (material) {
            this.disposeMaterial(material);
          }
        }
      });

      g.clear();
    });
  }

  protected disposeMaterial(mat: any): void {
    if (!mat) return;

    const texProps = [
      "map",
      "alphaMap",
      "aoMap",
      "bumpMap",
      "normalMap",
      "displacementMap",
      "roughnessMap",
      "metalnessMap",
      "envMap",
      "lightMap",
      "emissiveMap",
      "specularMap",
    ];

    texProps.forEach((p) => {
      const t = mat[p];
      if (t && typeof t.dispose === "function") t.dispose();
    });

    if (typeof mat.dispose === "function") mat.dispose();
  }

  onEnter(): void {
    // optional hook for subclasses
  }

  onExit(): void {
    // optional hook for subclasses
  }
}

export default class SystemManager {
  private scene: THREE.Scene;
  private systems: Map<
    string,
    new (manager: SystemManager, config?: any) => System
  > = new Map();

  // adjacency map for neighbor relationships
  private adjacency: Map<string, string[]> = new Map();

  // Loaded system instances keyed by id. We keep nearby systems alive
  private loadedSystems: Map<string, BaseSystem> = new Map();

  // currently active system id
  private activeSystemId?: string;

  // Shared/optional context available to systems
  public context: {
    camera: THREE.Camera;
    renderer?: THREE.WebGLRenderer;
  };

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera,
    renderer?: THREE.WebGLRenderer
  ) {
    this.scene = scene;
    this.context = { camera, renderer };
  }

  /**
   * Register a system class under a unique id
   */
  public register(
    id: string,
    SystemClass: new (manager: SystemManager, config?: any) => System
  ): void {
    this.systems.set(id, SystemClass);
  }

  /**
   * Connect two systems as neighbors (bidirectional)
   */
  public connect(systemA: string, systemB: string) {
    if (!this.adjacency.has(systemA)) this.adjacency.set(systemA, []);
    if (!this.adjacency.has(systemB)) this.adjacency.set(systemB, []);

    this.adjacency.get(systemA)!.push(systemB);
    this.adjacency.get(systemB)!.push(systemA);
  }

  /**
   * Load (switch to) a system by id, keeping nearby neighbor systems alive
   */
  public load(id: string, params: SystemConfig = {}): void {
    const activeId = id;

    // identify neighbors to keep alive
    const neighbors = this.adjacency.get(id) || [];
    const keepAlive = new Set<string>([activeId, ...neighbors]);

    // remove loaded systems that are not in the keepAlive set
    for (const [loadedId, system] of Array.from(this.loadedSystems)) {
      if (!keepAlive.has(loadedId)) {
        system.onExit?.();
        system.destroy?.();
        this.scene.remove(system.group);
        if (system.placeholder) this.scene.remove(system.placeholder);
        this.loadedSystems.delete(loadedId);
      }
    }

    // ensure required systems are loaded and positioned
    keepAlive.forEach((sysId) => {
      let sys = this.loadedSystems.get(sysId);

      if (!sys) {
        const ClassRef = this.systems.get(sysId);
        if (!ClassRef) return;

        sys = new (ClassRef as any)(this, params) as BaseSystem;
        sys.init?.(params);
        sys.initPlaceholder?.();

        this.scene.add(sys.group);
        if (sys.placeholder) this.scene.add(sys.placeholder);
        this.loadedSystems.set(sysId, sys);
      }

      // set LOD: only the active system is high detail
      const isActive = sysId === activeId;
      sys.setLOD(isActive);

      // position correction for neighbors
      if (!isActive) {
        this.positionNeighbor(activeId, sysId, sys);
      } else {
        sys.group.position.set(0, 0, 0);
        sys.placeholder.position.set(0, 0, 0);
      }
    });

    // track active system
    this.activeSystemId = activeId;
  }

  /**
   * Simple hard-coded neighbor positioning. Replace with universe coordinates as needed.
   */
  private positionNeighbor(
    activeId: string,
    neighborId: string,
    neighborSys: BaseSystem
  ) {
    // If we are in Interstellar space, place Solar System at origin as a small object
    if (activeId === "interstellar-space" && neighborId === "solar-system") {
      neighborSys.placeholder.position.set(0, 0, 0);
      neighborSys.placeholder.scale.setScalar(1);
    }

    // If we are in Solar System, Interstellar Space is a huge background
    if (activeId === "solar-system" && neighborId === "interstellar-space") {
      neighborSys.placeholder.position.set(0, 0, 0);
      neighborSys.placeholder.scale.setScalar(1000);
    }
  }

  public update(delta: number): void {
    // Update all loaded systems; they will only perform work if visible
    for (const sys of this.loadedSystems.values()) {
      sys.update(delta);
    }
  }

  public get current(): System | null {
    if (!this.activeSystemId) return null;
    return this.loadedSystems.get(this.activeSystemId) || null;
  }
}
