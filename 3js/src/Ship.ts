import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MILKY_WAY_WIDTH_SCENE } from "./units";

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
    // compute sensible camera distances from Milky Way width
    const desiredFar = Number.isFinite(MILKY_WAY_WIDTH_SCENE)
      ? Math.max(1e9, MILKY_WAY_WIDTH_SCENE * 2)
      : 1e9;
    const defaultDistance = Number.isFinite(MILKY_WAY_WIDTH_SCENE)
      ? Math.max(3, MILKY_WAY_WIDTH_SCENE * 0.6)
      : 3;

    // 1. Setup Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      desiredFar
    );
    camera.position.set(0, 0, defaultDistance);

    // 2. Setup Controls
    const controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    // minDistance left small so user can zoom in if desired
    controls.minDistance = 0.1;
    controls.maxDistance = desiredFar;

    if (initialTarget) {
      controls.target.copy(initialTarget);
    }
    controls.update();

    // 3. Initialize Parent
    super(camera, controls);
  }
}
