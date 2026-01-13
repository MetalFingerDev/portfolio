import * as THREE from "three";
import type { ICelestialBody } from "./config";

export interface Configuration {
  radius?: number;
  detailed?: boolean;
  position?: THREE.Vector3;
  intensity?: number;
}

export default class Sun implements ICelestialBody {
  public group: THREE.Group = new THREE.Group();
  private highDetailGroup: THREE.Group = new THREE.Group();
  private lowDetailGroup: THREE.Group = new THREE.Group();
  public mesh!: THREE.Mesh;
  public light?: THREE.PointLight;
  private rotationSpeed: number;

  constructor(_parent: THREE.Group | undefined, config: Configuration) {
    this.rotationSpeed = 0.01;
    this.group.add(this.highDetailGroup, this.lowDetailGroup);

    const detailed = config.detailed ?? true;
    const radius = config.radius ?? 20;
    const segments = detailed ? 64 : 8;
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const defaultColor = 0xffffff;
    const defaultEmissive = 0xffcc33;
    const material = detailed
      ? new THREE.MeshStandardMaterial({
          emissive: defaultEmissive,
          emissiveIntensity: 2,
          color: 0x000000,
          toneMapped: false,
        })
      : new THREE.MeshBasicMaterial({
          color: defaultColor,
          toneMapped: false,
        });
    this.mesh = new THREE.Mesh(geometry, material);
    if (config.position) {
      this.mesh.position.copy(config.position);
    }
    this.highDetailGroup.add(this.mesh);
    if (detailed) {
      const intensity = config.intensity ?? radius * 20;
      this.light = new THREE.PointLight(0xffffff, intensity, 0, 0.5);
      this.light.castShadow = true;
      this.light.shadow.mapSize.set(2048, 2048);
      this.light.shadow.camera.far = 2000000;
      this.light.position.copy(this.mesh.position);

      this.highDetailGroup.add(this.light);
      this.addAxis(radius);
    }

    
    const lowMat = new THREE.MeshBasicMaterial({
      color: defaultColor,
      toneMapped: false,
    });
    const lowGeo = new THREE.SphereGeometry(Math.max(4, radius * 0.6), 8, 8);
    const lowMesh = new THREE.Mesh(lowGeo, lowMat);
    this.lowDetailGroup.add(lowMesh);

    
    this.group.userData.baseSize = radius;

    this.setDetail(detailed);
  }

  private addAxis(radius: number) {
    const axisLen = radius * 2.2;
    const points = [
      new THREE.Vector3(0, axisLen / 2, 0),
      new THREE.Vector3(0, -axisLen / 2, 0),
    ];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffcc33,
      transparent: true,
      opacity: 0.9,
    });
    const line = new THREE.Line(geom, mat);
    this.mesh.add(line);
  }

  public setDetail(isHighDetail: boolean) {
    this.highDetailGroup.visible = isHighDetail;
    this.lowDetailGroup.visible = !isHighDetail;
  }

  public update(delta: number) {
    if (this.highDetailGroup.visible)
      this.mesh.rotation.y += this.rotationSpeed * delta;
  }

  public setIntensity(v: number) {
    if (this.light) this.light.intensity = v;
  }

  public destroy() {
    this.group.traverse((obj: any) => {
      if (obj.geometry) {
        try {
          obj.geometry.dispose();
        } catch (e) {}
      }
      if (obj.material) {
        try {
          if (Array.isArray(obj.material))
            obj.material.forEach((m: any) => m.dispose());
          else obj.material.dispose();
        } catch (e) {}
      }
      if (obj instanceof THREE.Light && obj.parent) {
        obj.parent.remove(obj);
      }
    });
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
