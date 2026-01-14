import * as THREE from "three";
import {
  MOON_RADIUS_M,
  MOON_ROTATION,
  MOON_ORBIT_INCLINATION_DEG,
  MOON_ORBIT_SPEED,
  MOON_DISTANCE_SCENE,
  MOON_AXIS_TILT_DEG,
  perSecondToPerDay,
} from "./conversions";
import type { ICelestialBody } from "./config";
import BaseBody from "./BaseBody";
import CelestialBody from "./CelestialBody";

export default class Moon extends BaseBody implements ICelestialBody {
  private orbitGroup: THREE.Group = new THREE.Group();
  private inner: CelestialBody;

  static ROTATION_SPEED = perSecondToPerDay(MOON_ROTATION);
  static ORBIT_SPEED = perSecondToPerDay(MOON_ORBIT_SPEED);
  static ORBIT_INCLINATION_DEG = MOON_ORBIT_INCLINATION_DEG;

  constructor(scene: THREE.Scene, parentGroup?: THREE.Group, ratio = 1) {
    super();
    // Top-level group contains orbit and detail groups
    this.group.add(this.orbitGroup);
    this.orbitGroup.rotation.x = THREE.MathUtils.degToRad(
      Moon.ORBIT_INCLINATION_DEG
    );

    // Create inner CelestialBody
    this.inner = new CelestialBody(
      {
        name: "Moon",
        radiusMeters: MOON_RADIUS_M,
        texturePath: "MOON.png",
        bumpPath: "MOON_bump.png",
        rotationSpeed: Moon.ROTATION_SPEED,
      },
      ratio
    );

    // Position the moon
    this.inner.group.position.set(0, 0, -MOON_DISTANCE_SCENE / ratio);
    this.inner.getMesh().rotation.z =
      THREE.MathUtils.degToRad(MOON_AXIS_TILT_DEG);

    this.orbitGroup.add(this.inner.group);

    // Axis visual
    const sceneRadius = (this.inner.group.userData as any).baseSize;
    const axisLen = sceneRadius * 2.2;
    const axisGeom = new THREE.BufferGeometry();
    axisGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [0, axisLen / 2, 0, 0, -axisLen / 2, 0],
        3
      )
    );
    const axisMat = new THREE.LineBasicMaterial({
      color: 0xcccccc,
      transparent: true,
      opacity: 0.9,
    });
    const axis = new THREE.Line(axisGeom, axisMat);
    this.inner.getMesh().add(axis);

    // Orbit ring
    const segments = 128;
    const positions = new Float32Array(segments * 3);
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.sin(t) * (MOON_DISTANCE_SCENE / ratio);
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.cos(t) * (MOON_DISTANCE_SCENE / ratio);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.LineBasicMaterial({
      color: 0x88aaff,
      transparent: true,
      opacity: 0.25,
      depthTest: false,
    });
    const ring = new THREE.LineLoop(geom, mat);
    this.orbitGroup.add(ring);

    // Attach to scene or parent
    (parentGroup || scene).add(this.group);

    // Default: high detail visible
    this.setDetail(true);
  }

  protected initGroups() {
    // Not used in wrapper
  }

  public update(delta = 0.016) {
    this.orbitGroup.rotation.y += Moon.ORBIT_SPEED * delta;
    this.inner.update(delta);
  }

  public setDetail(isHighDetail: boolean) {
    super.setDetail(isHighDetail);
    this.inner.setDetail(isHighDetail);
  }

  public destroy() {
    this.inner.destroy();
    super.destroy();
  }
}
