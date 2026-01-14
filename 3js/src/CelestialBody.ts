import * as THREE from "three";
import { toSceneUnits } from "./conversions";
import type { ICelestialBody } from "./config";

export interface BodyParams {
  name: string;
  radiusMeters: number;
  texturePath?: string;
  bumpPath?: string;
  color?: number;
  rotationSpeed?: number;
  emissive?: number;
  intensity?: number; // optional light intensity (for stars)
}

export default class CelestialBody implements ICelestialBody {
  public group: THREE.Group = new THREE.Group();
  private highDetail: THREE.Group = new THREE.Group();
  private lowDetail: THREE.Group = new THREE.Group();
  private mesh!: THREE.Mesh;

  // Expose groups and mesh for wrappers to augment
  public getHighDetailGroup() {
    return this.highDetail;
  }
  public getLowDetailGroup() {
    return this.lowDetail;
  }
  public getMesh() {
    return this.mesh;
  }
  private rotationSpeed: number;
  private light?: THREE.PointLight;

  constructor(params: BodyParams, ratio: number) {
    this.rotationSpeed = params.rotationSpeed ?? 0.01;
    this.group.name = params.name;
    this.group.add(this.highDetail, this.lowDetail);

    const sceneRadius = toSceneUnits(params.radiusMeters, ratio);
    // store base size for centralized scaling decisions
    (this.group.userData as any).baseSize = sceneRadius;

    // High detail
    const loader = new THREE.TextureLoader();
    const geo = new THREE.SphereGeometry(sceneRadius, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
      color: params.color ?? 0xffffff,
      map: params.texturePath ? loader.load(params.texturePath) : undefined,
      bumpMap: params.bumpPath ? loader.load(params.bumpPath) : undefined,
      bumpScale: 2,
    } as any);

    this.mesh = new THREE.Mesh(geo, mat);
    this.highDetail.add(this.mesh);

    // optional emissive light (for stars)
    if (params.intensity) {
      this.light = new THREE.PointLight(0xffffff, params.intensity, 0, 0.5);
      this.light.position.copy(this.mesh.position);
      (this.light as any).castShadow = false;
      this.highDetail.add(this.light);
    }

    // Low detail (proxy)
    const proxyGeo = new THREE.SphereGeometry(
      Math.max(0.25, sceneRadius * 0.5),
      8,
      8
    );
    const proxyMat = new THREE.MeshBasicMaterial({
      color: params.color ?? 0x4444ff,
      transparent: true,
      opacity: 0.85,
    });
    const proxy = new THREE.Mesh(proxyGeo, proxyMat);
    this.lowDetail.add(proxy);

    this.setDetail(false);
  }

  public setDetail(isHigh: boolean) {
    this.highDetail.visible = isHigh;
    this.lowDetail.visible = !isHigh;
    (this.group.userData as any).detailIsHigh = !!isHigh;
  }

  public update(delta: number) {
    if (this.highDetail.visible) {
      this.mesh.rotation.y += this.rotationSpeed * delta;
    }
  }

  public destroy() {
    this.highDetail.traverse((o: any) => {
      try {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material))
            o.material.forEach((m: any) => m.dispose());
          else o.material.dispose();
        }
      } catch (e) {}
    });
    this.lowDetail.traverse((o: any) => {
      try {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material))
            o.material.forEach((m: any) => m.dispose());
          else o.material.dispose();
        }
      } catch (e) {}
    });
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
