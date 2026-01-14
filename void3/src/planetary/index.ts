import * as THREE from "three";

// Basic constants to convert physical units into scene units
const EARTH_RADIUS_M = 6371000;
const AU_METERS = 149597870700;
const AU_SCENE = Math.round(AU_METERS / EARTH_RADIUS_M); // ~23454

export interface PlanetConfig {
  name: string;
  radiusMeters: number; // physical radius
  distanceAU?: number; // semi-major axis
  eccentricity?: number;
  angleDeg?: number;
  rotationSpeedRadPerSec?: number; // radians per second
  obliquityDeg?: number; // axial tilt

  // visuals
  texturePath?: string;
  color?: number;

  // optional effects
  hasAtmosphere?: boolean;
  hasClouds?: boolean;
  cloudMapPath?: string;
  cloudAlphaPath?: string;
}

export default class Planet extends THREE.Object3D {
  public radius: number; // scene radius
  private inner: THREE.Group;
  private highMesh: THREE.Mesh;
  private placeholder: THREE.Mesh;
  private cloudsMesh?: THREE.Mesh;
  private atmosphereMesh?: THREE.Mesh;
  private rotationSpeed = 0;
  public name: string;

  constructor(config: PlanetConfig, ratio = 1, parent?: THREE.Group) {
    super();
    this.name = config.name;

    // Convert physical radius to scene units (in Earth radii)
    const sceneRadius = config.radiusMeters / EARTH_RADIUS_M / ratio;
    this.radius = sceneRadius;

    this.inner = new THREE.Group();
    this.add(this.inner);

    // High-detail mesh
    const geo = new THREE.SphereGeometry(sceneRadius, 32, 32);
    const mat = new THREE.MeshStandardMaterial({
      color: config.color ?? 0xffffff,
      map: config.texturePath
        ? new THREE.TextureLoader().load(config.texturePath)
        : undefined,
    });
    this.highMesh = new THREE.Mesh(geo, mat);
    this.highMesh.name = `${this.name}-mesh`;
    this.inner.add(this.highMesh);

    // Placeholder / low-detail representation
    const phGeo = new THREE.SphereGeometry(
      Math.max(0.5, sceneRadius * 0.25),
      8,
      8
    );
    const phMat = new THREE.MeshBasicMaterial({
      color: config.color ?? 0xffffff,
    });
    this.placeholder = new THREE.Mesh(phGeo, phMat);
    this.placeholder.name = `${this.name}-placeholder`;
    this.placeholder.visible = false; // default to high-detail
    this.add(this.placeholder);

    // Clouds
    if (config.hasClouds && config.cloudMapPath) {
      const cloudsMat = new THREE.MeshStandardMaterial({
        map: new THREE.TextureLoader().load(config.cloudMapPath),
        alphaMap: config.cloudAlphaPath
          ? new THREE.TextureLoader().load(config.cloudAlphaPath)
          : undefined,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      });
      this.cloudsMesh = new THREE.Mesh(
        new THREE.SphereGeometry(sceneRadius * 1.01, 32, 32),
        cloudsMat
      );
      this.inner.add(this.cloudsMesh);
    }

    // Atmosphere: simple transparent shell
    if (config.hasAtmosphere) {
      const atmMat = new THREE.MeshBasicMaterial({
        color: 0x88ccee,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      });
      this.atmosphereMesh = new THREE.Mesh(
        new THREE.SphereGeometry(sceneRadius * 1.02, 16, 16),
        atmMat
      );
      this.inner.add(this.atmosphereMesh);
    }

    // Apply axial tilt
    if (typeof config.obliquityDeg === "number") {
      this.rotation.z = THREE.MathUtils.degToRad(config.obliquityDeg);
    }

    // Rotation speed
    if (typeof config.rotationSpeedRadPerSec === "number") {
      this.rotationSpeed = config.rotationSpeedRadPerSec;
    }

    // Orbit / Positioning
    if (parent && typeof config.distanceAU === "number") {
      const a = (config.distanceAU * AU_SCENE) / ratio;
      const angle = THREE.MathUtils.degToRad(config.angleDeg || 0);
      this.position.set(a * Math.cos(angle), 0, a * Math.sin(angle));
      parent.add(this);
    } else if (typeof config.distanceAU === "number") {
      const a = (config.distanceAU * AU_SCENE) / ratio;
      const angle = THREE.MathUtils.degToRad(config.angleDeg || 0);
      this.position.set(a * Math.cos(angle), 0, a * Math.sin(angle));
    }

    // Simple label as a sprite (so we don't depend on external label utilities)
    const labelSprite = createTextSprite(this.name, {
      fontSize: 24,
      color: "white",
    });
    labelSprite.position.set(0, sceneRadius * 2.5, 0);
    this.add(labelSprite);

    // Default to high-detail
    this.setDetail(true);
  }

  public setDetail(isHighDetail: boolean) {
    this.inner.visible = isHighDetail;
    this.placeholder.visible = !isHighDetail;
  }

  public update(delta: number) {
    // Rotate planet and clouds
    this.inner.rotation.y += this.rotationSpeed * delta;
    if (this.cloudsMesh)
      this.cloudsMesh.rotation.y += this.rotationSpeed * delta * 1.2;
  }

  public destroy() {
    // Dispose geometries and materials
    [
      this.highMesh,
      this.placeholder,
      this.cloudsMesh,
      this.atmosphereMesh,
    ].forEach((m) => {
      if (!m) return;
      if ((m.geometry as any)?.dispose) (m.geometry as any).dispose();
      const mat = m.material as any;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose && x.dispose());
      else mat?.dispose && mat.dispose();
    });

    this.inner.clear();
    this.placeholder.clear();
    this.removeFromParent();
  }
}

/**
 * Helper: create a simple sprite with text using a canvas texture.
 * Keeps us self-contained without adding new dependencies.
 */
function createTextSprite(
  text: string,
  opts: { fontSize?: number; color?: string } = {}
) {
  const fontSize = opts.fontSize ?? 32;
  const color = opts.color ?? "white";

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = `${fontSize}px sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + 16;
  const h = fontSize + 16;
  canvas.width = w;
  canvas.height = h;

  // background transparent
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = color;
  ctx.fillText(text, 8, fontSize + 2);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(w / 100, h / 100, 1);
  return spr;
}
