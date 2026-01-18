import * as THREE from 'three';
import { Region } from '@/void/regions';
import { GalaxyCluster } from './GalaxyCluster';
import { regionManager } from '@/void/regions';

/**
 * Laniakea (Immeasurable Heavens) Supercluster
 * A massive region containing multiple Galaxy Clusters arranged in filaments.
 */
export class Laniakea extends Region {
  constructor() {
    // Initialize the massive supercluster region
    super({
      name: 'Laniakea Supercluster',
      radius: 2000000, // 2 Million units scale
      entry: 2000000,
      exit: 2200000,
      debugShells: false,
    });

    this.setup();
  }

  private setup(): void {
    console.log(`[Laniakea] Initializing Supercluster Structure...`);

    const nodes = [
      { name: 'Virgo Cluster', x: 0, y: 0, z: 0, r: 150000, count: 50 },
      // The Great Attractor Region
      { name: 'Hydra-Centaurus', x: 400000, y: 100000, z: -200000, r: 250000, count: 80 },
      // Other major nodes
      { name: 'Pavo-Indus', x: -300000, y: -200000, z: 100000, r: 180000, count: 40 },
      { name: 'Coma Cluster', x: 100000, y: 600000, z: 50000, r: 200000, count: 60 },
      { name: 'Centaurus Cluster', x: 450000, y: 50000, z: -150000, r: 160000, count: 45 },
      { name: 'Norma Cluster', x: 600000, y: 150000, z: -300000, r: 140000, count: 35 },
    ];

    nodes.forEach((node) => {
      this.spawnCluster(node.name, node.x, node.y, node.z, node.r, node.count);
    });

    this.createFilament(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(400000, 100000, -200000),
      5 // number of intermediate nodes
    );

    this.createFilament(new THREE.Vector3(0, 0, 0), new THREE.Vector3(100000, 600000, 50000), 4);

    this.createCosmicWeb();
  }

  /**
   * Helper to instantiate a GalaxyCluster, position it in 3D space, and register it.
   */
  private spawnCluster(
    name: string,
    x: number,
    y: number,
    z: number,
    radius: number,
    count: number
  ): void {
    const cluster = new GalaxyCluster(name, radius, count);

    cluster.position.set(x, y, z);

    this.add(cluster);

    regionManager.register(cluster);

    console.log(`[Laniakea] Created ${name} at [${x}, ${y}, ${z}]`);
  }

  /**
   * Creates a string of smaller clusters between two points to simulate a filament.
   */
  private createFilament(start: THREE.Vector3, end: THREE.Vector3, segments: number): void {
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const pos = new THREE.Vector3().lerpVectors(start, end, t);

      // Add organic jitter so the line isn't perfectly straight
      pos.add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 60000,
          (Math.random() - 0.5) * 60000,
          (Math.random() - 0.5) * 60000
        )
      );

      this.spawnCluster(
        `Filament Node ${Math.floor(Math.random() * 1000)}`,
        pos.x,
        pos.y,
        pos.z,
        80000, // Smaller radius for filament nodes
        15 // Fewer galaxies per node
      );
    }
  }

  /**
   * Generates a massive point cloud to represent the intergalactic medium / dark matter web.
   */
  private createCosmicWeb(): void {
    const particleCount = 10000;
    const geom = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];

    const color1 = new THREE.Color(0x220044); // Dark void
    const color2 = new THREE.Color(0x6688ff); // Energetic web

    for (let i = 0; i < particleCount; i++) {
      // Random scatter within the supercluster volume
      const r = Math.pow(Math.random(), 1 / 3) * this.radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      // Color variation
      const c = color1.clone().lerp(color2, Math.random());
      colors.push(c.r, c.g, c.b);
    }

    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 4000,
      vertexColors: true,
      transparent: true,
      opacity: 0.1,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const web = new THREE.Points(geom, mat);
    web.name = 'CosmicWebViz';
    this.add(web);
  }

  /**
   * Cleanup: Unregister all child clusters when Laniakea is destroyed.
   */
  protected onDestroy(): void {
    this.children.forEach((c) => {
      // Check if the child is a GalaxyCluster (or generic Region) and unregister
      if (c instanceof GalaxyCluster) {
        regionManager.unregister(c);
      }
    });
    super.onDestroy();
  }

  protected onUpdate(delta: number): void {
    // Superclusters evolve on billion-year scales, so movement is imperceptible,
    // but we add a tiny drift for visual life.
    this.rotation.y += 0.00005 * delta;
  }
}
