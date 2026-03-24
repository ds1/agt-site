"use client";

import { useState, useEffect } from "react";
import AgentCard, { type AgentManifest } from "./AgentCard";
import { CAPABILITIES, PROTOCOLS } from "@/lib/agent-capabilities";
import styles from "./ExploreContent.module.css";

export default function ExploreContent() {
  const [agents, setAgents] = useState<AgentManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCap, setFilterCap] = useState("");
  const [filterProto, setFilterProto] = useState("");

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (filterCap) params.set("capability", filterCap);
      if (filterProto) params.set("protocol", filterProto);

      const resp = await fetch(`/api/agents?${params.toString()}`);
      const data = await resp.json();
      if (data.success) setAgents(data.agents);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCap, filterProto]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAgents();
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Agents</h1>
        <p>Registered on the .agt namespace</p>
      </div>

      <div className={styles.controls}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>

        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={filterProto}
            onChange={(e) => setFilterProto(e.target.value)}
          >
            <option value="">All protocols</option>
            {PROTOCOLS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={filterCap}
            onChange={(e) => setFilterCap(e.target.value)}
          >
            <option value="">All capabilities</option>
            {CAPABILITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className={styles.state}>
          <p>Scanning .agt domains...</p>
        </div>
      ) : agents.length === 0 ? (
        <div className={styles.state}>
          <p>
            No agents found
            {search || filterCap || filterProto
              ? " matching your filters"
              : ""}
            .
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {agents.map((agent) => (
            <AgentCard key={agent.domain} agent={agent} />
          ))}
        </div>
      )}
    </main>
  );
}
