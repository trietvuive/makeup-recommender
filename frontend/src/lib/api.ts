const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  return res.json();
}

export interface ProfileData {
  id: number;
  age: string | null;
  gender: string | null;
  skin_type: string | null;
  skin_tone: string | null;
  undertone: string | null;
  climate: string | null;
  allergies: string | null;
  budget: string | null;
  extra: string | null;
  products: string[];
}

export interface Conversation {
  id: number;
  title: string | null;
  created_at: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  attachments?: Attachment[];
}

export interface ChatResponse {
  reply?: string;
  error?: string;
  conversation_id: number;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  url: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  type: string;
  keyIngredients: string;
  price: string;
  img: string;
}

export interface ChatStreamHandlers {
  onMeta?: (data: { conversation_id: number; attachments?: Attachment[] }) => void;
  onDelta?: (content: string) => void;
  onDone?: (data: ChatResponse) => void;
  onError?: (error: string) => void;
}

export const api = {
  getProfile: () => request<ProfileData>("/api/profile"),

  updateProfile: (data: Partial<ProfileData>) =>
    request<ProfileData>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getConversations: () => request<Conversation[]>("/api/conversations"),

  deleteConversation: (id: number) =>
    request<{ ok: boolean }>(`/api/conversations/${id}`, { method: "DELETE" }),

  getMessages: (id: number) => request<Message[]>(`/api/conversations/${id}/messages`),

  getProducts: (params: { q?: string; ids?: string[]; limit?: number } = {}) => {
    const search = new URLSearchParams();
    if (params.q) search.set("q", params.q);
    if (params.ids?.length) search.set("ids", params.ids.join(","));
    if (params.limit) search.set("limit", String(params.limit));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    return request<Product[]>(`/api/products${suffix}`);
  },

  getProduct: async (id: string) => {
    const products = await api.getProducts({ ids: [id] });
    return products[0] ?? null;
  },

  sendMessage: (conversationId: number | null, message: string) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ conversation_id: conversationId, message }),
    }),

  sendMessageStream: async (
    conversationId: number | null,
    message: string,
    image: File | null,
    handlers: ChatStreamHandlers,
  ) => {
    const request =
      image
        ? (() => {
            const form = new FormData();
            if (conversationId) form.set("conversation_id", String(conversationId));
            form.set("message", message);
            form.set("stream", "true");
            form.set("image", image);
            return { method: "POST", body: form };
          })()
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversation_id: conversationId, message, stream: true }),
          };

    const res = await fetch(`${API}/api/chat`, request);

    if (!res.ok || !res.body) {
      throw new Error(`Chat request failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    function handleEvent(raw: string) {
      const lines = raw.split("\n");
      const event = lines.find((line) => line.startsWith("event: "))?.slice(7);
      const data = lines.find((line) => line.startsWith("data: "))?.slice(6);
      if (!event || !data) return;

      const parsed = JSON.parse(data);
      if (event === "meta") handlers.onMeta?.(parsed);
      if (event === "delta") handlers.onDelta?.(parsed.content || "");
      if (event === "done") handlers.onDone?.(parsed);
      if (event === "error") handlers.onError?.(parsed.error || "Unknown error");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";
      events.forEach(handleEvent);
    }

    if (buffer.trim()) {
      handleEvent(buffer);
    }
  },
};
