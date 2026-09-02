/// <reference types="node" />

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const rootDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(rootDir, "dist");
const typesDir = join(outDir, "types");
const entryPoint = "./src/index.ts";

const external = ["angular", "rxjs", "rxjs/*", "@popperjs/core", "ngjs-core", "ngjs-core/*"];

const htmlLoader: esbuild.Plugin = {
  name: "html-loader",
  setup(build) {
    build.onLoad({ filter: /\.html$/ }, async ({ path }) => ({
      contents: `export default ${JSON.stringify(await readFile(path, "utf8"))}`,
      loader: "js",
    }));
  },
};

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const commonOptions: esbuild.BuildOptions = {
  absWorkingDir: rootDir,
  entryPoints: [entryPoint],
  bundle: true,
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  sourcesContent: true,
  external,
  plugins: [htmlLoader],
  tsconfig: join(rootDir, "tsconfig.json"),
  legalComments: "eof",
  logLevel: "info",
};

await Promise.all([
  esbuild.build({
    ...commonOptions,
    format: "esm",
    outfile: join(outDir, "ngb-js.js"),
  }),
  esbuild.build({
    ...commonOptions,
    format: "cjs",
    outfile: join(outDir, "ngb-js.cjs"),
  }),
]);

execFileSync(process.execPath, ["x", "tsc", "-p", join(rootDir, "tsconfig.build.json")], {
  cwd: rootDir,
  stdio: "inherit",
});

async function listDeclarations(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? listDeclarations(path) : Promise.resolve(path.endsWith(".d.ts") ? [path] : []);
    }),
  );
  return files.flat();
}

function declarationTarget(fromFile: string, specifier: string): string {
  let target: string;
  if (specifier === "@ngb") {
    target = join(typesDir, "index");
  } else if (specifier.startsWith("@ngb/")) {
    target = join(typesDir, specifier.slice("@ngb/".length));
  } else {
    target = resolve(dirname(fromFile), specifier);
  }

  target = target.replace(/\.ts$/, "");
  if (existsSync(`${target}.d.ts`)) {
    target = `${target}.js`;
  } else if (existsSync(join(target, "index.d.ts"))) {
    target = join(target, "index.js");
  } else if (extname(target) === "") {
    return specifier;
  }

  let rewritten = relative(dirname(fromFile), target).split(sep).join("/");
  if (!rewritten.startsWith(".")) rewritten = `./${rewritten}`;
  return rewritten;
}

for (const declaration of await listDeclarations(typesDir)) {
  const source = await readFile(declaration, "utf8");
  const rewritten = source.replace(
    /(["'])(@ngb(?:\/[^"']+)?|\.\.?\/[^"']+)\1/g,
    (_match, quote: string, specifier: string) => `${quote}${declarationTarget(declaration, specifier)}${quote}`,
  );
  await writeFile(declaration, rewritten);
}

console.log("Build completed: dist/ngb-js.js, dist/ngb-js.cjs and dist/types/index.d.ts");
