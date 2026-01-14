import { WebGLRenderer, Scene, Camera } from "three";

export interface DisplayOptions {
  antialias?: boolean;
  alpha?: boolean;
}

export default class Display {
  public renderer: WebGLRenderer;

  constructor(canvas?: HTMLCanvasElement, options: DisplayOptions = {}) {
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: options.antialias,
      alpha: options.alpha,
    });
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  public render(scene: Scene, camera: Camera) {
    this.renderer.render(scene, camera);
  }
}
