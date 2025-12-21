import * as THREE from "three";

import {
  EARTH_RADIUS,
  EARTH_ROTATION,
  perSecondToPerDay,
  EARTH_OBLIQUITY_DEG,
} from "./units";
import { getFresnelMat } from "./getFresnelMat.js";

export default class Earth {
  earthMesh: THREE.Mesh;
  earthGroup: THREE.Group;
  cloudsMesh: THREE.Mesh | null = null;
  lightsMesh: THREE.Mesh | null = null;
  atmosphereMesh: THREE.Mesh | null = null;
  static RADIUS = EARTH_RADIUS;
  // ROTATION_SPEED is expressed in "per day" units to match the delta we pass from the main loop
  static ROTATION_SPEED = perSecondToPerDay(EARTH_ROTATION);

  constructor(scene: THREE.Scene) {
    this.earthGroup = new THREE.Group();
    // apply Earth's obliquity (tilt the group's rotation so the planet and its axis lean)
    this.earthGroup.rotation.z = THREE.MathUtils.degToRad(EARTH_OBLIQUITY_DEG);
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
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.cloudsMesh = new THREE.Mesh(earthGeometry, cloudsMaterial);
    this.cloudsMesh.renderOrder = 2;
    this.cloudsMesh.scale.setScalar(1.003);
    this.earthGroup.add(this.cloudsMesh);

    const atmosphereMaterial = getFresnelMat();
    // Render atmosphere additively and ensure it doesn't depth-test/write so it blends over clouds
    atmosphereMaterial.transparent = true;
    (atmosphereMaterial as any).depthWrite = false;
    (atmosphereMaterial as any).depthTest = false;
    atmosphereMaterial.blending = THREE.AdditiveBlending;

    this.atmosphereMesh = new THREE.Mesh(earthGeometry, atmosphereMaterial);
    this.atmosphereMesh.scale.setScalar(1.01);
    // render after clouds (clouds use renderOrder = 2)
    this.atmosphereMesh.renderOrder = 3;
    this.earthGroup.add(this.atmosphereMesh);

    // Axis visual for Earth (small line through poles)
    {
      const axisLen = Earth.RADIUS * 2.2;
      const axisGeom = new THREE.BufferGeometry();
      axisGeom.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          [0, axisLen / 2, 0, 0, -axisLen / 2, 0],
          3
        )
      );
      const axisMat = new THREE.LineBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.85,
      });
      const axis = new THREE.Line(axisGeom, axisMat);
      // attach to the mesh so it rotates with the planet's spin
      this.earthMesh.add(axis);
    }
  }

  update(delta = 0.016) {
    this.earthMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.lightsMesh)
      this.lightsMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.cloudsMesh)
      this.cloudsMesh.rotation.y += Earth.ROTATION_SPEED * 1.2 * delta;
  }
}
