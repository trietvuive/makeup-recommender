"use client";

import { useState, useEffect, useRef, useCallback, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, type Conversation, type Message, type Product } from "@/lib/api";
import { findMentionedProducts, linkifyProducts, productHref, productIdFromHref } from "@/lib/productLinks";
import { formatPriceRange } from "@/lib/price";
import ConversationSidebar from "@/components/ConversationSidebar/ConversationSidebar";
import ProductHoverLink from "@/components/ProductHoverLink/ProductHoverLink";
import styles from "./ChatTab.module.scss";

const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const STARTER_PROMPTS = [
  "Help me build a simple morning routine for dry skin under $45.",
  "Find me a non-comedogenic foundation that works in hot, humid weather.",
  "I have redness and sensitive skin. What products should I try?",
  "Can you compare my routine and tell me what I might be missing?",
];

export default function ChatTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      setLoadError(null);
    } catch {
      setLoadError("Unable to reach the beauty advisor backend. Please try refreshing in a moment.");
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    api.getProducts({ limit: 500 })
      .then(setProducts)
      .catch(() => {
        setProducts([]);
        setLoadError("Unable to load products right now. Please try refreshing in a moment.");
      });
  }, []);

  const productById = new Map(products.map((product) => [product.productId, product]));
  const exploreProducts = products.slice(0, 3);

  function renderProductReferences(content: string) {
    const mentioned = findMentionedProducts(content, products);
    if (mentioned.length === 0) return null;

    return (
      <div className={styles.references}>
        <div className={styles.referencesTitle}>Product references</div>
        <div className={styles.referenceList}>
          {mentioned.map((product) => (
            <Link key={product.productId} href={productHref(product.productId)} className={styles.referenceCard}>
              <Image src={product.img} alt="" width={44} height={44} unoptimized />
              <span>
                <strong>{product.name}</strong>
                <small>{product.category} · {formatPriceRange(product)}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  async function openConversation(id: number) {
    try {
      setActiveId(id);
      const msgs = await api.getMessages(id);
      setMessages(msgs.filter((m) => m.role !== "system"));
      setLoadError(null);
    } catch {
      setLoadError("Unable to load that conversation. Please try again.");
    }
  }

  function handleNew() {
    setActiveId(null);
    setMessages([]);
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteConversation(id);
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
      }
      await loadConversations();
    } catch {
      setLoadError("Unable to delete that conversation. Please try again.");
    }
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

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setImage(null);
      setImagePreview(null);
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function imageFromTransfer(files: FileList) {
    return Array.from(files).find((file) => ACCEPTED_IMAGE_TYPES.has(file.type)) ?? null;
  }

  function hasDraggedFiles(event: DragEvent<HTMLDivElement>) {
    return Array.from(event.dataTransfer.types).includes("Files");
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    if (sending || !hasDraggedFiles(event)) return;
    event.preventDefault();
    setDragActive(true);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    if (sending || !hasDraggedFiles(event)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (sending) return;
    handleImageChange(imageFromTransfer(event.dataTransfer.files));
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
      <div
        className={`${styles.main} ${dragActive ? styles.dragActive : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={styles.chatArea} ref={chatAreaRef}>
          {dragActive && (
            <div className={styles.dropHint}>
              Drop your image to attach it
            </div>
          )}
          {loadError && (
            <div className={styles.loadError}>
              {loadError}
            </div>
          )}
          {messages.length === 0 && !sending && (
            <div className={styles.emptyChat}>
              <span className={styles.emptyEyebrow}>AI Beauty Advisor</span>
              <h2>Start with a beauty goal</h2>
              <p>
                Ask for a routine, compare products, or attach a photo for more context.
                Here are a few places to start.
              </p>

              <div className={styles.promptGrid}>
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className={styles.promptChip}
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {exploreProducts.length > 0 && (
                <div className={styles.exploreSection}>
                  <div className={styles.exploreTitle}>Products to explore</div>
                  <div className={styles.exploreList}>
                    {exploreProducts.map((product) => (
                      <Link
                        key={product.productId}
                        href={productHref(product.productId)}
                        className={styles.exploreProduct}
                      >
                        <Image src={product.img} alt="" width={58} height={58} unoptimized />
                        <span>
                          <strong>{product.name}</strong>
                          <small>{product.category} · {formatPriceRange(product)}</small>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
            aria-label="Attach image"
            title="Attach image"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M8.75 17.25 17.9 8.1a3.18 3.18 0 0 0-4.5-4.5l-9.15 9.15a4.95 4.95 0 0 0 7 7l8.62-8.62a1 1 0 1 0-1.42-1.42l-8.62 8.62a2.95 2.95 0 0 1-4.17-4.17l9.15-9.15a1.18 1.18 0 1 1 1.67 1.67l-9.15 9.15a1 1 0 0 0 1.42 1.42Z" />
            </svg>
          </button>
          <button className={styles.sendBtn} onClick={handleSend} disabled={sending || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
