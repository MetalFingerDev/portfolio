import { Region } from '@/void/regions';
import { Star } from '@/void/stellar';

export class LocalFluff extends Region {
  private starCount: number;

  constructor(
    starCount: number = 300 // Default number of stars
  ) {
    super({
      name: 'Local Fluff',
      radius: 6.3241e8,
      debugShells: false, // Toggle to see the region boundaries
    });

    this.starCount = starCount;
    this.populate();
  }

  private populate(): void {
    const minDistance = 1000; // Safe zone radius around (0,0,0)
    const maxDistance = this.radius * 0.9; // Stay slightly within the boundary

    console.log(`[LocalFluff] Generating ${this.starCount} stars...`);

    for (let i = 0; i < this.starCount; i++) {
      // 1. Generate Random Position using Spherical Coordinates
      // This ensures uniform distribution and creates the hole in the center.
      const r = minDistance + Math.random() * (maxDistance - minDistance);
      const theta = Math.random() * Math.PI * 2; // Azimuth angle
      const phi = Math.acos(2 * Math.random() - 1); // Elevation angle

      // Convert to Cartesian (x, y, z)
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      // 2. Randomize Star Properties
      const color = this.getRandomStarColor();
      const size = 3 + Math.random() * 8; // Random size between 3 and 11
      const intensity = 5000 + Math.random() * 5000;

      // 3. Create the Star
      // We pass 'this' as parent, so it is automatically added to the Region group
      const star = new Star(this, `Fluff-Star-${i}`, intensity, size, color, false);

      // 4. Set Position
      // Because orbit is 0 and velocity is 0, the CelestialBody update loop
      // will NOT overwrite this position.
      star.position.set(x, y, z);
    }
  }

  /**
   * Returns a random color from a weighted Main Sequence approximation
   */
  private getRandomStarColor(): number {
    const rand = Math.random();
    if (rand > 0.9) return 0x9db4ff; // Blue-ish (O/B Class) - Rare
    if (rand > 0.7) return 0xffffff; // White (A/F Class)
    if (rand > 0.4) return 0xfff4e8; // Yellow-White (G Class)
    if (rand > 0.2) return 0xffd2a1; // Orange (K Class)
    return 0xffa371; // Red (M Class) - Common
  }

  protected onUpdate(): void {
    // Optional: Add a very slow drift to the entire cloud if desired
    // this.rotation.y += delta * 0.005;
  }
}
