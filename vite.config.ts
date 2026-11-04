import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" supaya jalan di GitHub Pages (https://<akun>.github.io/<repo>/) maupun di domain sendiri
export default defineConfig({
  base: "./",
  plugins: [react()],
});
