"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/claim", label: "Claim" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.brand}>
        .agt
      </Link>

      <div className={styles.links}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              pathname === link.href ? styles.linkActive : styles.linkInactive
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
