import { fileURLToPath, URL } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// The browser calls same-origin /api requests. In local development Vite
// forwards those requests to VITE_API_BASE_URL, so the backend needs no CORS
// configuration. Production uses the matching Vercel proxy function.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendUrl =
    env.VITE_API_BASE_URL || "https://futsal-be.onrender.com";

  const proxy = {
    "/api": {
      target: backendUrl,
      changeOrigin: true,
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: true, // bind 0.0.0.0 so the preview proxy can reach the dev server
      allowedHosts: true, // allow the sandbox preview hostname
      port: 5173,
      proxy,
    },
    preview: {
      host: true, // bind 0.0.0.0 for the production preview server
      allowedHosts: true, // allow the sandbox preview hostname
      port: 4173,
      proxy,
    },
  };
});
