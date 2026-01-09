# 🚀 3D Space Visualization App - Development Guide

A multi-scale cosmic visualization built with **Three.js** and **TypeScript**, allowing seamless navigation from the Solar System to the Laniakea Supercluster.

---

## 📁 Project Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         ENTRY POINT                              │
│                          main.ts                                 │
│    (Scene setup, animation loop, region management, controls)    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   config.ts   │   │    ui.ts      │   │   units.ts    │
│  (Data/Types) │   │ (Navigation)  │   │ (Conversions) │
└───────────────┘   └───────────────┘   └───────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ SolarSystem.ts│   │ LocalFluff.ts │   │  MilkyWay.ts  │
│   (Region 0)  │   │   (Region 1)  │   │   (Region 2)  │
└───────────────┘   └───────────────┘   └───────────────┘
        │                                       │
        ▼                                       ▼
┌───────────────┐                       ┌───────────────┐
│ LocalGroup.ts │                       │  Laniakea.ts  │
│   (Region 3)  │                       │   (Region 4)  │
└───────────────┘                       └───────────────┘
```

---

## 📂 File-by-File Breakdown

### 🎯 Core Files

| File                           | Purpose                                   | Key Exports                                            |
| ------------------------------ | ----------------------------------------- | ------------------------------------------------------ |
| [main.ts](main.ts)             | Application entry point, scene management | Animation loop, region transitions                     |
| [src/config.ts](src/config.ts) | All data definitions & type system        | `regions`, `compendium`, `PLANET_DATA`, `GALAXY_DATA`  |
| [src/units.ts](src/units.ts)   | Unit conversion constants & functions     | `AU_SCENE`, `LY_SCENE`, `lyToScene()`, `auToScene()`   |
| [src/ui.ts](src/ui.ts)         | Navigation dropdown & HUD management      | `updateNavigationList()`, `setupNavListClickHandler()` |

### 🌌 Region Classes (The 5 Cosmic Scales)

| File                                     | Region ID | Scale Description                 | Distance Boundary |
| ---------------------------------------- | --------- | --------------------------------- | ----------------- |
| [src/SolarSystem.ts](src/SolarSystem.ts) | `0`       | Planets, Sun, orbits              | 50,000 AU         |
| [src/LocalFluff.ts](src/LocalFluff.ts)   | `1`       | Local interstellar cloud          | 200 LY            |
| [src/MilkyWay.ts](src/MilkyWay.ts)       | `2`       | Galaxy disc & bulge               | 150,000 LY        |
| [src/LocalGroup.ts](src/LocalGroup.ts)   | `3`       | Nearby galaxies (Andromeda, etc.) | 100M LY           |
| [src/Laniakea.ts](src/Laniakea.ts)       | `4`       | Supercluster (placeholder)        | 500M LY           |

### 🌍 Celestial Body Classes

| File                         | What It Renders         | Special Features                   |
| ---------------------------- | ----------------------- | ---------------------------------- |
| [src/Sun.ts](src/Sun.ts)     | The Sun with PointLight | Rotation, axis line, emissive glow |
| [src/Earth.ts](src/Earth.ts) | Earth with atmosphere   | Texture maps, clouds, Fresnel glow |
| [src/Moon.ts](src/Moon.ts)   | Moon orbiting Earth     | Orbit line, tidal lock simulation  |

### 🛠️ Utility Files

| File                                         | Purpose                                         |
| -------------------------------------------- | ----------------------------------------------- |
| [src/getFresnelMat.ts](src/getFresnelMat.ts) | Custom shader for atmospheric rim lighting      |
| [src/utils.ts](src/utils.ts)                 | GLTF model loader with caching                  |
| [src/Render.ts](src/Render.ts)               | Extended WebGLRenderer with tone mapping        |
| [src/Ship.ts](src/Ship.ts)                   | Camera/controls wrapper (partially implemented) |

---

## 🔑 Core Concepts

### 1. The Region System (`config.ts`)

The app divides space into 5 **regions**, each with its own:

- **Ratio**: Scale factor (1 = real scale, higher = more zoomed out)
- **Dist**: The boundary distance that triggers a jump to the next region
- **Offset**: Position offset for nested parent objects

```typescript
// Region IDs (address type)
SOLAR_SYSTEM: 0; // Ratio: 1        (human scale)
LOCAL_FLUFF: 1; // Ratio: 10       (10x smaller)
GALAXY: 2; // Ratio: 50,000   (50,000x smaller)
LOCAL_GROUP: 3; // Ratio: 100M     (100 million x smaller)
LANIAKEA: 4; // Ratio: 1B       (1 billion x smaller)
```

### 2. The HyperSpace Jump System (`main.ts`)

When the camera moves beyond a region's `Dist` boundary, `hyperSpace()` triggers:

```typescript
function hyperSpace(targetAddress: address) {
  // 1. Calculate scale factor between current and target regions
  const factor = current.Ratio / target.Ratio;

  // 2. Scale camera position and look-at target
  ship.position.multiplyScalar(factor);
  controls.target.multiplyScalar(factor);

  // 3. Show/hide appropriate region groups
  // 4. Load adjacent regions, unload distant ones
  // 5. Update UI
}
```

**Key Insight**: The camera never actually moves billions of kilometers—the scene scales around it!

### 3. Unit Conversion System (`units.ts`)

All measurements flow through conversion constants:

```typescript
// Base unit: Earth Radii (EARTH_RADIUS = 1)

