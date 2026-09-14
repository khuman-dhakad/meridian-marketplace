import path from "node:path";
import dotenv from "dotenv";
import { defineConfig } from "@prisma/config";

// Load environment variables from .env.local (higher priority) then .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export default defineConfig({
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
