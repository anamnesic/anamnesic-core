import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "sqlite",
  schema: "./terminal/src/**/*.sql.ts",
  out: "./terminal/migration",
  dbCredentials: {
    url: "/home/thdxr/.local/share/kairos/kairos.db",
  },
})