// Astronomical Unit conversion
(AU_SCENE = 23), 481; // 1 AU = 23,481 scene units

// Light Year conversion
(LY_AU = 63), 241.077; // 1 LY = 63,241 AU
LY_SCENE = LY_AU * AU_SCENE; // 1 LY = ~1.48 billion scene units

// Usage
lyToScene(26000); // Sun's distance from galactic center → scene units
auToScene(1.524); // Mars orbit radius → scene units
```

### 4. The Region Interface (`config.ts`)

Every region class must implement:

```typescript
interface region {
  group: THREE.Group; // Container for all meshes
  cfg: data; // Configuration object
  update?: (delta: number) => void; // Animation tick (optional)
  destroy: () => void; // Cleanup method
}
```

### 5. Object Tracking System (`main.ts`)

The nav list allows clicking on objects to track them:

```typescript
let trackedObject: THREE.Object3D | null = null;

// In animate loop:
if (trackedObject) {
  const worldPos = new THREE.Vector3();
  trackedObject.getWorldPosition(worldPos);
  controls.target.lerp(worldPos, 0.1); // Smooth follow
}
```

---

## 🎮 Control Flow

### Application Startup Sequence

```
1. Create WebGLRenderer & CSS2DRenderer
2. Create Scene ("space") & Camera ("ship")
3. Set up OrbitControls
4. Create region registry ("stage" Map)
5. loadRegion(SOLAR_SYSTEM) → Creates SolarSystem instance
6. loadRegion(LOCAL_FLUFF)  → Creates LocalFluff instance (preload)
7. Make SOLAR_SYSTEM visible
8. Setup UI handlers
9. Start animate() loop
```

### Animation Loop (60 FPS)

```
animate()
├── Calculate delta time
├── Check if tracked object exists → Update camera target
├── Check distance to controls.target
│   ├── If > current region's Dist → hyperSpace(next region)
│   └── If < previous region's boundary → hyperSpace(previous region)
├── Call update(delta) on all loaded regions
├── controls.update() → Apply damping
├── renderer.render(space, ship)
└── labelRenderer.render(space, ship) → CSS2D labels
```

---

## 🌟 Region Deep Dives

### SolarSystem.ts (Region 0)

**What it creates:**

- `Sun` instance with PointLight
- 8 planets on elliptical orbits (using Keplerian elements)
- `Earth` with special treatment (clouds, atmosphere, textures)
- Star shell (10,000 background stars)
- CSS2D labels for all bodies

**Orbit Calculation:**

```typescript
// Elliptical orbit using true anomaly
const a = planet.distance * AU_SCENE * ratio; // Semi-major axis
const e = planet.eccentricity;
const b = a * Math.sqrt(1 - e * e); // Semi-minor axis
const focusOffset = a * e; // Sun at focus

