import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  appType: "mpa",
  build: { rollupOptions: { input: { menu: resolve(import.meta.dirname, "index.html"), level1: resolve(import.meta.dirname, "levels/level_1.html") } } }
});
