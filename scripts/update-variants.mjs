import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env.local then .env
const loadEnv = (filename) => {
  const filePath = path.join(rootDir, filename);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8");
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
};

loadEnv(".env.local");
loadEnv(".env");

const pool = new pg.Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "primenest_db",
  password: String(process.env.DB_PASSWORD || ""),
  port: Number(process.env.DB_PORT || 5432),
});

async function main() {
  console.log("Connecting to primenest_db to update Footwear & Perfume variants...");
  const client = await pool.connect();

  try {
    // 1. Fetch categories
    const catRes = await client.query("SELECT id, name, slug FROM categories");
    console.log("Categories:", catRes.rows);

    const footwearCat = catRes.rows.find((c) => c.slug === "footwear" || c.name.toLowerCase() === "footwear");
    const perfumeCat = catRes.rows.find((c) => c.slug === "perfume" || c.name.toLowerCase() === "perfume");

    // Standard Men's Shoe Sizes
    const menShoeVariants = [
      { label: "UK 6", stock: 12 },
      { label: "UK 7", stock: 15 },
      { label: "UK 8", stock: 18 },
      { label: "UK 9", stock: 16 },
      { label: "UK 10", stock: 10 },
      { label: "UK 11", stock: 8 },
    ];

    // Standard Women's Shoe Sizes
    const womenShoeVariants = [
      { label: "UK 4", stock: 10 },
      { label: "UK 5", stock: 14 },
      { label: "UK 6", stock: 16 },
      { label: "UK 7", stock: 12 },
      { label: "UK 8", stock: 8 },
    ];

    // Standard Perfume Sizes (100ml, 150ml)
    const perfumeVariants = [
      { label: "100ml", stock: 25 },
      { label: "150ml", stock: 18 },
    ];

    // 2. Update Footwear
    if (footwearCat) {
      const shoes = await client.query(
        "SELECT id, name, subcategory FROM products WHERE category_id = $1",
        [footwearCat.id]
      );
      console.log(`Found ${shoes.rows.length} footwear products to update.`);

      for (const shoe of shoes.rows) {
        const isWomen = (shoe.subcategory || "").toLowerCase().includes("women");
        const variants = isWomen ? womenShoeVariants : menShoeVariants;

        await client.query(
          `UPDATE products
           SET variants = $1::jsonb,
               variant_label = $2
           WHERE id = $3`,
          [JSON.stringify(variants), "Shoe Size (UK/IN)", shoe.id]
        );
      }
      console.log(`✓ Updated all ${shoes.rows.length} footwear items with shoe sizes (UK 6 - UK 11).`);
    }

    // 3. Update Perfumes
    if (perfumeCat) {
      const perfumes = await client.query(
        "SELECT id, name, subcategory FROM products WHERE category_id = $1",
        [perfumeCat.id]
      );
      console.log(`Found ${perfumes.rows.length} perfume products to update.`);

      for (const perfume of perfumes.rows) {
        await client.query(
          `UPDATE products
           SET variants = $1::jsonb,
               variant_label = $2
           WHERE id = $3`,
          [JSON.stringify(perfumeVariants), "Bottle Size", perfume.id]
        );
      }
      console.log(`✓ Updated all ${perfumes.rows.length} perfume items with 100ml, 150ml options.`);
    }

    console.log("Done!");
  } catch (err) {
    console.error("Error updating variants:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
