import * as THREE from "three";

export const EARTH_RADIUS = 1;
// Real Earth radius in kilometers — used to convert cloud altitude (km) into scene scale
export const EARTH_RADIUS_KM = 6371;
// Default cloud altitude in km (typical visible cloud tops ~12 km)
export const DEFAULT_CLOUD_ALTITUDE_KM = 12;

export default class Earth {
  mesh: THREE.Mesh;
  group: THREE.Group;
  cloudsMesh: THREE.Mesh | null = null;
  static RADIUS = EARTH_RADIUS;

  constructor(
    scene: THREE.Scene,
    cloudAltitudeKm: number = DEFAULT_CLOUD_ALTITUDE_KM
  ) {
    // Use a group so we can add layers (atmosphere/clouds) around the planet
    this.group = new THREE.Group();

    const geo = new THREE.IcosahedronGeometry(EARTH_RADIUS, 12);
    const loader = new THREE.TextureLoader();
    const textureUrl = new URL("../texture/00_earthmap1k.jpg", import.meta.url)
      .href;
    const mat = new THREE.MeshStandardMaterial({
      map: loader.load(textureUrl),
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // Clouds layer (slightly larger sphere)
    // Convert cloud altitude (km) to a scale factor relative to Earth's radius
    const cloudScale = 1 + cloudAltitudeKm / EARTH_RADIUS_KM;
    const cloudGeo = new THREE.IcosahedronGeometry(
      EARTH_RADIUS * cloudScale,
      12
    );
    const cloudMapUrl = new URL(
      "../texture/04_earthcloudmap.png",
      import.meta.url
    ).href;
    const cloudAlphaUrl = new URL(
      "../texture/05_earthcloudmaptrans.png",
      import.meta.url
    ).href;
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: loader.load(cloudMapUrl),
      alphaMap: loader.load(cloudAlphaUrl),
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
      alphaTest: 0.05,
    });
    this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudsMat);
    // ensure clouds render after earth and avoid z-fighting
    this.cloudsMesh.renderOrder = 1;
    this.group.add(this.cloudsMesh);

    scene.add(this.group);

    // tilt the whole planet+clouds group
    this.group.rotation.z = THREE.MathUtils.degToRad(23.44);
  }

  update(delta = 0.016) {
    const ROTATION_SPEED = 0.3;
    this.mesh.rotation.y += ROTATION_SPEED * delta;
    if (this.cloudsMesh) {
      // clouds move a bit faster to simulate upper-atmosphere wind
      this.cloudsMesh.rotation.y += ROTATION_SPEED * 1.2 * delta;
    }
  }
}
