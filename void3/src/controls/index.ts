import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export class Ship {
  public camera: THREE.PerspectiveCamera;
  public controls: OrbitControls;

  constructor(dom: HTMLElement) {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1e9
    );
    this.camera.position.set(0, 2, 10); // Default start

    this.controls = new OrbitControls(this.camera, dom);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
  }

  /**
   * EXCLUSIVE MOVEMENT HANDLER
   * This is the only place camera position updates should happen.
   */
  public update(_delta: number) {
    this.controls.update();
    // If you add keyboard flight controls later, add them here.
  }

  /**
   * REFRAME / HYPERSPACE
   * Handles the coordinate math when switching systems.
   * * @param factor - How much to scale the current position (oldRatio / newRatio)
   * @param offsetDelta - The distance shift (newOffset - oldOffset)
   */
  public reframe(factor: number, offsetDelta: number) {
    // 1. Scale the camera position
    // Matches logic: (x - old) * factor + new -> x * factor + (new - old*factor)
    // Simplified: Just scale, then apply the offset shift.

    this.camera.position.multiplyScalar(factor);
    this.camera.position.x += offsetDelta;

    // 2. Scale the Controls Target (LookAt) so we don't lose focus
    this.controls.target.multiplyScalar(factor);
    this.controls.target.x += offsetDelta;

    // 3. Update Camera Matrices immediately
    this.camera.updateProjectionMatrix();
    this.controls.update();
  }

  /**
   * Standard teleport for initial loading or respawning
   */
  public teleport(position: THREE.Vector3, lookAt?: THREE.Vector3) {
    this.camera.position.copy(position);
    if (lookAt) this.controls.target.copy(lookAt);
    this.controls.update();
  }

  public handleResize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }
}
