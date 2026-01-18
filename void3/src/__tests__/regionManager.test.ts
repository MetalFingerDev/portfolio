import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock 'three' to avoid SSR / bundler transform issues in Vitest environment.
vi.mock("three", () => {
  class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set(x: number, y: number, z: number) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    copy(v: any) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    distanceTo(v: any) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    clone() {
      return new Vector3(this.x, this.y, this.z);
    }
    subVectors(a: any, b: any) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;
    }
  }

  class PerspectiveCamera {
    position = new Vector3();
    far = 1000;
    getWorldPosition(out: any) {
      out.copy(this.position);
    }
  }

  class Object3D {
    position = new Vector3();
    children: any[] = [];
    parent: any = null;
    visible = true;
    add(child: any) {
      this.children.push(child);
      child.parent = this;
    }
    getWorldPosition(out: any) {
      out.copy(this.position);
    }
    traverse(cb: any) {
      cb(this);
      for (const c of this.children)
        if (c && typeof c.traverse === "function") c.traverse(cb);
    }
    dispatchEvent(_ev: any) {}
  }

  class Group extends Object3D {}
  class Mesh extends Object3D {
    geometry: any;
    material: any;
    constructor(g?: any, m?: any) {
      super();
      this.geometry = g;
      this.material = m;
    }
  }
  class LOD extends Object3D {
    update() {}
  }

  // Minimal geometry/material placeholders
  class SphereGeometry {}
  class MeshBasicMaterial {}

  return {
    Vector3,
    PerspectiveCamera,
    Object3D,
    Group,
    Mesh,
    LOD,
    SphereGeometry,
    MeshBasicMaterial,
  };
});

import * as THREE from "three";
import { RegionManager } from "@/void/regions/RegionManager";
import { Region } from "@/void/regions/Region";

describe("RegionManager selection edge cases", () => {
  let rm: RegionManager;
  let camera: THREE.PerspectiveCamera;

  beforeEach(() => {
    rm = new RegionManager();
    camera = new THREE.PerspectiveCamera();
    camera.position.set(0, 0, 0);
  });

  it("selects a region when camera is strictly inside the entry threshold", () => {
    const r = new Region({ name: "r1", radius: 10, entry: 10, exit: 15 });
    r.position.set(9, 0, 0); // distance 9 from camera
    rm.register(r);

    rm.update(camera, 0.016);

    expect(rm.activeRegion).toBe(r);
  });

  it("does NOT select a region when camera is exactly at the entry threshold (strict < used)", () => {
    const r = new Region({ name: "r2", radius: 10, entry: 10, exit: 15 });
    r.position.set(10, 0, 0); // distance == entry
    rm.register(r);

    rm.update(camera, 0.016);

    expect(rm.activeRegion).toBeNull();
  });

  it("does not exit a region until camera is strictly beyond the exit threshold", () => {
    const r = new Region({ name: "r3", radius: 20, entry: 10, exit: 15 });
    r.position.set(9, 0, 0); // inside entry
    rm.register(r);

    // First update: enter
    rm.update(camera, 0.016);
    expect(rm.activeRegion).toBe(r);

    // Move camera so distance is 14 (< exit) -> should still be active
    camera.position.set(5, 0, 0); // region at 9, camera at 5 -> dist 4 (still inside)
    rm.update(camera, 0.016);
    expect(rm.activeRegion).toBe(r);

    // Move camera to exactly exit threshold => should be considered outside (strict <)
    camera.position.set(-6, 0, 0); // region at 9, camera at -6 -> dist 15
    rm.update(camera, 0.016);
    expect(rm.activeRegion).toBeNull();
  });

  it("chooses the candidate with the smallest entry when multiple regions contain the camera", () => {
    const near = new Region({ name: "near", radius: 5, entry: 10, exit: 15 });
    const far = new Region({ name: "far", radius: 20, entry: 20, exit: 30 });

    // put both regions at distance 5 from camera
    near.position.set(5, 0, 0);
    far.position.set(5, 0, 0);

    rm.register(near);
    rm.register(far);

    rm.update(camera, 0.016);

    expect(rm.activeRegion).toBe(near);
  });
});
