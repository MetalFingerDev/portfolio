import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class SpaceShip {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
  }

  // Consolidated resize logic here
  handleResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  // Renamed 'moveShip' to 'move' for simplicity
  move(
    targetPos: THREE.Vector3,
    lookAt: THREE.Vector3,
    onComplete?: () => void
  ) {
    this.camera.position.copy(targetPos);
    this.controls.target.copy(lookAt);
    this.controls.update();
    if (onComplete) onComplete();
  }
}

export class OrbitingSpaceShip extends SpaceShip {
  constructor(domElement: HTMLElement, initialTarget?: THREE.Vector3) {
    // 1. Setup Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100_000_000
    );
    camera.position.set(0, 0, 3);

    // 2. Setup Controls
    const controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 0.1;
    controls.maxDistance = 1e9;

    if (initialTarget) {
      controls.target.copy(initialTarget);
    }
    controls.update();

    // 3. Initialize Parent
    super(camera, controls);
  }
}
