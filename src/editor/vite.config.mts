import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath, URL } from "url";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("../../../src/engine", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
