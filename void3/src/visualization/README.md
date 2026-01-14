# visualization

Purpose: High-level visualization entry points, scene setup, cameras, and debug helpers.

---

## Overview ✅

High-level visualization utilities for rendering scenes, managing camera traversal, and providing debug helpers for the Void3 simulation.

## Features 🎨

- **Visualization Class**: Wraps scene rendering with Three.js
- **Object Traversal**: Automatic camera focusing on visible named objects (planets, stars)
- **Dynamic Updates**: Maintains list of traversable objects based on current system

## Usage 💡

```typescript
import Visualization from "./visualization";

const visualization = new Visualization(scene, renderer);

// Update traversable objects when system changes
visualization.updateVisibleObjects(currentSystem);

// Traverse to next object
visualization.traverse(ship);

// Render scene
visualization.render(camera);
```

## Architecture

- **Traversal State**: Tracks visible objects and current index for cycling
- **Integration**: Works with Ship controls for camera focusing
- **Filtering**: Only includes named, visible objects (excludes meshes/lights)

## Development 🔧

- Add debug visualization helpers (e.g., bounding boxes, labels)
- Extend traversal to support custom focus behaviors

## Contributing ✨

Document new visualization features and their integration points.
