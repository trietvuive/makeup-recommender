"use client";

import type { Conversation } from "@/lib/api";
import styles from "./ConversationSidebar.module.scss";

interface Props {
  conversations: Conversation[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onNew: () => void;
}

export default function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNew,
}: Props) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <span>Chats</span>
        <button className={styles.newBtn} onClick={onNew}>
          + New
        </button>
      </div>
      <div className={styles.list}>
        {conversations.length === 0 && (
          <div className={styles.empty}>No conversations yet.</div>
        )}
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`${styles.item} ${c.id === activeId ? styles.active : ""}`}
            onClick={() => onSelect(c.id)}
          >
            <span className={styles.title}>{c.title || "Untitled"}</span>
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              title="Delete"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
