import * as THREE from "three";

import {
  SUN_DISTANCE_SCENE,
  SUN_RADIUS_SCENE,
  SUN_AXIS_TILT_DEG,
} from "./units";

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
    // tilt the Sun's axis for visual alignment with the ecliptic
    this.sunMesh.rotation.z = THREE.MathUtils.degToRad(SUN_AXIS_TILT_DEG);
    this.sunGroup.add(this.sunMesh);

    this.sunMesh.position.set(SUN_DISTANCE_SCENE, 0, 0);
    this.sunMesh.castShadow = this.sunMesh.receiveShadow = false;

    // Axis visual for Sun
    {
      const axisLen = SUN_RADIUS_SCENE * 2.2;
      const axisGeom = new THREE.BufferGeometry();
      axisGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          [0, axisLen / 2, 0, 0, -axisLen / 2, 0],
          3
        )
      );
      const axisMat = new THREE.LineBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.85,
      });
      const axis = new THREE.Line(axisGeom, axisMat);
      this.sunMesh.add(axis);
    }

    // Physically-based point light using real solar illuminance and inverse-square decay
    this.sunLight = new THREE.PointLight(0xffffff, 1000000000, 0, 2);
    this.sunGroup.add(this.sunLight);
    this.sunLight.position.copy(this.sunMesh.position);

    this.sunMesh.layers.enable(1);
  }
}
