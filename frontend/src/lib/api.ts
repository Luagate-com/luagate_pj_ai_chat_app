import type { ChatMessage, ChatResponse, HistoryResponse } from "../types";

// 本番では VITE_API_BASE_URL でフル URL を指定する。
// 開発時は Vite の dev proxy が /api を localhost:3031 に転送するので、空文字 (= 同一オリジン) でよい。
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

// セッション ID 管理 (chapter 11-chat-ui)
// - 起動時に crypto.randomUUID で発行
// - localStorage に永続化してリロード後も同じセッションを継続
// - すべての /api/chat リクエストで X-Session-Id ヘッダに乗せる
const SESSION_STORAGE_KEY = "luagate.aichat.sessionId";

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getSessionId(): string {
  try {
    const cached = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (cached && cached.length > 0 && cached.length <= 64) {
      return cached;
    }
    const fresh = generateSessionId();
    window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return generateSessionId();
  }
}

export function resetSessionId(): string {
  const fresh = generateSessionId();
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, fresh);
  } catch {
    // ignore
  }
  return fresh;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown, message?: string) {
    super(message || `API error ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "X-Session-Id": getSessionId(),
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await res.json() : await res.text();

  if (!res.ok) {
    throw new ApiError(res.status, payload);
  }
  return payload as T;
}

export function sendChatMessage(message: string): Promise<ChatResponse> {
  return request<ChatResponse>("POST", "/api/chat", { message });
}

export function fetchHistory(): Promise<HistoryResponse> {
  return request<HistoryResponse>("GET", "/api/chat/history");
}

export function resetHistory(): Promise<{ ok: true; history: ChatMessage[] }> {
  return request("DELETE", "/api/chat/history");
}

export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const p = err.payload;
    if (typeof p === "object" && p !== null) {
      const obj = p as Record<string, unknown>;
      if (typeof obj.error === "string") return obj.error;
    }
    return "ただいま回答できません。しばらくしてから再度お試しください";
  }
  if (err instanceof Error) return err.message;
  return "不明なエラーが発生しました";
}
