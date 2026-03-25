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
  "name": "researcher.agt",
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
    { "blockchain": "POLYGON", "name": "researcher.agt" }
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
    </article>
  );
}
