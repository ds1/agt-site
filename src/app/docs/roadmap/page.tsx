import styles from "../agt-manifest-spec/spec.module.css";

export const metadata = {
  title: "Roadmap — .agt Documentation",
  description:
    "What has shipped, and what comes next — ecosystem tools, infrastructure, and network effects.",
};

export default function RoadmapPage() {
  return (
    <article className={styles.article}>
      <h1>Roadmap</h1>
      <p className={styles.lead}>
        Where .agt stands today and where it&apos;s headed. Organized by phase,
        from foundation work already shipped through long-term network effects.
      </p>

      <h2>Completed</h2>
      <ul>
        <li>Browser agent resolution engine (Rust + vanilla JS)</li>
        <li>Agent card UI in browser</li>
        <li>Manifest spec v1 (TXT record-based)</li>
        <li>Registration site with full inline claim flow</li>
        <li>Agent directory / explore page</li>
        <li>Resolver SDK (TypeScript, zero-dep)</li>
        <li>Design system (dark purple, Source Sans 3)</li>
      </ul>

      <h2>Phase 2: Ecosystem</h2>
      <ul>
        <li>
          Record management dashboard — edit agent config post-registration
        </li>
        <li>
          Agent directory backed by Supabase index (replace seed list)
        </li>
        <li>
          Publish <code>@agt/resolver</code> to npm
        </li>
        <li>Onboarding campaign for 942 existing SLD holders</li>
        <li>Landing page refinement</li>
      </ul>

      <h2>Phase 3: Infrastructure</h2>
      <ul>
        <li>Handshake DNS sync from Freename state</li>
        <li>
          CLI tool (<code>agt init --from-mcp</code>,{" "}
          <code>agt register</code>, <code>agt update</code>)
        </li>
        <li>
          Browser agent interaction (MCP/A2A client, not just card display)
        </li>
        <li>Manifest v2 (IPFS-hosted JSON with signatures)</li>
      </ul>

      <h2>Phase 4: Network Effects</h2>
      <ul>
        <li>Agent-to-agent discovery protocol</li>
        <li>Trust/reputation layer (on-chain attestations)</li>
        <li>On-chain payment integration</li>
        <li>Open standard publication (RFC-style spec)</li>
        <li>Multi-platform clients (VS Code extension, Slack bot, etc.)</li>
      </ul>
    </article>
  );
}
