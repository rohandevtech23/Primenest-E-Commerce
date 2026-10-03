
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

function createSlug(name) {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "product"
  );
}

// PUT: Update an existing product
export async function PUT(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
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
    let subcategoryId = body.subcategory_id ? Number(body.subcategory_id) : null;

    // Accept multiple images array or single image / image_url
    let imagesList = null;
    if (Array.isArray(body.images)) {
      imagesList = body.images.map((u) => String(u || "").trim()).filter(Boolean);
    } else if (body.image_url || body.image) {
      const single = String(body.image_url || body.image || "").trim();
      if (single) imagesList = [single];
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

    if (imagesList) {
      for (const url of imagesList) {
        if (!/^https?:\/\//i.test(url) || url.length > 5000) {
          return Response.json(
            { success: false, message: `Enter a valid URL for image: ${url.slice(0, 30)}...` },
            { status: 400 }
          );
        }
      }
    }

    client = await pool.connect();
    await client.query("BEGIN");

    // Check that the product exists and lock it during the update.
    const currentResult = await client.query(
      "SELECT id FROM products WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (currentResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Check that the selected category exists.
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

    // Generate a unique slug.
    const baseSlug = createSlug(name);
    let slug = baseSlug;
    let suffix = 1;

    while (true) {
      const existing = await client.query(
        "SELECT id FROM products WHERE slug = $1 AND id <> $2",
        [slug, id]
      );

      if (existing.rowCount === 0) break;

      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    // Resolve subcategory and ensure it is saved in subcategories table
    let subcategoryName = subcategory;

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

    // Update product details without changing its image.
    const updatedResult = await client.query(
      `UPDATE products
       SET name = $1,
           slug = $2,
           description = $3,
           price = $4,
           stock = $5,
           category_id = $6,
           subcategory = $7,
           subcategory_id = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING id, name, slug, description, price, stock, category_id, subcategory, subcategory_id`,
      [name, slug, description, price, stock, categoryId, subcategoryName || null, subcategoryId || null, id]
    );

    // Update product images if images list provided
    if (imagesList !== null) {
      await client.query(
        `DELETE FROM product_images WHERE product_id = $1`,
        [id]
      );

      for (let i = 0; i < imagesList.length; i++) {
        await client.query(
          `INSERT INTO product_images
            (product_id, image_url, is_primary)
           VALUES ($1, $2, $3)`,
          [id, imagesList[i], i === 0]
        );
      }
    }

    await client.query("COMMIT");

    return Response.json({
      success: true,
      message: "Product updated successfully",
      product: updatedResult.rows[0],
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Admin product PUT error:", error);

    return Response.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}

// DELETE: Remove a product
export async function DELETE(request, { params }) {
  if (!(await isAdmin())) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: rawId } = await params;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json(
      { success: false, message: "Invalid product ID" },
      { status: 400 }
    );
  }

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT id FROM products WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (productResult.rowCount === 0) {
      await client.query("ROLLBACK");

      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Remove associated images before deleting the product.
    await client.query(
      "DELETE FROM product_images WHERE product_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM products WHERE id = $1",
      [id]
    );

    await client.query("COMMIT");

    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Admin product DELETE error:", error);

    if (error.code === "23503") {
      return Response.json(
        {
          success: false,
          message:
            "This product is linked to an order and cannot be deleted. Keep it in your records instead.",
        },
        { status: 409 }
      );
    }

    return Response.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}