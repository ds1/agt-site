"use client";

import Link from "next/link";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";
import styles from "./OnboardingContent.module.css";

export default function OnboardingContent() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>You own a .agt name</h1>
        <p className={styles.subline}>
          Now give it an agent identity. Configure protocols, capabilities, and
          endpoints so your agent can be discovered and connected to.
        </p>
      </section>

      <section className={styles.section}>
        <h2>How it works</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <div>
              <strong>Go to the Dashboard</strong>
              <p>
                Enter your .agt domain name to look up its current
                configuration.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <div>
              <strong>Pick a template or configure from scratch</strong>
              <p>
                Choose from pre-built templates for common agent types, or set
                each field manually.
              </p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <div>
              <strong>Save and verify</strong>
              <p>
                Your agent manifest is written as TXT records on your domain.
                Any .agt client can resolve it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Agent templates</h2>
        <p className={styles.sectionDesc}>
          Pre-built configurations to get started quickly. You can customize
          everything after selecting a template.
        </p>
        <div className={styles.templateGrid}>
          {AGENT_TEMPLATES.map((t) => (
            <div key={t.id} className={styles.templateCard}>
              <strong>{t.label}</strong>
              <p>{t.description}</p>
              <div className={styles.templateMeta}>
                <span>
                  {t.config.protocols.map((p) => p.toUpperCase()).join(", ")}
                </span>
                <span>{t.config.pricing}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>FAQ</h2>
        <div className={styles.faq}>
          <div className={styles.faqItem}>
            <strong>What is an agent manifest?</strong>
            <p>
              A set of TXT records on your .agt domain that declare your
              agent&apos;s name, capabilities, protocols, and endpoints. Any
              compatible client can read these records to discover and connect to
              your agent.{" "}
              <Link href="/spec">Read the spec</Link>
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>Do I need to do anything to my existing domain?</strong>
            <p>
              No. Your domain already works for web content (IPFS, HTTP). Adding
              agent records is additive — it doesn&apos;t affect existing content
              resolution.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>
              Can I configure my domain if I didn&apos;t buy it through
              agtnames.com?
            </strong>
            <p>
              Currently, the dashboard can edit records for domains registered
              through agtnames.com. If you registered elsewhere, you can set TXT
              records directly via the Freename dashboard or API.
            </p>
          </div>
          <div className={styles.faqItem}>
            <strong>What protocols are supported?</strong>
            <p>
              MCP (Model Context Protocol), A2A (Agent-to-Agent), HTTP REST,
              WebSocket, and gRPC. Custom protocol IDs are also supported.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <Link href="/dashboard" className={styles.ctaBtn}>
          Open Dashboard
        </Link>
        <Link href="/explore" className={styles.ctaLink}>
          Browse existing agents
        </Link>
      </section>
    </main>
  );
}
