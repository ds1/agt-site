import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { CAPABILITIES, getCapabilitiesGrouped } from "@/lib/agent-capabilities";
import styles from "../docs/agt-manifest-spec/spec.module.css";

export const metadata: Metadata = {
  title: ".agt Manifest Specification v0.1.0",
  description:
    "The .agt manifest defines agent identity using DNS TXT records on .agt domains. Standalone specification document.",
};

export default function StandaloneSpecPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <article className={styles.article}>
          <h1>.agt Manifest Specification</h1>
          <p className={styles.lead}>
            <strong>Version:</strong> 0.1.0 &middot;{" "}
            <strong>Status:</strong> Draft &middot;{" "}
            <strong>Date:</strong> 2026-04-02 &middot;{" "}
            <a
              href="https://github.com/ds1/agt-site/blob/master/spec/agt-manifest-v0.1.0.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              View as Markdown
            </a>
          </p>

          <h2>Abstract</h2>
          <p>
            The .agt manifest defines agent identity using DNS TXT records on{" "}
            <code>.agt</code> domains. Each <code>.agt</code> domain is an
            ERC-721 NFT on the Polygon blockchain, owned by a wallet address.
            The manifest &mdash; a set of structured key-value TXT records
            &mdash; declares the agent&apos;s name, capabilities, protocols,
            endpoints, and metadata.
          </p>
          <p>
            Any client that can resolve <code>.agt</code> domains can read and
            parse an agent&apos;s manifest without authentication.
          </p>

          <h2>1. Record Format</h2>
          <p>
            All manifest records are DNS TXT records on the{" "}
            <code>.agt</code> domain&apos;s root (<code>@</code>) with the
            format:
          </p>
          <pre>
            <code>agt-&#123;field&#125;=&#123;value&#125;</code>
          </pre>
          <ul>
            <li>Values are UTF-8 strings.</li>
            <li>
              Each TXT record MUST contain exactly one{" "}
              <code>agt-&#123;field&#125;=&#123;value&#125;</code> pair.
            </li>
            <li>
              DNS TXT record limits apply (255 bytes per string; multiple
              strings are concatenated).
            </li>
            <li>
              Records with unknown <code>agt-</code> prefixes SHOULD be
              ignored by parsers (forward compatibility).
            </li>
          </ul>

          <h2>2. Record Types</h2>

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
                  <code>agt-version=&#123;n&#125;</code>
                </td>
                <td>
                  <strong>Required.</strong> Sentinel. Current value:{" "}
                  <code>1</code>. A domain without this record has no valid
                  manifest.
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
                <th>Constraints</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>agt-name=&#123;name&#125;</code>
                </td>
                <td>Display name.</td>
                <td>Max 100 chars</td>
              </tr>
              <tr>
                <td>
                  <code>agt-description=&#123;text&#125;</code>
                </td>
                <td>One-line description.</td>
                <td>Max 200 chars</td>
              </tr>
              <tr>
                <td>
                  <code>agt-icon=&#123;url&#125;</code>
                </td>
                <td>Icon image URL (PNG, SVG, JPG).</td>
                <td>HTTPS recommended. 128x128+ recommended.</td>
              </tr>
              <tr>
                <td>
                  <code>agt-website=&#123;url&#125;</code>
                </td>
                <td>Agent homepage URL.</td>
                <td>Full HTTPS URL</td>
              </tr>
              <tr>
                <td>
                  <code>agt-owner=&#123;address&#125;</code>
                </td>
                <td>Owner wallet address.</td>
                <td>
                  Ethereum-style hex (e.g., <code>0x1234...abcd</code>)
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
                <th>Cardinality</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>agt-protocol=&#123;id&#125;</code>
                </td>
                <td>Protocol the agent supports.</td>
                <td>Repeatable</td>
              </tr>
              <tr>
                <td>
                  <code>agt-cap=&#123;id&#125;</code>
                </td>
                <td>Capability the agent has.</td>
                <td>Repeatable</td>
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
                  MUST match a declared <code>agt-protocol</code>.
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

          <h2>3. Protocol Vocabulary</h2>
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
                <td><code>mcp</code></td>
                <td>Model Context Protocol</td>
                <td>Anthropic&apos;s protocol for tool and context integration.</td>
              </tr>
              <tr>
                <td><code>a2a</code></td>
                <td>Agent-to-Agent Protocol</td>
                <td>Google&apos;s protocol for inter-agent communication.</td>
              </tr>
              <tr>
                <td><code>http</code></td>
                <td>REST API</td>
                <td>Standard HTTP/HTTPS REST interface.</td>
              </tr>
              <tr>
                <td><code>ws</code></td>
                <td>WebSocket</td>
                <td>Persistent bidirectional connection.</td>
              </tr>
              <tr>
                <td><code>grpc</code></td>
                <td>gRPC</td>
                <td>High-performance RPC framework.</td>
              </tr>
            </tbody>
          </table>
          <p>
            Custom protocol IDs MAY be used. They SHOULD be lowercase,
            hyphen-separated identifiers.
          </p>

          <h2>4. Capability Vocabulary</h2>
          <p>
            {CAPABILITIES.length} registered capabilities across{" "}
            {getCapabilitiesGrouped().length} categories. Categories are an
            organizational convenience — only capability IDs appear in{" "}
            <code>agt-cap=</code> records.
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
          <p>
            Custom capability IDs MAY be used. They MUST be lowercase,
            hyphen-separated identifiers.
          </p>

          <h2>5. Resolution Algorithm</h2>
          <ol>
            <li>
              Query DNS TXT records for the domain (e.g.,{" "}
              <code>exampleagent.agt</code>).
            </li>
            <li>
              Filter for records matching the <code>agt-</code> prefix.
            </li>
            <li>
              Check for <code>agt-version=1</code>. If absent, the domain has
              no valid manifest.
            </li>
            <li>
              Parse remaining records according to the field definitions in
              Section 2.
            </li>
          </ol>

          <h2>6. Parsing Rules</h2>
          <ol>
            <li>
              <strong>Quote stripping:</strong> DNS providers may wrap TXT
              values in double quotes. Parsers MUST strip surrounding quotes.
            </li>
            <li>
              <strong>Multiple records:</strong> Repeatable fields may appear
              multiple times. Each occurrence adds to the list.
            </li>
            <li>
              <strong>Empty values:</strong> A record with an empty value
              after <code>=</code> SHOULD be treated as absent.
            </li>
            <li>
              <strong>Unknown prefixes:</strong> Records with unrecognized{" "}
              <code>agt-</code> prefixes SHOULD be silently ignored.
            </li>
            <li>
              <strong>Case sensitivity:</strong> Field names are
              case-sensitive and MUST be lowercase. Values are case-sensitive
              unless otherwise specified.
            </li>
          </ol>

          <h2>7. Verification</h2>
          <p>
            The <code>agt-owner</code> address can be verified against the
            on-chain NFT owner:
          </p>
          <ol>
            <li>
              Query the Freename Name Service (FNS) contract on Polygon.
            </li>
            <li>
              Compute the token ID:{" "}
              <code>keccak256(abi.encodePacked(domain))</code>.
            </li>
            <li>
              Call <code>ownerOf(tokenId)</code> on the FNS contract.
            </li>
            <li>
              Compare the returned address with the <code>agt-owner</code>{" "}
              value.
            </li>
          </ol>

          <h2>8. Example</h2>
          <p>
            A complete manifest for <code>exampleagent.agt</code>:
          </p>
          <pre>
            <code>{`agt-version=1
agt-name=Example Agent
agt-description=General-purpose assistant agent
agt-icon=https://exampleagent.example.com/icon.png
agt-website=https://exampleagent.example.com
agt-owner=0x912D39E13b0bDAe2C5Cf5D0E2f9F4B38aE9c7f6a
agt-protocol=mcp
agt-protocol=http
agt-cap=research
agt-cap=summarization
agt-endpoint-mcp=https://exampleagent.example.com/mcp
agt-endpoint-http=https://exampleagent.example.com/api
agt-pricing=free`}</code>
          </pre>

          <h2>9. Security Considerations</h2>
          <ul>
            <li>
              All TXT records are public and unencrypted. Agents MUST NOT
              store secrets in manifest records.
            </li>
            <li>
              Endpoint URLs SHOULD use HTTPS. Clients SHOULD warn users
              before connecting to HTTP endpoints.
            </li>
            <li>
              Icon and website URLs SHOULD be served over HTTPS.
            </li>
            <li>
              Clients SHOULD verify <code>agt-owner</code> against on-chain
              ownership before trusting the manifest.
            </li>
          </ul>

          <h2>Appendix: Record Reference</h2>
          <table>
            <thead>
              <tr>
                <th>Record</th>
                <th>Required</th>
                <th>Repeatable</th>
                <th>Max Length</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>agt-version</code></td><td>Yes</td><td>No</td><td>&mdash;</td></tr>
              <tr><td><code>agt-name</code></td><td>No</td><td>No</td><td>100 chars</td></tr>
              <tr><td><code>agt-description</code></td><td>No</td><td>No</td><td>200 chars</td></tr>
              <tr><td><code>agt-icon</code></td><td>No</td><td>No</td><td>&mdash;</td></tr>
              <tr><td><code>agt-website</code></td><td>No</td><td>No</td><td>&mdash;</td></tr>
              <tr><td><code>agt-owner</code></td><td>No</td><td>No</td><td>&mdash;</td></tr>
              <tr><td><code>agt-protocol</code></td><td>No</td><td>Yes</td><td>&mdash;</td></tr>
              <tr><td><code>agt-cap</code></td><td>No</td><td>Yes</td><td>&mdash;</td></tr>
              <tr><td><code>agt-endpoint-&#123;proto&#125;</code></td><td>No</td><td>No (per proto)</td><td>&mdash;</td></tr>
              <tr><td><code>agt-pricing</code></td><td>No</td><td>No</td><td>&mdash;</td></tr>
            </tbody>
          </table>
          <h2 id="manifest-v2">Manifest v2: JSON on IPFS (Draft)</h2>
          <p>
            v0.2.0 adds an alternative to inline TXT records: a full JSON
            manifest hosted on IPFS, referenced by a single TXT pointer.
            This enables richer metadata that TXT records cannot express:
            capability schemas with input/output types, protocol versions,
            structured pricing, and cryptographic signatures.
          </p>
          <p>
            v1 inline TXT records continue to work unchanged. v2 is additive.
          </p>

          <h3>TXT Pointer Record</h3>
          <p>
            A single TXT record replaces all individual <code>agt-*</code> records:
          </p>
          <pre>
            <code>agt-manifest=ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi</code>
          </pre>

          <h3>Resolution Priority</h3>
          <ol>
            <li>
              Check for <code>agt-manifest=ipfs://&#123;cid&#125;</code> &mdash;
              fetch JSON from IPFS gateway, parse, verify signature if present.
            </li>
            <li>
              If no pointer: fall back to <code>agt-version=1</code> inline TXT
              records (v1).
            </li>
            <li>
              If neither found: no valid manifest.
            </li>
          </ol>

          <h3>JSON Schema</h3>
          <pre>
            <code>{`{
  "agt": "2.0",
  "domain": "exampleagent.agt",
  "name": "Example Agent",
  "description": "General-purpose assistant agent",
  "icon": "https://exampleagent.example.com/icon.png",
  "website": "https://exampleagent.example.com",
  "owner": "0x912D39E13b0bDAe2C5Cf5D0E2f9F4B38aE9c7f6a",
  "protocols": [
    {
      "id": "mcp",
      "version": "2025-11-05",
      "endpoint": "https://exampleagent.example.com/mcp"
    },
    {
      "id": "http",
      "endpoint": "https://exampleagent.example.com/api/v1"
    }
  ],
  "capabilities": [
    {
      "id": "research",
      "description": "Searches academic databases and web sources",
      "input": {
        "type": "string",
        "description": "Natural language research query"
      },
      "output": {
        "type": "object",
        "properties": {
          "summary": { "type": "string" },
          "sources": { "type": "array" }
        }
      }
    },
    {
      "id": "summarization"
    }
  ],
  "pricing": {
    "model": "freemium",
    "free_tier": "10 queries/day",
    "paid": {
      "currency": "USD",
      "amount": "0.01",
      "unit": "per_request"
    }
  },
  "signature": "0x7f3e8d4c..."
}`}</code>
          </pre>

          <h3>What v2 Enables</h3>
          <ul>
            <li>
              <strong>Capability schemas</strong> &mdash; declare input/output
              types so clients can evaluate compatibility programmatically.
            </li>
            <li>
              <strong>Protocol versions</strong> &mdash; specify which version
              of MCP, A2A, or other protocols the agent supports.
            </li>
            <li>
              <strong>Structured pricing</strong> &mdash; express actual payment
              terms (currency, amount, billing unit) instead of a single keyword.
            </li>
            <li>
              <strong>Cryptographic signatures</strong> &mdash; prove the
              manifest was authored by the NFT owner. Three-way verification:
              signer matches declared owner matches on-chain owner.
            </li>
            <li>
              <strong>Content integrity</strong> &mdash; the IPFS CID is a hash
              of the content. Tampered manifests won&apos;t match the pointer.
            </li>
          </ul>

          <h3>Signature Verification</h3>
          <ol>
            <li>
              Remove the <code>signature</code> field from the JSON.
            </li>
            <li>
              Serialize canonically (keys sorted alphabetically, no whitespace).
            </li>
            <li>
              Recover signer address from the signature and canonical message.
            </li>
            <li>
              Verify: signer == <code>owner</code> field == on-chain NFT owner.
            </li>
          </ol>

          <h3>Backward Compatibility</h3>
          <ul>
            <li>v1 inline TXT records continue to work unchanged.</li>
            <li>
              Clients MUST support v1. v2 support is optional but recommended.
            </li>
            <li>
              Agent owners can use v1 only, v2 only, or both (pointer takes
              priority).
            </li>
          </ul>
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
      </main>
      <Footer />
    </>
  );
}
