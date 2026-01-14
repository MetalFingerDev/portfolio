import * as THREE from "three";
import {
  EARTH_RADIUS_M,
  EARTH_ROTATION_SPEED,
  perSecondToPerDay,
  EARTH_OBLIQUITY_DEG,
  AU_SCENE,
} from "./conversions";
import { getFresnelMat } from "./getFresnelMat";
import type { PlanetData } from "./Planet";
import type { ICelestialBody } from "./config";
import { createLabel } from "./label";
import { addOrbit, addAxis } from "./visuals";
import CelestialBody from "./CelestialBody";
import { disposeObject } from "./utils/threeUtils";

export default class Earth implements ICelestialBody {
  public group: THREE.Group = new THREE.Group();
  private inner: CelestialBody;
  private cloudsMesh!: THREE.Mesh;
  private atmosphereMesh!: THREE.Mesh;

  static ROTATION_SPEED = perSecondToPerDay(EARTH_ROTATION_SPEED);

  constructor(planet: PlanetData, ratio: number, parent?: THREE.Group) {
    // Create base celestial body for Earth
    this.inner = new CelestialBody(
      {
        name: "Earth",
        radiusMeters: EARTH_RADIUS_M,
        texturePath: "earth.jpg",
        color: 0x2244ff,
      },
      ratio
    );

    this.group.add(this.inner.group);
    this.group.rotation.z = THREE.MathUtils.degToRad(EARTH_OBLIQUITY_DEG);

    // Use the inner celestial body as the base mesh
    const loader = new THREE.TextureLoader();
    const sceneRadius = (this.inner.group.userData as any).baseSize;
    const baseMesh = this.inner.getMesh();

    // Clouds and atmosphere attached to the inner high-detail group
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: loader.load("04_earthcloudmap.png"),
      alphaMap: loader.load("05_earthcloudmaptrans.png"),
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.cloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(sceneRadius, 32, 32),
      cloudsMaterial
    );
    this.cloudsMesh.scale.setScalar(1.003);
    this.inner.getHighDetailGroup().add(this.cloudsMesh);

    const atmosphereMaterial = getFresnelMat();
    this.atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(sceneRadius, 32, 32),
      atmosphereMaterial
    );
    this.atmosphereMesh.scale.setScalar(1.01);
    this.inner.getHighDetailGroup().add(this.atmosphereMesh);

    // Axis visual attached to base mesh
    addAxis(baseMesh, sceneRadius * 2.2);

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
      const a = (planet.distance * AU_SCENE) / ratio;
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
    this.group.add(
      createLabel(
        planet.name,
        ((this.inner.group.userData as any).baseSize || 0) * 3
      )
    );

    // Default to high detail (inner body manages its own detail groups)
    this.inner.setDetail(true);
  }

  public setDetail(isHighDetail: boolean) {
    this.inner.setDetail(isHighDetail);
  }

  public update(delta: number) {
    this.inner.update(delta);
    this.cloudsMesh.rotation.y += Earth.ROTATION_SPEED * delta * 1.2;
  }

  public destroy() {
    this.inner.destroy();
    disposeObject(this.group);
  }
}
