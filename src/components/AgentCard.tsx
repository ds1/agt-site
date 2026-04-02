/* eslint-disable @next/next/no-img-element */
import styles from "./AgentCard.module.css";

export interface AgentManifest {
  domain: string;
  version: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  website: string | null;
  protocols: string[];
  capabilities: string[];
  endpoints: { protocol: string; url: string }[];
  pricing: string | null;
  owner: string | null;
}

export default function AgentCard({ agent }: { agent: AgentManifest }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>
          {agent.icon ? (
            <img src={agent.icon} alt="" width={32} height={32} />
          ) : (
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="var(--purple-accent)" />
            </svg>
          )}
        </div>
        <div className={styles.headerText}>
          <span className={styles.domain}>{agent.domain}</span>
          {agent.name && <span className={styles.name}>{agent.name}</span>}
        </div>
      </div>

      {agent.description && (
        <p className={styles.description}>{agent.description}</p>
      )}

      <div className={styles.pills}>
        {agent.protocols.map((p) => (
          <span key={p} className={styles.protoPill}>
            {p.toUpperCase()}
          </span>
        ))}
        {agent.capabilities.map((c) => (
          <span key={c} className={styles.capPill}>
            {c}
          </span>
        ))}
      </div>

      {(agent.pricing || agent.endpoints.length > 0 || agent.website) && (
        <div className={styles.footer}>
          {agent.pricing && (
            <span className={styles.pricing}>{agent.pricing}</span>
          )}
          {agent.endpoints.length > 0 && (
            <span className={styles.endpoints}>
              {agent.endpoints.length} endpoint
              {agent.endpoints.length !== 1 ? "s" : ""}
            </span>
          )}
          {agent.website && (
            <a
              href={agent.website}
              className={styles.websiteLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}
