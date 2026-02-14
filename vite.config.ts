import { defineConfig } from "vite"
import viteConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [viteConfigPaths()]
})