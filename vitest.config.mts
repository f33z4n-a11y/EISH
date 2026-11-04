import { defineConfig } from "vitest/config";
import path from "node:path";
export default defineConfig({
  resolve: { alias: { "@": path.resolve("src") } },
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    fileParallelism: false,
    env: {
      AUTH_SECRET: "nilai-pengujian-sintetis-tidak-untuk-produksi",
      APP_URL: "http://localhost:3000",
    },
  },
});
