import * as THREE from "three";
import { AU_SCENE } from "./conversions";
import { createLabel } from "./label";
import { addOrbit, addAxis } from "./visuals";

export interface PlanetData {
  name: string;
  color: number;
  size: number;
  distance: number; // Semi-major axis (a) in AU
  eccentricity: number; // Orbital eccentricity (e)
  angle: number; // Heliocentric Longitude (degrees)
}

export const PLANET_DATA: PlanetData[] = [
  {
    name: "Mercury",
    color: 0xaaaaaa,
    size: 0.38,
    distance: 0.387,
    eccentricity: 0.2056,
    angle: 250,
  },
  {
    name: "Venus",
    color: 0xffcc33,
    size: 0.95,
    distance: 0.723,
    eccentricity: 0.0067,
    angle: 282,
  },
  {
    name: "Earth",
    color: 0x2233ff,
    size: 1.0,
    distance: 1.0,
    eccentricity: 0.0167,
    angle: 101,
  },
  {
    name: "Mars",
    color: 0xff4422,
    size: 0.53,
    distance: 1.524,
    eccentricity: 0.0934,
    angle: 275,
  },
  {
    name: "Jupiter",
    color: 0xffaa88,
    size: 11.2,
    distance: 5.203,
    eccentricity: 0.0484,
    angle: 105,
  },
  {
    name: "Saturn",
    color: 0xeeddaa,
    size: 9.45,
    distance: 9.537,
    eccentricity: 0.0541,
    angle: 350,
  },
  {
    name: "Uranus",
    color: 0x99ccff,
    size: 4.0,
    distance: 19.19,
    eccentricity: 0.0472,
    angle: 55,
  },
  {
    name: "Neptune",
    color: 0x6688ff,
    size: 3.88,
    distance: 30.07,
    eccentricity: 0.0086,
    angle: 355,
  },
];

export default class Planet {
  public group: THREE.Group;
  public mesh: THREE.Mesh;
  public name: string;
  private rotationSpeed: number;

  constructor(planet: PlanetData, ratio: number, parent?: THREE.Group) {
    this.name = planet.name;
    this.rotationSpeed = 0.005;

    this.group = new THREE.Group();
    this.group.name = this.name;

    const planetSize = planet.size * ratio;
    const segments = 64;
    const geometry = new THREE.SphereGeometry(planetSize, segments, segments);

    const material = new THREE.MeshStandardMaterial({
      color: planet.color,
      roughness: 0.9,
      metalness: 0.0,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.name = this.name;

    this.group.add(this.mesh);

    // Add visuals: orbit + axis. Pass parent group if available later from SolarSystem.
    // By default attach orbit to this.group's parent (if present) or this.group.
    // Caller (SolarSystem) should pass its group as parent when constructing planets.
    // We'll allow parent to be undefined; addOrbit will require an explicit parent from caller.
    // For convenience, compute the orbit here with addOrbit when a parent is provided via
    // `this.group.userData.__parentForOrbit` (set by SolarSystem before constructing).
    if (parent) {
      const { position } = addOrbit(parent, {
        distanceAU: planet.distance,
        eccentricity: planet.eccentricity,
        angleDeg: planet.angle,
        ratio,
      });
      this.group.position.copy(position);
    } else {
      // fallback: compute local position and attach a local orbit
      const a = planet.distance * AU_SCENE * ratio;
      const e = planet.eccentricity;
      const angleRad = THREE.MathUtils.degToRad(planet.angle);
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
      this.group.position.set(
        r * Math.cos(angleRad),
        0,
        r * Math.sin(angleRad)
      );
    }

    // add axis to the mesh
    addAxis(this.mesh, planetSize * 2.2);

    // Create label (centralized)
    this.group.add(createLabel(this.name, planetSize * 3));

    // Low-detail fallback: simple sphere
    const lowGeo = new THREE.SphereGeometry(
      Math.max(0.5, planetSize * 0.6),
      8,
      8
    );
    const lowMat = new THREE.MeshBasicMaterial({ color: planet.color });
    const lowMesh = new THREE.Mesh(lowGeo, lowMat);
    this.lowDetailGroup.add(lowMesh);

    this.setDetail(true);
  }

  public setDetail(isHighDetail: boolean) {
    this.highDetailGroup.visible = isHighDetail;
    this.lowDetailGroup.visible = !isHighDetail;
  }

  public update(delta: number) {
    this.mesh.rotation.y += this.rotationSpeed * delta;
  }

  public destroy(): void {
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
    });
    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
