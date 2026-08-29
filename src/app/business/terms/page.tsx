import type { Metadata } from "next";
import Link from "next/link";
import styles from "../business.module.css";

export const metadata: Metadata = {
  title: "Terms of Service | Our World, Our Story",
};

export default function TermsPage() {
  return (
    <main className={styles.policyPage}>
      <div className={styles.shell}>
        <header className={styles.policyHeader}>
          <Link className={styles.brand} href="/business">
            Our World, Our Story
          </Link>
        </header>

        <article className={styles.policyContent}>
          <h1>Terms of Service</h1>
          <p className={styles.updated}>Last updated: August 29, 2026</p>

          <p>
            These Terms of Service apply to the website, digital narrative games,
            and interactive story experiences offered by Our World, Our Story. By
            accessing or purchasing our services, you agree to these terms.
          </p>

          <h2>Digital products and access</h2>
          <p>
            Our products are digital. The specific access method, price, and access
            period, if applicable, are shown before purchase. No physical goods are
            shipped unless a product page expressly states otherwise.
          </p>

          <h2>Accounts and acceptable use</h2>
          <p>
            You are responsible for maintaining the security of any account used to
            access our services. You may not interfere with the operation or security
            of the service, attempt unauthorized access, redistribute paid content
            without permission, or use the service unlawfully.
          </p>

          <h2>Intellectual property</h2>
          <p>
            Unless otherwise stated, the stories, characters, visual presentation,
            text, music arrangements, software, and other original materials made
            available through Our World, Our Story are protected by applicable
            intellectual-property laws. Purchasing access does not transfer ownership
            of the underlying content.
          </p>

          <h2>Entertainment and reflective content</h2>
          <p>
            Our experiences are provided as entertainment and creative storytelling.
            They are not psychotherapy, medical care, crisis intervention, diagnosis,
            or professional health advice. If you need professional or emergency
            support, contact an appropriate qualified provider or local emergency service.
          </p>

          <h2>Payments and refunds</h2>
          <p>
            Payments are processed through third-party payment providers. Refund
            requests are governed by our{" "}
            <Link className={styles.inlineLink} href="/business/refund">
              Refund Policy
            </Link>.
          </p>

          <h2>Availability and changes</h2>
          <p>
            We may update, maintain, or modify our services over time. We aim to keep
            purchased content reasonably available according to the stated purchase
            terms, but temporary interruptions may occur for maintenance, security,
            or technical reasons.
          </p>

          <h2>Limitation</h2>
          <p>
            To the extent permitted by law, the service is provided without guarantees
            beyond those expressly stated in the applicable product description. Nothing
            in these terms excludes rights or remedies that cannot legally be excluded.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about these terms can be sent to{" "}
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
            <Link href="/business/privacy">Privacy Policy</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
