# controls

Purpose: Input and camera control modules (flight controls, orbit controls, and input mapping).

---

## Overview

Provides ship and camera controls, an `InputHandler` for keyboard shortcuts, and helpers to integrate with the `SystemManager`.

## Features 🎮

- **Ship Controls**: 3D flight controls for navigating through space scenes
- **Camera Integration**: Automatic camera positioning and movement synchronized with scene updates
- **Keyboard Shortcuts**:
  - 'L': Toggle Level of Detail for current system
  - 'S': Switch between Solar System and Interstellar Space
  - 'T': Traverse and focus on visible named objects (planets, stars)
- **InputHandler**: Centralized keyboard input processing with system integration
- **Resize Handling**: Automatic viewport adjustment for responsive design
- **System Integration**: Controls work seamlessly with SystemManager for LOD and system switching

## Usage 💡

```typescript
import { Ship, InputHandler } from "./controls";

// Initialize ship
const ship = new Ship(canvas);

// Create input handler with dependencies
const inputHandler = new InputHandler(ship, systemManager, visualization);

// Handle keyboard input
document.addEventListener("keydown", (e) => inputHandler.handleKey(e.key));
```

## Architecture

- **Ship Class**: Main flight controller with mouse/keyboard input and camera management
- **InputHandler Class**: Processes keyboard shortcuts and coordinates with system/visualization modules
- **Event Handling**: DOM event listeners for user input and system controls
- **State Management**: Position, rotation, and camera synchronization with scene entities

## Development 🔧

- Add tests for input parsing and edge cases; document initialization steps.
- Test control responsiveness across different viewport sizes and system states.
- Extend InputHandler for additional shortcuts or input devices.

## Notes (2026-01-18)

- The `Ship` class provides `focusOn` and `focusOnRegion` helpers that the main loop uses to programmatically position the camera on objects or regions.
- For rigid locks (e.g., tracking a moving planet like Earth), disabling `controls.enableDamping` prevents slight camera drift and is recommended when moving the camera by object displacement each frame.

## Contributing ✨

Add usage examples and document any assumptions about input devices or coordinate conventions.

> See the top-level README for full project context and contribution guidelines.
