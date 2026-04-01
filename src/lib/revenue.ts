import fs from "fs/promises";
import path from "path";

/**
 * Revenue tracking for Freename reconciliation.
 *
 * Stores transaction records as JSONL (one JSON object per line) in a
 * local file.  This is intentionally simple — good enough for early
 * volume and easy to migrate to Supabase/Postgres later.
 *
 * File location: DATA_DIR/revenue/<YYYY-MM>.jsonl
 */

const DATA_DIR = process.env.REVENUE_DATA_DIR || path.join(process.cwd(), ".data", "revenue");

// --- Types -------------------------------------------------------------------

export interface RevenueRecord {
  type: "sale" | "refund" | "dispute_created" | "dispute_closed";
  timestamp: string; // ISO 8601
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeDisputeId?: string;
  domain?: string;
  walletAddress?: string;
  grossAmount: number;      // cents
  currency: string;
  stripeFee?: number;       // cents (populated async from balance_transaction)
  netAmount?: number;       // cents (gross - stripeFee)
  freenameShare?: number;   // cents (65% of net)
  agtShare?: number;        // cents (35% of net)
  reason?: string;          // for refunds/disputes
  disputeStatus?: string;   // for disputes: won, lost, needs_response, etc.
  metadata?: Record<string, string>;
}

export interface MonthlySummary {
  month: string; // YYYY-MM
  totalGross: number;
  totalStripeFees: number;
  totalNet: number;
  freenameOwed: number;
  agtRetained: number;
  saleCount: number;
  refundCount: number;
  refundTotal: number;
  disputeCount: number;
  currency: string;
}

// --- Helpers -----------------------------------------------------------------

function monthKey(date?: Date): string {
  const d = date ?? new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function filePath(month: string): string {
  return path.join(DATA_DIR, `${month}.jsonl`);
}

async function ensureDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// --- Public API --------------------------------------------------------------

/** Append a revenue record to the current month's ledger. */
export async function recordTransaction(record: RevenueRecord): Promise<void> {
  await ensureDir();
  const month = monthKey(new Date(record.timestamp));
  const line = JSON.stringify(record) + "\n";
  await fs.appendFile(filePath(month), line, "utf-8");
}

/** Read all records for a given month. */
export async function getMonthRecords(month?: string): Promise<RevenueRecord[]> {
  const m = month ?? monthKey();
  const fp = filePath(m);
  try {
    const data = await fs.readFile(fp, "utf-8");
    return data
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as RevenueRecord);
  } catch {
    return []; // no file yet
  }
}

/** Generate a monthly summary for Freename reconciliation. */
export async function getMonthlySummary(month?: string): Promise<MonthlySummary> {
  const m = month ?? monthKey();
  const records = await getMonthRecords(m);

  let totalGross = 0;
  let totalStripeFees = 0;
  let saleCount = 0;
  let refundCount = 0;
  let refundTotal = 0;
  let disputeCount = 0;
  let currency = "usd";

  for (const r of records) {
    if (r.currency) currency = r.currency;

    if (r.type === "sale") {
      totalGross += r.grossAmount;
      totalStripeFees += r.stripeFee ?? 0;
      saleCount++;
    } else if (r.type === "refund") {
      refundTotal += r.grossAmount;
      refundCount++;
    } else if (r.type === "dispute_created") {
      disputeCount++;
    }
  }

  const totalNet = totalGross - totalStripeFees - refundTotal;
  const freenameOwed = Math.round(totalNet * 0.65);
  const agtRetained = totalNet - freenameOwed;

  return {
    month: m,
    totalGross,
    totalStripeFees,
    totalNet,
    freenameOwed,
    agtRetained,
    saleCount,
    refundCount,
    refundTotal,
    disputeCount,
    currency,
  };
}

/** List all months that have revenue data. */
export async function listMonths(): Promise<string[]> {
  await ensureDir();
  const files = await fs.readdir(DATA_DIR);
  return files
    .filter((f) => f.endsWith(".jsonl"))
    .map((f) => f.replace(".jsonl", ""))
    .sort();
}
