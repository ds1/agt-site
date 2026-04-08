import { CAPABILITIES, getCapabilitiesGrouped } from "@/lib/agent-capabilities";
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
                  <code>agt-website=&#123;url&#125;</code>
                </td>
                <td>Agent homepage URL. Full HTTPS URL.</td>
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
          <p>
            {CAPABILITIES.length} registered capabilities across{" "}
            {getCapabilitiesGrouped().length} categories. Custom IDs are
            allowed (lowercase, hyphen-separated).
          </p>
          {getCapabilitiesGrouped().map(({ category, capabilities }) => (
            <div key={category.id}>
              <h3>{category.label}</h3>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {capabilities.map((c) => (
                    <tr key={c.id}>
                      <td><code>{c.id}</code></td>
                      <td>{c.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

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
agt-name=Example Agent
agt-description=General-purpose assistant agent
agt-icon=https://exampleagent.example.com/icon.png
agt-website=https://exampleagent.example.com
agt-protocol=mcp
agt-protocol=http
agt-cap=research
agt-cap=summarization
agt-endpoint-mcp=https://exampleagent.example.com/mcp
agt-endpoint-http=https://exampleagent.example.com/api/v1
agt-pricing=freemium
agt-owner=0xABCD1234...`}</code>
          </pre>

          <h2>Resolve from Anywhere</h2>
          <pre>
            <code>{`import { resolveAgent } from '@agt/resolver'

const agent = await resolveAgent('exampleagent.agt')

agent.protocols    // ['mcp', 'http']
agent.capabilities // ['research', 'summarization']
agent.endpoints[0] // { protocol: 'mcp', url: 'https://...' }`}</code>
          </pre>
          <p>
            <code>@agt/resolver</code> — zero dependencies, works in Node,
            Deno, Bun, and browsers.
          </p>

          <h2 id="manifest-v2">Manifest v2: JSON on IPFS (Draft)</h2>
          <p>
            v0.2.0 adds a JSON manifest hosted on IPFS, referenced by a
            single TXT pointer: <code>agt-manifest=ipfs://&#123;cid&#125;</code>.
            This enables capability schemas, protocol versions, structured
            pricing, and cryptographic signatures. v1 inline records continue
            to work unchanged.
          </p>

          <h3>Resolution Priority</h3>
          <ol>
            <li>
              Check for <code>agt-manifest</code> TXT pointer &rarr; fetch JSON
              from IPFS.
            </li>
            <li>Fall back to <code>agt-version=1</code> inline TXT records.</li>
          </ol>

          <h3>v2 JSON Example</h3>
          <pre>
            <code>{`{
  "agt": "2.0",
  "domain": "exampleagent.agt",
  "name": "Example Agent",
  "description": "General-purpose assistant agent",
  "protocols": [
    { "id": "mcp", "version": "2025-11-05", "endpoint": "https://exampleagent.example.com/mcp" },
    { "id": "http", "endpoint": "https://exampleagent.example.com/api/v1" }
  ],
  "capabilities": [
    {
      "id": "research",
      "input": { "type": "string", "description": "Research query" },
      "output": { "type": "object", "properties": { "summary": { "type": "string" }, "sources": { "type": "array" } } }
    },
    { "id": "summarization" }
  ],
  "pricing": { "model": "freemium", "free_tier": "10 queries/day" },
  "owner": "0x912D39E13b0bDAe2C5Cf5D0E2f9F4B38aE9c7f6a",
  "signature": "0x7f3e8d4c..."
}`}</code>
          </pre>
          <p>
            Full specification:{" "}
            <a
              href="https://github.com/ds1/agt-site/blob/master/spec/agt-manifest-v0.2.0.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              spec/agt-manifest-v0.2.0.md
            </a>
          </p>
    </article>
  );
}
