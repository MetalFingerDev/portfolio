import * as THREE from "three";
import {
  MOON_RADIUS,
  MOON_ROTATION,
  MOON_ORBIT_INCLINATION_DEG,
  MOON_ORBIT_SPEED,
  MOON_DISTANCE_SCENE,
  MOON_AXIS_TILT_DEG,
  perSecondToPerDay,
} from "./conversions";
import type { ICelestialBody } from "./config";

export default class Moon implements ICelestialBody {
  public group: THREE.Group = new THREE.Group();
  private highDetailGroup: THREE.Group = new THREE.Group();
  private lowDetailGroup: THREE.Group = new THREE.Group();
  private orbitGroup: THREE.Group = new THREE.Group();

  private moonMesh!: THREE.Mesh;

  static RADIUS = MOON_RADIUS;
  static ROTATION_SPEED = perSecondToPerDay(MOON_ROTATION);
  static ORBIT_SPEED = perSecondToPerDay(MOON_ORBIT_SPEED);
  static ORBIT_INCLINATION_DEG = MOON_ORBIT_INCLINATION_DEG;

  constructor(scene: THREE.Scene, parentGroup?: THREE.Group, ratio = 1) {
    // Top-level group contains orbit and detail groups
    this.group.add(this.orbitGroup);
    this.orbitGroup.rotation.x = THREE.MathUtils.degToRad(
      Moon.ORBIT_INCLINATION_DEG
    );

    this.orbitGroup.add(this.highDetailGroup, this.lowDetailGroup);

    // Attach to scene or parent
    (parentGroup || scene).add(this.group);

    const loader = new THREE.TextureLoader();

    const moonTex = loader.load("MOON.png");
    const moonBump = loader.load("MOON_bump.png");
    const moonGeometry = new THREE.SphereGeometry(Moon.RADIUS * ratio, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTex,
      bumpMap: moonBump,
      bumpScale: 2,
      roughness: 0.9,
      metalness: 0,
    });

    this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    this.moonMesh.rotation.z = THREE.MathUtils.degToRad(MOON_AXIS_TILT_DEG);
    this.moonMesh.position.set(0, 0, -MOON_DISTANCE_SCENE * ratio);
    this.highDetailGroup.add(this.moonMesh);

    // Axis visual
    const axisLen = Moon.RADIUS * ratio * 2.2;
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
    this.moonMesh.add(axis);

    // Orbit ring
    const segments = 128;
    const positions = new Float32Array(segments * 3);
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.sin(t) * MOON_DISTANCE_SCENE * ratio;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.cos(t) * MOON_DISTANCE_SCENE * ratio;
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

    // Low-detail representation: small sphere
    const lowGeom = new THREE.SphereGeometry(
      Math.max(0.5, Moon.RADIUS * ratio * 0.5),
      8,
      8
    );
    const lowMat = new THREE.MeshBasicMaterial({ color: 0x8888aa });
    const lowMesh = new THREE.Mesh(lowGeom, lowMat);
    lowMesh.position.copy(this.moonMesh.position);
    this.lowDetailGroup.add(lowMesh);

    // Default: high detail visible
    // Store base size for centralized scaling
    this.group.userData.baseSize = Moon.RADIUS * ratio;

    this.setDetail(true);
  }

  public setDetail(isHighDetail: boolean) {
    this.highDetailGroup.visible = isHighDetail;
    this.lowDetailGroup.visible = !isHighDetail;
  }

  public update(delta = 0.016) {
    this.orbitGroup.rotation.y += Moon.ORBIT_SPEED * delta;
    if (this.highDetailGroup.visible) {
      this.moonMesh.rotation.y += Moon.ROTATION_SPEED * delta;
    }
  }

  public destroy() {
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
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
