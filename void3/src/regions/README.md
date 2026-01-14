# regions

Purpose: Region management utilities, LOD helpers, and spatial partitioning helpers.

---

## Overview ✅

Spatial partitioning utilities, level-of-detail helpers, and region managers used to optimize scene content and updates. Implements complete solar system and interstellar space regions with hierarchical entity relationships.

## Features 🌌

- **Solar System**: Complete planetary system with 9 planets orbiting a central star, accurate astronomical ratios and hierarchical structure
- **Interstellar Space**: Procedural starfield generation with randomized star properties and point-cloud placeholders
- **LOD Management**: Automatic level-of-detail switching between high-detail and placeholder representations for performance
- **System Switching**: Keyboard controls ('S') to toggle between regions, with neighbor loading for smooth transitions
- **Hierarchical Integration**: Planets attached to stars for proper orbital relationships and scene organization

## Usage 💡

```typescript
import registerer from "./regions";

// Register all regions with the system manager
registerer(systemManager);

// Load solar system
systemManager.load("solar-system");

// Switch to interstellar space
systemManager.load("interstellar-space");
```

## Keyboard Controls 🎮

- **'S'**: Switch between Solar System and Interstellar Space
- **'L'**: Toggle Level of Detail for current region

## Architecture 🏗️

- **SolarSystem**: Extends BaseSystem, creates Star with planets as children
- **InterstellarSpace**: Extends BaseSystem, generates procedural stars
- **registerer**: Connects systems as neighbors for efficient loading

## Development 🔧

- Add tests for partitioning and LOD behavior; document coordinate conventions.
- Update astronomical data with latest measurements.
- Ensure new regions integrate with the hierarchical scene graph.

## Contributing ✨

Explain constraints or expected coordinate systems when adding new region logic.

> See the top-level README for full project context and contribution guidelines.
