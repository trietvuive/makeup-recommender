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
}

export interface ChatResponse {
  reply?: string;
  error?: string;
  conversation_id: number;
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

  sendMessage: (conversationId: number | null, message: string) =>
    request<ChatResponse>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ conversation_id: conversationId, message }),
    }),
};
