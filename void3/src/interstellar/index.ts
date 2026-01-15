import * as THREE from "three";

export default class InterstellarMedium extends THREE.Object3D {
  public density: number;

  /**
   * @param particleCount Number of dust particles
   * @param range The spread/volume of the medium (width/height/depth)
   * @param color Hex color of the dust
   */
  constructor(particleCount = 2000, range = 500, color = 0x8888cc) {
    super();
    this.density = particleCount / range;

    // 1. Create geometry for the particles
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Random distribution centered at (0,0,0)
      const x = (Math.random() - 0.5) * range;
      const y = (Math.random() - 0.5) * range;
      const z = (Math.random() - 0.5) * range;
      positions.push(x, y, z);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );

    // 2. Create a material that fades in the distance
    const material = new THREE.PointsMaterial({
      color: color,
      size: 0.8, // Base size of particles
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true, // Particles get smaller when further away
    });

    // 3. Create the mesh and add it to this object
    const points = new THREE.Points(geometry, material);
    points.name = "ism-dust";
    this.add(points);
  }
}
