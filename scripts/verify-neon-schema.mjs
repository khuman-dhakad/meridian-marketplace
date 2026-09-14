import path from "node:path";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifySchema() {
  console.log("=== 1. VERIFY TABLES IN NEON ===");
  const tables = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `;
  const tableNames = tables.map((t) => t.table_name);
  console.log(`Found ${tableNames.length} tables:`, tableNames);

  const expectedModels = [
    "Category",
    "Conversation",
    "Favorite",
    "Listing",
    "ListingImage",
    "ListingPromotion",
    "Location",
    "Message",
    "Profile",
    "Report",
    "Session",
    "User",
    "Verification",
    "_prisma_migrations",
  ];
  for (const expected of expectedModels) {
    if (!tableNames.includes(expected)) {
      throw new Error(`Missing expected table: ${expected}`);
    }
  }
  console.log("✔ All 13 expected domain tables + _prisma_migrations exist in Neon.");

  console.log("\n=== 2. VERIFY ENUMS IN NEON ===");
  const enums = await prisma.$queryRaw`
    SELECT t.typname as enum_name, array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname
    ORDER BY t.typname;
  `;
  enums.forEach((e) => {
    console.log(`Enum ${e.enum_name}: [${e.values.join(", ")}]`);
  });
  console.log(`✔ All ${enums.length} enums confirmed in Neon.`);

  console.log("\n=== 3. VERIFY CONSTRAINTS IN NEON ===");
  const constraints = await prisma.$queryRaw`
    SELECT tc.table_name, tc.constraint_name, tc.constraint_type
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_type;
  `;
  const counts = constraints.reduce((acc, c) => {
    acc[c.constraint_type] = (acc[c.constraint_type] || 0) + 1;
    return acc;
  }, {});
  console.log("Constraint counts:", counts);
  console.log("✔ Primary Keys:", counts["PRIMARY KEY"]);
  console.log("✔ Foreign Keys:", counts["FOREIGN KEY"]);
  console.log("✔ Unique Constraints:", counts["UNIQUE"]);

  console.log("\n=== 4. VERIFY INDEXES IN NEON ===");
  const indexes = await prisma.$queryRaw`
    SELECT tablename, indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `;
  console.log(`Total public indexes in Neon: ${indexes.length}`);

  await prisma.$disconnect();
}

verifySchema().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
