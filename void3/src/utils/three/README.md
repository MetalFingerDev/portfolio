# utils/three

Purpose: Helper utilities and wrappers for Three.js usage.

---

## Overview

Small helpers to reduce boilerplate when setting up scenes, transforms, and common operations

## Usage 💡

Import helpers for consistent scene setup and avoid duplicating boilerplate.

## Development 🔧

- Document key helper functions and add small tests where applicable.

## Notes (2026-01-18)

- The project main loop now calls per-frame updates on region objects (e.g., `solarSystem.update(delta)`). Helpers in this module are used for camera positioning and scene transforms that support this pattern.

## Contributing ✨

Add usage examples for new helpers.

> See the top-level README for full project context and contribution guidelines.
