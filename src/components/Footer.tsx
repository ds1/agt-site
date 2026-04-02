import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>.agt — the agent namespace</span>
      <div className={styles.links}>
        <a href="mailto:support@agtnames.com">Support</a>
        <a href="https://x.com/agtnames" target="_blank" rel="noopener noreferrer">
          @agtnames
        </a>
        <a href="/docs">Docs</a>
        <a href="/terms">Terms</a>
        <a href="/privacy">Privacy</a>
        <a href="/refund">Refunds</a>
      </div>
    </footer>
  );
}
