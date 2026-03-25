import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DocsSidebar from "./DocsSidebar";
import styles from "./docs.module.css";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.docsLayout}>
      <Nav />
      <div className={styles.docsBody}>
        <DocsSidebar />
        <main className={styles.content}>{children}</main>
      </div>
      <Footer />
    </div>
  );
}
