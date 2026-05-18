import type { ChatMessage, ChatResponse, HistoryResponse } from "../types";

// 本番では VITE_API_BASE_URL でフル URL を指定する。
// 開発時は Vite の dev proxy が /api を localhost:3031 に転送するので、空文字 (= 同一オリジン) でよい。
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";

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
  const headers: Record<string, string> = {};
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
