import styles from "../agt-manifest-spec/spec.module.css";

export const metadata = {
  title: "Resolver SDK — .agt Documentation",
  description:
    "The @agt/resolver TypeScript package — zero dependencies, works in Node, Deno, Bun, and browsers.",
};

export default function ResolverSdkPage() {
  return (
    <article className={styles.article}>
      <h1>Resolver SDK</h1>
      <p className={styles.lead}>
        <code>@agt/resolver</code> is a standalone TypeScript library for
        resolving .agt agent manifests. Zero dependencies. Works in Node.js,
        Deno, Bun, and browsers.
      </p>

      <h2>Package Info</h2>
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Package</td>
            <td>
              <code>@agt/resolver</code>
            </td>
          </tr>
          <tr>
            <td>Version</td>
            <td>
              <code>0.1.0</code>
            </td>
          </tr>
          <tr>
            <td>Dependencies</td>
            <td>None (zero-dep)</td>
          </tr>
          <tr>
            <td>Output</td>
            <td>
              ESM — <code>dist/index.js</code> + <code>dist/index.d.ts</code>
            </td>
          </tr>
          <tr>
            <td>Runtimes</td>
            <td>Node.js, Deno, Bun, browsers</td>
          </tr>
        </tbody>
      </table>

      <h2>API</h2>

      <h3>resolveAgent</h3>
      <p>
        Resolve a single .agt domain to its manifest. Returns{" "}
        <code>AgentManifest | null</code>.
      </p>
      <pre>
        <code>{`import { resolveAgent } from '@agt/resolver'

const agent = await resolveAgent('researcher.agt')

if (agent) {
  agent.domain        // 'researcher.agt'
  agent.protocols     // ['mcp', 'http']
  agent.capabilities  // ['research', 'summarization']
  agent.endpoints[0]  // { protocol: 'mcp', url: 'https://...' }
}`}</code>
      </pre>

      <h3>resolveAgents</h3>
      <p>Resolve multiple .agt domains in parallel.</p>
      <pre>
        <code>{`import { resolveAgents } from '@agt/resolver'

const agents = await resolveAgents(['a.agt', 'b.agt', 'c.agt'])
// Returns (AgentManifest | null)[]`}</code>
      </pre>

      <h3>isAgent</h3>
      <p>Check whether a domain has a valid agent configuration.</p>
      <pre>
        <code>{`import { isAgent } from '@agt/resolver'

const hasConfig = await isAgent('researcher.agt')
// Returns boolean`}</code>
      </pre>

      <h2>TypeScript Types</h2>

      <h3>AgentManifest</h3>
      <pre>
        <code>{`interface AgentManifest {
  domain: string;           // "researcher.agt"
  version: number;          // 1
  name: string | null;      // "Research Agent"
  description: string | null;
  icon: string | null;      // URL to image
  protocols: string[];      // ["mcp", "a2a"]
  capabilities: string[];   // ["research", "summarization"]
  endpoints: AgentEndpoint[];
  pricing: string | null;   // "free" | "paid" | "freemium" | "contact"
  owner: string | null;     // "0x..."
}`}</code>
      </pre>

      <h3>AgentEndpoint</h3>
      <pre>
        <code>{`interface AgentEndpoint {
  protocol: string;   // "mcp"
  url: string;        // "https://..."
}`}</code>
      </pre>

      <h3>ResolveOptions</h3>
      <pre>
        <code>{`interface ResolveOptions {
  resolverUrl?: string;  // Default: Freename public resolver
  timeout?: number;      // Default: 10000ms
}`}</code>
      </pre>
      <p>
        Pass options as the second argument to any resolve function:
      </p>
      <pre>
        <code>{`const agent = await resolveAgent('researcher.agt', {
  timeout: 5000,
})`}</code>
      </pre>

      <h2>Resolution Mechanism</h2>
      <p>
        The SDK uses the Freename public resolver API. No authentication is
        required.
      </p>
      <pre>
        <code>{`GET https://apis.freename.io/api/v1/resolver/FNS/{domain}`}</code>
      </pre>
      <p>The resolution process:</p>
      <ol>
        <li>
          Fetch TXT records from the Freename public resolver for the given
          domain.
        </li>
        <li>
          Strip surrounding double quotes from record values (Freename wraps
          TXT values in quotes).
        </li>
        <li>
          Look for the <code>agt-version=1</code> sentinel. If absent, return{" "}
          <code>null</code>.
        </li>
        <li>
          Parse all <code>agt-*</code> prefixed records into a structured{" "}
          <code>AgentManifest</code> object.
        </li>
      </ol>
    </article>
  );
}
