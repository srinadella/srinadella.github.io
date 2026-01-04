import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/docs/mindbody/",
  plugins: [react()],
  build: {
    outDir: "../docs/mindbody",
    emptyOutDir: true
  }
});
