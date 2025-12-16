<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { initScene } from "../lib/three/initScene";

  let canvas: HTMLCanvasElement | null = null;
  let sceneHandle: {
    start: () => void;
    stop: () => void;
    dispose: () => void;
  } | null = null;

  onMount(() => {
    if (!canvas) return;
    sceneHandle = initScene(canvas);
    sceneHandle?.start();
  });

  onDestroy(() => {
    sceneHandle?.stop();
    sceneHandle?.dispose();
  });
</script>

<canvas bind:this={canvas} id="bg" class="fixed top-0 left-0 w-screen h-screen"
></canvas>
