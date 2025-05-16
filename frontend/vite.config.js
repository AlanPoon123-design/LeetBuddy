import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      react(),

      {
        name: "generate-manifest",
        generateBundle() {
          const template = fs.readFileSync("manifest.template.json", "utf-8");

          const backendUrls = [env.VITE_API_URL, env.VITE_API_URL_2]
            .filter(Boolean)
            .map((url) => `"${url}/*"`);

          const processed = template.replace(
            '"__BACKEND_PERMISSIONS__"',
            backendUrls.join(",\n    ")
          );

          this.emitFile({
            type: "asset",
            fileName: "manifest.json",
            source: processed,
          });
        },
      },
    ],

    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.html"),
          background: resolve(__dirname, "src/background/background.js"),
        },
        output: {
          entryFileNames: (chunkInfo) =>
            chunkInfo.name === "background"
              ? "[name].js"
              : "assets/[name]-[hash].js",
        },
      },
    },

    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(env.VITE_API_URL),
      "import.meta.env.VITE_API_URL_2": JSON.stringify(env.VITE_API_URL_2),
    },
  };
});
