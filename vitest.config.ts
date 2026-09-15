import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {defineConfig} from "vitest/config";

export default defineConfig({
  plugins: [
    {
      name: "html-loader",
      enforce: "pre",
      async load(id) {
        if(id.endsWith(".html")) {
          return `export default ${JSON.stringify(await readFile(id, "utf8"))}`;
        }
      },
    },
  ],
  resolve: {
    alias: {
      "@ngb": fileURLToPath(new URL("./src", import.meta.url)),
      "@demo": fileURLToPath(new URL("./demo/app", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    // Default (5000ms) es angosto para los specs de modal/offcanvas: `flush()`
    // hace 60 iteraciones reales de `setTimeout(0)`, y desde que las
    // transiciones de entrada esperan a que el elemento esté `isConnected`
    // antes de animar (`afterAttachedRender`, ver `@ngb/utils`) necesitan
    // un tick real más — corriendo la suite completa en paralelo (más
    // contención de CPU) alguno de esos specs pasa el default sin que haya
    // nada roto (corridos solos tardan ~1-3s).
    testTimeout: 10000,
  },
});
