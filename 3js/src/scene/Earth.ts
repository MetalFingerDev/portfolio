import * as THREE from "three";

export const EARTH_RADIUS = 1;
export const EARTH_RADIUS_KM = 6371;
export const DEFAULT_CLOUD_ALTITUDE_KM = 12;
export const ATMOSPHERE_HEIGHT_KM = 100;

function getFresnelMat() {
  return new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(0x0066ff) } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        float fresnel = 1.0 - dot(vNormal, vec3(0,0,1));
        float intensity = pow(fresnel, 2.0) * 0.8;
        float radius = length(vPosition);
        float height = radius - 1.0;
        float maxHeight = 0.0157;
        float normalizedHeight = clamp(height / maxHeight, 0.0, 1.0);
        float heightAlpha = pow(1.0 - normalizedHeight, 3.0);
        vec3 atmosphereColor = color * intensity * heightAlpha;
        gl_FragColor = vec4(atmosphereColor, intensity * heightAlpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
}

export default class Earth {
  mesh!: THREE.Mesh;
  group: THREE.Group;
  cloudsMesh: THREE.Mesh | null = null;
  lightsMesh: THREE.Mesh | null = null;
  glowMesh: THREE.Mesh | null = null;
  sunPositionRef: THREE.Vector3 | null = null;
  static RADIUS = EARTH_RADIUS;
  static ROTATION_SPEED = 0.1;

  constructor(
    scene: THREE.Scene,
    cloudAltitudeKm: number = DEFAULT_CLOUD_ALTITUDE_KM
  ) {
    this.group = new THREE.Group();
    this.createEarthMesh();
    this.createLightsMesh();
    this.createCloudsMesh(cloudAltitudeKm);
    this.createGlowMesh();
    scene.add(this.group);
    this.group.rotation.z = THREE.MathUtils.degToRad(23.44);
  }

  private createEarthMesh() {
    const geo = new THREE.IcosahedronGeometry(EARTH_RADIUS, 12);
    const mat = new THREE.MeshStandardMaterial();
    this.loadTexture("../texture/earth.jpg", (tex) => {
      this.applySRGB(tex);
      mat.map = tex;
      mat.needsUpdate = true;
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.group.add(this.mesh);
  }

  private createLightsMesh() {
    const geo = new THREE.IcosahedronGeometry(EARTH_RADIUS * 1.002, 12);
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      opacity: 1,
    });
    this.loadTexture("../texture/03_earthlights1k.png", (tex) => {
      this.applySRGB(tex);
      mat.map = tex;
      mat.needsUpdate = true;
    });
    this.lightsMesh = new THREE.Mesh(geo, mat);
    this.lightsMesh.renderOrder = 1;
    this.group.add(this.lightsMesh);
  }

  private createCloudsMesh(cloudAltitudeKm: number) {
    const cloudScale = 1 + cloudAltitudeKm / EARTH_RADIUS_KM;
    const geo = new THREE.IcosahedronGeometry(EARTH_RADIUS * cloudScale, 12);
    const mat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
      alphaTest: 0.05,
    });
    this.loadTexture("../texture/04_earthcloudmap.png", (tex) => {
      this.applySRGB(tex);
      mat.map = tex;
      mat.needsUpdate = true;
    });
    this.loadTexture("../texture/05_earthcloudmaptrans.png", (tex) => {
      mat.alphaMap = tex;
      mat.needsUpdate = true;
    });
    this.cloudsMesh = new THREE.Mesh(geo, mat);
    this.cloudsMesh.renderOrder = 2;
    this.group.add(this.cloudsMesh);
  }

  private createGlowMesh() {
    const geo = new THREE.IcosahedronGeometry(EARTH_RADIUS, 12);
    const mat = getFresnelMat();
    this.glowMesh = new THREE.Mesh(geo, mat);
    const scale = 1 + ATMOSPHERE_HEIGHT_KM / EARTH_RADIUS_KM;
    this.glowMesh.scale.setScalar(scale);
    this.glowMesh.renderOrder = 3;
    this.group.add(this.glowMesh);
  }

  private loadTexture(url: string, onLoad: (tex: THREE.Texture) => void) {
    const loader = new THREE.TextureLoader();
    const textureUrl = new URL(url, import.meta.url).href;
    loader.load(textureUrl, onLoad, undefined, (err) =>
      console.error(`Failed to load texture: ${textureUrl}`, err)
    );
  }

  private applySRGB(tex: THREE.Texture) {
    const t = tex as any;
    if (t.colorSpace !== undefined)
      t.colorSpace = (THREE as any).SRGBColorSpace;
    else if (t.encoding !== undefined) t.encoding = (THREE as any).sRGBEncoding;
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
    if (this.glowMesh) this.glowMesh.rotation.y += Earth.ROTATION_SPEED * delta;
  }
}
