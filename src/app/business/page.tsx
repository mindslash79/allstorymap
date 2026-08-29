import type { Metadata } from "next";
import Link from "next/link";
import styles from "./business.module.css";

export const metadata: Metadata = {
  title: "Our World, Our Story | Interactive Story Games",
  description:
    "Our World, Our Story creates digital interactive stories and narrative games for online audiences.",
};

export default function BusinessPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <nav className={styles.nav} aria-label="Business navigation">
          <Link className={styles.brand} href="/business">
            Our World, Our Story
          </Link>
          <div className={styles.navLinks}>
            <a href="#what-we-make">What we make</a>
            <a href="#how-it-works">How it works</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>

        <section className={styles.hero}>
          <div>
            <p className={styles.kicker}>Digital interactive storytelling</p>
            <h1>Stories you can enter, explore, and remember.</h1>
            <p className={styles.lead}>
              Our World, Our Story creates original digital narrative games and
              interactive story experiences. Players access our content online and
              move through story worlds built around characters, choices, places,
              and emotional themes.
            </p>
          </div>

          <aside className={styles.heroCard}>
            <p className={styles.heroCardLabel}>What customers purchase</p>
            <h2>Digital game access</h2>
            <p>
              We sell access to individual online narrative games and related
              digital story experiences. Purchases are delivered electronically;
              no physical goods are shipped.
            </p>
          </aside>
        </section>

        <section className={styles.section} id="what-we-make">
          <p className={styles.kicker}>What we make</p>
          <h2>Small story worlds inside a larger universe.</h2>
          <p className={styles.sectionIntro}>
            The project is designed as a collection of self-contained interactive
            stories connected through a broader world. Each title can have its own
            setting, tone, characters, and style of play while remaining part of
            the same creative universe.
          </p>

          <div className={styles.grid}>
            <article className={styles.card}>
              <h3>Narrative games</h3>
              <p>
                Original digital games in which story, exploration, dialogue, and
                player choices are central to the experience.
              </p>
            </article>
            <article className={styles.card}>
              <h3>Interactive stories</h3>
              <p>
                Shorter story experiences designed for web and mobile access, with
                visual scenes, music, dialogue, and interactive moments.
              </p>
            </article>
            <article className={styles.card}>
              <h3>Connected world</h3>
              <p>
                Individual stories may connect to a shared map and library so that
                players can discover different worlds and revisit their experiences.
              </p>
            </article>
          </div>

          <div className={styles.notice}>
            Our content is created for entertainment, reflection, and creative
            storytelling. It is not psychotherapy, medical treatment, crisis
            support, or professional health advice.
          </div>
        </section>

        <section className={styles.section} id="how-it-works">
          <p className={styles.kicker}>How purchasing works</p>
          <h2>Simple digital delivery.</h2>
          <div className={styles.grid}>
            <article className={styles.card}>
              <h3>1. Choose a title</h3>
              <p>
                Customers review the description and purchase terms shown for a
                specific digital experience before checkout.
              </p>
            </article>
            <article className={styles.card}>
              <h3>2. Pay securely</h3>
              <p>
                Payments are processed through a secure third-party payment
                provider. We do not store full payment-card numbers.
              </p>
            </article>
            <article className={styles.card}>
              <h3>3. Access online</h3>
              <p>
                After successful payment, access is provided electronically using
                the access method stated on the product or checkout page.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.section} id="contact">
          <p className={styles.kicker}>Customer support</p>
          <h2>Questions about access, billing, or a purchase?</h2>
          <p className={styles.sectionIntro}>
            Contact us and include the email address used for your purchase and,
            when available, the title of the experience and payment receipt or
            transaction reference.
          </p>

          <div className={styles.contactBox}>
            <div>
              <p><strong>Our World, Our Story</strong></p>
              <p>Digital interactive storytelling and narrative games</p>
              <p>Customer support: mindslash79@gmail.com</p>
            </div>
            <a className={styles.button} href="mailto:mindslash79@gmail.com">
              Email support
            </a>
          </div>
        </section>

        <footer className={styles.footer}>
          <span>© 2026 Our World, Our Story. All rights reserved.</span>
          <div className={styles.footerLinks}>
            <Link href="/business/refund">Refund Policy</Link>
            <Link href="/business/privacy">Privacy Policy</Link>
            <Link href="/business/terms">Terms of Service</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
