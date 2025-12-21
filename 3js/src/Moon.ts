import * as THREE from "three";
import {
  MOON_RADIUS,
  MOON_ROTATION,
  MOON_ORBIT_INCLINATION_DEG,
  MOON_ORBIT_SPEED,
  MOON_DISTANCE_SCENE,
  MOON_AXIS_TILT_DEG,
  perSecondToPerDay,
} from "./units";

export default class Moon {
  moonMesh: THREE.Mesh;
  moonGroup: THREE.Group;
  orbitGroup: THREE.Group;
  static RADIUS = MOON_RADIUS;
  static ROTATION_SPEED = perSecondToPerDay(MOON_ROTATION);
  static ORBIT_SPEED = perSecondToPerDay(MOON_ORBIT_SPEED);
  static ORBIT_INCLINATION_DEG = MOON_ORBIT_INCLINATION_DEG;

  constructor(scene: THREE.Scene, parentGroup?: THREE.Group) {
    this.orbitGroup = new THREE.Group();
    (parentGroup || scene).add(this.orbitGroup);
    this.orbitGroup.rotation.x = THREE.MathUtils.degToRad(
      Moon.ORBIT_INCLINATION_DEG
    );

    this.moonGroup = new THREE.Group();
    this.orbitGroup.add(this.moonGroup);

    const loader = new THREE.TextureLoader();

    const moonTex = loader.load("MOON.png");
    const moonBump = loader.load("MOON_bump.png");
    const moonGeometry = new THREE.SphereGeometry(Moon.RADIUS, 64, 64);
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTex,
      bumpMap: moonBump,
      bumpScale: 2,
      roughness: 0.9,
      metalness: 0,
    });

    this.moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    this.moonMesh.rotation.z = THREE.MathUtils.degToRad(MOON_AXIS_TILT_DEG);
    this.moonGroup.add(this.moonMesh);

    this.moonMesh.position.set(0, 0, -MOON_DISTANCE_SCENE);
    {
      const axisLen = Moon.RADIUS * 2.2;
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
    }

    // simple orbit visualization (line loop) added to orbit group
    {
      const segments = 128;
      const positions = new Float32Array(segments * 3);
      for (let i = 0; i < segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        positions[i * 3] = Math.sin(t) * MOON_DISTANCE_SCENE;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.cos(t) * MOON_DISTANCE_SCENE;
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
    }
  }

  // orbit the moon (rotate the orbit group) and spin the moon (self rotation)
  update(delta = 0.016) {
    // orbit around parent in the inclined plane
    this.orbitGroup.rotation.y += Moon.ORBIT_SPEED * delta;
    // self-rotation (tidally locked — same average angular speed as orbit)
    this.moonMesh.rotation.y += Moon.ROTATION_SPEED * delta;
  }
}
