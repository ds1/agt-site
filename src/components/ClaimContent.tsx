"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AgentConfigForm from "./AgentConfigForm";
import styles from "./ClaimContent.module.css";

type Step = "search" | "payment" | "fulfilling" | "minting" | "done" | "configure";

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
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [contract, setContract] = useState<string | null>(null);
  const [agentConfigResult, setAgentConfigResult] = useState<{
    configured: boolean;
    recordCount?: number;
    records?: string[];
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

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

  // Handle return from Stripe / cancelled checkout / initial search
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const cancelled = searchParams.get("cancelled");

    if (sessionId) {
      // Returning from Stripe Checkout — poll for fulfillment
      setStep("fulfilling");
      startFulfillmentPolling(sessionId);
    } else if (cancelled) {
      setError("Payment was cancelled. You can try again.");
      if (searchParams.get("name")) handleSearch();
    } else if (searchParams.get("name")) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Claim — redirect to Stripe Checkout
  const handleClaim = async () => {
    if (!result?.available || !wallet) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setError("Invalid wallet address. Must be 0x followed by 40 hex characters.");
      return;
    }

    setError(null);
    setStep("payment");

    try {
      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: result.fullDomain,
          walletAddress: wallet,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        setError(data.error || "Could not start checkout");
        setStep("search");
        return;
      }

      // Redirect to Stripe (or mock redirect back)
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setStep("search");
    }
  };

  // Poll /api/checkout/status after returning from Stripe
  const startFulfillmentPolling = useCallback((sessionId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes at 5s intervals

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const resp = await fetch(
          `/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`
        );
        const data = await resp.json();

        if (data.domain) setDomain(data.domain);
        if (data.walletAddress) setWallet(data.walletAddress);

        if (data.fulfillment_status === "complete" && data.zoneUuid) {
          clearInterval(pollRef.current!);
          setZoneUuid(data.zoneUuid);
          setStep("minting");
          startMintingPolling(data.domain);
        } else if (data.fulfillment_status === "failed") {
          clearInterval(pollRef.current!);
          setError(
            data.error ||
              "Registration failed after payment. Your payment will be refunded. Please contact support if needed."
          );
          setStep("search");
        }
      } catch {
        // Silently retry
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollRef.current!);
        setError("Registration is taking longer than expected. Please contact support.");
        setStep("search");
      }
    }, 3000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll /api/claim/status for on-chain minting progress
  const startMintingPolling = useCallback((domainName: string) => {
    let attempts = 0;
    const maxAttempts = 24; // 2 minutes at 5s intervals

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const resp = await fetch(
          `/api/claim/status?domain=${encodeURIComponent(domainName)}`
        );
        const data = await resp.json();

        if (data.transactionHash) setTxHash(data.transactionHash);
        if (data.tokenId) setTokenId(data.tokenId);
        if (data.contract) setContract(data.contract);

        if (data.status === "COMPLETE") {
          clearInterval(pollRef.current!);
          setMintStatus("COMPLETE");
          setStep("done");
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
        setStep("done");
      }
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const walletValid = /^0x[a-fA-F0-9]{40}$/.test(wallet);

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
  );

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );

  return (
    <main className={styles.main}>
      {step === "search" && (
        <div className={styles.header}>
          <h1>Claim an agent name</h1>
          <p>Search for a .agt name for your agent or project</p>
        </div>
      )}

      {step === "payment" && (
        <div className={styles.header}>
          <h1>Redirecting to payment...</h1>
          <p>You&apos;ll be taken to Stripe to complete your purchase</p>
        </div>
      )}

      {step === "fulfilling" && (
        <div className={styles.header}>
          <h1>{domain || "Processing..."}</h1>
          <p>Payment confirmed — registering your name</p>
        </div>
      )}

      {step === "minting" && (
        <div className={styles.header}>
          <h1>{domain}</h1>
          <p>Minting to <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>{wallet}</code> on Polygon</p>
        </div>
      )}

      {/* Search */}
      {step === "search" && (
        <>
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

      {/* Payment redirect */}
      {step === "payment" && (
        <div className={styles.progressCard}>
          <span className={styles.checkingDot} />
          <span>Redirecting to Stripe...</span>
        </div>
      )}

      {/* Fulfilling — waiting for webhook */}
      {step === "fulfilling" && (
        <div className={styles.progressCard}>
          <span className={styles.checkingDot} />
          <div>
            <span>Registering {domain || "your name"}...</span>
            <span className={styles.progressSub}>
              Payment confirmed. Setting up your domain.
            </span>
          </div>
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

      {/* Done — celebration */}
      {step === "done" && (() => {
        const shareText = `I just claimed ${domain} — a decentralized identity for my AI agent on the .agt namespace.`;
        const shareUrl = "https://agtnames.com";
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(shareUrl);

        return (
          <div className={styles.doneWrap}>
            {/* Congratulations heading */}
            <div className={styles.doneHeader}>
              <h1 className={styles.doneCongrats}>
                Congratulations! You are now the owner of{" "}
                <span className={styles.doneDomainInline}>{domain}</span>
              </h1>
              <p className={styles.doneOwner}>
                Minted to{" "}
                <code className={styles.doneWalletCode}>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </code>{" "}
                on Polygon
              </p>
            </div>

            {/* NFT card */}
            <div className={styles.nftCard}>
              <div className={styles.nftInner}>
                <div className={styles.nftBadge}>.agt</div>
                <div className={styles.nftName}>{domain.replace(/\.agt$/, "")}</div>
                <div className={styles.nftTld}>.agt</div>
                <div className={styles.nftFooter}>
                  <span className={styles.nftChain}>Polygon</span>
                  <span className={styles.nftOwner}>
                    {wallet.slice(0, 6)}...{wallet.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className={styles.shareSection}>
              <p className={styles.sharePrompt}>Share the news</p>
              <div className={styles.shareLinks}>
                <a
                  href={`https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <a
                  href={`https://discord.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
                  Discord
                </a>
                <a
                  href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.shareBtn}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 000-.463.327.327 0 00-.462 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.205-.094z"/></svg>
                  Reddit
                </a>
              </div>
            </div>

            {/* NFT details */}
            <div className={styles.nftDetails}>
              <h3 className={styles.nftDetailsTitle}>Your NFT</h3>
              <div className={styles.nftDetailRows}>
                <div className={styles.nftDetailRow}>
                  <span className={styles.nftDetailLabel}>Network</span>
                  <span className={styles.nftDetailValue}>Polygon</span>
                </div>
                {contract && (
                  <div className={styles.nftDetailRow}>
                    <span className={styles.nftDetailLabel}>Contract</span>
                    <div className={styles.nftDetailValueRow}>
                      <code className={styles.nftDetailMono}>
                        {contract.slice(0, 8)}...{contract.slice(-6)}
                      </code>
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(contract, "contract")}
                        title="Copy contract address"
                      >
                        {copied === "contract" ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>
                )}
                {tokenId && (
                  <div className={styles.nftDetailRow}>
                    <span className={styles.nftDetailLabel}>Token ID</span>
                    <div className={styles.nftDetailValueRow}>
                      <code className={styles.nftDetailMono}>
                        {tokenId.length > 20
                          ? tokenId.slice(0, 10) + "..." + tokenId.slice(-10)
                          : tokenId}
                      </code>
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(tokenId, "tokenId")}
                        title="Copy token ID"
                      >
                        {copied === "tokenId" ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>
                )}
                {txHash && (
                  <div className={styles.nftDetailRow}>
                    <span className={styles.nftDetailLabel}>Transaction</span>
                    <div className={styles.nftDetailValueRow}>
                      <a
                        href={`https://polygonscan.com/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.nftDetailLink}
                      >
                        {txHash.slice(0, 10)}...{txHash.slice(-8)}
                      </a>
                      <button
                        className={styles.copyBtn}
                        onClick={() => copyToClipboard(txHash, "txHash")}
                        title="Copy transaction hash"
                      >
                        {copied === "txHash" ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.nftDetailActions}>
                {contract && tokenId && (
                  <a
                    href={`https://opensea.io/assets/matic/${contract}/${tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                  >
                    View on OpenSea
                  </a>
                )}
                {txHash && (
                  <a
                    href={`https://polygonscan.com/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.shareBtn}
                  >
                    View on Polygonscan
                  </a>
                )}
              </div>
              {contract && tokenId && (
                <details className={styles.nftImportDetails}>
                  <summary className={styles.nftImportSummary}>
                    Import to MetaMask
                  </summary>
                  <ol className={styles.nftImportSteps}>
                    <li>Open MetaMask and switch to the Polygon network</li>
                    <li>Go to the NFTs tab and click &quot;Import NFT&quot;</li>
                    <li>
                      Paste the contract address:{" "}
                      <code className={styles.nftDetailMono}>{contract}</code>
                    </li>
                    <li>
                      Paste the token ID:{" "}
                      <code className={styles.nftDetailMono}>{tokenId}</code>
                    </li>
                    <li>Click &quot;Import&quot; — your .agt name will appear in your wallet</li>
                  </ol>
                </details>
              )}
            </div>

            {/* Next steps */}
            <div className={styles.nextSteps}>
              <h3 className={styles.nextStepsTitle}>Next steps</h3>
              <div className={styles.nextStepsGrid}>
                {!agentConfigResult?.configured && zoneUuid && (
                  <button
                    className={styles.nextStepCard}
                    onClick={() => setStep("configure")}
                  >
                    <span className={styles.nextStepIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                    </span>
                    <span className={styles.nextStepLabel}>Configure your agent</span>
                    <span className={styles.nextStepDesc}>Set protocols, capabilities, and endpoints</span>
                  </button>
                )}
                {agentConfigResult?.configured && (
                  <details className={styles.nextStepCardDone}>
                    <summary className={styles.nextStepCardDoneSummary}>
                      <span className={styles.nextStepIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      </span>
                      <span>
                        <span className={styles.nextStepLabel}>Agent configured</span>
                        <span className={styles.nextStepDesc}>{agentConfigResult.recordCount} records set</span>
                      </span>
                    </summary>
                    {agentConfigResult.records && agentConfigResult.records.length > 0 && (
                      <div className={styles.configRecordsList}>
                        {agentConfigResult.records.map((r, i) => (
                          <code key={i} className={styles.configRecord}>{r}</code>
                        ))}
                      </div>
                    )}
                  </details>
                )}
                <button
                  className={styles.nextStepCard}
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
                  <span className={styles.nextStepIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <span className={styles.nextStepLabel}>Claim another name</span>
                  <span className={styles.nextStepDesc}>Register more .agt identities</span>
                </button>
                <a href="/explore" className={styles.nextStepCard}>
                  <span className={styles.nextStepIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                  </span>
                  <span className={styles.nextStepLabel}>Explore agents</span>
                  <span className={styles.nextStepDesc}>Discover what others are building</span>
                </a>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
