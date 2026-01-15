import * as THREE from "three";
import Star from "../stellar";

export default class Galaxy extends THREE.Object3D {
  public name: string;
  constructor(name = "Milky Way") {
    super();
    this.name = name;

    // Add stars to the galaxy
    for (let i = 0; i < 100; i++) {
      const star = new Star();
      star.position.set(
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000,
        (Math.random() - 0.5) * 1000
      );
      this.add(star);
    }
  }
}
