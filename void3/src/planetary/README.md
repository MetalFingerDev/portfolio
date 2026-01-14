# planetary

Purpose: Planet and moon models, orbital mechanics, and planetary systems logic.

---

## Overview ✅

Modules for modeling planets, moons, and orbital systems used by the Void3 simulation and visualization layers. Features a complete config-driven solar system with all 9 planets, integrated hierarchically with star systems.

## Features 🌍

- **Planet Class**: Configurable planet objects with textures, atmospheres, clouds, and orbital positioning
- **Realistic Data**: Astronomical accuracy with proper radii, distances, eccentricities, and rotation speeds
- **Visual Effects**: Support for atmospheres, cloud layers, and custom materials
- **Hierarchical Integration**: Planets can be attached to parent objects (e.g., stars) for proper orbital relationships
- **Solar System**: Complete implementation with Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto

## Usage 💡

```typescript
import Planet, { PlanetConfig } from "./planetary";

const earthConfig: PlanetConfig = {
  name: "Earth",
  radiusMeters: 6371000,
  distanceAU: 1.0,
  rotationSpeedRadPerSec: 7.29e-5,
  texturePath: "earth.jpg",
  hasAtmosphere: true,
  hasClouds: true,
};

const earth = new Planet(earthConfig, ratio, parentObject); // parent can be a Star or Group
```

## Configuration

PlanetConfig interface supports:

- Physical properties (radius, distance, eccentricity)
- Orbital mechanics (rotation speed, axial tilt)
- Visual properties (textures, colors, effects)
- Atmospheric effects (atmosphere, clouds)

## Development 🔧

- Add tests and small demos when changing simulation logic.
- Update planet data with latest astronomical measurements.
- Ensure compatibility with parent object types (Object3D).

## Contributing ✨

Document expected inputs and typical usage patterns for new modules.

> See the top-level README for full project context and contribution guidelines.
