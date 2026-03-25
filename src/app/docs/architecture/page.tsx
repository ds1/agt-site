import styles from "../agt-manifest-spec/spec.module.css";

export const metadata = {
  title: "Architecture — .agt Documentation",
  description:
    "System components, repository map, and how the browser, registration site, resolver SDK, and Freename API fit together.",
};

export default function ArchitecturePage() {
  return (
    <article className={styles.article}>
      <h1>Architecture</h1>
      <p className={styles.lead}>
        The .agt ecosystem is composed of four repositories and an external API
        layer. Everything resolves through the Freename public resolver and
        records ownership on the Polygon blockchain.
      </p>

      <h2>System Components</h2>
      <pre>
        <code>{`┌─────────────────────────────────────────────────────────────┐
│  .agt Ecosystem                                             │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ Browser  │  │ agt-site     │  │ @agt/resolver SDK  │   │
│  │ (Tauri)  │  │ (Next.js 16) │  │ (TypeScript)       │   │
│  └────┬─────┘  └──────┬───────┘  └─────────┬──────────┘   │
│       │               │                     │               │
│       │  resolve       │  register/config    │  resolve     │
│       │               │                     │               │
│  ┌────┴───────────────┴─────────────────────┴──────────┐   │
│  │           Freename API Layer                         │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐  │   │
│  │  │ Public Resolver  │  │ Reseller API (Auth0)     │  │   │
│  │  │ (read-only)      │  │ (zone CRUD, minting,     │  │   │
│  │  │                  │  │  records)                 │  │   │
│  │  └─────────────────┘  └──────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────┴──────────────────────────────┐   │
│  │              Polygon Blockchain                       │   │
│  │  FNS Contract: 0x465ea4967479A96D4490d575b5a6cC2B4A4 │   │
│  │  NFT ownership, on-chain records                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘`}</code>
      </pre>

      <h2>Repositories</h2>
      <table>
        <thead>
          <tr>
            <th>Repo</th>
            <th>Purpose</th>
            <th>Stack</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>browser</code>
            </td>
            <td>Web3 browser — first .agt client</td>
            <td>Tauri v2, Rust, vanilla JS/CSS</td>
          </tr>
          <tr>
            <td>
              <code>agt/agt-site</code>
            </td>
            <td>Registration site + agent directory</td>
            <td>Next.js 16, TypeScript, Tailwind</td>
          </tr>
          <tr>
            <td>
              <code>agt/resolver-sdk</code>
            </td>
            <td>Standalone resolver library</td>
            <td>TypeScript, zero dependencies</td>
          </tr>
          <tr>
            <td>
              <code>agt/agtdomains-register</code>
            </td>
            <td>Legacy registration site (archived)</td>
            <td>Next.js 15, React 19, RainbowKit</td>
          </tr>
        </tbody>
      </table>

      <h2>How the Pieces Fit Together</h2>
      <p>
        There are two API surfaces within Freename: the <strong>Public
        Resolver</strong> (read-only, no auth) and the <strong>Reseller
        API</strong> (Auth0-authenticated, write access).
      </p>
      <ul>
        <li>
          <strong>Browser</strong> and <strong>@agt/resolver</strong> use the
          public resolver to look up TXT records for any .agt name. This is the
          read path — no credentials needed.
        </li>
        <li>
          <strong>agt-site</strong> uses the Reseller API to create zones, mint
          NFTs, and write TXT records. This is the write path — requires Auth0
          credentials and IP whitelisting.
        </li>
        <li>
          All registration ultimately records ownership on the{" "}
          <strong>Polygon blockchain</strong> via the FNS contract. The{" "}
          <code>agt-owner</code> field in a manifest can be verified against the
          on-chain NFT owner.
        </li>
      </ul>

      <h2>Resolution Flow</h2>
      <pre>
        <code>{`Client calls resolveAgent("researcher.agt")
  → GET https://apis.freename.io/api/v1/resolver/FNS/researcher.agt
  → Response includes TXT records
  → Parser finds agt-version=1 sentinel
  → Extracts all agt-* fields into AgentManifest
  → Returns structured manifest to caller`}</code>
      </pre>
      <p>
        The same resolution path works from the Tauri browser (Rust), the
        resolver SDK (TypeScript), or any HTTP client that can call the
        Freename public resolver endpoint.
      </p>
    </article>
  );
}
