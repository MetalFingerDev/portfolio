import * as THREE from 'three';

export default class Planet extends THREE.Object3D {
  public radius: number;
  constructor(radius = 1) {
    super();
    this.radius = radius;
  }
}
