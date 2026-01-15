import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Ship {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;
  private width: number;
  private height: number;

  constructor(domElement: HTMLCanvasElement, initialTarget?: THREE.Vector3) {
    this.width = domElement.width || window.innerWidth;
    this.height = domElement.height || window.innerHeight;

    const desiredFar = 1e9;
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      desiredFar
    );
    this.camera.position.set(0, 0, 50);
    this.camera.name = "ship-camera";

    this.controls = new OrbitControls(this.camera, domElement);
    if (initialTarget) this.controls.target.copy(initialTarget);
    this.controls.update();
  }

  handleResize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  update() {
    this.controls.update();
  }

  focusOn(target: THREE.Object3D, distance: number = 50) {
    const pos = new THREE.Vector3();
    target.getWorldPosition(pos);
    this.camera.position.copy(pos).add(new THREE.Vector3(0, 0, distance));
    this.controls.target.copy(pos);
    this.controls.update();
  }

}
