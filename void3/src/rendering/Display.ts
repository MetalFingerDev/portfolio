import { WebGLRenderer, Scene, Camera } from "three";

export interface Options {
  antialias?: boolean;
  alpha?: boolean;
  logarithmicDepthBuffer?: boolean;
}

export default class Display {
  public renderer: WebGLRenderer;

  constructor(canvas?: HTMLCanvasElement, options: Options = {}) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: options.antialias,
      alpha: options.alpha,
      logarithmicDepthBuffer: options.logarithmicDepthBuffer,
    });

    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    (this.renderer as any).physicallyCorrectLights = true;
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  public render(scene: Scene, camera: Camera) {
    this.renderer.render(scene, camera);
  }
}
