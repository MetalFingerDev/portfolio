# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Three.js integration

This project includes a small Three.js demo:

- The canvas element lives in `src/routes/+page.svelte` and is bound with `bind:this` so the component can pass it to the renderer.
- The Three.js setup lives in `src/lib/index.ts` and exposes a small API: `{ start, stop, dispose }`.
- Static assets (e.g. `space.jpg`) are in `static/` and can be referenced from the root as `/space.jpg`.

This is a minimal integration example — see the source files above for comments and lifecycle details.
