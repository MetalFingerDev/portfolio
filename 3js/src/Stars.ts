import * as THREE from "three";
import { STAR_FIELD_RADIUS } from "./units";

export default class Stars {
  starPoints: THREE.Points;
  starGroup: THREE.Group;
  interiorMesh?: THREE.Mesh;
  static RADIUS = STAR_FIELD_RADIUS;

  constructor(scene: THREE.Scene, count: number = 2000) {
    this.starGroup = new THREE.Group();
    scene.add(this.starGroup);

    // build random points on a spherical shell
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const sqrtOneMinusUSq = Math.sqrt(1 - u * u);
      const x = sqrtOneMinusUSq * Math.cos(theta);
      const y = sqrtOneMinusUSq * Math.sin(theta);
      const z = u;

      const r = STAR_FIELD_RADIUS * (0.95 + Math.random() * 0.1);
      positions[i * 3 + 0] = x * r;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = z * r;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.2,
      sizeAttenuation: true,
      depthWrite: false,
    });

    this.starPoints = new THREE.Points(geometry, material);
    this.starPoints.frustumCulled = false;
    this.starGroup.add(this.starPoints);

    // optional debug interior shell (yellow, visible from inside)
  }
}
