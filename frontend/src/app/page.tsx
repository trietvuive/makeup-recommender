"use client";

import { useState } from "react";
import ProfileTab from "@/components/ProfileTab/ProfileTab";
import ChatTab from "@/components/ChatTab/ChatTab";
import styles from "./page.module.scss";

type Tab = "profile" | "chat";

export default function Home() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.brand}
            onClick={() => setTab("profile")}
            aria-label="Go to profile home"
          >
            <img src="/logo.svg" alt="" className={styles.logoMark} />
            glow
          </button>
          <nav className={styles.nav}>
            <button
              className={`${styles.navItem} ${tab === "profile" ? styles.active : ""}`}
              onClick={() => setTab("profile")}
            >
              Your Profile
            </button>
            <button
              className={`${styles.navItem} ${tab === "chat" ? styles.active : ""}`}
              onClick={() => setTab("chat")}
            >
              Get Advice
            </button>
          </nav>
        </div>
      </header>

      {tab === "profile" && (
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
              <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=260&h=340&fit=crop" alt="" className={styles.heroImg1} />
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=220&h=280&fit=crop" alt="" className={styles.heroImg2} />
            </div>
          </div>
        </div>
      )}

      {tab === "chat" && (
        <div className={styles.heroMini}>
          <span className={styles.heroTag}>AI Beauty Advisor</span>
          <h1>What can we help you with?</h1>
        </div>
      )}

      <main className={styles.main}>
        {tab === "profile" && <ProfileTab />}
        {tab === "chat" && <ChatTab />}
      </main>
    </div>
  );
}
