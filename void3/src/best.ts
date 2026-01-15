import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./style.css";
import * as THREE from "three";

// --- Configuration ---
// The spacing between regions in 3D space
const REGION_OFFSET = 40;

class RegionManager {
  private scene: THREE.Scene;
  // The 'stage' is our active memory of loaded regions
  private stage = new Map<number, THREE.Group>();

  public context: {
    camera: THREE.Camera | null;
    renderer: THREE.WebGLRenderer | null;
    current: number | null;
  };

  constructor(
    scene: THREE.Scene,
    camera: THREE.Camera | null = null,
    renderer: THREE.WebGLRenderer | null = null,
    current: number | null = null
  ) {
    this.scene = scene;
    this.context = { camera, renderer, current };
  }

  /**
   * Loads a region into the stage.
   * If the region object isn't provided, it generates a placeholder.
   */
  public loadRegion(
    target: number,
    region?: THREE.Group,
    options?: { isCurrent?: boolean; isNeighbor?: boolean }
  ): void {
    const role = options?.isCurrent ? "current" : "neighbor";

    // 1. Check if it's already loaded
    const existing = this.stage.get(target);
    if (existing) {
      existing.userData.role = role;
      if (options?.isCurrent) this.context.current = target;
      return;
    }

    // 2. If not, create or use provided region
    const group = region ?? this.createNeighborRegion(target);

    // Ensure metadata exists
    group.userData = group.userData || {};
    group.userData.role = role;

    // Position the region in world space based on its ID
    // ID 1 is at 0, ID 2 is at +40, ID 0 is at -40, etc.
    group.position.x = (target - 1) * REGION_OFFSET;

    // 3. Add to system
    this.stage.set(target, group);
    this.scene.add(group);

    if (options?.isCurrent) this.context.current = target;

    // Note: We do NOT call enforceMaxLoaded here recursively to avoid infinite loops.
    // The driver (setCurrent) handles the cleanup.
  }

  /**
   * The Main Driver: Moves the player to a specific region index.
   * Loads the target and its neighbors, then deletes everything else.
   */
  public setCurrent(target: number, region?: THREE.Group): void {
    // 1. Load Current
    this.loadRegion(target, region, { isCurrent: true });

    // 2. Preload Neighbors (left and right)
    this.loadRegion(target - 1, undefined, { isNeighbor: true });
    this.loadRegion(target + 1, undefined, { isNeighbor: true });

    // 3. Move Camera to the new current region (optional, but helps navigation)
    if (this.context.camera) {
      // Smoothly jump camera x to the new region's x
      const targetX = (target - 1) * REGION_OFFSET;
      // We don't animate here for simplicity, but we snap the lookAt logic
      // Ideally, the OrbitControls target should update, or we just rely on the user moving.
      console.log(`Moved to Region ${target} at X=${targetX}`);
    }

    // 4. Clean up old regions
    this.enforceMaxLoaded();
  }

  private enforceMaxLoaded(): void {
    const current = this.context.current;
    if (current === null || current === undefined) return;

    // We only allow these 3 IDs to exist
    const allowed = new Set([current, current - 1, current + 1]);

    // Detect garbage
    const toRemove: number[] = [];
    for (const [key] of this.stage) {
      if (!allowed.has(key)) toRemove.push(key);
    }

    // Dispose garbage
    toRemove.forEach((key) => {
      console.log(`Unloading Region ${key}...`);
      this.unloadRegion(key);
    });
  }

  private createNeighborRegion(target: number): Region {
    const r = new Region();
    // Create simpler, grey shells for neighbors to distinguish them
    r.build([
      { radius: 7, color: 0x888888 },
      { radius: 4, color: 0x444444 },
    ]);

    // Use the target to position the placeholder so it's at the expected grid slot
    r.position.x = (target - 1) * REGION_OFFSET;

    return r;
  }

  public unloadRegion(target: number): void {
    const region = this.stage.get(target);
    if (!region) return;

    // 1. Remove from Scene
    this.scene.remove(region);

    // 2. Deep Clean (Dispose Geometries/Materials)
    region.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });

    // 3. Remove from Memory
    this.stage.delete(target);
  }

  public update(delta: number): void {
    this.stage.forEach((group) => {
      if (group instanceof Region) {
        group.update(delta);
      } else {
        group.rotation.y += delta * 0.05;
      }
    });
  }
}

// --- Region Class ---

interface SphereConfig {
  radius: number;
  color: number;
}

class Region extends THREE.Group {
  private animatedObjects: THREE.Object3D[] = [];

  constructor() {
    super();
  }

  public build(spheres: SphereConfig[]): void {
    spheres.forEach((config) => {
      const geometry = new THREE.SphereGeometry(config.radius, 32, 16);
      const material = new THREE.MeshStandardMaterial({
        color: config.color,
        wireframe: true,
      });
      const shell = new THREE.Mesh(geometry, material);
      this.add(shell);
      this.animatedObjects.push(shell);
    });
  }

  public update(delta: number): void {
    this.rotation.y += delta * 0.1;
    if (this.animatedObjects[0])
      this.animatedObjects[0].rotation.z += delta * 0.2;
    if (this.animatedObjects[1])
      this.animatedObjects[1].rotation.x -= delta * 0.3;
    if (this.animatedObjects[2])
      this.animatedObjects[2].rotation.y += delta * 0.4;
  }
}

// --- Setup ---

const canvas = document.querySelector("#app") as HTMLCanvasElement | null;
if (!canvas) throw new Error("Canvas not found");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  logarithmicDepthBuffer: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const ship = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1e15
);
ship.position.set(0, 20, 80);

const controls = new OrbitControls(ship, canvas);
controls.enableDamping = true;

const space = new THREE.Scene();
const light = new THREE.AmbientLight(0x404040, 5);
space.add(light);
const pointLight = new THREE.PointLight(0xffffff, 100);
pointLight.position.set(20, 20, 20);
space.add(pointLight);

// --- App Logic ---

const regions = new RegionManager(space, ship, renderer);

// 1. Define our specific "Hero" regions
const nestedSpheres = new Region();
nestedSpheres.build([
  { radius: 15, color: 0xff0000 },
  { radius: 10, color: 0x00ff00 },
  { radius: 5, color: 0x0000ff },
]);

const bestedSpheres = new Region();
bestedSpheres.build([
  { radius: 12, color: 0xff00ff }, // Magenta
  { radius: 8, color: 0x00ffff }, // Cyan
  { radius: 4, color: 0xffff00 }, // Yellow
]);

// 2. Load Region 1 as the current one.
// This triggers the manager to generate placeholders for 0 and 2 automatically.
regions.setCurrent(1, nestedSpheres);

// Optional: Pre-seed "bestedSpheres" as Region 2 so it appears instead of a placeholder
// We do this by manually loading it as a 'neighbor' after setting current
regions.loadRegion(2, bestedSpheres, { isNeighbor: true });

// --- Controls ---

window.addEventListener("keydown", (e) => {
  if (!regions.context.current) return;

  if (e.key === "ArrowRight") {
    const next = regions.context.current + 1;
    regions.setCurrent(next);
    // Move camera to follow roughly
    controls.target.x = (next - 1) * REGION_OFFSET;
    ship.position.x += REGION_OFFSET;
  }

  if (e.key === "ArrowLeft") {
    const prev = regions.context.current - 1;
    regions.setCurrent(prev);
    // Move camera to follow roughly
    controls.target.x = (prev - 1) * REGION_OFFSET;
    ship.position.x -= REGION_OFFSET;
  }
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  regions.update(delta);
  controls.update();
  renderer.render(space, ship);
}

animate();
