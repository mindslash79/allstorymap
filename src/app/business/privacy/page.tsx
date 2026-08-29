import type { Metadata } from "next";
import Link from "next/link";
import styles from "../business.module.css";

export const metadata: Metadata = {
  title: "Privacy Policy | Our World, Our Story",
};

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.policyPage}>
      <div className={styles.shell}>
        <header className={styles.policyHeader}>
          <Link className={styles.brand} href="/business">
            Our World, Our Story
          </Link>
        </header>

        <article className={styles.policyContent}>
          <h1>Privacy Policy</h1>
          <p className={styles.updated}>Last updated: August 29, 2026</p>

          <p>
            This Privacy Policy explains how Our World, Our Story handles personal
            information when you visit our website, contact us, create an account,
            or purchase access to a digital experience.
          </p>

          <h2>Information we may collect</h2>
          <ul>
            <li>Contact information such as your name and email address.</li>
            <li>Account information used to provide access to purchased content.</li>
            <li>Transaction details such as purchase status, product, date, and amount.</li>
            <li>Messages you send to customer support.</li>
            <li>Basic technical information used for security and site operation.</li>
          </ul>

          <h2>Payments</h2>
          <p>
            Payments are processed by third-party payment providers such as Stripe.
            We do not store your full payment-card number. Payment providers may
            collect and process payment and identity information under their own
            privacy terms.
          </p>

          <h2>How we use information</h2>
          <p>
            We use personal information to provide purchased access, operate and
            secure our services, respond to support requests, maintain transaction
            records, prevent misuse, and comply with legal obligations.
          </p>

          <h2>Sharing</h2>
          <p>
            We may share information with service providers that help us operate the
            website, host content, authenticate users, process payments, or comply
            with law. We do not sell personal information to advertisers.
          </p>

          <h2>Retention and security</h2>
          <p>
            We retain information only as reasonably necessary for service delivery,
            legitimate business records, security, and legal requirements. We use
            reasonable technical and organizational safeguards, but no online system
            can be guaranteed completely secure.
          </p>

          <h2>Your choices</h2>
          <p>
            You may contact us to ask about, correct, or request deletion of personal
            information, subject to legal and operational requirements that may
            require us to retain certain records.
          </p>

          <h2>Contact</h2>
          <p>
            Privacy questions can be sent to{" "}
            <a className={styles.inlineLink} href="mailto:mindslash79@gmail.com">
              mindslash79@gmail.com
            </a>.
          </p>
        </article>

        <footer className={styles.footer}>
          <span>© 2026 Our World, Our Story.</span>
          <div className={styles.footerLinks}>
            <Link href="/business">Business Home</Link>
            <Link href="/business/refund">Refund Policy</Link>
            <Link href="/business/terms">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
