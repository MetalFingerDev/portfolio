import * as THREE from "three";

export interface SunConfig {
  radius: number;
  color?: number;
  emissive?: number;
  detailed?: boolean; // If true, adds PointLight and axis
  rotationSpeed?: number;
  position?: THREE.Vector3;
}

export default class Sun {
  public sunGroup: THREE.Group;
  public sunMesh: THREE.Mesh;
  public sunLight?: THREE.PointLight;
  private rotationSpeed: number;

  constructor(parent: THREE.Group, config: SunConfig) {
    this.sunGroup = new THREE.Group();
    parent.add(this.sunGroup);

    this.rotationSpeed = config.rotationSpeed ?? 0.01;

    const segments = config.detailed ? 64 : 16;
    const geometry = new THREE.SphereGeometry(
      config.radius,
      segments,
      segments
    );

    const material = config.detailed
      ? new THREE.MeshStandardMaterial({
          emissive: 0xffcc33,
          emissiveIntensity: 2,
          color: 0x000000,
        })
      : new THREE.MeshBasicMaterial({
          color: config.color ?? 0xffffff,
          toneMapped: false,
        });

    this.sunMesh = new THREE.Mesh(geometry, material);

    if (config.position) {
      this.sunMesh.position.copy(config.position);
    }

    this.sunGroup.add(this.sunMesh);

    if (config.detailed) {
      this.sunLight = new THREE.PointLight(0xffffff, 600, 0, 0.5);

      this.sunLight.castShadow = true;
      this.sunLight.shadow.mapSize.set(2048, 2048);
      this.sunLight.shadow.camera.far = 2000000;

      this.sunLight.position.copy(this.sunMesh.position);
      this.sunGroup.add(this.sunLight);
      this.sunMesh.material = new THREE.MeshStandardMaterial({
        emissive: 0xffcc33,
        emissiveIntensity: 3,
        toneMapped: false,
      });

      this.addAxis(config.radius);
    }
  }

  private addAxis(radius: number) {
    const axisLen = radius * 2.2;
    const points = [
      new THREE.Vector3(0, axisLen / 2, 0),
      new THREE.Vector3(0, -axisLen / 2, 0),
    ];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.MeshStandardMaterial({
      emissive: 0xffcc33,
      emissiveIntensity: 2,
      color: 0x000000,
    });
    this.sunMesh.add(new THREE.Line(geom, mat));
  }

  public update(delta: number) {
    this.sunMesh.rotation.y += this.rotationSpeed * delta;
  }
}
