import * as THREE from "three";
import Renderer from "../rendering";

export default class Visualization {
  public scene: THREE.Scene;
  public renderer: Renderer;

  constructor(scene: THREE.Scene, renderer: Renderer) {
    this.scene = scene;
    this.renderer = renderer;
  }

  public render(camera: THREE.Camera) {
    this.renderer.render(this.scene, camera);
  }
}
