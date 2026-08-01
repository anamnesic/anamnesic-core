import { readFileSync } from "node:fs"
import solidPlugin from "vite-plugin-solid"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { fileURLToPath } from "url"

const theme = fileURLToPath(new URL("./public/oc-theme-preload.js", import.meta.url))

export default defineConfig({
  plugins: [
    {
      name: "kairos-web:config",
      config() {
        return {
          resolve: {
            alias: {
              "@": fileURLToPath(new URL("./src", import.meta.url)),
              "@infra": fileURLToPath(new URL("../../terminal/packages/infra/src", import.meta.url)),
            },
          },
          worker: {
            format: "es",
          },
        }
      },
    },
    {
      name: "kairos-web:theme-preload",
      transformIndexHtml(html: string) {
        return html.replace(
          '<script id="oc-theme-preload-script" src="/oc-theme-preload.js"></script>',
          `<script id="oc-theme-preload-script">${readFileSync(theme, "utf8")}</script>`,
        )
      },
    },
    tailwindcss(),
    solidPlugin(),
  ],
  publicDir: "./public",
  clearScreen: false,
  esbuild: {
    keepNames: true,
  },
  server: {
    port: 1420,
    strictPort: true,
  },
})
