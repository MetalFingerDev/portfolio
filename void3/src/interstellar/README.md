# interstellar

Purpose: Interstellar space system and procedural starfield generation.

---

## Overview

Procedural starfield system used for large-scale scenes and interstellar exploration.

## Features 🌌

- **InterstellarSpace System**: Procedural generation of starfields with randomized properties and neighbor relationships
- **Star Distribution**: 100+ stars positioned in 3D space with realistic color variation and lighting
- **LOD Support**: High-detail star meshes and low-detail point cloud placeholders for performance
- **System Integration**: Connected to solar system for seamless switching ('S' key)
- **Performance Optimized**: Efficient rendering for large-scale space scenes with hierarchical updates

## Usage 💡

```typescript
import InterstellarSpace from "./interstellar";

// Create interstellar space system
const interstellar = new InterstellarSpace(manager, config);

// Initialize with procedural star generation
interstellar.init();

// Switch to interstellar view
systemManager.load("interstellar-space");
```

## Technical Details

- **Star Count**: ~100 procedural stars in high-detail mode, 300+ points in placeholder
- **Distribution Volume**: Stars scattered within 800-unit radius for immersive exploration
- **Color Variation**: HSL-based colors favoring realistic star temperatures (yellow/red/blue)
- **Lighting**: Each star provides point lighting for nearby illumination
- **Animation**: Slow rotation for dynamic, living starfield

## Controls 🎮

- **'S'**: Switch between Interstellar Space and Solar System
- **'L'**: Toggle LOD between detailed stars and point cloud
- **'T'**: Traverse visible stars (if named) with camera focusing

## Development 🔧

- Optimize star generation algorithms for better performance.
- Add more realistic star distribution patterns or nebulae.
- Ensure smooth transitions with neighboring systems.

## Contributing ✨

Document procedural generation parameters and their visual impact.

> See the top-level README for full project context and contribution guidelines.
