import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const client = new pg.Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "primenest_db",
});

async function main() {
  await client.connect();
  console.log("Connected to database:", process.env.DB_NAME || "primenest_db");

  // Check categories to be removed
  const targetSlugs = ["home-essentials", "home", "kids", "beauty"];
  const toDelete = await client.query(
    "SELECT id, name, slug FROM categories WHERE LOWER(slug) = ANY($1) OR LOWER(name) = ANY($2)",
    [targetSlugs, ["home essentials", "home", "kids", "beauty"]]
  );

  console.log("Found categories to remove:", toDelete.rows);

  if (toDelete.rows.length > 0) {
    const ids = toDelete.rows.map((r) => r.id);

    // Delete any dependent products if any exist
    const prodRes = await client.query(
      "DELETE FROM products WHERE category_id = ANY($1) RETURNING id, name",
      [ids]
    );
    console.log(`Deleted ${prodRes.rows.length} products linked to these categories.`);

    // Delete the categories
    const catRes = await client.query(
      "DELETE FROM categories WHERE id = ANY($1) RETURNING id, name, slug",
      [ids]
    );
    console.log("Deleted categories:", catRes.rows);
  } else {
    console.log("No matching categories found in database.");
  }

  // Print remaining categories
  const remaining = await client.query("SELECT id, name, slug FROM categories ORDER BY id ASC");
  console.log("Remaining categories in database:", remaining.rows);

  await client.end();
}

main().catch((err) => {
  console.error("Database deletion error:", err);
  process.exit(1);
});
