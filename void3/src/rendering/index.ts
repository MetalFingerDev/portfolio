import { WebGLRenderer, Scene, Camera } from 'three';

export interface RendererOptions {
  antialias?: boolean;
  alpha?: boolean;
}

export default class Renderer {
  public renderer: WebGLRenderer;

  constructor(canvas?: HTMLCanvasElement, options: RendererOptions = {}) {
    this.renderer = new WebGLRenderer({ canvas, antialias: options.antialias, alpha: options.alpha });
  }

  public setSize(width: number, height: number) {
    this.renderer.setSize(width, height);
  }

  public render(scene: Scene, camera: Camera) {
    this.renderer.render(scene, camera);
  }
}
