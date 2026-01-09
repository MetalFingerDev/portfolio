import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { MILKY_WAY_WIDTH_SCENE } from "./conversions";

export default class SpaceShip {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;

  constructor(camera: THREE.PerspectiveCamera, controls: OrbitControls) {
    this.camera = camera;
    this.controls = controls;
  }

  handleResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

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
    const desiredFar = Number.isFinite(MILKY_WAY_WIDTH_SCENE)
      ? Math.max(1e9, MILKY_WAY_WIDTH_SCENE * 2)
      : 1e9;
    const defaultDistance = Number.isFinite(MILKY_WAY_WIDTH_SCENE)
      ? Math.max(3, MILKY_WAY_WIDTH_SCENE * 0.6)
      : 3;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      desiredFar
    );
    camera.position.set(0, 0, defaultDistance);

    const controls = new OrbitControls(camera, domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.minDistance = 0.1;
    controls.maxDistance = desiredFar;

    if (initialTarget) {
      controls.target.copy(initialTarget);
    }
    controls.update();

    super(camera, controls);
  }
}
