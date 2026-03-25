import styles from "../agt-manifest-spec/spec.module.css";

export const metadata = {
  title: "User Flows — .agt Documentation",
  description:
    "Step-by-step walkthroughs: claiming a name, browsing agents, resolving programmatically, agent-to-agent discovery, and exploring the directory.",
};

export default function UserFlowsPage() {
  return (
    <article className={styles.article}>
      <h1>User Flows</h1>
      <p className={styles.lead}>
        How users, developers, and agents interact with the .agt ecosystem —
        from claiming a name to programmatic resolution to agent-to-agent
        discovery.
      </p>

      <h2>Flow 1: Claim a Name</h2>
      <p>The registration site at <code>/claim</code> walks users through:</p>
      <ol>
        <li>User visits <code>/claim</code>.</li>
        <li>
          Types a name (e.g., &quot;researcher&quot;), clicks Search.
        </li>
        <li>
          API checks availability via Freename and shows the price.
        </li>
        <li>
          User enters a wallet address (<code>0x...</code>).
        </li>
        <li>Clicks &quot;Claim this name.&quot;</li>
        <li>
          Backend creates the zone, triggers minting, and sets the{" "}
          <code>agt-version=1</code> sentinel record.
        </li>
        <li>Frontend polls minting status every 5 seconds.</li>
        <li>
          On success, the <strong>AgentConfigForm</strong> appears.
        </li>
        <li>
          User fills in: name, description, protocols, capabilities, and
          endpoints — or clicks &quot;Skip for now.&quot;
        </li>
        <li>
          Backend creates TXT records with <code>agt-*</code> values.
        </li>
        <li>
          Done screen: domain claimed, config status, and next actions.
        </li>
      </ol>

      <h2>Flow 2: Browse an Agent from the Browser</h2>
      <ol>
        <li>
          User types <code>researcher.agt</code> in the browser URL bar.
        </li>
        <li>TLD hint routes to the Freename resolver.</li>
        <li>Freename API returns TXT records.</li>
        <li>
          Parser finds <code>agt-version=1</code> and extracts all{" "}
          <code>agt-*</code> records into a manifest.
        </li>
        <li>
          Frontend renders an <strong>agent card</strong> (not a webpage).
        </li>
        <li>
          User sees: name, description, protocols, capabilities, and endpoints.
        </li>
        <li>Clicking an endpoint opens it in a new webview tab.</li>
      </ol>

      <h2>Flow 3: Resolve Programmatically</h2>
      <p>
        Using the <code>@agt/resolver</code> SDK:
      </p>
      <pre>
        <code>{`import { resolveAgent } from '@agt/resolver'

const agent = await resolveAgent('researcher.agt')
if (agent) {
  // Use agent.endpoints[0].url to connect
  // Check agent.protocols for supported communication methods
  // Read agent.capabilities for what it can do
}`}</code>
      </pre>
      <p>
        Works in any JavaScript runtime. The SDK calls the Freename public
        resolver — no authentication or API keys required.
      </p>

      <h2>Flow 4: Agent-to-Agent Discovery</h2>
      <p>
        <em>Future capability.</em> The envisioned flow:
      </p>
      <ol>
        <li>
          An orchestrator agent needs a specific capability (e.g., web
          scraping).
        </li>
        <li>
          Queries the .agt registry for agents with capability{" "}
          <code>web-scraping</code>.
        </li>
        <li>Resolves manifests, compares pricing and reputation.</li>
        <li>
          Selects <code>scraper.agt</code>, connects via MCP endpoint.
        </li>
        <li>Delegates the task and receives the result.</li>
      </ol>

      <h2>Flow 5: Explore Agents</h2>
      <p>The agent directory at <code>/explore</code>:</p>
      <ol>
        <li>User visits <code>/explore</code>.</li>
        <li>
          Page fetches manifests from a seed domain list via{" "}
          <code>/api/agents</code>.
        </li>
        <li>Agent cards are displayed in a grid.</li>
        <li>
          User filters by protocol (MCP, A2A) or capability (research, chat).
        </li>
        <li>User searches by name or description.</li>
      </ol>
    </article>
  );
}
