# stellar

Purpose: Code and models for stars and stellar phenomena (e.g., Sun, star properties, spectrums, stellar evolution).

---

## Overview ✅

Models and utilities for representing stars, spectrums, and stellar phenomena. Features realistic star rendering with lighting and visual effects.

## Features ⭐

- **Star Class**: Configurable star objects with luminosity, size, and color
- **Lighting**: Point lights that illuminate nearby objects realistically
- **Solar System Integration**: Accurate sun representation with proper scaling
- **Procedural Generation**: Randomized star properties for interstellar scenes

## Usage 💡

```typescript
import Star from "./stellar";

// Create the Sun with realistic properties
const sun = new Star(5.0, 109, 0xffff00); // luminosity, radius, color

// Create procedural stars
const star = new Star(
  0.5 + Math.random() * 1.5, // random luminosity
  0.8 + Math.random() * 0.5, // random radius
  randomColor // random color
);

// Create a star with planets attached
const planets = [earth, mars, jupiter];
const sunWithPlanets = new Star(5.0, 109, 0xffff00, planets);

// Or add planets later
sun.addPlanets([venus, saturn]);
```

## Properties

- **Luminosity**: Controls light intensity (affects illumination range)
- **Radius**: Visual size of the star sphere
- **Color**: Hex color for both mesh and light emission
- **Planets**: Optional array of planet objects to attach during initialization

## Methods

- **addPlanets(planets: THREE.Object3D[])**: Adds an array of planet objects to the star's coordinate system

## Hierarchical Relationships 🏗️

Stars serve as central objects in planetary systems:

- Planets are attached as children for proper orbital relationships
- Coordinate system allows relative positioning and rotation
- Lighting affects child planets realistically

## Development 🔧

- Add tests and small visualization examples for new algorithms.
- Validate lighting behavior with different luminosity values.
- Ensure planet attachment works with scene graph hierarchies.

## Contributing ✨

Document parameter choices and references for any scientific models.

> See the top-level README for full project context and contribution guidelines.
