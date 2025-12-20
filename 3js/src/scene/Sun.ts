import * as THREE from "three";

export const SUN_RADIUS = 109;

export default class Sun {
  mesh: THREE.Mesh;
  corona: THREE.Sprite;
  light: THREE.DirectionalLight;
  static RADIUS = SUN_RADIUS;

  constructor(scene: THREE.Scene) {
    // Core: opaque PBR with emissive color (keeps visible emissive term)
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(Sun.RADIUS, 64, 64),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        emissive: 0xffffff,
        emissiveIntensity: 6,
        roughness: 1,
        metalness: 0,
        transparent: false,
        opacity: 1,
        side: THREE.DoubleSide,
      })
    );
    this.mesh.position.set(23500, 0, 0);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    scene.add(this.mesh);

    // Use a directional light to simulate sunlight coming from a far distance
    const FIXED_SUN_INTENSITY = 3.5;
    this.light = new THREE.DirectionalLight(0xffffff, FIXED_SUN_INTENSITY);
    this.light.castShadow = false;
    this.light.position.copy(this.mesh.position);
    // Ensure the sun (layer 1) isn't affected by this light
    this.light.layers.disable(1);
    // Directional lights point at their target — make the target relative to the sun
    this.light.target.position.set(-1, 0, 0);
    scene.add(this.light);
    // Attach the target to the sun mesh so it follows the sun's transform
    this.mesh.add(this.light.target);

    // Corona: minimal canvas-gradient texture for a soft, realistic halo
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,220,1)");
    g.addColorStop(0.3, "rgba(255,200,120,0.6)");
    g.addColorStop(0.6, "rgba(255,120,60,0.18)");
    g.addColorStop(1, "rgba(255,120,60,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    // Prefer sRGB encoding when available (some @types/three versions don't list it)
    if ((THREE as any).sRGBEncoding !== undefined) {
      (tex as any).encoding = (THREE as any).sRGBEncoding;
    }

    // Use a camera-facing sprite for the corona so it looks consistent from any angle
    const spriteMat = new THREE.SpriteMaterial({
      map: tex,
      color: 0xffffcf,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      // Enable depthTest so the corona is occluded by nearer objects (e.g., the Earth)
      depthTest: true,
    });
    this.corona = new THREE.Sprite(spriteMat);
    // Size sprite so its visible halo matches previous sphere diameter (~1.9*radius * 2)
    const diameter = Sun.RADIUS * 1.9 * 2;
    this.corona.scale.set(diameter, diameter, 1);
    // No forced renderOrder so standard depth sorting/occlusion applies
    // Attach corona to the sun so it follows position automatically
    this.mesh.add(this.corona);

    this.mesh.layers.enable(1);
  }

  get position() {
    return this.mesh.position;
  }
  update() {
    this.light.position.copy(this.mesh.position);
    // Target is attached to the mesh; no need to reset its position here
  }
}
