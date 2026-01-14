# controls

Purpose: Input and camera control code, e.g., orbit controls, flight controls.

---

## Overview ✅

Input and camera control modules, including flight/orbit controls and input mapping utilities. Features ship-based navigation and keyboard shortcuts for system control, integrated with the broader simulation.

## Features 🎮

- **Ship Controls**: 3D flight controls for navigating through space scenes
- **Camera Integration**: Automatic camera positioning and movement synchronized with scene updates
- **Keyboard Shortcuts**:
  - 'L': Toggle Level of Detail for current system
  - 'S': Switch between Solar System and Interstellar Space
- **Resize Handling**: Automatic viewport adjustment for responsive design
- **System Integration**: Controls work seamlessly with SystemManager for LOD and system switching

## Usage 💡

```typescript
import { Ship } from "./controls";

// Initialize with canvas element
const ship = new Ship(canvas);

// Update in animation loop
ship.update(deltaTime);

// Handle window resize
ship.handleResize(width, height);
```

## Architecture

- **Ship Class**: Main flight controller with mouse/keyboard input and camera management
- **Event Handling**: DOM event listeners for user input and system controls
- **State Management**: Position, rotation, and camera synchronization with scene entities

## Development 🔧

- Add tests for input parsing and edge cases; document initialization steps.
- Test control responsiveness across different viewport sizes and system states.

## Contributing ✨

Add usage examples and document any assumptions about input devices or coordinate conventions.

> See the top-level README for full project context and contribution guidelines.
