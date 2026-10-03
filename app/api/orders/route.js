
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function POST(request) {
  const client = await pool.connect();

  try {
    const body = await request.json();
    const {
      customerName,
      email,
      phone,
      address,
      items,
    } = body;

    // Strictly verify customer authentication
    const cookieStore = await cookies();
    const token = cookieStore.get("primenest-session")?.value;
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in to place an order. Please sign in to proceed.",
        },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);
    if (!session || !session.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Session expired or invalid. Please sign in to place your order.",
        },
        { status: 401 }
      );
    }

    const userId = session.id;

    // Validate customer information
    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      customerName.trim().length > 150 ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 255 ||
      typeof phone !== "string" ||
      !/^[+0-9() -]{7,20}$/.test(phone.trim()) ||
      typeof address !== "string" ||
      !address.trim() ||
      address.trim().length > 2000
    ) {
      return NextResponse.json(
        { success: false, error: "Please enter valid customer and delivery details." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return NextResponse.json(
        { success: false, error: "Your order has no valid items." },
        { status: 400 }
      );
    }

    // Validate and combine duplicate product entries
    const quantities = new Map();

    for (const item of items) {
      const id = Number(item.id);
      const quantity = Number(item.quantity);

      if (
        !Number.isSafeInteger(id) ||
        id <= 0 ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { success: false, error: "Invalid product or quantity." },
          { status: 400 }
        );
      }

      quantities.set(id, (quantities.get(id) || 0) + quantity);

      if (quantities.get(id) > 100) {
        return NextResponse.json(
          { success: false, error: "Maximum quantity per product is 100." },
          { status: 400 }
        );
      }
    }

    await client.query("BEGIN");

    // Fetch current product prices and lock rows during checkout
    const productIds = [...quantities.keys()];

    const result = await client.query(
      `SELECT id, name, price, stock
       FROM products
       WHERE id = ANY($1::int[])
       FOR UPDATE`,
      [productIds]
    );

    if (result.rows.length !== productIds.length) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { success: false, error: "One or more products are no longer available." },
        { status: 400 }
      );
    }

    const products = new Map(
      result.rows.map((product) => [Number(product.id), product])
    );

    let total = 0;

    for (const [id, quantity] of quantities) {
      const product = products.get(id);
      const stock = Number(product.stock);
      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Invalid product price in database.");
      }

      if (!Number.isFinite(stock) || stock < quantity) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            success: false,
            error: `${product.name} has insufficient stock. Please update your bag.`,
          },
          { status: 409 }
        );
      }

      total += price * quantity;
    }

    // Determine payment method and status
    const allowedPaymentMethods = ["upi", "card", "cod"];
    const paymentMethod = allowedPaymentMethods.includes(body.paymentMethod?.toLowerCase())
      ? body.paymentMethod.toLowerCase()
      : "cod";
    const paymentStatus = paymentMethod === "cod" ? "pending" : "completed";
    const orderStatus = paymentMethod === "cod" ? "pending" : "confirmed";

    // Save the order with user_id attached
    const orderResult = await client.query(
      `INSERT INTO orders
        (customer_name, email, phone, address, total, status, payment_method, payment_status, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        customerName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        address.trim(),
        total.toFixed(2),
        orderStatus,
        paymentMethod,
        paymentStatus,
        userId,
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Save each product and reduce available stock
    for (const [id, quantity] of quantities) {
      const product = products.get(id);

      await client.query(
        `INSERT INTO order_items
          (order_id, product_id, product_name, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, id, product.name, quantity, product.price]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [quantity, id]
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: "Order placed successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order creation failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to place your order. Please try again.",
      },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}