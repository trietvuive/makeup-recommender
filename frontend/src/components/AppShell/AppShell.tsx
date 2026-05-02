"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./AppShell.module.scss";

interface Props {
  active?: "profile" | "chat";
  children: React.ReactNode;
  scrollableMain?: boolean;
}

export default function AppShell({ active, children, scrollableMain = false }: Props) {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/profile" className={styles.brand} aria-label="Go to profile home">
            <Image src="/logo.svg" alt="" width={32} height={32} className={styles.logoMark} />
            glow
          </Link>
          <nav className={styles.nav}>
            <Link
              href="/profile"
              className={`${styles.navItem} ${active === "profile" ? styles.active : ""}`}
            >
              Your Profile
            </Link>
            <Link
              href="/chat"
              className={`${styles.navItem} ${active === "chat" ? styles.active : ""}`}
            >
              Get Advice
            </Link>
          </nav>
        </div>
      </header>

      {active === "profile" && (
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <span className={styles.heroTag}>Personalized Beauty</span>
            <h1>Your skin is unique.<br />Your routine should be too.</h1>
            <p>
              Tell us about your skin, your routine, and your preferences &mdash;
              and we&apos;ll craft recommendations made just for you.
            </p>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImages}>
              <Image
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=260&h=340&fit=crop"
                alt=""
                width={180}
                height={240}
                unoptimized
                className={styles.heroImg1}
              />
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=220&h=280&fit=crop"
                alt=""
                width={140}
                height={190}
                unoptimized
                className={styles.heroImg2}
              />
            </div>
          </div>
        </div>
      )}

      <main className={`${styles.main} ${scrollableMain ? styles.scrollableMain : ""}`}>
        {children}
      </main>
    </div>
  );
}
