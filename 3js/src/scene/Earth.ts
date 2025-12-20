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
  lightsMesh: THREE.Mesh | null = null;
  sunPositionRef: THREE.Vector3 | null = null;
  static RADIUS = EARTH_RADIUS;
  static ROTATION_SPEED = 0.1;

  constructor(
    scene: THREE.Scene,
    cloudAltitudeKm: number = DEFAULT_CLOUD_ALTITUDE_KM
  ) {
    // Use a group so we can add layers (atmosphere/clouds) around the planet
    this.group = new THREE.Group();

    const geo = new THREE.IcosahedronGeometry(EARTH_RADIUS, 12);
    const loader = new THREE.TextureLoader();
    const applySRGB = (tex: THREE.Texture) => {
      const t = tex as any;
      if (t.colorSpace !== undefined)
        t.colorSpace = (THREE as any).SRGBColorSpace;
      else if (t.encoding !== undefined)
        t.encoding = (THREE as any).sRGBEncoding;
    };
    const textureUrl = new URL("../texture/earth.jpg", import.meta.url).href;
    const mat = new THREE.MeshStandardMaterial();
    // Load the color map and make sure it's treated as sRGB
    loader.load(
      textureUrl,
      (tex) => {
        applySRGB(tex);
        mat.map = tex;
        mat.needsUpdate = true;
      },
      undefined,
      (err) => console.error("Failed to load Earth texture:", textureUrl, err)
    );
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);

    // City lights layer — simple texture overlay
    const lightsGeo = new THREE.IcosahedronGeometry(EARTH_RADIUS * 1.002, 12);
    const lightsMat = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      opacity: 1,
    });
    const lightsUrl = new URL(
      "../texture/03_earthlights1k.png",
      import.meta.url
    ).href;
    // load lights texture and apply directly to the material
    loader.load(
      lightsUrl,
      (tex) => {
        applySRGB(tex);
        lightsMat.map = tex;
        lightsMat.needsUpdate = true;
      },
      undefined,
      (err) =>
        console.error(
          "Failed to load Earth city lights texture:",
          lightsUrl,
          err
        )
    );
    this.lightsMesh = new THREE.Mesh(lightsGeo, lightsMat);
    // Render after earth but before clouds
    this.lightsMesh.renderOrder = 1;
    this.group.add(this.lightsMesh);

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
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
      alphaTest: 0.05,
    });
    // Load cloud color map (sRGB) and alpha map separately
    loader.load(
      cloudMapUrl,
      (tex) => {
        applySRGB(tex);
        cloudsMat.map = tex;
        cloudsMat.needsUpdate = true;
      },
      undefined,
      (err) => console.error("Failed to load cloud map:", cloudMapUrl, err)
    );
    loader.load(
      cloudAlphaUrl,
      (tex) => {
        cloudsMat.alphaMap = tex;
        cloudsMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.error("Failed to load cloud alpha map:", cloudAlphaUrl, err);
      }
    );
    this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudsMat);
    // ensure clouds render after earth and avoid z-fighting
    this.cloudsMesh.renderOrder = 2;
    this.group.add(this.cloudsMesh);

    scene.add(this.group);

    // tilt the whole planet+clouds group
    this.group.rotation.z = THREE.MathUtils.degToRad(23.44);
  }

  setSunPosition(sunPos: THREE.Vector3) {
    this.sunPositionRef = sunPos;
  }

  update(delta = 0.016) {
    this.mesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.lightsMesh)
      this.lightsMesh.rotation.y += Earth.ROTATION_SPEED * delta;
    if (this.cloudsMesh)
      this.cloudsMesh.rotation.y += Earth.ROTATION_SPEED * 1.2 * delta;
  }
}
