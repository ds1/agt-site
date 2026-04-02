"use client";

import { useState } from "react";
import { PROTOCOLS, PRICING_OPTIONS, getCapabilitiesGrouped, searchCapabilities } from "@/lib/agent-capabilities";
import styles from "./AgentConfigForm.module.css";

interface Props {
  zoneUuid: string;
  walletAddress: string;
  domain: string;
  onComplete: (result: { configured: boolean; recordCount?: number; records?: string[] }) => void;
  onSkip: () => void;
}

export default function AgentConfigForm({ zoneUuid, walletAddress, domain, onComplete, onSkip }: Props) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: "",
    website: "",
    protocols: [] as string[],
    capabilities: [] as string[],
    endpoints: {} as Record<string, string>,
    pricing: "",
    customCap: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iconError, setIconError] = useState(false);
  const [capSearch, setCapSearch] = useState("");

  const toggleProtocol = (id: string) => {
    setForm((prev) => {
      const protocols = prev.protocols.includes(id)
        ? prev.protocols.filter((p) => p !== id)
        : [...prev.protocols, id];
      const endpoints = { ...prev.endpoints };
      if (!protocols.includes(id)) delete endpoints[id];
      return { ...prev, protocols, endpoints };
    });
  };

  const toggleCap = (id: string) => {
    setForm((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(id)
        ? prev.capabilities.filter((c) => c !== id)
        : [...prev.capabilities, id],
    }));
  };

  const addCustomCap = () => {
    const cap = form.customCap.trim().toLowerCase().replace(/\s+/g, "-");
    if (cap && !form.capabilities.includes(cap)) {
      setForm((prev) => ({
        ...prev,
        capabilities: [...prev.capabilities, cap],
        customCap: "",
      }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const config = {
        name: form.name || null,
        description: form.description || null,
        icon: form.icon || null,
        website: form.website || null,
        protocols: form.protocols,
        capabilities: form.capabilities,
        endpoints: form.protocols
          .filter((p) => form.endpoints[p])
          .map((p) => ({ protocol: p, url: form.endpoints[p] })),
        pricing: form.pricing || null,
        owner: walletAddress,
      };

      const resp = await fetch("/api/agent-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zoneUuid, config }),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to save");

      const records: string[] = ["agt-version=1"];
      if (config.name) records.push(`agt-name=${config.name}`);
      if (config.description) records.push(`agt-description=${config.description}`);
      if (config.icon) records.push(`agt-icon=${config.icon}`);
      if (config.website) records.push(`agt-website=${config.website}`);
      if (config.protocols) config.protocols.forEach(p => records.push(`agt-protocol=${p}`));
      if (config.capabilities) config.capabilities.forEach(c => records.push(`agt-cap=${c}`));
      if (config.endpoints) config.endpoints.forEach(e => records.push(`agt-endpoint-${e.protocol}=${e.url}`));
      if (config.pricing) records.push(`agt-pricing=${config.pricing}`);
      if (config.owner) records.push(`agt-owner=${config.owner}`);
      onComplete({ configured: true, recordCount: data.recordCount, records });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.form}>
      <div className={styles.formHeader}>
        <h2>Configure your agent</h2>
        <p>
          Set up <span className={styles.mono}>{domain}</span> as an agent
          identity. You can always change this later.
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g., Research Agent"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          maxLength={100}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          placeholder="What does your agent do?"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          rows={2}
          maxLength={200}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Icon URL</label>
        <div className={styles.iconPreviewRow}>
          <input
            type="url"
            className={styles.input}
            placeholder="https://example.com/icon.png"
            value={form.icon}
            onChange={(e) => {
              setForm((p) => ({ ...p, icon: e.target.value }));
              setIconError(false);
            }}
          />
          {form.icon && /^https?:\/\/.+/.test(form.icon) && (
            <div className={styles.iconPreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.icon}
                alt="Icon preview"
                width={48}
                height={48}
                onError={() => setIconError(true)}
                onLoad={() => setIconError(false)}
                style={{ display: iconError ? "none" : "block" }}
              />
              {iconError && (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="15" x2="9" y2="15.01" />
                  <line x1="15" y1="15" x2="15" y2="15.01" />
                </svg>
              )}
            </div>
          )}
        </div>
        {iconError && form.icon && (
          <span className={styles.iconError}>Could not load image</span>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Website URL</label>
        <input
          type="url"
          className={styles.input}
          placeholder="https://your-agent-homepage.com"
          value={form.website}
          onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Protocols</label>
        <div className={styles.chips}>
          {PROTOCOLS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${styles.chip} ${form.protocols.includes(p.id) ? styles.chipActive : ""}`}
              onClick={() => toggleProtocol(p.id)}
              title={p.description}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {form.protocols.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>Endpoints</label>
          {form.protocols.map((proto) => {
            const info = PROTOCOLS.find((p) => p.id === proto);
            return (
              <div key={proto} className={styles.endpointRow}>
                <span className={styles.endpointLabel}>{info?.label || proto}</span>
                <input
                  type="url"
                  className={styles.input}
                  placeholder={`https://your-agent.com/${proto}`}
                  value={form.endpoints[proto] || ""}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      endpoints: { ...p.endpoints, [proto]: e.target.value },
                    }))
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.field}>
        <label className={styles.label}>Capabilities</label>
        <input
          type="text"
          className={`${styles.input} ${styles.capSearch}`}
          placeholder="Search capabilities..."
          value={capSearch}
          onChange={(e) => setCapSearch(e.target.value)}
        />
        {(() => {
          const matchingIds = new Set(searchCapabilities(capSearch).map((c) => c.id));
          const groups = getCapabilitiesGrouped();
          return groups.map(({ category, capabilities }) => {
            const visible = capabilities.filter(
              (c) => matchingIds.has(c.id) || form.capabilities.includes(c.id)
            );
            if (visible.length === 0) return null;
            return (
              <div key={category.id} className={styles.capCategoryGroup}>
                <span className={styles.capCategoryLabel}>{category.label}</span>
                <div className={styles.chips}>
                  {visible.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.chip} ${form.capabilities.includes(c.id) ? styles.chipActive : ""}`}
                      onClick={() => toggleCap(c.id)}
                      title={c.description}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          });
        })()}
        <div className={styles.customCapRow}>
          <input
            type="text"
            className={styles.input}
            placeholder="Custom capability"
            value={form.customCap}
            onChange={(e) => setForm((p) => ({ ...p, customCap: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCap())}
          />
          <button type="button" className={styles.addBtn} onClick={addCustomCap}>
            Add
          </button>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Pricing</label>
        <select
          className={styles.select}
          value={form.pricing}
          onChange={(e) => setForm((p) => ({ ...p, pricing: e.target.value }))}
        >
          <option value="">Select pricing model</option>
          {PRICING_OPTIONS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.skipBtn} onClick={onSkip} disabled={loading}>
          Skip for now
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save configuration"}
        </button>
      </div>
    </div>
  );
}
