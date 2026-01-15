import * as THREE from "three";
import Renderer from "../rendering";
import { Ship } from "../controls";
import { type System } from "../systems";

export default class Visualization {
  public scene: THREE.Scene;
  public renderer: Renderer;

  // Traversal state
  private visibleObjects: THREE.Object3D[] = [];
  private currentObjectIndex = -1;

  constructor(scene: THREE.Scene, renderer: Renderer) {
    this.scene = scene;
    this.renderer = renderer;
  }

  public render(camera: THREE.Camera) {
    this.renderer.render(this.scene, camera);
  }

  /**
   * Update the list of visible named objects for traversal
   */
  public updateVisibleObjects(system: System | null) {
    if (system) {
      this.visibleObjects = [];
      system.group.traverse((obj: any) => {
        if (
          obj.name &&
          obj.name !== "star-mesh" &&
          obj.name !== "star-light" &&
          obj.visible &&
          obj.traversable !== false
        ) {
          this.visibleObjects.push(obj);
        }
      });
      this.currentObjectIndex = -1; // Reset index
    }
  }

  /**
   * Traverse to the next visible object and focus camera
   */
  public traverse(ship: Ship) {
    if (this.visibleObjects.length === 0) return;
    this.currentObjectIndex =
      (this.currentObjectIndex + 1) % this.visibleObjects.length;
    const obj = this.visibleObjects[this.currentObjectIndex];
    const distance = (obj as any).defaultViewDistance || 50;
    ship.focusOn(obj, distance);
  }
}
