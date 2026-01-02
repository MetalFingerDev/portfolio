import * as THREE from "three";

export default class Render extends THREE.WebGLRenderer {
  constructor(canvas: HTMLCanvasElement) {
    super({ canvas, antialias: true });
    (
      this as unknown as { physicallyCorrectLights?: boolean }
    ).physicallyCorrectLights = true;

    // Enable tone mapping for better control over overall brightness
    // Use ACES filmic (if available) and set a conservative exposure
    (this as any).toneMapping =
      THREE.ACESFilmicToneMapping ?? THREE.ReinhardToneMapping;
    // Lowered exposure to reduce overall brightness of bright textures
    (this as any).toneMappingExposure = 0.35;

    this.setPixelRatio(window.devicePixelRatio);
    this.setSize(window.innerWidth, window.innerHeight);
  }

  setExposure(exposure: number) {
    (this as any).toneMappingExposure = exposure;
  }

  handleResize(width: number, height: number) {
    this.setSize(width, height);
  }
}
