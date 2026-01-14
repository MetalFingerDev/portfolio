import { Camera, EventDispatcher } from "three";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default class Controls extends EventDispatcher {
  public camera: Camera;
  constructor(camera: Camera) {
    super();
    this.camera = camera;
  }
  public update(_delta: number) {
    // update control state
  }
}

export class Ship extends Controls {
  public camera: THREE.PerspectiveCamera;
  public controls?: OrbitControls;

  constructor(opts?: {
    camera?: THREE.PerspectiveCamera;
    dom?: HTMLElement;
    initialTarget?: THREE.Vector3;
    fov?: number;
    far?: number;
    distance?: number;
  }) {
    const fov = opts?.fov ?? 75;
    const far = opts?.far ?? 1e9;
    const camera =
      opts?.camera ??
      new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        0.1,
        far
      );
    camera.position.set(0, 0, opts?.distance ?? 3);
    super(camera);
    this.camera = camera;

    if (opts?.dom) {
      const controls = new OrbitControls(camera, opts.dom);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = true;
      controls.minDistance = 0.1;
      controls.maxDistance = far;
      if (opts.initialTarget) controls.target.copy(opts.initialTarget);
      controls.update();
      this.controls = controls;
    }
  }

  public handleResize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public move(
    targetPos: THREE.Vector3,
    lookAt: THREE.Vector3,
    onComplete?: () => void
  ) {
    this.camera.position.copy(targetPos);
    if (this.controls) {
      this.controls.target.copy(lookAt);
      this.controls.update();
    } else {
      this.camera.lookAt(lookAt);
    }
    if (onComplete) onComplete();
  }
}

