import * as THREE from "three";

import { SUN_DISTANCE_SCENE, SUN_RADIUS_SCENE } from "./units";

// Units: scene unit = 1 Earth radius (see `units.ts`)
export default class Sun {
  sunMesh: THREE.Mesh;
  sunGroup: THREE.Group;
  sunLight: THREE.PointLight;
  static RADIUS = SUN_RADIUS_SCENE;

  constructor(scene: THREE.Scene) {
    this.sunGroup = new THREE.Group();
    this.sunGroup.position.set(0, 0, 0);
    scene.add(this.sunGroup);

    const sunGeometry = new THREE.SphereGeometry(SUN_RADIUS_SCENE, 64, 64);
    const sunMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0xffffff,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sunGroup.add(this.sunMesh);

    this.sunMesh.position.set(SUN_DISTANCE_SCENE, 0, 0);
    this.sunMesh.castShadow = this.sunMesh.receiveShadow = false;

    // Physically-based point light using real solar illuminance and inverse-square decay
    this.sunLight = new THREE.PointLight(0xffffff, 1000000000, 0, 2);
    this.sunGroup.add(this.sunLight);
    this.sunLight.position.copy(this.sunMesh.position);

    this.sunMesh.layers.enable(1);
  }
}
