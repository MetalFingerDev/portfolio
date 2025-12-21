import * as THREE from "three";

export const EARTH_RADIUS = 1;
export const EARTH_RADIUS_KM = 6371;

export default class Earth {
  earthMesh: THREE.Mesh;
  earthGroup: THREE.Group;
  cloudsMesh: THREE.Mesh | null = null;
  lightsMesh: THREE.Mesh | null = null;
  static RADIUS = EARTH_RADIUS;
  static ROTATION_SPEED = 0.1;

  constructor(scene: THREE.Scene) {
    this.earthGroup = new THREE.Group();

    const loader = new THREE.TextureLoader();
    const earthTex = loader.load("earth.jpg");
    const lightsTex = loader.load("03_earthlights1k.png");
    const cloudsTex = loader.load("04_earthcloudmap.png");
    const cloudsAlpha = loader.load("05_earthcloudmaptrans.png");

    // Create Earth mesh
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTex });
    this.earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    this.earthGroup.add(this.earthMesh);

    // Create lights (night map)
    const lightsGeometry = new THREE.SphereGeometry(
      EARTH_RADIUS * 1.002,
      64,
      64
    );
    const lightsMaterial = new THREE.MeshBasicMaterial({
      map: lightsTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      opacity: 0.6,
    });
    this.lightsMesh = new THREE.Mesh(lightsGeometry, lightsMaterial);
    this.lightsMesh.renderOrder = 1;
    this.earthGroup.add(this.lightsMesh);

    // Create clouds mesh
    const cloudScale = 1 + 12 / EARTH_RADIUS_KM;
    const cloudsGeometry = new THREE.SphereGeometry(
      EARTH_RADIUS * cloudScale,
      64,
      64
    );
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: cloudsTex,
      alphaMap: cloudsAlpha,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    this.cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    this.cloudsMesh.renderOrder = 2;
    this.earthGroup.add(this.cloudsMesh);

    // Add to scene and set axial tilt
    scene.add(this.earthGroup);
    this.earthGroup.rotation.z = THREE.MathUtils.degToRad(23.44);
  }

  update(delta = 0.016) {
    this.earthMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.lightsMesh)
      this.lightsMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.cloudsMesh)
      this.cloudsMesh.rotation.y += Earth.ROTATION_SPEED * 1.2 * delta;
  }
}
