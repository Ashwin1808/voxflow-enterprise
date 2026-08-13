import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/v/",
  plugins: [react()],
  server: {
    port: 4180,
    proxy: {
      "/public": "http://localhost:8082",
    },
  },
});
