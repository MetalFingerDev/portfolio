import * as THREE from "three";
import { Region, type CelestialBody } from "./Region";
import { LocalFluff } from "./LocalFluff";
import { MilkyWay } from "./MilkyWay";

function createRadialTexture(color: number, size = 256): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grd = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  const col = new THREE.Color(color);
  const css = `rgba(${Math.floor(col.r * 255)}, ${Math.floor(
    col.g * 255
  )}, ${Math.floor(col.b * 255)},`;
  grd.addColorStop(0, `${css}0.9)`);
  grd.addColorStop(0.4, `${css}0.5)`);
  grd.addColorStop(1, `${css}0)`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Simple cylinder-based galaxy used only for visualization (e.g., Andromeda)
 */
class SimpleGalaxy extends Region implements CelestialBody {
  public mesh: THREE.Mesh;

  constructor(name: string, radius: number, thickness: number, color: number) {
    super();
    this.name = name;

    const geometry = new THREE.CylinderGeometry(radius, radius, thickness, 64);
    const material = new THREE.MeshStandardMaterial({
      color,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.8,
      metalness: 0.0,
      roughness: 1.0,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.add(this.mesh);

    // Add a soft point light at the galaxy center to create a glow
    const glow = new THREE.PointLight(
      color,
      0.7,
      Math.max(radius * 0.8, 50000),
      2
    );
    glow.name = `${name}-glow`;
    this.add(glow);

    // Add a subtle halo sprite behind the galaxy for a bloom-like look
    const spriteMat = new THREE.SpriteMaterial({
      map: createRadialTexture(color),
      color: 0xffffff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.6,
      depthWrite: false,
    });
    const halo = new THREE.Sprite(spriteMat);
    halo.name = `${name}-halo`;
    const haloSize = radius * 1.2;
    halo.scale.set(haloSize, haloSize, 1);
    halo.position.set(0, 0, 0);
    this.add(halo);

    // Register self as a body for Region lifecycle methods
    this.bodies.push(this);
  }

  setDetail(_isHighDetail: boolean): void {}
  update(delta: number): void {
    // Slight slow tumble
    this.rotation.y += 0.00008 * delta;
  }

  destroy(): void {
    if (this.parent) this.parent.remove(this);
    this.traverse((child) => {
      if ((child as any).isMesh || (child as any).isSprite) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            (mesh.material as THREE.Material[]).forEach((m: any) => {
              try {
                if (m.map) m.map.dispose();
              } catch (e) {}
              try {
                m.dispose();
              } catch (e) {}
            });
          } else {
            try {
              if ((mesh.material as any).map)
                (mesh.material as any).map.dispose();
            } catch (e) {}
            try {
              (mesh.material as THREE.Material).dispose();
            } catch (e) {}
          }
        }
      }
    });
  }
}

/**
 * LocalGroup region that contains the Milky Way and a nearby galaxy (Andromeda-like),
 * with a surrounding LocalFluff representing intergalactic stars.
 */
export class LocalGroup extends Region {
  public milkyWay: MilkyWay;
  public neighbor: SimpleGalaxy;
  public fluff: LocalFluff;

  // Real-world-ish ratio: distance between MW and Andromeda ~50× the galactic disk radius
  public static readonly GALAXY_SEPARATION_RATIO = 50;

  constructor(cfg?: any) {
    super(cfg);
    this.name = "LocalGroup";

    // Primary: a full MilkyWay instance
    this.milkyWay = new MilkyWay();

    // Try to read the MilkyWay radius from its geometry; fall back to the known value
    const mwRadius =
      (this.milkyWay as any).mesh?.geometry?.parameters?.radius ||
      (this.milkyWay as any).mesh?.geometry?.parameters?.radiusTop ||
      400000;

    const ratio = LocalGroup.GALAXY_SEPARATION_RATIO;
    const separation = mwRadius * ratio;

    // Position the two galaxies relative to the LocalGroup center
    // Put Milky Way a half separation to the left and the neighbor to the right
    this.milkyWay.position.set(-separation / 2, 0, 0);
    this.add(this.milkyWay);
    this.bodies.push(this.milkyWay);

    // Neighbor: simple cylinder-based galaxy (visual only)
    const thickness = 20000;
    this.neighbor = new SimpleGalaxy(
      "Andromeda",
      mwRadius,
      thickness,
      0xffcccc
    );
    this.neighbor.position.set(separation / 2, 0, 0);
    this.add(this.neighbor);
    this.bodies.push(this.neighbor);

    // Local fluff (intergalactic stars) spanning the region between and around the galaxies
    const fluffInner = mwRadius * 2; // avoids being right on top of galaxy discs
    const fluffOuter = separation * 1.1; // reach slightly beyond the neighbor
    this.fluff = new LocalFluff(fluffInner, fluffOuter, 800);
    this.add(this.fluff);
    this.bodies.push(this.fluff);
  }

  setDetail(isHighDetail: boolean): void {
    this.bodies.forEach((b) => {
      try {
        if (b && typeof b.setDetail === "function") b.setDetail(isHighDetail);
      } catch (e) {
        /* defensive */
      }
    });
  }

  update(delta: number): void {
    this.bodies.forEach((b) => {
      try {
        if (b && typeof b.update === "function") b.update(delta);
      } catch (e) {
        /* defensive */
      }
    });
  }

  destroy(): void {
    this.bodies.forEach((b) => {
      try {
        if (b && typeof b.destroy === "function") b.destroy();
      } catch (e) {
        /* defensive */
      }
    });
    if (this.parent) this.parent.remove(this);
  }
}
