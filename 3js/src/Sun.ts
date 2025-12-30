import * as THREE from "three";

import {
  SUN_DISTANCE_SCENE,
  SUN_RADIUS_SCENE,
  SUN_AXIS_TILT_DEG,
  SUN_ROTATION_SPEED,
  perSecondToPerDay,
} from "./units";

export default class Sun {
  sunMesh: THREE.Mesh;
  sunGroup: THREE.Group;
  sunLight: THREE.PointLight;
  static RADIUS = SUN_RADIUS_SCENE;
  static ROTATION_SPEED = perSecondToPerDay(SUN_ROTATION_SPEED);

  constructor(scene: THREE.Scene) {
    this.sunGroup = new THREE.Group();
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

    this.sunLight = new THREE.PointLight(0xffffff, 1000000000, 0, 2);
    this.sunGroup.add(this.sunLight);
    this.sunLight.position.copy(this.sunMesh.position);
    this.sunMesh.layers.enable(1);
  }

  update(delta = 0.016) {
    this.sunMesh.rotation.y += Sun.ROTATION_SPEED * delta;
  }
}

export function CloseSun(scene: THREE.Scene) {
  const sun = new Sun(scene);

  sun.sunMesh.rotation.z = THREE.MathUtils.degToRad(SUN_AXIS_TILT_DEG);

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
    sun.sunMesh.add(axis);
  }

  return sun;
}

export function DistantSun(
  scene: THREE.Scene,
  opts?: { color?: number; radiusScale?: number; distanceScale?: number }
) {
  const color = opts?.color ?? 0xffee88;
  const radiusScale = opts?.radiusScale ?? 0.002; // relative to SUN_RADIUS_SCENE
  const distanceScale = opts?.distanceScale ?? 5; // placed at SUN_DISTANCE_SCENE * distanceScale

  const group = new THREE.Group();
  scene.add(group);

  const radius = SUN_RADIUS_SCENE * radiusScale;
  const geom = new THREE.SphereGeometry(Math.max(0.001, radius), 16, 16);
  const mat = new THREE.MeshBasicMaterial({ color, toneMapped: false });
  const mesh = new THREE.Mesh(geom, mat);
  group.add(mesh);

  mesh.position.set(SUN_DISTANCE_SCENE * distanceScale, 0, 0);

  return {
    group,
    mesh,
    update(delta = 0.016) {
      mesh.rotation.y += 0.1 * delta;
    },
  };
}
