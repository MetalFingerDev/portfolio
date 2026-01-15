import * as THREE from "three";
import type { address, IRegion, data } from "./config";
import { regions, compendium } from "./config";
import { lyToScene } from "./conversions";
import { MilkyWay } from "./MilkyWay";
import { LocalFluff } from "./LocalFluff";
import { SolarSystem } from "../../void3/src/SolarSystem";
import InterstellarSpace from "./InterstellarSpace";
import { LocalGroup } from "./LocalGroup";
import { Laniakea } from "./Laniakea";

export class RegionManager {
  private stage = new Map<address, IRegion>();
  private currentAddress: address;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private legend: Record<address, new (cfg: data) => IRegion> = {
    [regions.SOLAR_SYSTEM]: SolarSystem,
    [regions.INTERSTELLAR_SPACE]: InterstellarSpace,
    [regions.LOCAL_FLUFF]: LocalFluff,
    [regions.GALAXY]: MilkyWay,
    [regions.LOCAL_GROUP]: LocalGroup,
    [regions.LANIAKEA]: Laniakea,
  };

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    initialAddress: address = regions.SOLAR_SYSTEM
  ) {
    this.scene = scene;
    this.camera = camera;
    this.currentAddress = initialAddress;
  }

  public loadRegion(address: address): void {
    if (this.stage.has(address)) return;

    const cfg = compendium[address];
    if (!cfg) return;

    const RegionClass = this.legend[address];
    const region = new RegionClass(compendium[address]);

    this.stage.set(address, region);
    this.scene.add(region.group);

    // Set detail level based on whether this is the ship's current region
    region.setDetail(address === this.currentAddress);

    // Register the camera for LOD updates
    region.setCamera(this.camera);
    region.group.userData.cameraAssigned = true;

    // Position camera if this is the current region
    if (address === this.currentAddress) {
      this.setInitialCameraPosition(address, cfg);
    }
  }

  private setInitialCameraPosition(address: address, cfg: data): void {
    const offset = cfg.Offset || 0;

    if (address === regions.GALAXY) {
      // Sun is ~26,000 LY from galactic center
      const sunDistFromCenter = lyToScene(26000) / cfg.Ratio;
      // Position ship at the Sun's galactic location, looking at the galactic center
      this.camera.position.set(sunDistFromCenter, 500, 500);
      // Assuming controls is available, but since it's not passed, we'll skip target setting for now
    } else if (address === regions.LOCAL_FLUFF) {
      const entryDist = lyToScene(50) / cfg.Ratio;
      // Position ship relative to the fluff's offset
      this.camera.position.set(offset, 0, entryDist);
    } else if (address === regions.SOLAR_SYSTEM) {
      // Position ship relative to the solar system's offset
      this.camera.position.set(offset, 2, 150);
    }
  }

  public unloadRegion(address: address): void {
    const region = this.stage.get(address);
    if (!region) return;

    try {
      region.destroy();
    } catch (err) {
      console.warn(`Region.destroy() threw for address ${address}`, err);
    }

    if (region.group && region.group.parent) {
      try {
        region.group.parent.remove(region.group);
      } catch (err) {
        console.warn(
          `Failed to remove region.group for address ${address}`,
          err
        );
      }
    }

    try {
      region.group.traverse((obj: THREE.Object3D) => {
        const mesh = obj as THREE.Mesh;
        if ((mesh as any).isMesh) {
          if (
            mesh.geometry &&
            typeof (mesh.geometry as any).dispose === "function"
          ) {
            try {
              (mesh.geometry as any).dispose();
            } catch (e) {
              /* ignore */
            }
          }

          const mat = (mesh as any).material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => {
              if (m && typeof m.dispose === "function") {
                try {
                  m.dispose();
                } catch (e) {
                  /* ignore */
                }
              }
            });
          } else if (mat && typeof mat.dispose === "function") {
            try {
              mat.dispose();
            } catch (e) {
              /* ignore */
            }
          }
        }
      });
    } catch (err) {
      console.warn(`Defensive cleanup failed for region ${address}`, err);
    }

    // Finally remove from our registry
    this.stage.delete(address);
  }

  public hyperSpace(targetAddress: address, controls?: any): void {
    const previousAddress = this.currentAddress;
    const prevCfg = compendium[previousAddress];
    const targetCfg = compendium[targetAddress];

    // Ensure the target region is loaded
    this.loadRegion(targetAddress);

    // Swap detail levels
    this.stage.get(previousAddress)?.setDetail(false);
    this.stage.get(targetAddress)?.setDetail(true);

    // Ensure both regions have the camera
    this.stage.get(previousAddress)?.setCamera(this.camera);
    this.stage.get(targetAddress)?.setCamera(this.camera);

    // Calculate and apply camera transform
    this.applyCameraTransform(prevCfg, targetCfg, controls);

    // Update current address
    this.currentAddress = targetAddress;

    // Keep only current and neighbor regions loaded
    this.manageLoadedRegions();
  }

  private applyCameraTransform(
    prevCfg: data,
    targetCfg: data,
    controls?: any
  ): void {
    const factor = prevCfg.Ratio / targetCfg.Ratio;
    const oldOffset = (prevCfg.Offset || 0) / prevCfg.Ratio;
    const newOffset = (targetCfg.Offset || 0) / targetCfg.Ratio;

    // Subtract old, scale, add new
    this.camera.position.x =
      (this.camera.position.x - oldOffset) * factor + newOffset;
    this.camera.position.y *= factor;
    this.camera.position.z *= factor;

    if (controls) {
      controls.target.x = (controls.target.x - oldOffset) * factor + newOffset;
      controls.target.y *= factor;
      controls.target.z *= factor;
      controls.update();
    }
  }

  private manageLoadedRegions(): void {
    const neighbors = [
      this.currentAddress,
      this.currentAddress - 1,
      this.currentAddress + 1,
    ];
    this.stage.forEach((_, addr) => {
      if (!neighbors.includes(addr)) this.unloadRegion(addr);
    });

    neighbors.forEach((addr) => {
      if (addr >= regions.SOLAR_SYSTEM && addr <= regions.LANIAKEA) {
        this.loadRegion(addr as address);
      }
    });
  }

  public getCurrentRegion(): IRegion | undefined {
    return this.stage.get(this.currentAddress);
  }

  public getRegion(address: address): IRegion | undefined {
    return this.stage.get(address);
  }

  public update(delta: number): void {
    this.stage.forEach((region) => region.update(delta));
  }

  public getStage(): Map<address, IRegion> {
    return this.stage;
  }

  public getCurrentAddress(): address {
    return this.currentAddress;
  }
}
