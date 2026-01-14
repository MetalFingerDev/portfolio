import * as THREE from "three";

export default class Star extends THREE.Object3D {
  public luminosity: number;
  public light: THREE.PointLight;

  /**
   * @param luminosity Multiplier for light intensity
   * @param radius Visual radius of the star sphere
   * @param color Hex color for both mesh and light
   * @param planets Optional array of planets to attach immediately
   */
  constructor(
    luminosity = 1,
    radius = 1,
    color: number | THREE.Color = 0xffcc00,
    planets: THREE.Object3D[] = []
  ) {
    super();
    this.luminosity = luminosity;

    // Default viewing distance for camera traversal
    (this as any).defaultViewDistance = radius * 3; // For stars, scale with radius

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

    // Add any planets passed during initialization
    if (planets.length > 0) {
      this.addPlanets(planets);
    }
  }

  /**
   * Helper to add planets to the Star's group/coordinate system
   */
  addPlanets(planets: THREE.Object3D[]) {
    planets.forEach((planet) => {
      this.add(planet);
    });
  }
}
