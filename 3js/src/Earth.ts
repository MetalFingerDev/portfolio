import * as THREE from "three";

import { EARTH_RADIUS, EARTH_ROTATION } from "./units";

export default class Earth {
  earthMesh: THREE.Mesh;
  earthGroup: THREE.Group;
  cloudsMesh: THREE.Mesh | null = null;
  lightsMesh: THREE.Mesh | null = null;
  static RADIUS = EARTH_RADIUS;
  static ROTATION_SPEED = EARTH_ROTATION;

  constructor(scene: THREE.Scene) {
    this.earthGroup = new THREE.Group();
    scene.add(this.earthGroup);

    const loader = new THREE.TextureLoader();
    const earthTex = loader.load("earth.jpg");
    const earthBump = loader.load("earth_bump.png");
    const earthSpeck = loader.load("earth_speck.png");
    const cloudsTex = loader.load("04_earthcloudmap.png");
    const cloudsAlpha = loader.load("05_earthcloudmaptrans.png");

    const earthGeometry = new THREE.SphereGeometry(Earth.RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTex,
      bumpMap: earthBump,
      specularMap: earthSpeck,
      bumpScale: 0.04,
    });
    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    this.earthGroup.add(this.earthMesh);

    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      alphaMap: cloudsAlpha,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.cloudsMesh = new THREE.Mesh(earthGeometry, cloudsMaterial);
    this.cloudsMesh.renderOrder = 2;
    this.cloudsMesh.scale.setScalar(1.003);
    this.earthGroup.add(this.cloudsMesh);
  }

  update(delta = 0.016) {
    this.earthMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.lightsMesh)
      this.lightsMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.cloudsMesh)
      this.cloudsMesh.rotation.y += Earth.ROTATION_SPEED * 1.2 * delta;
  }
}
