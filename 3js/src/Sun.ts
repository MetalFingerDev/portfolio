import * as THREE from "three";

export interface Configuration {
  radius?: number;
  detailed?: boolean;
  position?: THREE.Vector3;
  intensity?: number; // optional light intensity (for detailed mode)
}

export default class Sun {
  public group: THREE.Group;
  public mesh: THREE.Mesh;
  public light?: THREE.PointLight;
  private rotationSpeed: number;

  constructor(parent: THREE.Group, config: Configuration) {
    this.rotationSpeed = 0.01;
    this.group = new THREE.Group();
    parent.add(this.group);

    const detailed = config.detailed ?? true;
    const radius = config.radius ?? 20;
    const segments = detailed ? 64 : 8; // fewer segments for low-quality placeholder
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
    this.group.add(this.mesh);
    if (detailed) {
      const intensity = config.intensity ?? radius * 20;
      this.light = new THREE.PointLight(0xffffff, intensity, 0, 0.5);
      this.light.castShadow = true;
      this.light.shadow.mapSize.set(2048, 2048);
      this.light.shadow.camera.far = 2000000;
      this.light.position.copy(this.mesh.position);

      this.group.add(this.light);
      this.addAxis(radius);
    }
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

  public update(delta: number) {
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
