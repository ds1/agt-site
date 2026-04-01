import { NextResponse } from "next/server";
import { getMonthlySummary, getMonthRecords, listMonths } from "@/lib/revenue";

/**
 * Admin-only revenue endpoint for Freename reconciliation.
 *
 * Protected by a shared secret in ADMIN_API_KEY env var.
 * No key = endpoint disabled.
 *
 * GET /api/admin/revenue                → current month summary
 * GET /api/admin/revenue?month=2026-03  → specific month summary
 * GET /api/admin/revenue?month=2026-03&detail=true → all records
 * GET /api/admin/revenue?months=all     → list available months
 */

export async function GET(request: Request) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "Admin endpoint not configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // List all months with data
  if (searchParams.get("months") === "all") {
    const months = await listMonths();
    return NextResponse.json({ months });
  }

  const month = searchParams.get("month") ?? undefined;
  const detail = searchParams.get("detail") === "true";

  if (detail) {
    const records = await getMonthRecords(month);
    return NextResponse.json({ month: month ?? "current", records });
  }

  const summary = await getMonthlySummary(month);
  return NextResponse.json({
    ...summary,
    freenameOwedFormatted: `${(summary.freenameOwed / 100).toFixed(2)} ${summary.currency.toUpperCase()}`,
    agtRetainedFormatted: `${(summary.agtRetained / 100).toFixed(2)} ${summary.currency.toUpperCase()}`,
    note: "Freename share (65%) is due by the 10th of the following month.",
  });
}
