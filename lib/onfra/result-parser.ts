import { isRecord } from "@/lib/utils";
import { looksLikePaymentError } from "@/lib/onfra/mcp-client";
import type { McpCallResult } from "@/lib/onfra/types";

export interface ParsedResult {
  ok: boolean;
  data: unknown;
  error?: string;
  paymentRequired: boolean;
}

function tryJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

export function parseToolResult(res: McpCallResult): ParsedResult {
  const text = (res.content ?? [])
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text as string)
    .join("\n")
    .trim();

  let data: unknown = res.structuredContent ?? undefined;
  if (data === undefined && text) data = tryJson(text) ?? text;

  if (res.isError) {
    const error = text || "The tool returned an error.";
    return { ok: false, data, error, paymentRequired: looksLikePaymentError(error) };
  }

  if (isRecord(data)) {
    const err = data.error;
    if (data.success === false || (data.success !== true && typeof err === "string" && err)) {
      const msg =
        (typeof err === "string" && err) ||
        (typeof data.message === "string" && data.message) ||
        "The tool reported a failure.";
      return { ok: false, data, error: msg, paymentRequired: looksLikePaymentError(msg) };
    }
  }

  if (data === undefined || data === "") {
    return { ok: false, data, error: "The tool returned an empty result.", paymentRequired: false };
  }

  return { ok: true, data, paymentRequired: false };
}

/** Bounds size and depth so a huge tool result can't blow up the response or the prompt. */
export function trimForClient(value: unknown, depth = 0): unknown {
  if (depth > 8) return "[truncated]";
  if (typeof value === "string") return value.length > 2000 ? `${value.slice(0, 2000)}…` : value;
  if (Array.isArray(value)) return value.slice(0, 50).map((v) => trimForClient(v, depth + 1));
  if (isRecord(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = trimForClient(v, depth + 1);
    return out;
  }
  return value;
}

export function stringifyForModel(value: unknown): string {
  const s = typeof value === "string" ? value : JSON.stringify(trimForClient(value));
  return s.length > 20_000 ? `${s.slice(0, 20_000)}…[truncated]` : s;
}
