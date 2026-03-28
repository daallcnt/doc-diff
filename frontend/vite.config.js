import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "diff.xn----qd6ew2cx70c6uae40epc.com",
    ],
  },
});
