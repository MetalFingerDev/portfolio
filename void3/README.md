# void3

A modular TypeScript project for space visualization and simulation built with Three.js and a small systems architecture. Explore the solar system with accurate astronomical ratios and interactive controls.

---

## Features 🌌

- **Solar System Simulation**: Complete solar system with all 9 planets (including Pluto) featuring accurate astronomical data, textures, and effects (clouds, atmosphere)
- **Realistic Ratios**: Planet sizes, orbital distances, and star sizes scaled to real astronomical proportions (e.g., Sun is 109x Earth's radius)
- **Interstellar Space**: Procedural starfield with randomized star properties for broader exploration
- **Interactive Controls**:
  - Ship controls for navigation through space
  - Keyboard shortcuts: 'L' to toggle Level of Detail, 'S' to switch between Solar System and Interstellar Space
- **LOD System**: Dynamic level-of-detail switching for performance optimization across systems
- **Modular Architecture**: Clean separation of systems, regions, and components with hierarchical scene graphs
- **Extensible Entities**: Config-driven planets and stars with support for custom visuals and behaviors

## Quick start 🚀

1. Install dependencies: `pnpm install`
2. Build: `pnpm build` or use package scripts defined in the workspace root
3. Type-check: `pnpm -w run typecheck` (workspace-level)
4. Run dev server: `pnpm dev`

## Controls 🎮

- **Movement**: Use mouse and keyboard for ship navigation
- **LOD Toggle**: Press 'L' to switch between high/low detail modes for the active system
- **System Switch**: Press 'S' to toggle between Solar System and Interstellar Space views
- **Object Traversal**: Press 'T' to cycle through visible named objects (planets, stars) and focus the camera at optimal distances

## Architecture Overview 🏗️

- **SystemManager**: Central hub for loading and switching between celestial systems (e.g., solar-system, interstellar-space)
- **BaseSystem**: Abstract base for systems with high-detail and placeholder representations
- **Regions**: Implement specific systems like SolarSystem (planets orbiting sun) and InterstellarSpace (starfield)
- **Entities**: Star and Planet classes with config-driven instantiation and hierarchical relationships
- **Rendering**: Three.js-based display with optimized scene management

## Project structure 🔍

- `src/` — main TypeScript source; subdivided into `components`, `rendering`, `systems`, `scenes`, `shaders`, etc.
- `public/` — static assets, textures, and catalogs
- `tests/` — unit and integration tests

## Contributing ✨

- Keep changes small and well-tested wherever possible.
- Add README updates for any new folders or public modules you introduce.
- Follow the code style and add examples or screenshots for visual changes.
- Document new systems, entities, or features in relevant READMEs.

## License

See repository-level license (if present).
