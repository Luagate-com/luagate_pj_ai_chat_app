export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  message: ChatMessage;
  history: ChatMessage[];
}

export interface HistoryResponse {
  history: ChatMessage[];
}

export interface ToastItem {
  id: string;
  type: "error" | "info" | "success";
  message: string;
}
