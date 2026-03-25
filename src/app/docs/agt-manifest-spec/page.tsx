import styles from "./spec.module.css";

export const metadata = {
  title: ".agt Manifest Specification v1",
  description:
    "The .agt manifest defines agent identity using DNS TXT records on .agt domains.",
};

export default function ManifestSpecPage() {
  return (
    <article className={styles.article}>
          <h1>Manifest Specification v1</h1>
          <p className={styles.lead}>
            The .agt manifest defines agent identity using DNS TXT records on
            .agt domains. Any client that can resolve Freename or Handshake
            domains can read and parse an agent&apos;s manifest.
          </p>

          <h2>Record Format</h2>
          <p>
            Each TXT record value follows{" "}
            <code>agt-&#123;field&#125;=&#123;value&#125;</code>.
          </p>

          <h3>Required</h3>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>agt-version=1</code>
                </td>
                <td>
                  <strong>Required sentinel.</strong> Must be present for the
                  domain to be recognized as an agent.
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Identity</h3>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>agt-name=&#123;name&#125;</code>
                </td>
                <td>Display name. Max 100 characters.</td>
              </tr>
              <tr>
                <td>
                  <code>agt-description=&#123;text&#125;</code>
                </td>
                <td>One-line description. Max 200 characters.</td>
              </tr>
              <tr>
                <td>
                  <code>agt-icon=&#123;url&#125;</code>
                </td>
                <td>Icon image URL (PNG, SVG, JPG). Recommended 128x128+.</td>
              </tr>
              <tr>
                <td>
                  <code>agt-owner=&#123;address&#125;</code>
                </td>
                <td>
                  Owner wallet address (e.g., <code>0x1234...abcd</code>).
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Capabilities</h3>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>agt-protocol=&#123;id&#125;</code>
                </td>
                <td>
                  Protocol the agent supports. One record per protocol.
                  Repeatable.
                </td>
              </tr>
              <tr>
                <td>
                  <code>agt-cap=&#123;id&#125;</code>
                </td>
                <td>
                  Capability the agent has. One record per capability.
                  Repeatable.
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Endpoints</h3>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>
                    agt-endpoint-&#123;protocol&#125;=&#123;url&#125;
                  </code>
                </td>
                <td>
                  URL for a specific protocol. <code>&#123;protocol&#125;</code>{" "}
                  matches a declared <code>agt-protocol</code>.
                </td>
              </tr>
            </tbody>
          </table>

          <h3>Commerce</h3>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>agt-pricing=&#123;model&#125;</code>
                </td>
                <td>
                  Values: <code>free</code>, <code>paid</code>,{" "}
                  <code>freemium</code>, <code>contact</code>.
                </td>
              </tr>
            </tbody>
          </table>

          <h2>Protocol Vocabulary</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>mcp</code>
                </td>
                <td>MCP</td>
                <td>Model Context Protocol (Anthropic)</td>
              </tr>
              <tr>
                <td>
                  <code>a2a</code>
                </td>
                <td>A2A</td>
                <td>Agent-to-Agent Protocol (Google)</td>
              </tr>
              <tr>
                <td>
                  <code>http</code>
                </td>
                <td>HTTP</td>
                <td>REST API</td>
              </tr>
              <tr>
                <td>
                  <code>ws</code>
                </td>
                <td>WebSocket</td>
                <td>Real-time bidirectional</td>
              </tr>
              <tr>
                <td>
                  <code>grpc</code>
                </td>
                <td>gRPC</td>
                <td>High-performance RPC</td>
              </tr>
            </tbody>
          </table>

          <h2>Capability Vocabulary</h2>
          <p>20 starter capabilities (custom IDs allowed, lowercase, hyphen-separated):</p>
          <div className={styles.pills}>
            {[
              "research",
              "summarization",
              "translation",
              "code-generation",
              "code-review",
              "data-analysis",
              "image-generation",
              "image-analysis",
              "audio-transcription",
              "web-scraping",
              "api-integration",
              "workflow-automation",
              "scheduling",
              "monitoring",
              "content-writing",
              "chat",
              "reasoning",
              "math",
              "search",
              "embedding",
            ].map((cap) => (
              <code key={cap} className={styles.capPill}>
                {cap}
              </code>
            ))}
          </div>

          <h2>Resolution Algorithm</h2>
          <p>Priority order:</p>
          <ol>
            <li>
              <strong>Inline TXT records</strong> (v1 default): Check for{" "}
              <code>agt-version=1</code>. If found, parse all{" "}
              <code>agt-*</code> values.
            </li>
            <li>
              <strong>Content-addressed manifest</strong>: If{" "}
              <code>agt-manifest=&#123;cid-or-url&#125;</code> present, fetch
              JSON from IPFS or HTTP.
            </li>
            <li>
              <strong>Hosted manifest</strong>: Fetch{" "}
              <code>&#123;endpoint&#125;/.agt/manifest.json</code> from the
              domain&apos;s HTTP endpoint.
            </li>
            <li>
              <strong>Fallback</strong>: Resolve as normal web content (IPFS,
              Arweave, HTTP).
            </li>
          </ol>

          <h2>Parsing Rules</h2>
          <ul>
            <li>
              Strip surrounding double quotes (Freename API wraps TXT values in
              quotes).
            </li>
            <li>Multiple records of the same type are supported.</li>
            <li>
              Empty values after <code>=</code> are ignored.
            </li>
            <li>
              Unknown <code>agt-</code> prefixed records are ignored (forward
              compatibility).
            </li>
            <li>
              <code>agt-version</code> sentinel must be present for any parsing
              to occur.
            </li>
          </ul>

          <h2>Verification</h2>
          <p>
            The <code>agt-owner</code> address can be verified against the
            Freename NFT owner on-chain:
          </p>
          <ol>
            <li>
              Compute tokenId:{" "}
              <code>keccak256(bytes(tld) ++ keccak256(bytes(sld)))</code>
            </li>
            <li>
              Query FNS contract <code>ownerOf(tokenId)</code> on Polygon (
              <code>0x465ea4967479A96D4490d575b5a6cC2B4A4BEE65</code>)
            </li>
            <li>
              Compare with declared <code>agt-owner</code>
            </li>
          </ol>

          <h2>Example</h2>
          <pre>
            <code>{`agt-version=1
agt-name=Research Agent
agt-description=Deep research and source citation
agt-icon=https://researcher.example.com/icon.png
agt-protocol=mcp
agt-protocol=http
agt-cap=research
agt-cap=summarization
agt-endpoint-mcp=https://researcher.example.com/mcp
agt-endpoint-http=https://researcher.example.com/api/v1
agt-pricing=freemium
agt-owner=0xABCD1234...`}</code>
          </pre>

          <h2>Resolve from Anywhere</h2>
          <pre>
            <code>{`import { resolveAgent } from '@agt/resolver'

const agent = await resolveAgent('researcher.agt')

agent.protocols    // ['mcp', 'http']
agent.capabilities // ['research', 'summarization']
agent.endpoints[0] // { protocol: 'mcp', url: 'https://...' }`}</code>
          </pre>
          <p>
            <code>@agt/resolver</code> — zero dependencies, works in Node,
            Deno, Bun, and browsers.
          </p>
    </article>
  );
}
