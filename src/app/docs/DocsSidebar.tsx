"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./docs.module.css";

const docPages = [
  { href: "/docs/overview", label: "Overview" },
  { href: "/docs/agt-manifest-spec", label: "Manifest Spec" },
  { href: "/docs/resolver-sdk", label: "Resolver SDK" },
  { href: "/docs/api-reference", label: "API Reference" },
  { href: "/docs/user-flows", label: "User Flows" },
  { href: "/docs/architecture", label: "Architecture" },
  { href: "/docs/roadmap", label: "Roadmap" },
];

export default function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTitle}>Documentation</div>
      <nav className={styles.sidebarNav}>
        {docPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className={`${styles.sidebarLink} ${
              pathname === page.href ? styles.sidebarLinkActive : ""
            }`}
          >
            {page.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
