import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const angularEntry = fileURLToPath(new URL("../node_modules/angular/index.js", import.meta.url));
const rxjsEntry = fileURLToPath(new URL("../node_modules/rxjs/dist/esm/index.js", import.meta.url));
const demoRoot = fileURLToPath(new URL(".", import.meta.url));

const htmlLoader: esbuild.Plugin = {
  name: "html-loader",
  setup(build) {
    build.onLoad({ filter: /\.html$/ }, async ({ path }) => ({
      contents: `export default ${JSON.stringify(await readFile(path, "utf8"))}`,
      loader: "js",
    }));
  },
};

const ctx = await esbuild.context({
  entryPoints: [
    fileURLToPath(new URL("./main.ts", import.meta.url)),
    fileURLToPath(new URL("./style.css", import.meta.url)),
  ],
  outdir: fileURLToPath(new URL("./dist", import.meta.url)),
  bundle: true,
  alias: {
    angular: angularEntry,
    rxjs: rxjsEntry,
  },
  tsconfig: fileURLToPath(new URL("./tsconfig.json", import.meta.url)),
  plugins: [htmlLoader],
  sourcemap: true,
});

await ctx.watch();

const { hosts, port } = await ctx.serve({
  servedir: demoRoot,
});

console.log(`http://${hosts[0]}:${port}`);
