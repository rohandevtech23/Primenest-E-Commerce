
import pool from "@/lib/db";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth";

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("primenest-session")?.value;

  if (!token) return false;

  const user = await verifySessionToken(token);
  return user?.role === "admin";
}


// GET: Fetch products and categories
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [productsResult, categoriesResult, subcategoriesResult] = await Promise.all([
      pool.query(`
        SELECT
          p.id,
          p.name,
          p.slug,
          p.description,
          p.price,
          p.stock,
          p.category_id,
          p.subcategory_id,
          p.subcategory,
          c.name AS category,
          MAX(CASE WHEN pi.is_primary = TRUE THEN pi.image_url ELSE NULL END) AS image,
          COALESCE(
            json_agg(pi.image_url ORDER BY pi.is_primary DESC, pi.id ASC)
            FILTER (WHERE pi.image_url IS NOT NULL),
            '[]'::json
          ) AS images
        FROM products p
        LEFT JOIN categories c
          ON p.category_id = c.id
        LEFT JOIN product_images pi
          ON p.id = pi.product_id
        GROUP BY p.id, c.name
        ORDER BY p.id DESC
      `),

      pool.query(`
        SELECT id, name, slug
        FROM categories
        ORDER BY name ASC
      `),

      pool.query(`
        SELECT id, category_id, name, slug
        FROM subcategories
        ORDER BY name ASC
      `),
    ]);

    return Response.json({
      success: true,
      products: productsResult.rows,
      categories: categoriesResult.rows,
      subcategories: subcategoriesResult.rows,
    });
  } catch (error) {
    console.error("Admin products GET error:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// POST: Create a product
export async function POST(request) {
  if (!(await isAdmin())) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let client;

  try {
    const body = await request.json();

    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock);
    const categoryId = Number(body.category_id);
    const subcategory = String(body.subcategory || "").trim();
    
    // Parse single image or multiple images array
    let imagesList = [];
    if (Array.isArray(body.images)) {
      imagesList = body.images.map((u) => String(u || "").trim()).filter(Boolean);
    } else if (body.image_url || body.image) {
      const single = String(body.image_url || body.image || "").trim();
      if (single) imagesList.push(single);
    }

    if (!name) {
      return Response.json(
        { success: false, message: "Product name is required" },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(categoryId) ||
      categoryId <= 0
    ) {
      return Response.json(
        {
          success: false,
          message: "Enter a valid price, stock, and category",
        },
        { status: 400 }
      );
    }

    for (const url of imagesList) {
      if (!/^https?:\/\//i.test(url) || url.length > 5000) {
        return Response.json(
          { success: false, message: `Enter a valid URL for image: ${url.slice(0, 30)}...` },
          { status: 400 }
        );
      }
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Confirm the selected category exists.
    const categoryResult = await client.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return Response.json(
        { success: false, message: "Selected category was not found" },
        { status: 400 }
      );
    }

    // Generate a URL-friendly slug from the product name.
    const baseSlug =
      name
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 80) || "product";

    let slug = baseSlug;
    let suffix = 1;

    // Ensure the slug is unique.
    while (true) {
      const existing = await client.query(
        "SELECT id FROM products WHERE slug = $1",
        [slug]
      );

      if (existing.rowCount === 0) break;

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    let subcategoryId = body.subcategory_id ? Number(body.subcategory_id) : null;
    let subcategoryName = String(body.subcategory || "").trim();

    if (subcategoryName) {
      const subSlug = subcategoryName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const subRes = await client.query(
        `INSERT INTO subcategories (category_id, name, slug)
         VALUES ($1, $2, $3)
         ON CONFLICT (category_id, name) DO UPDATE
         SET updated_at = CURRENT_TIMESTAMP
         RETURNING id, name`,
        [categoryId, subcategoryName, subSlug]
      );
      subcategoryId = subRes.rows[0].id;
      subcategoryName = subRes.rows[0].name;
    } else if (subcategoryId) {
      const subRes = await client.query(
        "SELECT name FROM subcategories WHERE id = $1",
        [subcategoryId]
      );
      if (subRes.rows.length > 0) {
        subcategoryName = subRes.rows[0].name;
      }
    }

    const productResult = await client.query(
      `INSERT INTO products
        (name, slug, description, price, stock, category_id, subcategory, subcategory_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING
         id, name, slug, description, price, stock,
         category_id, subcategory, subcategory_id`,
      [
        name,
        slug,
        description,
        price,
        stock,
        categoryId,
        subcategoryName || null,
        subcategoryId || null,
      ]
    );

    const product = productResult.rows[0];

    // Save images into product_images (first image is primary, remaining are gallery images)
    for (let i = 0; i < imagesList.length; i++) {
      await client.query(
        `INSERT INTO product_images
          (product_id, image_url, is_primary)
         VALUES ($1, $2, $3)`,
        [product.id, imagesList[i], i === 0]
      );
    }

    await client.query("COMMIT");

    return Response.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Admin products POST error:", error);

    return Response.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}