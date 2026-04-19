import { defineConfig } from "vite";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;
// @ts-expect-error process is a nodejs global
const base: string = process.env.PANDOKU_BASE ?? "/";

// `PANDOKU_BASE` is set to "/pandoku/" by the GitHub Pages deploy workflow so
// assets resolve correctly under rriiot.github.io/pandoku/. Left as "/" for
// `pnpm tauri build` (the Tauri shell serves the bundle from the app root).
export default defineConfig(async () => ({
  base,
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
}));
