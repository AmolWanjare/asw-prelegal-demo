const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessageResponse {
  session_id: number;
  message_id: number;
  reply: string;
  extracted_fields: Record<string, unknown>;
  is_complete: boolean;
  document_data: Record<string, unknown>;
  document_type: string;
}

export interface MessageOut {
  id: number;
  role: "user" | "assistant";
  content: string;
  field_updates: string | null;
  created_at: string;
}

export interface SessionMessagesResponse {
  session_id: number;
  document_data: Record<string, unknown>;
  document_type: string;
  is_complete: boolean;
  messages: MessageOut[];
}

export interface CatalogItem {
  slug: string;
  display_name: string;
  description: string;
  filename: string;
}

export async function sendChatMessage(
  message: string,
  sessionId: number | null,
  documentType?: string
): Promise<ChatMessageResponse> {
  const body: Record<string, unknown> = {
    message,
    session_id: sessionId,
  };
  if (!sessionId && documentType) {
    body.document_type = documentType;
  }
  const res = await fetch(`${API_BASE}/api/chat/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function loadSession(
  sessionId: number
): Promise<SessionMessagesResponse> {
  const res = await fetch(
    `${API_BASE}/api/chat/session/${sessionId}/messages`,
    { credentials: "include" }
  );
  if (!res.ok) {
    throw new Error(`Failed to load session: ${res.status}`);
  }
  return res.json();
}

export async function deleteSession(sessionId: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/chat/session/${sessionId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete session: ${res.status}`);
  }
}

export async function checkAuth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  return res.ok;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string
): Promise<boolean> {
  const res = await fetch(`${API_BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, full_name: fullName }),
  });
  return res.ok;
}

export async function fetchCatalog(): Promise<CatalogItem[]> {
  const res = await fetch(`${API_BASE}/api/catalog`);
  if (!res.ok) {
    throw new Error(`Failed to fetch catalog: ${res.status}`);
  }
  const data = await res.json();
  return data.items;
}
