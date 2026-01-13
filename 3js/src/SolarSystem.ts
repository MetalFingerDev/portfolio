import * as THREE from "three";
import type { IRegion, data } from "./config";
import { PLANET_DATA } from "./Planet";
import {
  SUN_RADIUS_M,
  toSceneUnits,
  AU_SCENE,
  EARTH_RADIUS_M,
} from "./conversions";
import CelestialBody from "./CelestialBody";
import BaseRegion from "./BaseRegion";

export class SolarSystem extends BaseRegion implements IRegion {
  private highDetailGroup: THREE.Group = new THREE.Group();
  private lowDetailGroup: THREE.Group = new THREE.Group();

  // The distance at which a planet switches to High Detail (e.g., 20 AU)
  private readonly DETAIL_THRESHOLD = 20 * AU_SCENE;

  constructor(cfg: data) {
    super(cfg);

    // Attach detail groups to main group
    this.group.add(this.highDetailGroup);
    this.group.add(this.lowDetailGroup);

    // Initialize both representations
    this.initHighDetail(cfg.Ratio);
    this.initLowDetail(cfg.Ratio);

    // Default to low detail until needed
    this.setDetail(false);

    // Sky/background remains attached to the main group
    this.createSkySphere();
  }

  private createSkySphere() {
    const loader = new THREE.TextureLoader();

    // We set the radius slightly smaller than the region's boundary (Dist)
    // to ensure it stays within the viewable area
    const skyGeo = new THREE.SphereGeometry(this.cfg.Dist * 0.9, 64, 64);

    const skyMat = new THREE.MeshBasicMaterial({
      map: loader.load("milkyway.jpg"),
      side: THREE.BackSide, // This makes the texture visible from the inside
    });

    const skyMesh = new THREE.Mesh(skyGeo, skyMat);

    // Name it for potential reference or debugging
    skyMesh.name = "MilkyWaySkybox";

    this.group.add(skyMesh); //
  }

  private initHighDetail(ratio: number) {
    // Compute Sun size from physical meters and region ratio
    const sunRadius = toSceneUnits(SUN_RADIUS_M, ratio);

    // Create Sun as a CelestialBody (use physical meters)
    const sunBody = new CelestialBody(
      {
        name: "Sun",
        radiusMeters: SUN_RADIUS_M,
        texturePath: "sun.jpg",
        color: 0xffcc00,
        intensity: sunRadius * 15,
      },
      ratio
    );

    sunBody.group.name = "Sun";
    this.highDetailGroup.add(sunBody.group);
    this.bodies.push(sunBody);

    PLANET_DATA.forEach((planet) => {
      // Compute planet radius from PlanetData.size (Earth radii)
      const radiusMeters = planet.size * EARTH_RADIUS_M;
      const body = new CelestialBody(
        {
          name: planet.name,
          radiusMeters,
          texturePath: planet.name === "Earth" ? "earth.jpg" : undefined,
          color: planet.color,
          rotationSpeed: 0.005,
        },
        ratio
      );

      body.group.name = planet.name;
      this.highDetailGroup.add(body.group);
      this.bodies.push(body);
    });
  }

  private initLowDetail(ratio: number) {
    // Simple low-detail dots for each planet
    PLANET_DATA.forEach((p) => {
      // Compute a physically-scaled dot radius from planet size (size is in Earth radii)
      const dotRadius = toSceneUnits(p.size * EARTH_RADIUS_M, ratio);
      const dotGeo = new THREE.SphereGeometry(
        Math.max(0.5, dotRadius * 2),
        8,
        8
      );
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dot = new THREE.Mesh(dotGeo, dotMat);

      // compute same orbital position math as high-detail; apply ratio as divisor
      const a = (p.distance * AU_SCENE) / ratio;
      const angleRad = THREE.MathUtils.degToRad(p.angle);
      const e = p.eccentricity;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
      dot.position.set(r * Math.cos(angleRad), 0, r * Math.sin(angleRad));

      dot.name = `low_${p.name}`;
      this.lowDetailGroup.add(dot);
    });
  }

  public setDetail(isHighDetail: boolean) {
    this.group.userData.detailIsHigh = isHighDetail;
    this.highDetailGroup.visible = isHighDetail;
    this.lowDetailGroup.visible = !isHighDetail;
    this.bodies.forEach((b) => {
      try {
        b.setDetail(isHighDetail);
      } catch (e) {}
    });
  }

  public setCamera(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
  }

  public update(delta: number) {
    if (!this.camera) return;

    const shipPos = new THREE.Vector3();
    this.camera.getWorldPosition(shipPos);

    this.bodies.forEach((body) => {
      try {
        const bodyPos = new THREE.Vector3();
        body.group.getWorldPosition(bodyPos);

        const distance = shipPos.distanceTo(bodyPos);

        // Centralized detail switching — account for region ratio
        const threshold = this.DETAIL_THRESHOLD * (this.cfg.Ratio || 1);
        body.setDetail(distance < threshold);

        // Centralized visual scaling
        const minVisualSize = 0.05;
        const baseSize = (body.group.userData.baseSize as number) || 1;
        const currentScale = body.group.scale.x || 1;
        const targetScale = Math.max(1, (distance * minVisualSize) / baseSize);
        body.group.scale.setScalar(
          THREE.MathUtils.lerp(currentScale, targetScale, 0.1)
        );

        body.update(delta);
      } catch (e) {}
    });
  }

  public destroy() {
    this.bodies.forEach((u) => {
      try {
        u.destroy();
      } catch (e) {}
    });

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
      if (obj instanceof THREE.Light) {
        if (obj.parent) obj.parent.remove(obj);
      }
    });

    if (this.group.parent) this.group.parent.remove(this.group);
  }
}
