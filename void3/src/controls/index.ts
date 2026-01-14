import { Camera, EventDispatcher } from "three";

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
