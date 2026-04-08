/**
 * Domain registry — tracks known .agt domains for the explore directory.
 *
 * Combines seed domains (hardcoded) with domains sold through agtnames.com
 * (persisted to a JSON file on disk). In production on Vercel, the purchased
 * domains file lives in /tmp and resets on cold starts, so the seed list is
 * the baseline. A future Supabase migration will replace the file-based store.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const SEED_DOMAINS = [
  "agt.agt",
  "scrape.agt",
  "receipt.agt",
  "pricing.agt",
  "tutorial.agt",
  "ai.agt",
  "search.agt",
  "chat.agt",
  "code.agt",
  "data.agt",
  "research.agt",
  "translate.agt",
  "monitor.agt",
  "deploy.agt",
  "build.agt",
  "test.agt",
  "scan.agt",
  "write.agt",
  "read.agt",
  "index.agt",
];

const PURCHASED_FILE = join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "purchased-domains.json"
);

let _purchasedCache: string[] | null = null;

function loadPurchased(): string[] {
  if (_purchasedCache) return _purchasedCache;
  try {
    if (existsSync(PURCHASED_FILE)) {
      const raw = readFileSync(PURCHASED_FILE, "utf-8");
      _purchasedCache = JSON.parse(raw);
      return _purchasedCache!;
    }
  } catch {
    // Corrupted file — ignore
  }
  _purchasedCache = [];
  return [];
}

function savePurchased(domains: string[]) {
  _purchasedCache = domains;
  try {
    writeFileSync(PURCHASED_FILE, JSON.stringify(domains, null, 2));
  } catch (err) {
    console.warn("Could not save purchased domains:", err);
  }
}

/**
 * Return all known .agt domains (seeds + purchased), deduplicated.
 */
export function getKnownDomains(): string[] {
  const purchased = loadPurchased();
  const all = new Set([...SEED_DOMAINS, ...purchased]);
  return Array.from(all).sort();
}

/**
 * Register a newly purchased domain so it appears in the explore directory.
 */
export function registerDomain(domain: string) {
  const purchased = loadPurchased();
  const normalized = domain.toLowerCase();
  if (!purchased.includes(normalized) && !SEED_DOMAINS.includes(normalized)) {
    purchased.push(normalized);
    savePurchased(purchased);
  }
}
