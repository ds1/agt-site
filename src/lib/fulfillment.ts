import FreenameAPI from "./freename-api";
import { log } from "./logger";

export interface FulfillmentResult {
  success: boolean;
  zoneUuid?: string;
  error?: string;
}

/**
 * Execute the full Freename registration sequence for a claimed domain.
 * Called by the Stripe webhook after payment confirmation.
 */
export async function fulfillDomainClaim(
  domain: string,
  walletAddress: string
): Promise<FulfillmentResult> {
  const api = new FreenameAPI();
  const start = Date.now();

  // 1. Re-check availability (guard against race conditions)
  const available = await api.checkAvailability(domain);
  if (!available) {
    log.error("fulfillment.unavailable", { domain, walletAddress });
    return { success: false, error: "Name is no longer available" };
  }

  // 2. Create zone
  const zoneResult = await api.createZone({
    name: domain,
    walletAddress,
  });

  const zoneUuid = zoneResult.data?.uuid;
  if (!zoneUuid) {
    log.critical("fulfillment.zone_failed", { domain, walletAddress, response: JSON.stringify(zoneResult) });
    return { success: false, error: "Zone creation failed — no UUID returned" };
  }

  // 3. Trigger minting on Polygon
  await api.triggerMinting(domain, walletAddress);

  // 4. Set agt-version=1 sentinel record
  await api.createRecords(zoneUuid, [
    { type: "TXT", name: "@", value: "agt-version=1", ttl: 300 },
  ]);

  const elapsed = Date.now() - start;
  log.info("fulfillment.complete", { domain, walletAddress, zoneUuid, elapsedMs: elapsed });

  return { success: true, zoneUuid };
}
