import * as THREE from "three";

export class Laniakea {
  public group: THREE.Group = new THREE.Group();

  constructor() {
    this.init();
  }

  private init() {
    // 1. The "Great Attractor" - A central soft glow
    const coreGeom = new THREE.SphereGeometry(50, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.2,
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    this.group.add(core);

    // 2. The Filaments (The "Vascular" look)
    // We create multiple "tendrils" that curve toward the center
    const particleCount = 50000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // Create a "branch" index
      const branch = i % 8;
      const t = Math.random(); // Distance along the filament

      // Parametric equation for a "feather" shape
      const angle = (branch * (Math.PI * 2)) / 8;
      const spread = Math.pow(t, 2) * 500; // Fans out as it gets further

      const x = Math.cos(angle) * t * 2000 + (Math.random() - 0.5) * spread;
      const y = Math.sin(angle) * t * 2000 + (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread * 0.5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color gradient: Brighter/Whiter near the core, Blue/Purple further out
      color.setHSL(0.6 + t * 0.1, 1.0, 0.5 + (1 - t) * 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending, // Makes it glow
      depthWrite: false,
    });

    const filaments = new THREE.Points(geometry, material);
    this.group.add(filaments);

    // 3. Highlight "Home" (The Local Group position)
    const homeGeom = new THREE.SphereGeometry(10, 16, 16);
    const homeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const homeMarker = new THREE.Mesh(homeGeom, homeMat);
    homeMarker.position.set(400, 200, 50); // Offset from the Great Attractor
    this.group.add(homeMarker);
  }
}
