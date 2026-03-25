import Link from "next/link";
import styles from "./agt-manifest-spec/spec.module.css";

export const metadata = {
  title: ".agt Documentation",
  description:
    "Technical documentation for the .agt agent namespace — manifest spec, resolver SDK, API reference, architecture, and more.",
};

const sections = [
  {
    href: "/docs/overview",
    title: "Overview",
    description:
      "What .agt is, the problem it solves, the six protocol layers, TLD ownership, and naming conventions.",
  },
  {
    href: "/docs/agt-manifest-spec",
    title: "Manifest Spec v1",
    description:
      "The record format for declaring agent identity via DNS TXT records — fields, vocabulary, resolution algorithm, and parsing rules.",
  },
  {
    href: "/docs/resolver-sdk",
    title: "Resolver SDK",
    description:
      "The @agt/resolver TypeScript package — zero dependencies, works in Node, Deno, Bun, and browsers. API, types, and usage examples.",
  },
  {
    href: "/docs/api-reference",
    title: "API Reference",
    description:
      "Freename Reseller API integration — authentication, zone creation, minting, record management, and billing.",
  },
  {
    href: "/docs/user-flows",
    title: "User Flows",
    description:
      "Step-by-step walkthroughs: claiming a name, browsing agents, resolving programmatically, agent-to-agent discovery, and exploring the directory.",
  },
  {
    href: "/docs/architecture",
    title: "Architecture",
    description:
      "System component diagram, repository map, and how the browser, registration site, resolver SDK, and Freename API fit together.",
  },
  {
    href: "/docs/roadmap",
    title: "Roadmap",
    description:
      "What has shipped, and what comes next — ecosystem tools, infrastructure, and network effects.",
  },
];

export default function DocsIndexPage() {
  return (
    <article className={styles.article}>
      <h1>Documentation</h1>
      <p className={styles.lead}>
        Technical reference for the .agt agent namespace. Everything you need to
        register names, resolve agents, and build on the protocol.
      </p>

      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            style={{
              display: "block",
              padding: "1.25rem 1.5rem",
              background: "var(--bg-surface)",
              border: "1px solid var(--purple-dim)",
              borderRadius: "8px",
              transition: "border-color 0.15s",
              textDecoration: "none",
            }}
          >
            <div
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginBottom: "0.35rem",
              }}
            >
              {section.title}
            </div>
            <div
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.5,
              }}
            >
              {section.description}
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
