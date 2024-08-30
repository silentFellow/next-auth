import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./lib/drizzle/schema.ts",
  out: "./lib/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL as string
  },
  verbose: true,
  strict: true
})
