import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
  server: {
    cors: true, // CORS für lokale Entwicklung aktivieren
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/main.ts"),
      name: "MWDragToUpload",
      fileName: "index",
    },
  },
  define: {
    __APP_ID__: JSON.stringify("d2c8673e-a0ad-4aae-b7b8-9904cdea1501"),
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_HOMEPAGE__: JSON.stringify(packageJson.homepage),
    __APP_BUILD_DATE__: JSON.stringify(Date.now()),
    // TODO: A workaround for `process is not defined`
    // This is not a real solution, but it works for now.
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
});
