import styles from "../agt-manifest-spec/spec.module.css";

export const metadata = {
  title: "Overview — .agt Documentation",
  description:
    "What .agt is, the problem it solves, the six protocol layers, TLD ownership, and naming conventions.",
};

export default function OverviewPage() {
  return (
    <article className={styles.article}>
      <h1>Overview</h1>
      <p className={styles.lead}>
        .agt is a namespace for AI agents. A .agt name gives an agent a
        human-readable identity, structured metadata, verifiable ownership, and
        discoverability by any client.
      </p>

      <h2>The Problem</h2>
      <p>
        The AI agent ecosystem lacks a decentralized identity and discovery
        layer:
      </p>
      <ul>
        <li>
          <strong>MCP</strong> (Anthropic) defines agent-to-tool communication.
          Discovery is manual JSON config — no directory.
        </li>
        <li>
          <strong>A2A</strong> (Google) defines agent-to-agent communication.
          Agent Cards live at <code>/.well-known/agent.json</code> — tied to
          traditional DNS.
        </li>
        <li>
          <strong>OpenAI / Salesforce marketplaces</strong> are fully
          centralized. Platforms control listing, ranking, and delisting.
        </li>
        <li>
          <strong>LangChain, CrewAI, AutoGen</strong> are orchestration
          frameworks where agent discovery is hardcoded.
        </li>
      </ul>
      <p>
        .agt fills this gap as the decentralized, verifiable, human-readable
        identity layer for AI agents.
      </p>

      <h2>What a .agt Name Provides</h2>
      <ul>
        <li>
          A human-readable identity (<code>researcher.agt</code>)
        </li>
        <li>
          Structured metadata (capabilities, protocols, endpoints)
        </li>
        <li>
          Verifiable ownership (on-chain NFT on Polygon)
        </li>
        <li>
          Discoverability (resolvable by any client)
        </li>
      </ul>

      <h2>Positioning</h2>
      <p>
        .agt is the identity layer for the agent ecosystem. The mental model:
      </p>
      <ul>
        <li>
          ICANN controls <code>.com</code> — every company needs one
        </li>
        <li>
          <code>.agt</code> — every agent needs one
        </li>
      </ul>

      <h2>The Six Layers</h2>
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Identity</strong>
            </td>
            <td>
              Human-readable names (<code>researcher.agt</code>), on-chain NFT
              ownership on Polygon.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Manifest</strong>
            </td>
            <td>
              Structured metadata via DNS TXT records — name, description,
              protocols, capabilities, endpoints, pricing.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Resolution</strong>
            </td>
            <td>
              Any client resolves a .agt name to its manifest. Freename public
              resolver, no auth needed.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Communication</strong>
            </td>
            <td>
              Protocol-agnostic endpoints — MCP, A2A, HTTP, WebSocket, gRPC.
              The manifest declares what the agent speaks.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Trust</strong>
            </td>
            <td>
              Verifiable ownership via on-chain NFT. The{" "}
              <code>agt-owner</code> address can be checked against the FNS
              contract on Polygon.
            </td>
          </tr>
          <tr>
            <td>
              <strong>Composition</strong>
            </td>
            <td>
              Agents discover and connect to other agents by resolving .agt
              names and matching on capabilities and protocols.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>TLD Ownership</h2>
      <p>
        .agt is owned across multiple naming systems using a dual-platform
        model:
      </p>
      <table>
        <thead>
          <tr>
            <th>System</th>
            <th>Role</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Freename</strong>
            </td>
            <td>Canonical registry — ownership, NFT minting, on-chain records</td>
            <td>Active. 942+ SLDs registered.</td>
          </tr>
          <tr>
            <td>
              <strong>Handshake</strong>
            </td>
            <td>Infrastructure — DNS records, reachability via DoH</td>
            <td>Owned. Registrations closed.</td>
          </tr>
          <tr>
            <td>
              <strong>Dweb</strong>
            </td>
            <td>Defensive registration</td>
            <td>Owned. Not actively used.</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Freename</strong> is the single source of truth for
        registration. <strong>Handshake</strong> records are a downstream
        effect, set by the system. This eliminates name collisions — there is
        one registration path, and Handshake mirrors it.
      </p>

      <h2>Naming Conventions</h2>
      <ul>
        <li>
          Users register <strong>names</strong>, not domains. &quot;Claim a
          name&quot; / &quot;Name your agent.&quot;
        </li>
        <li>
          Use &quot;.agt Protocol&quot; or &quot;.agt Standard&quot; when
          referencing the spec.
        </li>
        <li>
          Names are lowercase, alphanumeric, hyphen-separated.
        </li>
      </ul>
    </article>
  );
}
