import { NextResponse } from "next/server";
import OpenAI from "openai";
import { LIMITS } from "@/lib/config";
import { missingConfig } from "@/lib/env";
import { errorMessage, isRecord } from "@/lib/utils";
import { AgentInputError, runAgent } from "@/lib/ai/agent";
import { McpError } from "@/lib/onfra/mcp-client";
import type { ApiMessage, ChatErrorResponse, ChatRequestBody } from "@/lib/types";

export const maxDuration = 60;

function fail(status: number, code: string, message: string) {
  return NextResponse.json<ChatErrorResponse>({ error: { code, message } }, { status });
}

function parseBody(raw: unknown): ChatRequestBody | string {
  if (!isRecord(raw) || !Array.isArray(raw.messages)) return "Expected a messages array.";

  const messages: ApiMessage[] = [];
  for (const m of raw.messages) {
    if (!isRecord(m) || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return "Invalid message format.";
    }
    const content = m.content.trim();
    if (!content) continue;
    if (m.role === "user" && content.length > LIMITS.maxMessageChars) {
      return `Messages are limited to ${LIMITS.maxMessageChars} characters.`;
    }
    messages.push({ role: m.role, content: content.slice(0, LIMITS.maxMessageChars) });
  }
  const bounded = messages.slice(-LIMITS.maxHistory);
  if (bounded.length === 0) return "No message provided.";

  let confirm: ChatRequestBody["confirm"];
  if (raw.confirm !== undefined) {
    if (!isRecord(raw.confirm) || typeof raw.confirm.toolName !== "string" || !isRecord(raw.confirm.args)) {
      return "Invalid confirmation payload.";
    }
    confirm = { toolName: raw.confirm.toolName, args: raw.confirm.args };
  } else if (bounded[bounded.length - 1].role !== "user") {
    return "The last message must come from the user.";
  }

  return { messages: bounded, confirm };
}

export async function POST(req: Request) {
  const missing = missingConfig();
  if (missing.length > 0) {
    return fail(503, "config", `Server is not configured. Missing environment variable(s): ${missing.join(", ")}.`);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail(400, "bad_request", "Request body must be valid JSON.");
  }

  const body = parseBody(raw);
  if (typeof body === "string") return fail(400, "bad_request", body);

  try {
    const result = await runAgent(body);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[chat] failed:", errorMessage(e)); // message only: no stacks, keys or headers

    if (e instanceof AgentInputError) return fail(400, "bad_request", e.message);
    if (e instanceof McpError) {
      return fail(502, "mcp_unavailable", `Couldn't reach the OnFRA MCP server. ${e.message}`);
    }
    if (e instanceof OpenAI.APIError) {
      if (e.status === 401) return fail(502, "llm_auth", "OpenAI rejected the API key. Check OPENAI_API_KEY.");
      if (e.status === 404) return fail(502, "llm_model", "OpenAI could not find the configured model. Check OPENAI_MODEL.");
      if (e.status === 429) return fail(502, "llm_rate", "OpenAI rate limit or quota reached. Try again shortly.");
      return fail(502, "llm_error", "The language model request failed. Please try again.");
    }
    return fail(500, "internal", "Something went wrong. Please try again.");
  }
}
