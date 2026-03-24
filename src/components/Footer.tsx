export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--purple-dim)",
        padding: "2rem",
        marginTop: "auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.8125rem",
        color: "var(--text-tertiary)",
      }}
    >
      <span>.agt — the agent namespace</span>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <a href="https://x.com/agtnames" target="_blank" rel="noopener noreferrer">
          @agtnames
        </a>
        <a href="/docs/agt-manifest-spec" target="_blank">
          Spec
        </a>
      </div>
    </footer>
  );
}
