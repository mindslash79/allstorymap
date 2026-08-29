import type { Metadata } from "next";
import Link from "next/link";
import styles from "../business.module.css";

export const metadata: Metadata = {
  title: "Refund Policy | Our World, Our Story",
};

export default function RefundPolicyPage() {
  return (
    <main className={styles.policyPage}>
      <div className={styles.shell}>
        <header className={styles.policyHeader}>
          <Link className={styles.brand} href="/business">
            Our World, Our Story
          </Link>
        </header>

        <article className={styles.policyContent}>
          <h1>Refund Policy</h1>
          <p className={styles.updated}>Last updated: August 29, 2026</p>

          <p>
            Our World, Our Story sells access to digital narrative games and
            interactive story experiences. Because our products are delivered
            electronically, refund eligibility depends on the circumstances of
            the purchase and access to the digital content.
          </p>

          <h2>Refund requests</h2>
          <p>
            You may contact us within 14 days of purchase to request a refund. We
            review requests individually. Please include the email address used for
            the purchase and any available receipt or transaction reference.
          </p>

          <h2>Technical access problems</h2>
          <p>
            If a technical problem prevents you from accessing a purchased product,
            please contact us first so we can attempt to restore access. If we cannot
            provide the purchased access within a reasonable period, we will provide
            an appropriate refund or other remedy.
          </p>

          <h2>Duplicate or incorrect charges</h2>
          <p>
            If you believe you were charged more than once for the same purchase or
            charged an incorrect amount, contact us promptly. Confirmed duplicate or
            incorrect charges will be corrected.
          </p>

          <h2>Digital content already accessed</h2>
          <p>
            Refunds may be limited after digital content has been substantially
            accessed or consumed, except where required by applicable law or where
            the product was materially different from its description.
          </p>

          <h2>Disputes and unauthorized payments</h2>
          <p>
            If you do not recognize a charge, please contact us as soon as possible.
            We will review the transaction and cooperate with the payment provider
            where appropriate. Nothing in this policy limits rights available under
            applicable consumer-protection law.
          </p>

          <h2>Contact</h2>
          <p>
            Refund and billing requests can be sent to{" "}
            <a className={styles.inlineLink} href="mailto:mindslash79@gmail.com">
              mindslash79@gmail.com
            </a>.
          </p>
        </article>

        <footer className={styles.footer}>
          <span>© 2026 Our World, Our Story.</span>
          <div className={styles.footerLinks}>
            <Link href="/business">Business Home</Link>
            <Link href="/business/privacy">Privacy Policy</Link>
            <Link href="/business/terms">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
