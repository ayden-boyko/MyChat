import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@": path.resolve(__dirname, "./src"), // General alias for src directory
    },
  },
  server: {
    host: "0.0.0.0", // This allows access from other devices on the network
    port: 5173, // Ensure the port matches what you want to use
  },
});
