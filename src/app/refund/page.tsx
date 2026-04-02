import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import styles from "../legal.module.css";

export const metadata: Metadata = {
  title: "Refund Policy — .agt",
  description:
    "Refund policy for the .agt agent namespace registration service.",
};

export default function RefundPolicyPage() {
  return (
    <>
      <Nav />
      <main className={styles.legal}>
        <h1>Refund Policy</h1>
        <p className={styles.updated}>Last updated: April 2, 2026</p>

        <section>
          <h2>1. Overview</h2>
          <p>
            AGT Domains (&quot;we&quot;, &quot;us&quot;) is the merchant of
            record for all .agt domain purchases. This policy explains when and
            how refunds are issued.
          </p>
        </section>

        <section>
          <h2>2. Automatic Refunds — Failed Registration</h2>
          <p>
            If your payment succeeds but domain registration (NFT minting) fails
            for any reason, a <strong>full refund is issued automatically</strong>.
            You do not need to contact us — the refund is triggered immediately
            upon detecting the failure.
          </p>
          <p>
            Refunds typically appear on your statement within 5–10 business days,
            depending on your bank or card issuer.
          </p>
        </section>

        <section>
          <h2>3. Completed Registrations</h2>
          <p>
            Once a .agt domain has been successfully minted as an NFT to your
            wallet, the registration is <strong>non-refundable</strong>. This is
            because:
          </p>
          <ul>
            <li>
              The NFT has been permanently minted on the Polygon blockchain.
            </li>
            <li>
              The domain name has been registered with the Freename registrar and
              cannot be &quot;un-registered.&quot;
            </li>
            <li>
              A cancellation fee applies to reversed registrations, which would
              be deducted from any refund amount.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Exceptional Circumstances</h2>
          <p>
            We may consider refunds for completed registrations on a
            case-by-case basis in exceptional circumstances, such as:
          </p>
          <ul>
            <li>
              You were charged multiple times for the same domain due to a
              technical error.
            </li>
            <li>
              The domain you received materially differs from what was shown
              during checkout.
            </li>
          </ul>
          <p>
            If a refund is granted for a completed registration, a cancellation
            fee may be deducted from the refund amount to cover registrar costs.
          </p>
        </section>

        <section>
          <h2>5. How to Request a Refund</h2>
          <p>
            If you believe you are entitled to a refund that was not
            automatically issued, contact us at{" "}
            <a href="mailto:support@agtnames.com">support@agtnames.com</a> with:
          </p>
          <ul>
            <li>The email address used at checkout.</li>
            <li>The domain name you attempted to register.</li>
            <li>A description of the issue.</li>
          </ul>
          <p>
            We aim to respond to refund requests within 2 business days.
          </p>
        </section>

        <section>
          <h2>6. Chargebacks</h2>
          <p>
            If you file a chargeback (payment dispute) with your bank instead of
            contacting us, we will provide evidence to your card issuer
            demonstrating that the domain was registered and delivered. Filing a
            chargeback for a successfully completed registration may result in
            your access to the Service being restricted.
          </p>
          <p>
            We encourage you to{" "}
            <a href="mailto:support@agtnames.com">contact us</a> first so we
            can resolve the issue directly.
          </p>
        </section>

        <section>
          <h2>7. Contact</h2>
          <p>
            Questions about this policy? Reach us at{" "}
            <a href="mailto:support@agtnames.com">support@agtnames.com</a>.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
