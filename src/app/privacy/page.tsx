import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy — .agt",
  description: "Privacy Policy for the .agt agent namespace registration service.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className={styles.legal}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: March 30, 2026</p>

        <section>
          <h2>1. Overview</h2>
          <p>
            This policy describes what data we collect when you use the .agt
            agent namespace registration service at agtnames.com and how we use
            it.
          </p>
        </section>

        <section>
          <h2>2. Data We Collect</h2>
          <h3>Information you provide</h3>
          <ul>
            <li>
              <strong>Wallet address</strong> — provided during registration to
              mint the .agt NFT. This is a public blockchain address.
            </li>
            <li>
              <strong>Email address</strong> — optionally provided during
              checkout for order confirmation and support.
            </li>
            <li>
              <strong>Agent configuration</strong> — name, description,
              protocols, capabilities, endpoints, and other manifest data you
              choose to publish. This is stored as public DNS TXT records.
            </li>
          </ul>

          <h3>Information collected automatically</h3>
          <ul>
            <li>
              <strong>Usage data</strong> — pages visited, search queries,
              timestamps. We use privacy-respecting analytics that do not track
              individuals across sites.
            </li>
            <li>
              <strong>IP address</strong> — used transiently for rate limiting.
              Not stored persistently or linked to your identity.
            </li>
          </ul>

          <h3>Payment data</h3>
          <ul>
            <li>
              Payments are processed by{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe
              </a>
              . We do not store credit card numbers or full payment details.
              Stripe handles this data under their own privacy policy.
            </li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Data</h2>
          <ul>
            <li>To register .agt names and mint NFTs to your wallet.</li>
            <li>To process payments and issue refunds when necessary.</li>
            <li>To send order confirmation and support communications (if email provided).</li>
            <li>To enforce rate limits and prevent abuse.</li>
            <li>To improve the Service based on aggregated, anonymized usage patterns.</li>
          </ul>
        </section>

        <section>
          <h2>4. Public Data</h2>
          <p>
            By design, the following data is public and visible to anyone:
          </p>
          <ul>
            <li>Your wallet address (visible on the Polygon blockchain).</li>
            <li>Your .agt domain name and all agent configuration records (stored as public DNS TXT records).</li>
            <li>NFT ownership and transaction history (visible on-chain).</li>
          </ul>
          <p>
            Do not include private or sensitive information in agent
            configuration fields.
          </p>
        </section>

        <section>
          <h2>5. Data Sharing</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul>
            <li>
              <strong>Stripe</strong> — for payment processing.
            </li>
            <li>
              <strong>Freename</strong> — for domain registration and DNS record
              management.
            </li>
            <li>
              <strong>Polygon network</strong> — for NFT minting (on-chain,
              public).
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <ul>
            <li>
              Payment records are retained as required by financial regulations.
            </li>
            <li>
              Agent configuration is stored in DNS as long as the domain is
              active. You can update or remove records through the management
              dashboard.
            </li>
            <li>
              On-chain data (NFT ownership, transactions) is permanent and
              cannot be deleted due to the nature of blockchain.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We do not use tracking cookies. We may use essential cookies
            required for the Service to function (e.g., Stripe checkout
            sessions).
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal data by contacting us. Note that on-chain data and public
            DNS records cannot be removed by us alone.
          </p>
        </section>

        <section>
          <h2>9. Changes</h2>
          <p>
            We may update this policy. Changes will be noted by the date at the
            top of this page. Continued use of the Service constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            Privacy questions? Reach us at{" "}
            <a href="mailto:support@agtnames.com">support@agtnames.com</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
