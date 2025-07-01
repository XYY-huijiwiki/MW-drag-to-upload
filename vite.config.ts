import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

const packageJson = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf-8")
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    Components({ resolvers: [NaiveUiResolver()] }),
    tailwindcss(),
    cssInjectedByJsPlugin(),
    vue(),
  ],
  build: {
    manifest: true, // Manifest-Datei für die Produktion erstellen
  },
  server: {
    cors: true, // CORS für lokale Entwicklung aktivieren
  },
  define: {
    __APP_ID__: JSON.stringify("d2c8673e-a0ad-4aae-b7b8-9904cdea1501"),
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_HOMEPAGE__: JSON.stringify(packageJson.homepage),
    __APP_BUILD_DATE__: JSON.stringify(Date.now()),
  },
  base: "https://cdn.jsdelivr.net/gh/XYY-huijiwiki/MW-drag-to-upload@dist/",
});
