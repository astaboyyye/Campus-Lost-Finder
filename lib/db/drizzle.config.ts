import { defineConfig } from "drizzle-kit";
import path from "path";

try {
  process.loadEnvFile(path.resolve(__dirname, "..", "..", ".env.local"));
} catch {
  // Environment variables may already be provided by CI or the host.
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: `${path.resolve(__dirname, "src", "schema").replaceAll("\\", "/")}/*.ts`,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
