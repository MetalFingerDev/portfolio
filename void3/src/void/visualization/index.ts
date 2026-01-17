import * as THREE from "three";
import Renderer from "../../rendering/Display";
import Ship from "../../controls/Ship";

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