// Position from orbital angle
const r = (a * (1 - e * e)) / (1 + e * Math.cos(angleRad));
const posX = r * Math.cos(angleRad);
const posZ = r * Math.sin(angleRad);
```

### LocalFluff.ts (Region 1)

**What it creates:**

- 50,000 stars in volumetric distribution
- Glow sphere for atmosphere
- No labels (too many objects)

**Star Distribution:**

```typescript
// Power distribution creates denser center
const r = Math.pow(Math.random(), 0.5) * boundaryRadius;
// Spherical coordinates for uniform sphere filling
const theta = Math.random() * Math.PI * 2;
const phi = Math.acos(2 * Math.random() - 1);
```

### MilkyWay.ts (Region 2)

**What it creates:**

- Main disc (cylinder, ~105,700 LY diameter)
- Inner dense plane (thinner, brighter)
- Central bulge (sphere, ~12,000 LY diameter)
- Core point (single bright pixel)

**Proportions:**

```typescript
const radius = lyToScene(52850) / this.cfg.Ratio; // Galaxy radius
const thickness = lyToScene(1000) / this.cfg.Ratio; // Disc thickness
const bulgeRadius = lyToScene(6000) / this.cfg.Ratio; // Bulge radius
```

### LocalGroup.ts (Region 3)

**What it creates:**

- Disc meshes for each galaxy in `GALAXY_DATA`
- CSS2D labels with names
- Milky Way, Andromeda, Triangulum, LMC, SMC

**Galaxy Data Structure:**

```typescript
{
  name: "Andromeda (M31)",
  color: 0xffcc99,
  size: 220000,  // Diameter in LY
  coords: { x: 2500000, y: 500000, z: -200000 }  // Position relative to MW
}
```

### Laniakea.ts (Region 4)

**Current State:** Empty placeholder with only `destroy()` implemented.

**TODO:** Add supercluster visualization, Great Attractor, galaxy filaments.

---

## 🎨 Visual Effects

### Earth Atmosphere (Fresnel Shader)

The `getFresnelMat()` creates a rim-lighting effect:

```glsl
// Fresnel effect: brighter at edges (atmosphere visible)
vReflectionFactor = fresnelBias + fresnelScale *
    pow(1.0 + dot(normalize(I), worldNormal), fresnelPower);
```

### Additive Blending

Used throughout for glowing effects:

```typescript
blending: THREE.AdditiveBlending,  // Colors add together
depthWrite: false,                 // Don't occlude other objects
```

### Logarithmic Depth Buffer

Essential for multi-scale rendering:

```typescript
new THREE.WebGLRenderer({
  logarithmicDepthBuffer: true, // Prevents z-fighting at extreme scales
});
```

---

## 🧭 UI System (ui.ts)

### Components

| Element            | ID                | Purpose                                     |
| ------------------ | ----------------- | ------------------------------------------- |
| Dropdown container | `#nav-dropdown`   | Main navigation panel                       |
| Toggle button      | `#nav-toggle`     | Opens/closes dropdown                       |
| Scene buttons      | `#scene-selector` | Quick jump between regions                  |
| Object list        | `#nav-list`       | Clickable list of objects in current region |
| Region name        | `#region-name`    | HUD showing current location                |

### Navigation Flow

```
User clicks object in #nav-list
    ↓
setupNavListClickHandler() catches click
    ↓
Find object by UUID in current region
    ↓
setTrackedObject(target) → Camera will follow
    ↓
Move camera to object with offset
    ↓
Close dropdown
```

---

## ⚙️ Configuration Reference

### compendium (Region Config)

| Property | Type   | Description                          |
| -------- | ------ | ------------------------------------ |
| `Name`   | string | Display name for HUD                 |
| `Dist`   | number | Boundary distance (in scene units)   |
| `Ratio`  | number | Scale divisor (1 = real scale)       |
| `Offset` | number | X-position offset for nested regions |

### PLANET_DATA

| Property       | Description                              |
| -------------- | ---------------------------------------- |
| `name`         | Planet name                              |
| `color`        | Hex color for non-Earth planets          |
| `size`         | Radius relative to Earth (Earth = 1.0)   |
| `distance`     | Semi-major axis in AU                    |
| `eccentricity` | Orbital eccentricity (0 = circle)        |
| `angle`        | Initial heliocentric longitude (degrees) |

### GALAXY_DATA

| Property | Description                                    |
| -------- | ---------------------------------------------- |
| `name`   | Galaxy name                                    |
| `color`  | Disc color                                     |
| `size`   | Diameter in light years                        |
| `coords` | {x, y, z} position relative to Milky Way in LY |

---

## 🚧 Known Limitations & TODOs

### Current Limitations

