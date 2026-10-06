import pg from "pg";
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

  // 1. Check categories
  const catRes = await client.query(`
    SELECT id, name, slug
    FROM categories
    WHERE LOWER(name) IN ('sweater', 'sweaters', 'suit', 'suits', 'legging', 'leggings')
       OR LOWER(slug) IN ('sweater', 'sweaters', 'suit', 'suits', 'legging', 'leggings')
  `);
  console.log("Matching categories to remove:", catRes.rows);

  // 2. Check products
  const prodRes = await client.query(`
    SELECT id, name, slug, subcategory, category_id
    FROM products
    WHERE LOWER(subcategory) IN ('sweater', 'sweaters', 'suit', 'suits', 'legging', 'leggings')
       OR LOWER(subcategory) LIKE '%sweater%'
       OR LOWER(subcategory) LIKE '%suit%'
       OR LOWER(subcategory) LIKE '%legging%'
  `);
  console.log(`Found ${prodRes.rows.length} products matching sweater, suit, or legging:`);
  console.table(prodRes.rows.map(r => ({ id: r.id, name: r.name, subcategory: r.subcategory })));

  const productIds = prodRes.rows.map(r => r.id);
  const categoryIds = catRes.rows.map(r => r.id);

  if (productIds.length > 0) {
    console.log(`Cleaning up relations for ${productIds.length} products...`);
    const tables = [
      "product_variants",
      "cart_items",
      "wishlist_items",
      "wishlists",
      "reviews",
      "product_images",
      "order_items"
    ];

    for (const table of tables) {
      try {
        const delRes = await client.query(
          `DELETE FROM ${table} WHERE product_id = ANY($1) RETURNING *`,
          [productIds]
        );
        console.log(`Deleted ${delRes.rowCount} rows from ${table}`);
      } catch (err) {
        // Table or column might not exist
      }
    }

    const delProd = await client.query(
      "DELETE FROM products WHERE id = ANY($1) RETURNING id, name",
      [productIds]
    );
    console.log(`Successfully deleted ${delProd.rowCount} products from database.`);
  } else {
    console.log("No matching products found in database.");
  }

  if (categoryIds.length > 0) {
    const delCat = await client.query(
      "DELETE FROM categories WHERE id = ANY($1) RETURNING id, name",
      [categoryIds]
    );
    console.log(`Successfully deleted ${delCat.rowCount} categories:`, delCat.rows);
  }

  // 3. Verify remaining counts
  const remaining = await client.query(`
    SELECT COUNT(*) as count
    FROM products
    WHERE LOWER(subcategory) IN ('sweater', 'sweaters', 'suit', 'suits', 'legging', 'leggings')
       OR LOWER(subcategory) LIKE '%sweater%'
       OR LOWER(subcategory) LIKE '%suit%'
       OR LOWER(subcategory) LIKE '%legging%'
  `);
  console.log("Remaining matching products count:", remaining.rows[0].count);

  await client.end();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
