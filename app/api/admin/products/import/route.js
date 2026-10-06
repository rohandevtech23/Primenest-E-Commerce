import pool from "@/lib/db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";
import * as XLSX from "xlsx";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("primenest-session")?.value;

  if (!token) return false;

  const user = await verifySessionToken(token);
  return user?.role === "admin";
}

// Generate unique slug given a base name and existing slugs set or database
function slugify(text) {
  return (
    String(text || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "product"
  );
}

// Clean string key for flexible matching (removes all non-alphanumeric chars: spaces, parentheses, dashes, etc.)
function cleanKey(str) {
  return String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Smart sheet extractor: detects true header row even with leading empty rows or title banners
export function extractSheetRows(sheet) {
  if (!sheet) return [];
  const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (!grid || grid.length === 0) return [];

  const clean = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

  const headerKeywords = [
    "title", "product", "name", "price", "mrp", "cost", "stock", "qty",
    "quantity", "category", "image", "cover", "gallery", "angle", "slug", "desc", "sku", "rate", "subcat"
  ];

  let headerRowIndex = 0;
  let maxScore = 0;

  const searchLimit = Math.min(grid.length, 25);
  for (let r = 0; r < searchLimit; r++) {
    const row = grid[r];
    if (!Array.isArray(row)) continue;
    let score = 0;
    for (const cell of row) {
      const cellClean = clean(cell);
      if (!cellClean) continue;
      for (const kw of headerKeywords) {
        if (cellClean.includes(kw)) {
          score += 2;
          break;
        }
      }
    }
    if (score > maxScore) {
      maxScore = score;
      headerRowIndex = r;
    }
  }

  const rawHeaders = Array.isArray(grid[headerRowIndex]) ? grid[headerRowIndex] : [];
  const headers = rawHeaders.map((h, i) => {
    const str = String(h || "").trim();
    return str || `col_${i + 1}`;
  });

  const dataRows = [];
  for (let r = headerRowIndex + 1; r < grid.length; r++) {
    const row = grid[r];
    if (!Array.isArray(row)) continue;
    const hasData = row.some((cell) => cell !== null && cell !== undefined && String(cell).trim() !== "");
    if (!hasData) continue;

    const rowObj = {};
    headers.forEach((hdr, colIdx) => {
      rowObj[hdr] = row[colIdx] !== undefined ? row[colIdx] : "";
    });
    dataRows.push(rowObj);
  }

  if (dataRows.length === 0) {
    return XLSX.utils.sheet_to_json(sheet, { defval: "" });
  }

  return dataRows;
}

// Normalize incoming product row object from CSV/Excel
export function normalizeProductRow(rawRow) {
  if (!rawRow || typeof rawRow !== "object") return null;

  const keys = Object.keys(rawRow);
  const getVal = (...fieldNames) => {
    for (const name of fieldNames) {
      const target = cleanKey(name);
      for (const k of keys) {
        if (cleanKey(k) === target && rawRow[k] !== undefined && rawRow[k] !== null && String(rawRow[k]).trim() !== "") {
          return rawRow[k];
        }
      }
    }
    return "";
  };

  let name = String(getVal("name", "title", "producttitle", "productname", "itemname", "item") || "").trim();
  if (!name) {
    for (const k of keys) {
      const ck = cleanKey(k);
      if (
        (ck.includes("title") || (ck.includes("product") && !ck.includes("slug") && !ck.includes("url") && !ck.includes("desc") && !ck.includes("image") && !ck.includes("cat"))) &&
        rawRow[k] !== undefined &&
        rawRow[k] !== null &&
        String(rawRow[k]).trim() !== ""
      ) {
        name = String(rawRow[k]).trim();
        break;
      }
    }
  }
  
  let slug = String(getVal("slug", "productslug") || "").trim();
  if (!slug && name) {
    slug = slugify(name);
  } else if (slug) {
    slug = slugify(slug);
  }

  const description = String(getVal("description", "desc", "details", "productdescription", "detail") || "").trim();

  // Price extraction: match exact key or any key containing 'price', 'mrp', 'cost', 'rate', 'amount'
  let priceRaw = getVal("price", "priceinr", "mrp", "cost", "rate", "amount", "unitprice");
  if (priceRaw === "") {
    for (const k of keys) {
      const ck = cleanKey(k);
      if (
        (ck.includes("price") || ck.includes("mrp") || ck.includes("cost") || ck.includes("amount") || ck.includes("rate")) &&
        rawRow[k] !== undefined &&
        rawRow[k] !== null &&
        String(rawRow[k]).trim() !== ""
      ) {
        priceRaw = rawRow[k];
        break;
      }
    }
  }

  let price = null;
  if (typeof priceRaw === "number" && Number.isFinite(priceRaw) && priceRaw > 0) {
    price = priceRaw;
  } else if (priceRaw !== "" && priceRaw !== undefined && priceRaw !== null) {
    const cleanNum = String(priceRaw).replace(/,/g, "").replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleanNum);
    if (Number.isFinite(parsed) && parsed > 0) {
      price = parsed;
    }
  }

  // Stock Units
  let stockRaw = getVal("stock", "stockunits", "quantity", "qty", "inventory", "units", "totalunits");
  if (stockRaw === "") {
    for (const k of keys) {
      const ck = cleanKey(k);
      if (
        (ck.includes("stock") || ck.includes("qty") || ck.includes("quantity") || ck.includes("units")) &&
        rawRow[k] !== undefined &&
        rawRow[k] !== null &&
        String(rawRow[k]).trim() !== ""
      ) {
        stockRaw = rawRow[k];
        break;
      }
    }
  }

  let stock = 10;
  if (typeof stockRaw === "number" && Number.isInteger(stockRaw) && stockRaw >= 0) {
    stock = stockRaw;
  } else if (stockRaw !== "" && stockRaw !== undefined && stockRaw !== null) {
    const parsedStock = parseInt(String(stockRaw).replace(/[^0-9]/g, ""), 10);
    if (Number.isInteger(parsedStock) && parsedStock >= 0) {
      stock = parsedStock;
    }
  }

  let categoryRaw = String(getVal("category", "categoryname", "catogary", "catogaryname", "categoryid", "cat") || "").trim();
  if (!categoryRaw) {
    for (const k of keys) {
      const ck = cleanKey(k);
      if (ck.includes("cat") && !ck.includes("sub") && rawRow[k] && String(rawRow[k]).trim() !== "") {
        categoryRaw = String(rawRow[k]).trim();
        break;
      }
    }
  }

  let subcategory = String(getVal("subcategory", "subcategoryname", "subcatogary", "subcatogaryname", "subcat") || "").trim();
  if (!subcategory) {
    for (const k of keys) {
      const ck = cleanKey(k);
      if (ck.includes("subcat") && rawRow[k] && String(rawRow[k]).trim() !== "") {
        subcategory = String(rawRow[k]).trim();
        break;
      }
    }
  }

  // Robust multi-image extraction: captures all 5+ image links
  const images = [];
  const urlRegex = /(https?:\/\/[^\s"',;<>|]+)/gi;

  // If already an array of image strings
  if (Array.isArray(rawRow.images)) {
    for (const u of rawRow.images) {
      if (typeof u === "string" && /^https?:\/\//i.test(u) && !images.includes(u)) {
        images.push(u);
      }
    }
  }

  // 1. Primary/Cover angle first (Slot 1)
  for (const k of keys) {
    const ck = cleanKey(k);
    if (
      ck.includes("primary") ||
      ck.includes("cover") ||
      ck.includes("front") ||
      ck === "url1" ||
      ck === "image1" ||
      ck === "image" ||
      ck === "imageurl" ||
      ck === "photo1"
    ) {
      const matches = String(rawRow[k] || "").match(urlRegex) || [];
      for (const m of matches) {
        if (!images.includes(m)) images.push(m);
      }
    }
  }

  // 2. Ordered angle slots (Gallery Angle Image 2, 3, 4, 5, etc. and URL 2..8)
  for (let i = 2; i <= 8; i++) {
    for (const k of keys) {
      const ck = cleanKey(k);
      if (
        ck === `url${i}` ||
        ck === `image${i}` ||
        ck === `image${i}url` ||
        ck === `photo${i}` ||
        ck === `img${i}` ||
        ck === `gallery${i}` ||
        ck.includes(`angleimage${i}`) ||
        ck.includes(`galleryangleimage${i}`) ||
        ck.includes(`galleryangle${i}`) ||
        ck.includes(`angle${i}`) ||
        ck.endsWith(`image${i}`) ||
        ck.endsWith(`${i}`)
      ) {
        const matches = String(rawRow[k] || "").match(urlRegex) || [];
        for (const m of matches) {
          if (!images.includes(m)) images.push(m);
        }
      }
    }
  }

  // 3. Any other columns containing "image", "gallery", "photo", "pic", "img" (ignoring standalone 'url')
  for (const k of keys) {
    const ck = cleanKey(k);
    if (ck === "url" || ck === "producturl" || ck === "link") continue; // skip store product page link
    if (
      ck.includes("image") ||
      ck.includes("gallery") ||
      ck.includes("photo") ||
      ck.includes("img") ||
      ck.includes("picture")
    ) {
      const matches = String(rawRow[k] || "").match(urlRegex) || [];
      for (const m of matches) {
        if (!images.includes(m)) images.push(m);
      }
    }
  }

  // 4. Any remaining cells in the row containing http:// or https://
  for (const k of keys) {
    const ck = cleanKey(k);
    if (ck === "url" || ck === "producturl" || ck === "link") continue;
    const val = String(rawRow[k] || "");
    if (val.includes("http://") || val.includes("https://")) {
      const matches = val.match(urlRegex) || [];
      for (const m of matches) {
        if (!images.includes(m)) images.push(m);
      }
    }
  }

  return {
    name,
    slug,
    description,
    price,
    stock,
    category: categoryRaw,
    subcategory,
    images: images.filter((url) => /^https?:\/\//i.test(url)),
  };
}

export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let client;

  try {
    const contentType = request.headers.get("content-type") || "";
    let rawProducts = [];
    let defaultCategoryId = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      defaultCategoryId = formData.get("default_category_id") ? Number(formData.get("default_category_id")) : null;

      if (!file || typeof file === "string") {
        return Response.json(
          { success: false, message: "No spreadsheet file uploaded." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        return Response.json(
          { success: false, message: "The uploaded spreadsheet has no sheets." },
          { status: 400 }
        );
      }

      const sheet = workbook.Sheets[firstSheetName];
      const rows = extractSheetRows(sheet);

      rawProducts = rows.map(normalizeProductRow).filter(Boolean);
    } else {
      const body = await request.json();
      defaultCategoryId = body.default_category_id ? Number(body.default_category_id) : null;

      if (Array.isArray(body.products)) {
        rawProducts = body.products.map(normalizeProductRow).filter(Boolean);
      } else {
        return Response.json(
          { success: false, message: "Invalid payload: expected products array." },
          { status: 400 }
        );
      }
    }

    if (rawProducts.length === 0) {
      return Response.json(
        { success: false, message: "No product rows found to import." },
        { status: 400 }
      );
    }

    client = await pool.connect();

    // Fetch existing categories
    const categoriesRes = await client.query(
      "SELECT id, name, slug FROM categories ORDER BY id ASC"
    );
    const categories = categoriesRes.rows;

    const categoryMap = new Map();
    for (const c of categories) {
      categoryMap.set(String(c.id), c.id);
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
      categoryMap.set(c.slug.toLowerCase().trim(), c.id);
    }

    // Common category synonyms / aliases
    const aliases = {
      men: "men",
      mens: "men",
      "men's": "men",
      male: "men",
      women: "women",
      womens: "women",
      "women's": "women",
      female: "women",
      shoes: "footwear",
      shoe: "footwear",
      sneakers: "footwear",
      footwear: "footwear",
      accessories: "accessories",
      accessory: "accessories",
      bags: "accessories",
      perfume: "perfume",
      perfumes: "perfume",
      fragrance: "perfume",
      fragrances: "perfume",
    };

    const resolveCategoryId = (val) => {
      if (!val && defaultCategoryId) return defaultCategoryId;
      const str = String(val || "").trim().toLowerCase();
      if (!str) return defaultCategoryId || categories[0]?.id || 1;

      // Direct match in map
      if (categoryMap.has(str)) return categoryMap.get(str);

      // Try aliases
      const aliasTarget = aliases[str];
      if (aliasTarget && categoryMap.has(aliasTarget)) {
        return categoryMap.get(aliasTarget);
      }

      // Partial match
      for (const c of categories) {
        if (str.includes(c.slug) || c.name.toLowerCase().includes(str)) {
          return c.id;
        }
      }

      return defaultCategoryId || categories[0]?.id || 1;
    };

    const results = {
      total: rawProducts.length,
      importedCount: 0,
      skippedCount: 0,
      errors: [],
      importedProducts: [],
    };

    // Process each row safely
    for (let index = 0; index < rawProducts.length; index++) {
      const item = rawProducts[index];
      const rowNumber = index + 2; // Accounting for 1-based header row

      if (!item.name || !item.name.trim()) {
        results.skippedCount++;
        results.errors.push({
          row: rowNumber,
          product: "Unknown",
          message: "Product title/name is missing.",
        });
        continue;
      }

      if (!item.price || item.price <= 0) {
        results.skippedCount++;
        results.errors.push({
          row: rowNumber,
          product: item.name,
          message: `Invalid or missing price for "${item.name}". Must be greater than 0.`,
        });
        continue;
      }

      let targetCategoryId = resolveCategoryId(item.category);
      if (!targetCategoryId) {
        results.skippedCount++;
        results.errors.push({
          row: rowNumber,
          product: item.name,
          message: `Category "${item.category || "Empty"}" could not be matched.`,
        });
        continue;
      }

      // Subcategory normalization
      let subcategoryName = item.subcategory ? item.subcategory.trim() : null;
      if (subcategoryName) {
        if (/^flip\s*flops?$/i.test(subcategoryName)) {
          subcategoryName = "Flip Flops";
        }
        const subLower = subcategoryName.toLowerCase();
        const isFootwearSub =
          subLower.includes("flip") ||
          subLower.includes("slide") ||
          subLower.includes("slider") ||
          subLower.includes("slipper") ||
          subLower.includes("sneaker") ||
          subLower.includes("heel") ||
          subLower.includes("loafer") ||
          subLower.includes("sandal") ||
          subLower.includes("shoe");

        // If subcategory is footwear but category was set to Men or Women in the spreadsheet
        if (isFootwearSub && (targetCategoryId === 1 || targetCategoryId === 2)) {
          targetCategoryId = categoryMap.get("footwear") || 5;
        }
      }

      try {
        await client.query("BEGIN");

        // Unique slug generation
        const baseSlug = slugify(item.slug || item.name);
        let slug = baseSlug;
        let suffix = 1;

        while (true) {
          const existing = await client.query(
            "SELECT id FROM products WHERE slug = $1",
            [slug]
          );
          if (existing.rowCount === 0) break;
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }

        // Subcategory resolution
        let subcategoryId = null;

        if (subcategoryName) {
          const subSlug = slugify(subcategoryName);
          const subRes = await client.query(
            `INSERT INTO subcategories (category_id, name, slug)
             VALUES ($1, $2, $3)
             ON CONFLICT (category_id, name) DO UPDATE
             SET updated_at = CURRENT_TIMESTAMP
             RETURNING id, name`,
            [targetCategoryId, subcategoryName, subSlug]
          );
          if (subRes.rows.length > 0) {
            subcategoryId = subRes.rows[0].id;
            subcategoryName = subRes.rows[0].name;
          }
        }

        // Insert product
        const insertProductRes = await client.query(
          `INSERT INTO products
            (name, slug, description, price, stock, category_id, subcategory, subcategory_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id, name, slug, price, stock, category_id, subcategory`,
          [
            item.name.trim(),
            slug,
            (item.description || "").trim(),
            item.price,
            item.stock,
            targetCategoryId,
            subcategoryName,
            subcategoryId,
          ]
        );

        const newProduct = insertProductRes.rows[0];

        // Insert images into product_images
        const cleanImages = (item.images || []).filter((u) =>
          /^https?:\/\//i.test(u)
        );

        for (let imgIdx = 0; imgIdx < cleanImages.length; imgIdx++) {
          await client.query(
            `INSERT INTO product_images
              (product_id, image_url, is_primary)
             VALUES ($1, $2, $3)`,
            [newProduct.id, cleanImages[imgIdx], imgIdx === 0]
          );
        }

        await client.query("COMMIT");

        results.importedCount++;
        results.importedProducts.push({
          id: newProduct.id,
          name: newProduct.name,
          slug: newProduct.slug,
          price: newProduct.price,
          stock: newProduct.stock,
          imagesCount: cleanImages.length,
          primaryImage: cleanImages[0] || null,
        });
      } catch (rowErr) {
        await client.query("ROLLBACK");
        results.skippedCount++;
        results.errors.push({
          row: rowNumber,
          product: item.name,
          message: rowErr.message || "Failed to save product to database.",
        });
      }
    }

    return Response.json({
      success: true,
      message: `Successfully imported ${results.importedCount} of ${results.total} products.`,
      ...results,
    });
  } catch (error) {
    console.error("Bulk product import error:", error);
    return Response.json(
      {
        success: false,
        message: error.message || "Failed to process bulk product import.",
      },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
