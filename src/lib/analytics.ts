/**
 * GA4 custom event helper.
 *
 * Sends events via the global gtag() function injected in layout.tsx.
 * No-ops gracefully if GA is not loaded (dev, ad blockers, etc.).
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GtagFn = (...args: any[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

function send(eventName: string, params?: Record<string, string | number | boolean>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

export const analytics = {
  /** User searched for a domain name */
  searchPerformed(name: string) {
    send("domain_search", { search_term: name });
  },

  /** Search result returned */
  searchResult(domain: string, status: "available" | "unavailable" | "protected") {
    send("search_result", { domain, availability: status });
  },

  /** User clicked "Claim this name" — checkout initiated */
  checkoutInitiated(domain: string, price: number) {
    send("begin_checkout", { domain, value: price, currency: "USD" });
  },

  /** User returned from Stripe — checkout completed */
  checkoutCompleted(domain: string) {
    send("purchase", { domain });
  },

  /** User cancelled checkout or abandoned */
  checkoutCancelled(domain: string) {
    send("checkout_cancelled", { domain });
  },

  /** Registration fulfilled successfully */
  registrationComplete(domain: string) {
    send("registration_complete", { domain });
  },

  /** Registration failed after payment */
  registrationFailed(domain: string) {
    send("registration_failed", { domain });
  },

  /** Agent config saved */
  agentConfigSaved(domain: string, recordCount: number) {
    send("agent_config_saved", { domain, record_count: recordCount });
  },

  /** Agent config skipped */
  agentConfigSkipped(domain: string) {
    send("agent_config_skipped", { domain });
  },
};
