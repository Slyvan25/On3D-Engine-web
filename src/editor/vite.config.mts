import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath, URL } from "url";
import path from "path";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "@engine": fileURLToPath(new URL("../../../src/engine", import.meta.url)),
      three: path.resolve(fileURLToPath(new URL("./", import.meta.url)), "node_modules/three"),
    },
  },
  server: {
    port: 5173,
  },
});
