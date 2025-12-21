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
  // rotation speed is provided as per-second in units; convert to per-day so delta (days) matches
  static ROTATION_SPEED = perSecondToPerDay(MOON_ROTATION);
  // orbital speed and inclination (per-day units to match update(delta) which is in days)
  static ORBIT_SPEED = perSecondToPerDay(MOON_ORBIT_SPEED);
  static ORBIT_INCLINATION_DEG = MOON_ORBIT_INCLINATION_DEG;

  constructor(scene: THREE.Scene, parentGroup?: THREE.Group) {
    // orbit group is centered on parent (Earth) — tilt it to set the orbital plane
    this.orbitGroup = new THREE.Group();
    (parentGroup || scene).add(this.orbitGroup);
    this.orbitGroup.rotation.x = THREE.MathUtils.degToRad(
      Moon.ORBIT_INCLINATION_DEG
    );

    // moon group contains the moon mesh and is positioned relative to the orbit center
    this.moonGroup = new THREE.Group();
    this.orbitGroup.add(this.moonGroup);

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
    // tilt the moon's axis slightly relative to its orbit
    this.moonMesh.rotation.z = THREE.MathUtils.degToRad(MOON_AXIS_TILT_DEG);
    // place moon at average distance along -Z relative to its moonGroup
    this.moonMesh.position.set(0, 0, -MOON_DISTANCE_SCENE);
    this.moonGroup.add(this.moonMesh);

    // Axis visual for Moon
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
