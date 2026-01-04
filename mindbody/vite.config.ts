import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/mindbody/",
  plugins: [react()],
  build: {
    outDir: "../docs/mindbody",
    emptyOutDir: true
  }
});
