import styles from "../agt-manifest-spec/spec.module.css";

export const metadata = {
  title: "API Reference — .agt Documentation",
  description:
    "Freename Reseller API integration — authentication, zone creation, minting, record management, and billing.",
};

export default function ApiReferencePage() {
  return (
    <article className={styles.article}>
      <h1>API Reference</h1>
      <p className={styles.lead}>
        The .agt registration system integrates with the Freename Reseller API
        for zone creation, NFT minting, and DNS record management. All write
        operations require Auth0 authentication.
      </p>

      <h2>Authentication</h2>
      <p>
        Auth0-based. Credentials are <code>FREENAME_API_EMAIL</code> and{" "}
        <code>FREENAME_API_PASSWORD</code>.
      </p>
      <pre>
        <code>{`// Login
POST /api/v1/auth/login
→ { access_token, refresh_token, expires_in }

// Refresh
POST /api/v1/auth/refresh
→ { access_token, id_token, expires_in }`}</code>
      </pre>
      <p>
        The token is cached with a 60-second buffer before expiry.
        Auto-refreshes. Falls back to full re-login if refresh fails.
      </p>
      <p>
        APIs are IP-whitelisted. Freename must whitelist the server&apos;s IP
        before requests will succeed.
      </p>

      <h2>Key Endpoints</h2>
      <p>
        All under{" "}
        <code>
          https://apis.freename.io/api/v1/reseller-logic/
        </code>
      </p>
      <table>
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Method</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>/search?searchString=X</code>
            </td>
            <td>GET</td>
            <td>Search domains, get availability + pricing</td>
          </tr>
          <tr>
            <td>
              <code>/zones/availability/&#123;domain&#125;</code>
            </td>
            <td>GET</td>
            <td>Check if domain is available (boolean)</td>
          </tr>
          <tr>
            <td>
              <code>/zones?mint=false</code>
            </td>
            <td>POST</td>
            <td>Create zone (domain registration)</td>
          </tr>
          <tr>
            <td>
              <code>/zones/minting</code>
            </td>
            <td>POST</td>
            <td>Trigger NFT minting on blockchain</td>
          </tr>
          <tr>
            <td>
              <code>/minting/&#123;domain&#125;</code>
            </td>
            <td>GET</td>
            <td>Check minting status</td>
          </tr>
          <tr>
            <td>
              <code>/records?zone=&#123;uuid&#125;</code>
            </td>
            <td>POST</td>
            <td>Create records on a zone</td>
          </tr>
          <tr>
            <td>
              <code>/records?zone=&#123;uuid&#125;</code>
            </td>
            <td>GET</td>
            <td>Fetch records for a zone</td>
          </tr>
          <tr>
            <td>
              <code>/records?record=&#123;uuid&#125;</code>
            </td>
            <td>PUT</td>
            <td>Update a specific record</td>
          </tr>
          <tr>
            <td>
              <code>/records/&#123;uuid&#125;</code>
            </td>
            <td>DELETE</td>
            <td>Delete a record</td>
          </tr>
        </tbody>
      </table>

      <h2>Zone Creation</h2>
      <pre>
        <code>{`POST /zones?mint=false

{
  "name": "exampleagent.agt",
  "status": "OK",
  "level": "SLD",
  "chain": "POLYGON",
  "walletAddress": "0x...",
  "registrationDate": "2026-03-24T00:00:00.000Z",
  "records": []
}`}</code>
      </pre>

      <h2>Minting</h2>
      <pre>
        <code>{`POST /zones/minting

{
  "mintDetail": [
    { "blockchain": "POLYGON", "name": "exampleagent.agt" }
  ],
  "walletAddress": "0x..."
}`}</code>
      </pre>
      <p>
        Minting is asynchronous — it takes a few minutes. Poll{" "}
        <code>/minting/&#123;domain&#125;</code> for status:{" "}
        <code>PENDING</code> → <code>IN_PROGRESS</code> →{" "}
        <code>COMPLETE</code> | <code>FAILED</code>.
      </p>

      <h2>Record Types</h2>

      <h3>Standard DNS</h3>
      <div className={styles.pills}>
        {["A", "AAAA", "MX", "CNAME", "NS", "SOA", "TXT", "PTR"].map(
          (type) => (
            <code key={type} className={styles.capPill}>
              {type}
            </code>
          )
        )}
      </div>

      <h3>Web3</h3>
      <div className={styles.pills}>
        {["TOKEN", "PROFILE", "LINK", "CONTRACT", "OTHER"].map((type) => (
          <code key={type} className={styles.capPill}>
            {type}
          </code>
        ))}
      </div>

      <p>
        For agent manifests, use TXT records with <code>name: &quot;@&quot;</code> and{" "}
        <code>value: &quot;agt-*=...&quot;</code>.
      </p>

      <h2>Supported Chains</h2>
      <p>
        Ethereum, BSC, Polygon (default for .agt), Base, Solana.
      </p>

      <h2>Billing</h2>
      <p>
        Gas fees are covered by Freename and invoiced to the reseller. No
        real-time payment is required for zone creation or minting. Domain
        pricing is set by Freename — the TLD owner has limited control over
        pricing and cannot offer free registrations.
      </p>

      <h2>agt-site Internal API Routes</h2>
      <p>
        The registration site exposes its own API routes for the claim flow,
        agent directory, and administration.
      </p>
      <table>
        <thead>
          <tr>
            <th>Route</th>
            <th>Method</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>/api/search</code></td>
            <td>GET</td>
            <td>
              Check name availability and pricing. Params: <code>name</code>.
              Applies 40% markup on Freename base price. Rate limited (30
              req/IP/min). Results cached for 45 seconds.
            </td>
          </tr>
          <tr>
            <td><code>/api/checkout</code></td>
            <td>POST</td>
            <td>
              Create a Stripe Checkout session. Server-side price verification
              against Freename API. Body:{" "}
              <code>
                &#123; domain, walletAddress, email?, termsAccepted &#125;
              </code>
            </td>
          </tr>
          <tr>
            <td><code>/api/checkout/status</code></td>
            <td>GET</td>
            <td>
              Poll fulfillment status after payment. Params:{" "}
              <code>session_id</code>. Returns fulfillment status, domain,
              wallet, and zone UUID.
            </td>
          </tr>
          <tr>
            <td><code>/api/claim/status</code></td>
            <td>GET</td>
            <td>
              Poll minting status on Polygon. Params: <code>domain</code>.
              Returns status (PENDING/IN_PROGRESS/COMPLETE/FAILED),
              transaction hash, token ID, and contract address.
            </td>
          </tr>
          <tr>
            <td><code>/api/agent-config</code></td>
            <td>POST</td>
            <td>
              Set agent configuration (agt-* TXT records). Body:{" "}
              <code>
                &#123; zoneUuid, config: &#123; name, description, icon,
                website, protocols, capabilities, endpoints, pricing &#125;
                &#125;
              </code>
            </td>
          </tr>
          <tr>
            <td><code>/api/agents</code></td>
            <td>GET</td>
            <td>
              Fetch agent manifests from the seed domain list. Filters:{" "}
              <code>capability</code>, <code>protocol</code>,{" "}
              <code>q</code> (text search).
            </td>
          </tr>
          <tr>
            <td><code>/api/webhooks/stripe</code></td>
            <td>POST</td>
            <td>
              Stripe webhook endpoint. Handles 6 event types: checkout
              completed/expired, dispute created/updated/closed, charge
              refunded. Auto-refunds on fulfillment failure.
            </td>
          </tr>
          <tr>
            <td><code>/api/admin/revenue</code></td>
            <td>GET</td>
            <td>
              Revenue reporting for Freename reconciliation. Requires{" "}
              <code>Authorization: Bearer &#123;ADMIN_API_KEY&#125;</code>.
              Params: <code>month</code>, <code>detail</code>,{" "}
              <code>months=all</code>.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>Freename API Resilience</h2>
      <p>
        The Freename API client (<code>src/lib/freename-api.ts</code>)
        implements several resilience features:
      </p>
      <ul>
        <li>
          <strong>Global rate limiting</strong> — 30 requests/minute across
          all users to comply with fair use (Section 4.6).
        </li>
        <li>
          <strong>Search caching</strong> — 45-second TTL to reduce redundant
          API calls for the same domain.
        </li>
        <li>
          <strong>Request timeouts</strong> — 15-second default via
          AbortController. No uptime SLA from Freename (Section 4.1).
        </li>
        <li>
          <strong>429 handling</strong> — Rate limit responses surfaced as
          user-friendly errors.
        </li>
        <li>
          <strong>Error sanitization</strong> — Internal Freename errors are
          never exposed to end users.
        </li>
        <li>
          <strong>Request timing</strong> — Every call logged with endpoint,
          status, and elapsed milliseconds.
        </li>
      </ul>
    </article>
  );
}
