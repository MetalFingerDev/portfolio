# systems

Purpose: Multi-body systems (solar system, local group), system-level orchestration and managers.

---

## Overview ✅

System-level orchestration for multi-body simulations such as solar-system and local-group systems. Features a flexible manager for loading, switching, and optimizing spatial regions with hierarchical scene management.

## Features ⚙️

- **SystemManager**: Orchestrates multiple spatial systems with adjacency relationships and neighbor loading
- **LOD Control**: Automatic level-of-detail switching for performance optimization across active and neighboring systems
- **System Switching**: Dynamic loading/unloading of connected systems with smooth transitions
- **Keyboard Integration**: Built-in support for toggle controls ('L' for LOD, 'S' for system switching)
- **Hierarchical Updates**: Propagates update calls through scene graph hierarchies for efficient entity management

## Usage 💡

```typescript
import SystemManager from "./systems";

// Create manager
const manager = new SystemManager(scene, camera, renderer);

// Register systems
manager.register("solar-system", SolarSystem);
manager.register("interstellar-space", InterstellarSpace);

// Connect systems
manager.connect("solar-system", "interstellar-space");

// Load initial system
manager.load("solar-system");

// Toggle controls
manager.toggleLOD(); // Switch detail level
manager.toggleSystem(); // Switch between connected systems
```

## Architecture

- **BaseSystem**: Abstract base class for all systems with LOD support (group/placeholder) and lifecycle methods
- **System Lifecycle**: init(), update(), destroy() with optional onEnter/onExit hooks
- **Adjacency Graph**: Define relationships between systems for seamless transitions and neighbor preloading
- **Update Propagation**: Hierarchical updates ensure child entities (e.g., planets on stars) are updated efficiently

## Development 🔧

- Add tests for system interactions, lifecycle hooks, and adjacency logic.
- Document adjacency relationships when adding new systems.
- Ensure new systems integrate with the hierarchical update system.

## Contributing ✨

Document public APIs and expected side effects.

> See the top-level README for full project context and contribution guidelines.
