import * as THREE from "three";

// Units: 1 scene unit == 1 Earth radius (6371 km)
export const SUN_RADIUS = 109; // Sun radius in Earth-radius units
export const SUN_DISTANCE_UNITS = 23500; // Average Sun-Earth distance in Earth-radius units
export const DISTANCE_SCALE = 1; // change this to compress distances for visualization

export default class Sun {
  mesh: THREE.Mesh;
  light: THREE.DirectionalLight;
  corona: THREE.Sprite | null = null;
  static RADIUS = SUN_RADIUS;
  static ROTATION_SPEED = 0.004; // Realistic: ~1/25th of Earth's speed

  constructor(scene: THREE.Scene) {
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(Sun.RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0xffffff,
        roughness: 1,
        metalness: 0,
      })
    );
    this.mesh.position.set(SUN_DISTANCE_UNITS / DISTANCE_SCALE, 0, 0);
    this.mesh.castShadow = this.mesh.receiveShadow = false;
    scene.add(this.mesh);

    
    this.light = new THREE.DirectionalLight(0xffffff, 3);
    this.light.castShadow = false;
    this.light.layers.disable(1);
    this.light.target.position.set(-1, 0, 0);
    this.light.position.set(SUN_DISTANCE_UNITS / DISTANCE_SCALE, 0, 0);
    this.mesh.add(this.light.target);
    scene.add(this.light);

    this.mesh.layers.enable(1);
  }

  get position() {
    return this.mesh.position;
  }

  update(delta = 0.016) {
    this.mesh.rotation.y += Sun.ROTATION_SPEED * delta;
  }
}
