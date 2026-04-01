/**
 * Pricing engine for .agt domain sales.
 *
 * Freename's API already applies its own tiered pricing based on domain
 * desirability (dictionary words, length, etc.). Our job is to apply a
 * simple markup on top of whatever Freename returns.
 *
 * Economics:
 *   Customer pays → Stripe takes ~2.9% + $0.30 → remaining splits 65/35 (Freename/AGT)
 *   Tax (VAT/GST) is collected on top via Stripe Tax and remitted separately — it is
 *   not part of the revenue split.
 *
 * All amounts in this module are in the currency's standard unit (dollars, not cents)
 * unless suffixed with "Cents".
 */

// --- Configuration (env-overridable) -----------------------------------------

/** Percentage markup on Freename base price. Default 40%. */
const MARKUP_PERCENT = parseFloat(process.env.PRICE_MARKUP_PERCENT || "40");

/** Absolute minimum price in dollars. No domain sells below this. */
const PRICE_FLOOR = parseFloat(process.env.PRICE_FLOOR || "9.99");

// --- Public API --------------------------------------------------------------

export interface PricingResult {
  /** Final customer-facing price (before tax) in dollars */
  amount: number;
  /** Price in cents for Stripe */
  amountCents: number;
  currency: string;
  /** Freename's base cost */
  baseCost: number;
  /** Our markup amount */
  markup: number;
}

/**
 * Calculate the customer-facing price for a domain.
 *
 * @param freenamePrice - Base price from Freename API in dollars
 * @param currency - Currency code (default "usd")
 */
export function calculatePrice(
  freenamePrice: number,
  currency: string = "usd"
): PricingResult {
  // Apply percentage markup
  let price = freenamePrice * (1 + MARKUP_PERCENT / 100);

  // Enforce price floor
  price = Math.max(price, PRICE_FLOOR);

  // Round to nearest cent
  price = Math.round(price * 100) / 100;

  return {
    amount: price,
    amountCents: Math.round(price * 100),
    currency: currency.toLowerCase(),
    baseCost: freenamePrice,
    markup: Math.round((price - freenamePrice) * 100) / 100,
  };
}

// --- Margin analysis (for internal/admin use) --------------------------------

export interface MarginAnalysis {
  customerPays: number;
  stripeFee: number;
  netAfterStripe: number;
  freenameShare: number;
  agtShare: number;
  agtMarginPercent: number;
}

/**
 * Analyze the margin breakdown for a given price point.
 * Useful for evaluating pricing decisions.
 */
export function analyzeMargin(
  customerPrice: number,
  stripeFeePercent: number = 2.9,
  stripeFeeFlatCents: number = 30
): MarginAnalysis {
  const stripeFee = (customerPrice * stripeFeePercent) / 100 + stripeFeeFlatCents / 100;
  const netAfterStripe = customerPrice - stripeFee;
  const freenameShare = netAfterStripe * 0.65;
  const agtShare = netAfterStripe * 0.35;
  const agtMarginPercent = (agtShare / customerPrice) * 100;

  return {
    customerPays: customerPrice,
    stripeFee: Math.round(stripeFee * 100) / 100,
    netAfterStripe: Math.round(netAfterStripe * 100) / 100,
    freenameShare: Math.round(freenameShare * 100) / 100,
    agtShare: Math.round(agtShare * 100) / 100,
    agtMarginPercent: Math.round(agtMarginPercent * 10) / 10,
  };
}
