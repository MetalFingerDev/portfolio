import * as THREE from "three";
import {
  MOON_RADIUS,
  MOON_ROTATION,
  MOON_DISTANCE_SCENE,
  perSecondToPerDay,
} from "./units";

export default class Moon {
  moonMesh: THREE.Mesh;
  moonGroup: THREE.Group;
  static RADIUS = MOON_RADIUS;
  // rotation speed is provided as per-second in units; convert to per-day so delta (days) matches
  static ROTATION_SPEED = perSecondToPerDay(MOON_ROTATION);

  constructor(scene: THREE.Scene, parentGroup?: THREE.Group) {
    this.moonGroup = new THREE.Group();
    (parentGroup || scene).add(this.moonGroup);

    const loader = new THREE.TextureLoader();
    // correct asset filename and use a PBR material compatible with physically-correct lights
    const moonTex = loader.load("MOON.png");
    const moonBump = loader.load("MOON_bump.png");

    const moonGeometry = new THREE.SphereGeometry(Moon.RADIUS, 64, 64);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTex,
      // use the existing bump map (grayscale) rather than treating it as a normal map
      bumpMap: moonBump,
      bumpScale: 0.04,
      roughness: 0.9,
      metalness: 0,
    });

    this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    // place moon at average distance along +X relative to its group
    this.moonMesh.position.set(MOON_DISTANCE_SCENE, 0, 0);
    this.moonGroup.add(this.moonMesh);
  }

  // simple rotation to simulate orbit/rotation
  update(delta = 0.016) {
    this.moonGroup.rotation.y += Moon.ROTATION_SPEED * delta;
    this.moonMesh.rotation.y += Moon.ROTATION_SPEED * delta;
  }
}
