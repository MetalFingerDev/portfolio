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
  init?(params?: any): void;
  update(delta: number): void;
  destroy?(): void;
  onEnter?(): void;
  onExit?(): void;
}

export default class SystemManager {
  private scene: THREE.Scene;
  private systems: Map<
    string,
    new (manager: SystemManager, config?: any) => System
  > = new Map();
  private activeSystem: System | null = null;

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
   * Load (switch to) a system by id, cleaning up the previous one.
   */
  public load(id: string, params: SystemConfig = {}): void {
    const SystemClass = this.systems.get(id);
    if (!SystemClass) {
      console.warn(`System [${id}] not found in registry.`);
      return;
    }

    // teardown previous
    if (this.activeSystem) {
      this.activeSystem.onExit?.();
      this.activeSystem.destroy?.();
      this.scene.remove(this.activeSystem.group);
      this.activeSystem = null;
    }

    // init new
    this.activeSystem = new SystemClass(this, params);
    this.scene.add(this.activeSystem.group);
    this.activeSystem.init?.(params);
    this.activeSystem.onEnter?.();
  }

  public update(delta: number): void {
    this.activeSystem?.update(delta);
  }

  public get current(): System | null {
    return this.activeSystem;
  }
}
