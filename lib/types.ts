export type ChatRole = "user" | "assistant";

export interface ApiMessage {
  role: ChatRole;
  content: string;
}

export interface ToolActivityItem {
  id: string;
  name: string;
  label: string;
  args: Record<string, unknown>;
  status: "success" | "error";
  error?: string;
}

export interface ResultCardData {
  id: string;
  tool: string;
  title: string;
  data: unknown;
}

export interface PendingPaidCall {
  toolName: string;
  args: Record<string, unknown>;
  priceUsdt: string;
  purpose: string;
}

export interface ChatRequestBody {
  messages: ApiMessage[];
  confirm?: { toolName: string; args: Record<string, unknown> };
}

export interface ChatSuccessResponse {
  message: string;
  toolActivity: ToolActivityItem[];
  cards: ResultCardData[];
  pending?: PendingPaidCall;
  activeWallet: string | null;
}

export interface ChatErrorResponse {
  error: { code: string; message: string };
}

export type PendingState = "awaiting" | "running" | "done" | "cancelled";

export interface UiMessage {
  id: string;
  role: ChatRole;
  content: string;
  toolActivity?: ToolActivityItem[];
  cards?: ResultCardData[];
  pending?: PendingPaidCall & { state: PendingState };
  error?: boolean;
}
