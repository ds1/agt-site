"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./HomeContent.module.css";

export default function HomeContent() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const name = search.trim().toLowerCase().replace(/\.agt$/, "");
    if (name) {
      router.push(`/claim?name=${encodeURIComponent(name)}`);
    }
  };

  return (
    <main className={styles.main}>
      {/* Hero: Search is the product */}
      <section className={styles.hero}>
        <h1 className={styles.headline}>Name your agent</h1>
        <p className={styles.subline}>
          .agt is the identity layer for AI agents. Claim a name, declare
          capabilities, get discovered.
        </p>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="youragent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              spellCheck={false}
              autoComplete="off"
            />
            <span className={styles.searchTld}>.agt</span>
          </div>
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>
      </section>

      {/* What you get: show the manifest, not marketing copy */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What a .agt name gives you</h2>

        <div className={styles.manifestPreview}>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-name</span>
            <span className={styles.mVal}>Research Agent</span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-description</span>
            <span className={styles.mVal}>
              Deep research and source citation
            </span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-website</span>
            <span className={styles.mVal}>
              https://researcher.example.com
            </span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-protocol</span>
            <span className={styles.mVal}>mcp</span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-protocol</span>
            <span className={styles.mVal}>a2a</span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-cap</span>
            <span className={styles.mVal}>research</span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-cap</span>
            <span className={styles.mVal}>summarization</span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-endpoint-mcp</span>
            <span className={styles.mVal}>
              https://researcher.example.com/mcp
            </span>
          </div>
          <div className={styles.manifestLine}>
            <span className={styles.mKey}>agt-pricing</span>
            <span className={styles.mVal}>free</span>
          </div>
        </div>

        <p className={styles.manifestCaption}>
          Your agent&apos;s manifest — stored as DNS records, owned as an NFT on Polygon.{" "}
          <a href="/docs/agt-manifest-spec">Read the spec</a>
        </p>
      </section>

      {/* How it works: terse, technical */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How it works</h2>

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <div>
              <strong>Claim a name</strong>
              <p>Search, pay once, own the NFT on Polygon.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <div>
              <strong>Configure your agent</strong>
              <p>
                Set protocols, capabilities, endpoints. Or just point it at a
                website.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <div>
              <strong>Get discovered</strong>
              <p>
                Any .agt client can resolve your name and read your manifest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SDK: show don't tell */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resolve from anywhere</h2>

        <pre className={styles.codeBlock}>
          <code>{`import { resolveAgent } from '@agt/resolver'

const agent = await resolveAgent('researcher.agt')

agent.protocols  // ['mcp', 'a2a']
agent.capabilities  // ['research', 'summarization']
agent.endpoints[0].url  // 'https://researcher.example.com/mcp'`}</code>
        </pre>

        <p className={styles.manifestCaption}>
          Resolve any .agt name with one call.{" "}
          <a href="/docs/resolver-sdk">SDK docs</a>
        </p>
      </section>
    </main>
  );
}
