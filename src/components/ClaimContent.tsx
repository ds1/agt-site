"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AgentConfigForm from "./AgentConfigForm";
import styles from "./ClaimContent.module.css";

type Step = "search" | "claiming" | "minting" | "configure" | "done";

interface SearchResult {
  name: string;
  fullDomain: string;
  status: "available" | "unavailable" | "protected";
  available: boolean;
  price: { currency: string; amount: number } | null;
}

export default function ClaimContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("name") || "");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Claim flow state
  const [step, setStep] = useState<Step>("search");
  const [wallet, setWallet] = useState("");
  const [zoneUuid, setZoneUuid] = useState<string | null>(null);
  const [domain, setDomain] = useState("");
  const [mintStatus, setMintStatus] = useState("PENDING");
  const [agentConfigResult, setAgentConfigResult] = useState<{
    configured: boolean;
    recordCount?: number;
  } | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Search
  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const name = search.trim().toLowerCase().replace(/\.agt$/, "");
    if (!name) return;

    setSearching(true);
    setError(null);
    setResult(null);
    setStep("search");

    try {
      const resp = await fetch(`/api/search?name=${encodeURIComponent(name)}`);
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setError(data.error || "Search failed");
        return;
      }
      setResult(data);
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("name")) handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Claim
  const handleClaim = async () => {
    if (!result?.available || !wallet) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setError("Invalid wallet address. Must be 0x followed by 40 hex characters.");
      return;
    }

    setError(null);
    setStep("claiming");

    try {
      const resp = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: result.fullDomain, walletAddress: wallet }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setError(data.error || "Claim failed");
        setStep("search");
        return;
      }

      setZoneUuid(data.zoneUuid);
      setDomain(data.domain);
      setStep("minting");
      startPolling(data.domain);
    } catch {
      setError("Claim failed. Please try again.");
      setStep("search");
    }
  };

  // Minting status polling
  const startPolling = useCallback((domainName: string) => {
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes at 5s intervals

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const resp = await fetch(
          `/api/claim/status?domain=${encodeURIComponent(domainName)}`
        );
        const data = await resp.json();

        if (data.status === "COMPLETE") {
          clearInterval(pollRef.current!);
          setMintStatus("COMPLETE");
          setStep("configure");
        } else if (data.status === "FAILED") {
          clearInterval(pollRef.current!);
          setMintStatus("FAILED");
          setError("Minting failed on blockchain. Please contact support.");
          setStep("search");
        } else {
          setMintStatus(data.status || "PENDING");
        }
      } catch {
        // Silently retry
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollRef.current!);
        // Move to configure anyway — minting may complete in background
        setStep("configure");
      }
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const walletValid = /^0x[a-fA-F0-9]{40}$/.test(wallet);

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Claim a name</h1>
        <p>Search for a .agt name for your agent or project</p>
      </div>

      {/* Search (always visible unless in later steps) */}
      {step === "search" && (
        <>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchBox}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="researcher"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                autoFocus
              />
              <span className={styles.searchTld}>.agt</span>
            </div>
            <button type="submit" className={styles.searchBtn} disabled={searching}>
              {searching ? "..." : "Search"}
            </button>
          </form>

          {searching && (
            <div className={styles.checking}>
              <span className={styles.checkingDot} />
              Checking availability...
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          {!searching && result && (
            <div className={styles.result}>
              <div className={styles.resultHeader}>
                <span className={styles.resultDomain}>{result.fullDomain}</span>
                <span
                  className={`${styles.resultStatus} ${
                    result.available ? styles.available : styles.taken
                  }`}
                >
                  {result.status === "available"
                    ? "Available"
                    : result.status === "protected"
                    ? "Reserved"
                    : "Taken"}
                </span>
              </div>

              {result.available && result.price && (
                <div className={styles.resultBody}>
                  <span className={styles.price}>
                    ${result.price.amount.toFixed(2)}{" "}
                    <span className={styles.priceNote}>one-time</span>
                  </span>

                  <div className={styles.walletField}>
                    <label className={styles.walletLabel}>Wallet address</label>
                    <input
                      type="text"
                      className={styles.walletInput}
                      placeholder="0x..."
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <span className={styles.walletHint}>
                      The NFT will be minted to this address on Polygon
                    </span>
                  </div>

                  <button
                    className={styles.claimBtn}
                    onClick={handleClaim}
                    disabled={!walletValid}
                  >
                    Claim this name
                  </button>
                </div>
              )}

              {result.status === "protected" && (
                <p className={styles.note}>This name is reserved or premium.</p>
              )}

              {result.status === "unavailable" && (
                <p className={styles.note}>
                  This name is already registered. Try a different one.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* Claiming */}
      {step === "claiming" && (
        <div className={styles.progressCard}>
          <span className={styles.checkingDot} />
          <span>Creating zone for {domain}...</span>
        </div>
      )}

      {/* Minting */}
      {step === "minting" && (
        <div className={styles.progressCard}>
          <span className={styles.checkingDot} />
          <div>
            <span>Minting {domain} to Polygon...</span>
            <span className={styles.progressSub}>
              Status: {mintStatus}. This may take a few minutes.
            </span>
          </div>
        </div>
      )}

      {/* Configure */}
      {step === "configure" && zoneUuid && (
        <AgentConfigForm
          zoneUuid={zoneUuid}
          walletAddress={wallet}
          domain={domain}
          onComplete={(res) => {
            setAgentConfigResult(res);
            setStep("done");
          }}
          onSkip={() => {
            setAgentConfigResult({ configured: false });
            setStep("done");
          }}
        />
      )}

      {/* Done */}
      {step === "done" && (
        <div className={styles.doneCard}>
          <h2>{domain}</h2>
          <p className={styles.doneStatus}>
            Name claimed
            {agentConfigResult?.configured
              ? ` and configured (${agentConfigResult.recordCount} records)`
              : ". Agent not configured yet."}
          </p>

          <div className={styles.doneActions}>
            <a href="/explore" className={styles.doneLink}>
              Explore agents
            </a>
            <button
              className={styles.claimBtn}
              onClick={() => {
                setStep("search");
                setResult(null);
                setSearch("");
                setWallet("");
                setZoneUuid(null);
                setAgentConfigResult(null);
                setError(null);
              }}
            >
              Claim another name
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
