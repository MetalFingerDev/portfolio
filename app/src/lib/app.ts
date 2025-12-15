// app.ts
// Centralized state management for your Svelte app

import { writable } from "svelte/store";

// Example state: theme
export const theme = writable<"light" | "dark">("light");

// Example state: user
export const user = writable<{ name: string; loggedIn: boolean } | null>(null);

// Add more states as needed

// Example: 3D scene state (if you want to share Three.js objects)
// import type { Scene, Camera, WebGLRenderer } from 'three';
// export const threeState = writable<{
//   scene?: Scene;
//   camera?: Camera;
//   renderer?: WebGLRenderer;
// }>({});
