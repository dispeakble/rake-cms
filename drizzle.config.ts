import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/*.ts",
  out: "./src/db/migrations",
  dialect: "postgresql", // Will be overridden per-env; also supports "mysql"
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
