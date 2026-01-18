// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    // Keep the top-level deps.inline to help older Vitest versions
    deps: {
      inline: ["three", "three/examples/jsm/controls/OrbitControls.js"],
    },
    // Also set the server deps inline the officially-recommended place
    server: {
      deps: {
        inline: ["three", "three/examples/jsm/controls/OrbitControls.js"],
      },
    },
    globals: true,
    environmentOptions: {
      jsdom: {
        resources: "usable",
      },
    },
  },
});
