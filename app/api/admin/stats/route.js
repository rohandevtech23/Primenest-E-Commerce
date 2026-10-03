
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const startDateParam = url.searchParams.get("startDate");
    const endDateParam = url.searchParams.get("endDate");
    const periodParam = url.searchParams.get("period") || "week"; // "week", "last7", "thisMonth", "last30", "custom"

    // 1. Verify admin login
    const cookieStore = await cookies();
    const token = cookieStore.get("primenest-session")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const session = await verifySessionToken(token);

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      );
    }

    // 2. Resolve chart date range (custom or presets)
    let startDate;
    let endDate;
    let periodName = periodParam;

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (startDateParam && endDateParam && dateRegex.test(startDateParam) && dateRegex.test(endDateParam)) {
      startDate = startDateParam;
      endDate = endDateParam;
      periodName = "custom";
    } else if (periodParam === "last7") {
      const r = await pool.query(`SELECT (CURRENT_DATE - INTERVAL '6 days')::date::text as start, CURRENT_DATE::text as end`);
      startDate = r.rows[0].start;
      endDate = r.rows[0].end;
      periodName = "last7";
    } else if (periodParam === "thisMonth") {
      const r = await pool.query(`SELECT DATE_TRUNC('month', CURRENT_DATE)::date::text as start, (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::date::text as end`);
      startDate = r.rows[0].start;
      endDate = r.rows[0].end;
      periodName = "thisMonth";
    } else if (periodParam === "last30") {
      const r = await pool.query(`SELECT (CURRENT_DATE - INTERVAL '29 days')::date::text as start, CURRENT_DATE::text as end`);
      startDate = r.rows[0].start;
      endDate = r.rows[0].end;
      periodName = "last30";
    } else {
      periodName = "week";
      const r = await pool.query(`SELECT DATE_TRUNC('week', CURRENT_DATE)::date::text as start, (DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '6 days')::date::text as end`);
      startDate = r.rows[0].start;
      endDate = r.rows[0].end;
    }

    // 3. Get total sales and order count
    const salesResult = await pool.query(`
      SELECT
        COALESCE(SUM(total), 0) AS "totalSales",
        COUNT(*)::int AS "orderCount"
      FROM orders
    `);

    // 4. Get registered customer count
    const customersResult = await pool.query(`
      SELECT COUNT(*)::int AS "userCount"
      FROM users
      WHERE role = 'user'
    `);

    // 5. Get product count and in-stock count
    const productsResult = await pool.query(`
      SELECT
        COUNT(*)::int AS "productCount",
        COUNT(*) FILTER (WHERE stock > 0)::int AS "inStockCount"
      FROM products
    `);

    // 6. Get dynamic sales performance for the selected date range
    const rangeResult = await pool.query(
      `
      WITH date_series AS (
        SELECT 
          d.day::date AS date,
          TRIM(TO_CHAR(d.day, 'Day')) AS day_name,
          TRIM(TO_CHAR(d.day, 'Dy')) AS day_short,
          TO_CHAR(d.day, 'Mon DD') AS date_formatted,
          EXTRACT(ISODOW FROM d.day)::int AS day_num
        FROM generate_series(
          $1::timestamp,
          $2::timestamp,
          INTERVAL '1 day'
        ) AS d(day)
      ),
      daily_sales AS (
        SELECT
          DATE_TRUNC('day', created_at)::date AS order_date,
          COALESCE(SUM(total), 0) AS revenue,
          COUNT(*)::int AS order_count
        FROM orders
        WHERE created_at >= $1::timestamp
          AND created_at < ($2::timestamp + INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', created_at)::date
      )
      SELECT
        w.date,
        w.day_name,
        w.day_short,
        w.date_formatted,
        w.day_num,
        COALESCE(s.revenue, 0)::numeric AS revenue,
        COALESCE(s.order_count, 0)::int AS order_count
      FROM date_series w
      LEFT JOIN daily_sales s ON w.date = s.order_date
      ORDER BY w.date ASC;
      `,
      [startDate, endDate]
    );

    const totalPeriodSales = rangeResult.rows.reduce(
      (acc, r) => acc + Number(r.revenue),
      0
    );
    const totalPeriodOrders = rangeResult.rows.reduce(
      (acc, r) => acc + Number(r.order_count),
      0
    );
    const maxDailyRevenue = Math.max(
      ...rangeResult.rows.map((r) => Number(r.revenue)),
      0
    );

    const chartData = rangeResult.rows.map((row) => {
      const revenue = Number(row.revenue);
      const isPeak = maxDailyRevenue > 0 && revenue === maxDailyRevenue;
      const pct =
        totalPeriodSales > 0
          ? `${((revenue / totalPeriodSales) * 100).toFixed(1)}%`
          : "0%";

      return {
        day: row.day_name,
        short: row.day_short,
        formattedDate: row.date_formatted,
        date: row.date,
        dayNum: row.day_num,
        revenue,
        orderCount: row.order_count,
        isPeak,
        pct,
      };
    });

    const chartMeta = {
      period: periodName,
      startDate,
      endDate,
      totalPeriodSales,
      totalPeriodOrders,
      dayCount: chartData.length,
    };

    // Dynamic growth comparisons (This week vs Last week, and today vs yesterday)
    const growthResult = await pool.query(`
      SELECT
        -- Revenue
        COALESCE((SELECT SUM(total) FROM orders WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)), 0) AS "thisWeekRevenue",
        COALESCE((SELECT SUM(total) FROM orders WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days' AND created_at < DATE_TRUNC('week', CURRENT_DATE)), 0) AS "lastWeekRevenue",
        COALESCE((SELECT SUM(total) FROM orders WHERE created_at >= CURRENT_DATE), 0) AS "todayRevenue",
        COALESCE((SELECT SUM(total) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE), 0) AS "yesterdayRevenue",
        
        -- Orders
        COALESCE((SELECT COUNT(*)::int FROM orders WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)), 0) AS "thisWeekOrders",
        COALESCE((SELECT COUNT(*)::int FROM orders WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days' AND created_at < DATE_TRUNC('week', CURRENT_DATE)), 0) AS "lastWeekOrders",
        COALESCE((SELECT COUNT(*)::int FROM orders WHERE created_at >= CURRENT_DATE), 0) AS "todayOrders",
        COALESCE((SELECT COUNT(*)::int FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE), 0) AS "yesterdayOrders",

        -- Users
        COALESCE((SELECT COUNT(*)::int FROM users WHERE role = 'user' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)), 0) AS "thisWeekUsers",
        COALESCE((SELECT COUNT(*)::int FROM users WHERE role = 'user' AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days' AND created_at < DATE_TRUNC('week', CURRENT_DATE)), 0) AS "lastWeekUsers",
        COALESCE((SELECT COUNT(*)::int FROM users WHERE role = 'user' AND created_at >= CURRENT_DATE), 0) AS "todayUsers",
        COALESCE((SELECT COUNT(*)::int FROM users WHERE role = 'user' AND created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE), 0) AS "yesterdayUsers"
    `);

    // Monthly revenue for the current year
    const monthlyResult = await pool.query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
        EXTRACT(MONTH FROM created_at)::int AS month_number,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE created_at >= DATE_TRUNC('year', CURRENT_DATE)
        AND created_at < DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year'
      GROUP BY DATE_TRUNC('month', created_at),
               EXTRACT(MONTH FROM created_at)
      ORDER BY month_number
    `);

    // Latest five orders
    const latestOrdersResult = await pool.query(`
      SELECT
        id,
        customer_name,
        email,
        total,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Dynamic percentages calculation
    const growthData = growthResult.rows[0] || {};
    const thisWeekRev = Number(growthData.thisWeekRevenue || 0);
    const lastWeekRev = Number(growthData.lastWeekRevenue || 0);
    const todayRev = Number(growthData.todayRevenue || 0);
    const yesterdayRev = Number(growthData.yesterdayRevenue || 0);

    let revGrowthVal = 0;
    if (lastWeekRev > 0) {
      revGrowthVal = Math.round(((thisWeekRev - lastWeekRev) / lastWeekRev) * 100);
    } else if (yesterdayRev > 0) {
      revGrowthVal = Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100);
    } else if (thisWeekRev > 0) {
      revGrowthVal = 100;
    }

    const thisWeekOrders = Number(growthData.thisWeekOrders || 0);
    const lastWeekOrders = Number(growthData.lastWeekOrders || 0);
    const todayOrders = Number(growthData.todayOrders || 0);
    const yesterdayOrders = Number(growthData.yesterdayOrders || 0);

    let ordGrowthVal = 0;
    if (lastWeekOrders > 0) {
      ordGrowthVal = Math.round(((thisWeekOrders - lastWeekOrders) / lastWeekOrders) * 100);
    } else if (yesterdayOrders > 0) {
      ordGrowthVal = Math.round(((todayOrders - yesterdayOrders) / yesterdayOrders) * 100);
    } else if (thisWeekOrders > 0) {
      ordGrowthVal = 100;
    }

    const thisWeekUsr = Number(growthData.thisWeekUsers || 0);
    const lastWeekUsr = Number(growthData.lastWeekUsers || 0);
    const todayUsr = Number(growthData.todayUsers || 0);
    const yesterdayUsr = Number(growthData.yesterdayUsers || 0);

    let usrGrowthVal = 0;
    if (lastWeekUsr > 0) {
      usrGrowthVal = Math.round(((thisWeekUsr - lastWeekUsr) / lastWeekUsr) * 100);
    } else if (yesterdayUsr > 0) {
      usrGrowthVal = Math.round(((todayUsr - yesterdayUsr) / yesterdayUsr) * 100);
    } else if (thisWeekUsr > 0) {
      usrGrowthVal = 100;
    }

    const totalProd = Number(productsResult.rows[0]?.productCount || 0);
    const inStockProd = Number(productsResult.rows[0]?.inStockCount || 0);
    const inStockRate = totalProd > 0 ? Math.round((inStockProd / totalProd) * 100) : 0;

    const revenueGrowth = {
      value: `${revGrowthVal >= 0 ? "+" : ""}${revGrowthVal}%`,
      percentage: revGrowthVal,
      isPositive: revGrowthVal >= 0,
    };

    const orderGrowth = {
      value: `${ordGrowthVal >= 0 ? "+" : ""}${ordGrowthVal}%`,
      percentage: ordGrowthVal,
      isPositive: ordGrowthVal >= 0,
    };

    const customerGrowth = {
      value: `${usrGrowthVal >= 0 ? "+" : ""}${usrGrowthVal}%`,
      percentage: usrGrowthVal,
      isPositive: usrGrowthVal >= 0,
    };

    const catalogRate = {
      value: `${inStockRate}%`,
      label: `${inStockRate}% in stock`,
      percentage: inStockRate,
      isPositive: inStockRate >= 90,
      inStockCount: inStockProd,
      totalCount: totalProd,
    };

    return NextResponse.json({
      success: true,
      totalSales: Number(salesResult.rows[0]?.totalSales || 0),
      orderCount: Number(salesResult.rows[0]?.orderCount || 0),
      userCount: Number(customersResult.rows[0]?.userCount || 0),
      productCount: totalProd,
      latestOrders: latestOrdersResult.rows,
      monthlyRevenue: monthlyResult.rows.map((row) => ({
        month: row.month,
        revenue: Number(row.revenue),
      })),
      weeklySales: chartData,
      chartData,
      chartMeta,
      revenueGrowth,
      orderGrowth,
      customerGrowth,
      catalogRate,
      stats: {
        totalSales: Number(salesResult.rows[0]?.totalSales || 0),
        orderCount: Number(salesResult.rows[0]?.orderCount || 0),
        userCount: Number(customersResult.rows[0]?.userCount || 0),
        productCount: totalProd,
        latestOrders: latestOrdersResult.rows,
        monthlyRevenue: monthlyResult.rows.map((row) => ({
          month: row.month,
          revenue: Number(row.revenue),
        })),
        weeklySales: chartData,
        chartData,
        chartMeta,
        revenueGrowth,
        orderGrowth,
        customerGrowth,
        catalogRate,
      },
    });
  } catch (error) {
    console.error("Admin stats API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
      },
      { status: 500 }
    );
  }
}