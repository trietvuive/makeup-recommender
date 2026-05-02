"use client";

import { useState } from "react";
import ProfileTab from "@/components/ProfileTab/ProfileTab";
import ChatTab from "@/components/ChatTab/ChatTab";
import styles from "./page.module.scss";

type Tab = "profile" | "chat";

export default function Home() {
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <>
      <header className={styles.header}>
        <h1>Makeup Advisor</h1>
        <p>AI-powered product recommendations, tailored to you</p>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${tab === "profile" ? styles.active : ""}`}
          onClick={() => setTab("profile")}
        >
          My Profile
        </button>
        <button
          className={`${styles.tabBtn} ${tab === "chat" ? styles.active : ""}`}
          onClick={() => setTab("chat")}
        >
          Chat &amp; Recommendations
        </button>
      </div>

      <div className={styles.content}>
        {tab === "profile" && <ProfileTab />}
        {tab === "chat" && <ChatTab />}
      </div>
    </>
  );
}
