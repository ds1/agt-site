import FreenameAPI, { FreenameTimeoutError } from "./freename-api";
import { log } from "./logger";

export interface FulfillmentResult {
  success: boolean;
  zoneUuid?: string;
  error?: string;
}

/**
 * Execute the full Freename registration sequence for a claimed domain.
 * Called by the Stripe webhook after payment confirmation.
 *
 * Zone creation on Freename is slow (~20-45s) and may succeed even when our
 * client times out. If zone creation times out, we re-check availability to
 * determine whether the zone was actually created before treating it as a failure.
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

  // 2. Create zone — handle timeout separately since the operation may succeed
  //    on Freename's backend even when our client times out.
  let zoneUuid: string | undefined;
  try {
    const zoneResult = await api.createZone({
      name: domain,
      walletAddress,
    });
    zoneUuid = zoneResult.data?.uuid;
  } catch (err) {
    if (err instanceof FreenameTimeoutError) {
      log.warn("fulfillment.zone_timeout", { domain, walletAddress });
      // Zone creation may have succeeded despite the timeout.
      // Wait briefly and check if the domain is still available.
      await sleep(5_000);
      const stillAvailable = await api.checkAvailability(domain);
      if (!stillAvailable) {
        // Zone was created — proceed without UUID (minting uses domain name, not UUID)
        log.info("fulfillment.zone_timeout_but_created", { domain, walletAddress });
      } else {
        // Zone genuinely wasn't created — retry once with a longer timeout
        log.info("fulfillment.zone_timeout_retrying", { domain, walletAddress });
        try {
          const retryResult = await api.createZone({ name: domain, walletAddress });
          zoneUuid = retryResult.data?.uuid;
        } catch (retryErr) {
          log.critical("fulfillment.zone_retry_failed", { domain, walletAddress, error: String(retryErr) });
          return { success: false, error: "Zone creation failed after retry" };
        }
      }
    } else {
      throw err;
    }
  }

  if (!zoneUuid) {
    // If we don't have a UUID (timeout path), fetch it from zones/self or skip.
    // Minting and record creation can proceed — minting uses domain name, records
    // can be set later. Log the missing UUID for manual follow-up.
    log.warn("fulfillment.no_zone_uuid", { domain, walletAddress });
  }

  // 3. Trigger minting on Polygon
  await api.triggerMinting(domain, walletAddress);

  // 4. Set agt-version=1 sentinel record (requires zone UUID)
  if (zoneUuid) {
    await api.createRecords(zoneUuid, [
      { type: "TXT", name: "@", value: "agt-version=1", ttl: 300 },
    ]);
  }

  const elapsed = Date.now() - start;
  log.info("fulfillment.complete", { domain, walletAddress, zoneUuid: zoneUuid || "unknown", elapsedMs: elapsed });

  return { success: true, zoneUuid };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
