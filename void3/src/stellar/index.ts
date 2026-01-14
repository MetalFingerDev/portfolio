import * as THREE from "three";

export default class Star extends THREE.Object3D {
  public luminosity: number;
  public light: THREE.PointLight;

  /**
   * @param luminosity Multiplier for light intensity
   * @param radius Visual radius of the star sphere
   * @param color Hex color for both mesh and light
   */
  constructor(
    luminosity = 1,
    radius = 1,
    color: number | THREE.Color = 0xffcc00
  ) {
    super();
    this.luminosity = luminosity;

    // visual sphere
    const geo = new THREE.SphereGeometry(radius, 24, 24);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "star-mesh";
    this.add(mesh);

    // add a point light so the star actually lights nearby objects
    this.light = new THREE.PointLight(
      color,
      Math.max(0.1, luminosity * 1.5),
      radius * 50
    );
    this.light.name = "star-light";
    this.add(this.light);
  }
}
