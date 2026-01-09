import * as THREE from "three";
import {
  EARTH_RADIUS,
  EARTH_ROTATION_SPEED,
  perSecondToPerDay,
  EARTH_OBLIQUITY_DEG,
} from "./conversions.ts";
import { getFresnelMat } from "./getFresnelMat.ts";

export default class Earth {
  public group: THREE.Group;
  private earthMesh: THREE.Mesh;
  private cloudsMesh: THREE.Mesh;
  private atmosphereMesh: THREE.Mesh;

  static RADIUS = EARTH_RADIUS;
  static ROTATION_SPEED = perSecondToPerDay(EARTH_ROTATION_SPEED);

  constructor(ratio: number) {
    this.group = new THREE.Group();
    this.group.rotation.z = THREE.MathUtils.degToRad(EARTH_OBLIQUITY_DEG);

    const loader = new THREE.TextureLoader();
    const earthGeometry = new THREE.SphereGeometry(
      Earth.RADIUS * ratio,
      64,
      64
    );

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: loader.load("earth.jpg"),
      bumpMap: loader.load("earth_bump.png"),
      specularMap: loader.load("earth_speck.png"),
      bumpScale: 4,
    });
    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    this.group.add(this.earthMesh);

    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: loader.load("04_earthcloudmap.png"),
      alphaMap: loader.load("05_earthcloudmaptrans.png"),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.cloudsMesh = new THREE.Mesh(earthGeometry, cloudsMaterial);
    this.cloudsMesh.scale.setScalar(1.003);
    this.group.add(this.cloudsMesh);

    const atmosphereMaterial = getFresnelMat();
    this.atmosphereMesh = new THREE.Mesh(earthGeometry, atmosphereMaterial);
    this.atmosphereMesh.scale.setScalar(1.01);
    this.group.add(this.atmosphereMesh);
  }

  update(delta: number) {
    this.earthMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    this.cloudsMesh.rotation.y += Earth.ROTATION_SPEED * 1.2 * delta;
  }

  destroy() {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }
}
