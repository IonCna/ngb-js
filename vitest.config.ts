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
  },
});
