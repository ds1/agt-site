import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Terms of Service — .agt",
  description: "Terms of Service for the .agt agent namespace registration service.",
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className={styles.legal}>
        <h1>Terms of Service</h1>
        <p className={styles.updated}>Last updated: March 30, 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the .agt agent namespace registration service
            (&quot;Service&quot;) operated at agtnames.com (&quot;we&quot;,
            &quot;us&quot;, &quot;our&quot;), you agree to be bound by these
            Terms of Service. If you do not agree, do not use the Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            The Service allows users to search for, purchase, and register .agt
            domain names as NFTs minted on the Polygon blockchain. Each .agt
            name serves as a decentralized identity for AI agents, with
            configuration stored as DNS TXT records via the Freename registrar.
          </p>
        </section>

        <section>
          <h2>3. Registration and Ownership</h2>
          <ul>
            <li>
              .agt names are minted as ERC-721 NFTs on the Polygon network.
              Ownership is determined by the wallet address provided at
              registration.
            </li>
            <li>
              You are solely responsible for maintaining control of your wallet
              and private keys. We cannot recover lost wallet access.
            </li>
            <li>
              Registration is on a first-come, first-served basis. We do not
              guarantee availability of any name.
            </li>
            <li>
              Certain names may be reserved or protected at our discretion.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Payments and Refunds</h2>
          <ul>
            <li>
              Payments are processed by Stripe. By making a purchase, you also
              agree to{" "}
              <a
                href="https://stripe.com/legal/consumer"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stripe&apos;s terms
              </a>
              .
            </li>
            <li>
              Prices are displayed in USD and are charged as a one-time payment.
            </li>
            <li>
              If domain registration fails after payment, a full refund will be
              issued automatically.
            </li>
            <li>
              Completed registrations are non-refundable, as the NFT has already
              been minted to your wallet.
            </li>
          </ul>
          <p>
            For full details, see our{" "}
            <a href="/refund">Refund Policy</a>.
          </p>
        </section>

        <section>
          <h2>5. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul>
            <li>Register names for the purpose of resale or domain squatting.</li>
            <li>Impersonate other individuals, organizations, or agents.</li>
            <li>Distribute malware, spam, or malicious agent configurations.</li>
            <li>Violate any applicable laws or regulations.</li>
          </ul>
          <p>
            We reserve the right to restrict or revoke access to the Service for
            violations of these terms.
          </p>
        </section>

        <section>
          <h2>6. Agent Configuration</h2>
          <p>
            You are responsible for all agent configuration data (protocols,
            capabilities, endpoints, descriptions) you publish through the
            Service. We do not verify, endorse, or monitor the accuracy of agent
            configurations.
          </p>
        </section>

        <section>
          <h2>7. Blockchain Risks</h2>
          <ul>
            <li>
              NFT minting is an on-chain operation. Transactions are
              irreversible once confirmed on the Polygon network.
            </li>
            <li>
              We are not responsible for network congestion, gas fees, or
              blockchain outages that may affect minting.
            </li>
            <li>
              Smart contract interactions carry inherent risks. Use at your own
              discretion.
            </li>
          </ul>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any
            kind. To the maximum extent permitted by law, we are not liable for
            any indirect, incidental, or consequential damages arising from your
            use of the Service, including but not limited to loss of funds, loss
            of wallet access, or agent misconfiguration.
          </p>
        </section>

        <section>
          <h2>9. Changes to Terms</h2>
          <p>
            We may update these terms at any time. Continued use of the Service
            after changes constitutes acceptance. We will note the date of the
            most recent update at the top of this page.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            Questions about these terms? Reach us at{" "}
            <a href="mailto:support@agtnames.com">support@agtnames.com</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
