import * as THREE from "three";

export default class Render extends THREE.WebGLRenderer {
  constructor(canvas: HTMLCanvasElement) {
    super({ canvas, antialias: true });
    (
      this as unknown as { physicallyCorrectLights?: boolean }
    ).physicallyCorrectLights = true;
    this.setPixelRatio(window.devicePixelRatio);
    this.setSize(window.innerWidth, window.innerHeight);
  }

  handleResize(width: number, height: number) {
    this.setSize(width, height);
  }
}
