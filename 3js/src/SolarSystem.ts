import * as THREE from "three";
import type { IRegion, ICelestialBody, data } from "./config";
import { PLANET_DATA } from "./Planet";
import { SUN_RADIUS, AU_SCENE } from "./conversions";
import Earth from "./Earth";
import Sun from "./Sun";
import Planet from "./Planet";

export class SolarSystem implements IRegion {
  public group: THREE.Group = new THREE.Group();
  private highDetailGroup: THREE.Group = new THREE.Group();
  private lowDetailGroup: THREE.Group = new THREE.Group();
  public cfg: data;
  public bodies: ICelestialBody[] = [];
  private camera?: THREE.PerspectiveCamera;

  // The distance at which a planet switches to High Detail (e.g., 20 AU)
  private readonly DETAIL_THRESHOLD = 20 * AU_SCENE;

  constructor(cfg: data) {
    this.cfg = cfg;
    this.group.position.x = cfg.Offset || 0;

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
    const sunRadius = SUN_RADIUS * ratio;

    const sun = new Sun(undefined, {
      radius: sunRadius,
      detailed: true,
      intensity: sunRadius * 15,
      position: new THREE.Vector3(0, 0, 0),
    });
    sun.group.name = "Sun";
    this.highDetailGroup.add(sun.group);
    this.bodies.push(sun);

    PLANET_DATA.forEach((planet) => {
      if (planet.name === "Earth") {
        const earth = new Earth(planet, ratio, this.highDetailGroup);
        earth.group.name = "Earth";
        this.highDetailGroup.add(earth.group);
        this.bodies.push(earth);
      } else {
        const planetObj = new Planet(planet, ratio, this.highDetailGroup);
        this.highDetailGroup.add(planetObj.group);
        this.bodies.push(planetObj);
      }
    });
  }

  private initLowDetail(ratio: number) {
    // Simple low-detail dots for each planet
    PLANET_DATA.forEach((p) => {
      const dotGeo = new THREE.SphereGeometry(p.size * ratio * 2, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const dot = new THREE.Mesh(dotGeo, dotMat);

      // compute same orbital position math as high-detail
      const a = p.distance * AU_SCENE * ratio;
      const angleRad = THREE.MathUtils.degToRad(p.angle);
      const e = p.eccentricity;
      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
      dot.position.set(r * Math.cos(angleRad), 0, r * Math.sin(angleRad));

      dot.name = `low_${p.name}`;
      this.lowDetailGroup.add(dot);
    });
  }

  public setDetail(isHighDetail: boolean) {
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
