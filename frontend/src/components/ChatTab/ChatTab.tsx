"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type Conversation, type Message } from "@/lib/api";
import ConversationSidebar from "@/components/ConversationSidebar/ConversationSidebar";
import styles from "./ChatTab.module.scss";

export default function ChatTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const data = await api.getConversations();
    setConversations(data);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  async function openConversation(id: number) {
    setActiveId(id);
    const msgs = await api.getMessages(id);
    setMessages(msgs.filter((m) => m.role !== "system"));
  }

  function handleNew() {
    setActiveId(null);
    setMessages([]);
  }

  async function handleDelete(id: number) {
    await api.deleteConversation(id);
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
    await loadConversations();
  }

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    setSending(true);

    try {
      const data = await api.sendMessage(activeId, text);

      if (data.conversation_id && data.conversation_id !== activeId) {
        setActiveId(data.conversation_id);
        await loadConversations();
      }

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "system", content: `Error: ${data.error}`, created_at: new Date().toISOString() },
        ]);
      } else if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply!, created_at: new Date().toISOString() },
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `Network error: ${(e as Error).message}`,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setSending(false);
  }

  return (
    <div className={styles.layout}>
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={openConversation}
        onDelete={handleDelete}
        onNew={handleNew}
      />
      <div className={styles.main}>
        <div className={styles.chatArea} ref={chatAreaRef}>
          {messages.length === 0 && !sending && (
            <div className={styles.emptyChat}>
              <span className={styles.emptyIcon}>&#128132;</span>
              Describe your makeup or skincare concern and I&apos;ll recommend products for you!
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`${styles.msg} ${
                m.role === "user"
                  ? styles.user
                  : m.role === "assistant"
                  ? styles.assistant
                  : styles.error
              }`}
            >
              {m.role === "assistant" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
              ) : (
                m.content
              )}
            </div>
          ))}
          {sending && <div className={styles.typing}>Thinking...</div>}
        </div>
        <div className={styles.inputBar}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="e.g. I need a foundation that won't clog my pores..."
            disabled={sending}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={sending || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
