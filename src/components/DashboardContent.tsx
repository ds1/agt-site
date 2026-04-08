"use client";

import { useState } from "react";
import AgentConfigForm, { type AgentConfigValues } from "./AgentConfigForm";
import AgentCard, { type AgentManifest } from "./AgentCard";
import styles from "./DashboardContent.module.css";

type DashboardState =
  | { step: "lookup" }
  | { step: "loading" }
  | { step: "view"; domain: string; config: AgentConfigValues; manifest: AgentManifest; zoneUuid: string | null; hasVersion: boolean; owner: string }
  | { step: "edit"; domain: string; config: AgentConfigValues; zoneUuid: string; walletAddress: string }
  | { step: "saved"; domain: string; recordCount: number }
  | { step: "error"; message: string };

export default function DashboardContent() {
  const [state, setState] = useState<DashboardState>({ step: "lookup" });
  const [domainInput, setDomainInput] = useState("");

  const lookupDomain = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const domain = domainInput.trim().toLowerCase();
    if (!domain) return;

    const fullDomain = domain.endsWith(".agt") ? domain : `${domain}.agt`;
    setState({ step: "loading" });

    try {
      const resp = await fetch(`/api/agent-config?domain=${encodeURIComponent(fullDomain)}`);
      const data = await resp.json();

      if (!resp.ok) {
        setState({ step: "error", message: data.error || "Failed to look up domain" });
        return;
      }

      const config: AgentConfigValues = data.config || {};
      const endpointsMap: Record<string, string> = {};
      if (data.config?.endpoints) {
        for (const ep of data.config.endpoints) {
          endpointsMap[ep.protocol] = ep.url;
        }
      }
      config.endpoints = endpointsMap;

      const owner = data.config?.owner || null;

      const manifest: AgentManifest = {
        domain: fullDomain,
        version: 1,
        name: config.name || null,
        description: config.description || null,
        icon: config.icon || null,
        website: config.website || null,
        protocols: config.protocols || [],
        capabilities: config.capabilities || [],
        endpoints: data.config?.endpoints || [],
        pricing: config.pricing || null,
        owner,
      };

      setState({
        step: "view",
        domain: fullDomain,
        config,
        manifest,
        zoneUuid: data.zoneUuid || null,
        hasVersion: data.hasVersion,
        owner: owner || "",
      });
    } catch {
      setState({ step: "error", message: "Network error. Please try again." });
    }
  };

  const startEdit = () => {
    if (state.step !== "view") return;
    if (!state.zoneUuid) {
      setState({
        step: "error",
        message: "Cannot edit: this domain was not registered through agtnames.com. Zone UUID not found.",
      });
      return;
    }
    setState({
      step: "edit",
      domain: state.domain,
      config: state.config,
      zoneUuid: state.zoneUuid,
      walletAddress: state.owner,
    });
  };

  const reset = () => {
    setState({ step: "lookup" });
    setDomainInput("");
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Dashboard</h1>
        <p>Look up and manage your .agt agent configuration</p>
      </div>

      {state.step === "lookup" && (
        <form onSubmit={lookupDomain} className={styles.lookupForm}>
          <div className={styles.inputRow}>
            <input
              type="text"
              className={styles.domainInput}
              placeholder="Enter domain name"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              autoFocus
            />
            <span className={styles.tldSuffix}>.agt</span>
          </div>
          <button type="submit" className={styles.lookupBtn} disabled={!domainInput.trim()}>
            Look up
          </button>
        </form>
      )}

      {state.step === "loading" && (
        <div className={styles.state}>
          <p>Resolving domain...</p>
        </div>
      )}

      {state.step === "error" && (
        <div className={styles.errorState}>
          <p>{state.message}</p>
          <button className={styles.backBtn} onClick={reset}>
            Try another domain
          </button>
        </div>
      )}

      {state.step === "view" && (
        <div className={styles.viewSection}>
          {state.hasVersion ? (
            <>
              <div className={styles.statusBadge}>
                <span className={styles.statusDot} />
                Agent configured
              </div>
              <AgentCard agent={state.manifest} />
            </>
          ) : (
            <div className={styles.unconfigured}>
              <span className={styles.domain}>{state.domain}</span>
              <p>This domain exists but has no agent configuration yet.</p>
            </div>
          )}

          <div className={styles.viewActions}>
            {state.zoneUuid ? (
              <button className={styles.editBtn} onClick={startEdit}>
                {state.hasVersion ? "Edit configuration" : "Configure as agent"}
              </button>
            ) : (
              <p className={styles.noEditHint}>
                Editing is available for domains registered through agtnames.com.
              </p>
            )}
            <button className={styles.backBtn} onClick={reset}>
              Look up another
            </button>
          </div>
        </div>
      )}

      {state.step === "edit" && (
        <AgentConfigForm
          zoneUuid={state.zoneUuid}
          walletAddress={state.walletAddress}
          domain={state.domain}
          initialValues={state.config}
          skipLabel="Cancel"
          onSkip={reset}
          onComplete={(result) => {
            setState({
              step: "saved",
              domain: state.domain,
              recordCount: result.recordCount || 0,
            });
          }}
        />
      )}

      {state.step === "saved" && (
        <div className={styles.savedState}>
          <div className={styles.successIcon}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" stroke="var(--success)" strokeWidth="2" />
              <path d="M15 24l6 6 12-12" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2>Configuration saved</h2>
          <p>
            <span className={styles.mono}>{state.domain}</span> updated with{" "}
            {state.recordCount} records. Changes may take a few minutes to propagate.
          </p>
          <div className={styles.savedActions}>
            <button
              className={styles.editBtn}
              onClick={() => {
                setDomainInput(state.domain.replace(/\.agt$/, ""));
                lookupDomain();
              }}
            >
              View current config
            </button>
            <button className={styles.backBtn} onClick={reset}>
              Look up another
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
