import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";
import runableWebsiteRuntime from "runable-website-runtime";

export default defineConfig({
  plugins: [react(), runableWebsiteRuntime(), tailwind()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/web"),
    },
  },
  server: {
    allowedHosts: true,
  },
});
