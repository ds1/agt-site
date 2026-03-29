import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span>.agt — the agent namespace</span>
      <div className={styles.links}>
        <a href="https://x.com/agtnames" target="_blank" rel="noopener noreferrer">
          @agtnames
        </a>
        <a href="/docs" target="_blank">
          Docs
        </a>
      </div>
    </footer>
  );
}
