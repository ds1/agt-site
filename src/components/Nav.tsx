"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/claim", label: "Claim" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "1rem 2rem",
        borderBottom: "1px solid var(--purple-dim)",
        background: "var(--bg-deep)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <Link
        href="/"
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        .agt
      </Link>

      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color:
                pathname === link.href
                  ? "var(--text-primary)"
                  : "var(--text-secondary)",
              transition: "color 0.15s",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
