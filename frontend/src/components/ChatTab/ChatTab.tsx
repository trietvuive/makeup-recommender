"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type Conversation, type Message, type Product } from "@/lib/api";
import { findMentionedProducts, linkifyProducts, productHref, productIdFromHref } from "@/lib/productLinks";
import ConversationSidebar from "@/components/ConversationSidebar/ConversationSidebar";
import ProductHoverLink from "@/components/ProductHoverLink/ProductHoverLink";
import styles from "./ChatTab.module.scss";

export default function ChatTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadConversations = useCallback(async () => {
    const data = await api.getConversations();
    setConversations(data);
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    api.getProducts({ limit: 500 }).then(setProducts);
  }, []);

  const productById = new Map(products.map((product) => [product.id, product]));

  function renderProductReferences(content: string) {
    const mentioned = findMentionedProducts(content, products);
    if (mentioned.length === 0) return null;

    return (
      <div className={styles.references}>
        <div className={styles.referencesTitle}>Product references</div>
        <div className={styles.referenceList}>
          {mentioned.map((product) => (
            <Link key={product.id} href={productHref(product.id)} className={styles.referenceCard}>
              <Image src={product.img} alt="" width={44} height={44} unoptimized />
              <span>
                <strong>{product.name}</strong>
                <small>{product.category} · {product.price}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

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

    const pendingImage = image;
    const pendingPreview = imagePreview;
    const userMessage: Message = {
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
      attachments: pendingImage && pendingPreview
        ? [{
            id: "pending",
            original_name: pendingImage.name,
            mime_type: pendingImage.type,
            size_bytes: pendingImage.size,
            url: pendingPreview,
            created_at: new Date().toISOString(),
          }]
        : [],
    };
    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      created_at: new Date().toISOString(),
    };

    setInput("");
    setImage(null);
    setImagePreview(null);
    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setSending(true);

    try {
      let nextConversationId = activeId;

      await api.sendMessageStream(activeId, text, pendingImage, {
        onMeta: (data) => {
          nextConversationId = data.conversation_id;
          if (data.conversation_id !== activeId) {
            setActiveId(data.conversation_id);
          }
          if (data.attachments?.length) {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 2 ? { ...m, attachments: data.attachments } : m,
              ),
            );
          }
        },
        onDelta: (content) => {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: m.content + content } : m,
            ),
          );
        },
        onDone: (data) => {
          if (data.conversation_id) {
            nextConversationId = data.conversation_id;
          }
          if (data.reply) {
            setMessages((prev) =>
              prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: data.reply! } : m,
              ),
            );
          }
        },
        onError: (error) => {
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "system", content: `Error: ${error}`, created_at: new Date().toISOString() },
          ]);
        },
      });

      if (nextConversationId !== activeId) {
        await loadConversations();
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "system",
          content: `Network error: ${(e as Error).message}`,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setSending(false);
  }

  function handleImageChange(file: File | null) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
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
              {!!m.attachments?.length && (
                <div className={styles.attachments}>
                  {m.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.url}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.attachment}
                    >
                      <Image
                        src={attachment.url}
                        alt={attachment.original_name}
                        width={150}
                        height={110}
                        unoptimized
                      />
                    </a>
                  ))}
                </div>
              )}
              {m.role === "assistant" ? (
                m.content ? (
                  <>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ href, children }) => {
                          const productId = productIdFromHref(href);
                          const product = productId ? productById.get(productId) : null;
                          if (product) {
                            return <ProductHoverLink product={product}>{children}</ProductHoverLink>;
                          }
                          return <a href={href}>{children}</a>;
                        },
                      }}
                    >
                      {linkifyProducts(m.content, products)}
                    </ReactMarkdown>
                    {renderProductReferences(m.content)}
                  </>
                ) : (
                  <span className={styles.typing}>Thinking...</span>
                )
              ) : (
                m.content
              )}
            </div>
          ))}
        </div>
        <div className={styles.inputBar}>
          <div className={styles.inputStack}>
            {imagePreview && (
              <div className={styles.preview}>
                <Image
                  src={imagePreview}
                  alt="Selected attachment"
                  width={42}
                  height={42}
                  unoptimized
                />
                <span>{image?.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    handleImageChange(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  aria-label="Remove image"
                >
                  &times;
                </button>
              </div>
            )}
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
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
          />
          <button
            className={styles.attachBtn}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
          >
            Image
          </button>
          <button className={styles.sendBtn} onClick={handleSend} disabled={sending || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