1. **No orbital motion** - Planets are static at Jan 1, 2026 positions
2. **Laniakea is empty** - Region 4 has no content
3. **Moon not integrated** - `Moon.ts` exists but isn't used in `SolarSystem`
4. **No scene selector** - `setupSceneSelector()` exported but not called
5. **Ship.ts unused** - `SpaceShip` class not integrated into main.ts

### Suggested Enhancements

| Priority  | Feature                            | Difficulty |
| --------- | ---------------------------------- | ---------- |
| 🔴 High   | Add orbital motion to planets      | Medium     |
| 🔴 High   | Integrate Moon into Earth          | Easy       |
| 🟡 Medium | Implement Laniakea region          | Hard       |
| 🟡 Medium | Add scene selector buttons         | Easy       |
| 🟡 Medium | Add asteroid belt                  | Medium     |
| 🟢 Low    | Texture Milky Way with spiral arms | Medium     |
| 🟢 Low    | Add dwarf planets (Pluto, Ceres)   | Easy       |
| 🟢 Low    | Add star names in LocalFluff       | Medium     |

---

## 🔧 Development Patterns

### Adding a New Planet

1. Add entry to `PLANET_DATA` in [config.ts](src/config.ts):

```typescript
{
  name: "Pluto",
  color: 0xccbbaa,
  size: 0.18,
  distance: 39.48,
  eccentricity: 0.2488,
  angle: 285,
}
```

2. SolarSystem will automatically create it!

### Adding a New Celestial Body Class

1. Create new file in `src/` (e.g., `Asteroid.ts`)
2. Implement with `update()` method:

```typescript
export default class Asteroid {
  public mesh: THREE.Mesh;
  constructor(radius: number) {
    /* ... */
  }
  update(delta: number) {
    /* rotation/movement */
  }
}
```

3. Import and instantiate in the appropriate region class
4. Add to `updatables` array for animation

### Adding a New Region

1. Add to `regions` enum in [config.ts](src/config.ts):

```typescript
export const regions = {
  // ... existing
  VIRGO_CLUSTER: 5,
} as const;
```

2. Add config to `compendium`:

```typescript
[regions.VIRGO_CLUSTER]: {
  Name: "Virgo Cluster",
  Dist: 50000000000 * LY_SCENE,
  Ratio: 10000000000,
}
```

3. Create `src/VirgoCluster.ts` implementing `region` interface

4. Add to `legend` in [main.ts](main.ts):

```typescript
const legend: Record<address, new (cfg: any) => region> = {
  // ... existing
  [regions.VIRGO_CLUSTER]: VirgoCluster,
};
```

---

## 📊 Performance Notes

| Technique                | Purpose                           |
| ------------------------ | --------------------------------- |
| `sizeAttenuation: false` | Stars render as fixed-size pixels |
| `depthWrite: false`      | Transparent objects don't z-fight |
| Lazy region loading      | Only adjacent regions are loaded  |
| Region unloading         | Distant regions are disposed      |
| Shared geometries        | `SolarSystem.sphereGeo` reused    |
| Texture caching          | `utils.ts` caches loaded GLTFs    |

---

## 🗂️ Asset Requirements

### Textures (in `/public/` or root)

| File                        | Used By  | Notes           |
| --------------------------- | -------- | --------------- |
| `earth.jpg`                 | Earth.ts | Earth surface   |
| `earth_bump.png`            | Earth.ts | Height map      |
| `earth_speck.png`           | Earth.ts | Specular map    |
| `04_earthcloudmap.png`      | Earth.ts | Cloud texture   |
| `05_earthcloudmaptrans.png` | Earth.ts | Cloud alpha     |
| `MOON.png`                  | Moon.ts  | Moon surface    |
| `MOON_bump.png`             | Moon.ts  | Moon height map |

### Milky Way Assets (in `/public/milky_way/textures/`)

Currently not implemented - textures available for future spiral arm visualization.

---

## 🎯 Quick Reference Commands

```bash
# Development
pnpm dev          # Start Vite dev server

# Build
pnpm build        # Production build

# Preview
pnpm preview      # Preview production build
```

---

## 📝 Code Style Notes

- **Naming**: PascalCase for classes, camelCase for functions/variables
- **Types**: TypeScript strict mode, explicit return types preferred
- **Dispose Pattern**: Always implement `destroy()` to prevent memory leaks
- **Updates**: Use `updatables` array pattern for animation
- **Constants**: SCREAMING_SNAKE_CASE for constants in units.ts

---

_Last Updated: January 2026_
