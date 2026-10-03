import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// 1. Manually parse .env if process.env values are not set
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split(/\r?\n/)) {
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

const config = {
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  password: process.env.DB_PASSWORD || "postgres",
  targetDb: process.env.DB_NAME || "primenest_db",
};

console.log("--------------------------------------------------");
console.log(" PrimeNest Database Setup");
console.log("--------------------------------------------------");
console.log(`Host:     ${config.host}:${config.port}`);
console.log(`User:     ${config.user}`);
console.log(`Database: ${config.targetDb}`);
console.log("--------------------------------------------------");

async function setup() {
  const { Client } = pg;

  // Step 1: Connect to maintenance database 'postgres' to check/create target database
  console.log("-> Connecting to PostgreSQL server...");
  const rootClient = new Client({
    user: config.user,
    host: config.host,
    port: config.port,
    password: config.password,
    database: "postgres",
  });

  try {
    await rootClient.connect();
    console.log("✓ Connected to PostgreSQL server.");
  } catch (err) {
    console.error("✗ Failed to connect to PostgreSQL:", err.message);
    if (err.code === "28P01") {
      console.error("\n[Error 28P01] Password authentication failed.");
      console.error("Please open your .env file and update DB_PASSWORD with your PostgreSQL password.");
    } else if (err.code === "ECONNREFUSED") {
      console.error("\n[Connection Refused] PostgreSQL is not running on port " + config.port);
      console.error("Please ensure the PostgreSQL service is started.");
    }
    process.exit(1);
  }

  try {
    const checkDb = await rootClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.targetDb]
    );

    if (checkDb.rowCount === 0) {
      console.log(`-> Creating database "${config.targetDb}"...`);
      await rootClient.query(`CREATE DATABASE "${config.targetDb}"`);
      console.log(`✓ Database "${config.targetDb}" created.`);
    } else {
      console.log(`✓ Database "${config.targetDb}" already exists.`);
    }
  } finally {
    await rootClient.end();
  }

  // Step 2: Connect to target database and apply schema
  console.log(`-> Connecting to "${config.targetDb}"...`);
  const dbClient = new Client({
    user: config.user,
    host: config.host,
    port: config.port,
    password: config.password,
    database: config.targetDb,
  });

  try {
    await dbClient.connect();
    console.log(`✓ Connected to "${config.targetDb}".`);

    const schemaPath = path.join(rootDir, "schema.sql");
    console.log("-> Reading schema.sql...");
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");

    console.log("-> Applying tables, indexes, and seed data...");
    await dbClient.query(schemaSql);
    console.log("✓ Schema and initial seed data applied successfully!");

    // Step 3: Verify created tables
    console.log("\n-> Verifying tables in database:");
    const tablesRes = await dbClient.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    for (const row of tablesRes.rows) {
      const countRes = await dbClient.query(`SELECT COUNT(*)::int as count FROM "${row.table_name}"`);
      console.log(`   - ${row.table_name.padEnd(20)} (${countRes.rows[0].count} rows)`);
    }

    console.log("\n==================================================");
    console.log(" Database setup completed successfully!");
    console.log("==================================================");
  } catch (err) {
    console.error("✗ Error applying schema:", err);
    process.exit(1);
  } finally {
    await dbClient.end();
  }
}

setup();
