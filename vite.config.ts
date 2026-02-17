import { defineConfig } from "vite"
import viteConfigPaths from "vite-tsconfig-paths"

export default defineConfig({
    plugins: [viteConfigPaths()],
    test: {
        environment: "jsdom",
        setupFiles: ["./test/setup.ts"],
        include: ["**/*.{test,spec}.ts"]
    }
})
