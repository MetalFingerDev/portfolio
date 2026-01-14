import * as THREE from "three";

export default class Star extends THREE.Object3D {
  public luminosity: number;
  constructor(luminosity = 1) {
    super();
    this.luminosity = luminosity;
  }
}
