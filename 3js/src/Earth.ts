import * as THREE from "three";
import {
  EARTH_RADIUS,
  EARTH_ROTATION_SPEED,
  perSecondToPerDay,
  EARTH_OBLIQUITY_DEG,
} from "./conversions";
import { AU_SCENE } from "./conversions";
import { getFresnelMat } from "./getFresnelMat";
import type { PlanetData } from "./Planet";
import type { ICelestialBody } from "./config";
import { createLabel } from "./label";
import { addOrbit, addAxis } from "./visuals";

export default class Earth implements ICelestialBody {
  public group: THREE.Group = new THREE.Group();
  private highDetailGroup: THREE.Group = new THREE.Group();
  private lowDetailGroup: THREE.Group = new THREE.Group();

  private earthMesh!: THREE.Mesh;
  private cloudsMesh!: THREE.Mesh;
  private atmosphereMesh!: THREE.Mesh;

  static RADIUS = EARTH_RADIUS;
  static ROTATION_SPEED = perSecondToPerDay(EARTH_ROTATION_SPEED);

  constructor(planet: PlanetData, ratio: number, parent?: THREE.Group) {
    this.group.rotation.z = THREE.MathUtils.degToRad(EARTH_OBLIQUITY_DEG);

    // Create high/low detail containers
    this.group.add(this.highDetailGroup, this.lowDetailGroup);

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
    this.highDetailGroup.add(this.earthMesh);

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
    this.highDetailGroup.add(this.cloudsMesh);

    const atmosphereMaterial = getFresnelMat();
    this.atmosphereMesh = new THREE.Mesh(earthGeometry, atmosphereMaterial);
    this.atmosphereMesh.scale.setScalar(1.01);
    this.highDetailGroup.add(this.atmosphereMesh);

    // Positioning: attach to parent or compute local position
    if (parent) {
      const { position } = addOrbit(parent, {
        distanceAU: planet.distance,
        eccentricity: planet.eccentricity,
        angleDeg: planet.angle,
        ratio,
      });
      this.group.position.copy(position);
    } else {
      const a = planet.distance * AU_SCENE * ratio;
      const angleRad = THREE.MathUtils.degToRad(planet.angle);
      const e = planet.eccentricity;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
      this.group.position.set(
        r * Math.cos(angleRad),
        0,
        r * Math.sin(angleRad)
      );
    }

    // Label
    this.group.add(createLabel(planet.name, planet.size * ratio * 3));

    // Store base size for centralized scaling decisions
    this.group.userData.baseSize = Earth.RADIUS * ratio;

    // Add axis visual
    addAxis(this.earthMesh, Earth.RADIUS * ratio * 2.2);

    // Low-detail fallback: simple sphere for distant view
    const lowGeom = new THREE.SphereGeometry(
      Math.max(1, Earth.RADIUS * ratio * 0.6),
      8,
      8
    );
    const lowMat = new THREE.MeshBasicMaterial({ color: 0x4444ff });
    const lowMesh = new THREE.Mesh(lowGeom, lowMat);
    this.lowDetailGroup.add(lowMesh);

    // Default to high detail
    this.setDetail(true);
  }

  public setDetail(isHighDetail: boolean) {
    this.highDetailGroup.visible = isHighDetail;
    this.lowDetailGroup.visible = !isHighDetail;
  }

  update(delta: number) {
    if (this.highDetailGroup.visible) {
      this.earthMesh.rotation.y += Earth.ROTATION_SPEED * delta;
      this.cloudsMesh.rotation.y += Earth.ROTATION_SPEED * 1.2 * delta;
    }
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
