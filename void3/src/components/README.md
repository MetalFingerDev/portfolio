# components

Purpose: Reusable UI/game/3D components (ships, HUDs, widgets) and small composable modules.

---

## Overview ✅

This folder contains reusable components used throughout the Void3 project (UI, controls, small systems). Each module is small and focused; prefer composition and composition-based APIs.

## Usage 💡

Import and use components where needed. Example:

```ts
import { Ship } from "../controls";
```

Adjust relative paths based on your file location.

## Development 🔧

- Use workspace scripts from the repo root to build and type-check (e.g., `pnpm build`, `pnpm -w run typecheck`).
- Add or update tests when adding new behavior.

## Contributing ✨

Follow existing code patterns and add brief usage examples to this README when introducing significant modules.

> See the top-level README for full project context and contribution guidelines.
