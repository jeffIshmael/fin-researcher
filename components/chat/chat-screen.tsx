"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LIMITS } from "@/lib/config";
import { uid } from "@/lib/utils";
import type {
  ApiMessage,
  ChatErrorResponse,
  ChatRequestBody,
  ChatSuccessResponse,
  UiMessage,
} from "@/lib/types";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatHeader, type McpStatus } from "@/components/chat/chat-header";
import { AgentBubble, AgentRow, ChatMessage } from "@/components/chat/chat-message";
import { SuggestedPrompts } from "@/components/chat/suggested-prompts";

const WELCOME =
  "Hi, I'm Financial Researcher. I can help you understand Celo wallet activity, follow where funds move, compare cash flow and explain transactions. What would you like to investigate?";

function toApiMessages(messages: UiMessage[]): ApiMessage[] {
  return messages
    .filter((m) => !m.error && m.content.trim())
    .slice(-LIMITS.maxHistory)
    .map((m) => ({ role: m.role, content: m.content }));
}

async function requestChat(body: ChatRequestBody): Promise<UiMessage> {
  const errorReply = (content: string): UiMessage => ({ id: uid(), role: "assistant", content, error: true });
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    let json: ChatSuccessResponse | ChatErrorResponse | null = null;
    try {
      json = await res.json();
    } catch {
      /* non-JSON response */
    }
    if (!json) return errorReply(`The server returned an unexpected response (${res.status}).`);
    if ("error" in json) return errorReply(json.error.message);
    return {
      id: uid(),
      role: "assistant",
      content: json.message,
      toolActivity: json.toolActivity,
      cards: json.cards,
      pending: json.pending ? { ...json.pending, state: "awaiting" } : undefined,
    };
  } catch {
    return errorReply("Couldn't reach the server. Check your connection and try again.");
  }
}

export function ChatScreen({ onHelp }: { onHelp: () => void }) {
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<McpStatus>("connecting");
  const busy = useRef(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/health")
      .then((r) => r.json())
      .then((j: { mcp?: string }) => {
        if (!cancelled) setStatus(j.mcp === "connected" ? "connected" : "unavailable");
      })
      .catch(() => {
        if (!cancelled) setStatus("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const run = useCallback(async (history: UiMessage[], confirm?: ChatRequestBody["confirm"]) => {
    if (busy.current) return false;
    busy.current = true;
    setLoading(true);
    try {
      const reply = await requestChat({ messages: toApiMessages(history), confirm });
      setMessages((prev) => [...prev, reply]);
      if (reply.error) setStatus((s) => (s === "connected" ? s : "unavailable"));
      return !reply.error;
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, []);

  function send(text: string) {
    if (busy.current) return;
    const next = [...messages, { id: uid(), role: "user" as const, content: text }];
    setMessages(next);
    void run(next);
  }

  function retry(errorMsg: UiMessage) {
    const idx = messages.findIndex((m) => m.id === errorMsg.id);
    const history = messages.slice(0, idx);
    setMessages(history);
    void run(history);
  }

  function setPendingState(id: string, state: "awaiting" | "running" | "done" | "cancelled") {
    setMessages((prev) => prev.map((m) => (m.id === id && m.pending ? { ...m, pending: { ...m.pending, state } } : m)));
  }

  async function confirm(m: UiMessage) {
    if (!m.pending || busy.current) return;
    setPendingState(m.id, "running");
    const ok = await run(messages, { toolName: m.pending.toolName, args: m.pending.args });
    setPendingState(m.id, ok ? "done" : "awaiting");
  }

  function cancel(m: UiMessage) {
    setPendingState(m.id, "cancelled");
    setMessages((prev) => [
      ...prev,
      { id: uid(), role: "assistant", content: "Cancelled. Nothing was run and nothing was charged." },
    ]);
  }

  function newChat() {
    if (busy.current) return;
    setMessages([]);
  }

  return (
    <div className="app-bg flex h-full flex-col">
      <ChatHeader status={status} onNewChat={newChat} onHelp={onHelp} disabled={loading} />

      <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-3 py-4">
        <div>
          <AgentRow>
            <AgentBubble>
              <p className="leading-relaxed">{WELCOME}</p>
            </AgentBubble>
          </AgentRow>
          {messages.length === 0 && (
            <>
              <SuggestedPrompts onPick={send} disabled={loading} />
              <p className="mt-4 text-center text-xs text-muted">
                Paste a public Celo address or transaction hash in your message. No wallet connection needed.
              </p>
            </>
          )}
        </div>

        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} busy={loading} onConfirm={confirm} onCancel={cancel} onRetry={retry} />
        ))}

        {loading && (
          <AgentRow>
            <div
              role="status"
              aria-label="Researching"
              className="inline-flex items-center gap-2 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3 text-sm text-muted"
            >
              <span className="flex gap-1" aria-hidden>
                <span className="dot-blink h-1.5 w-1.5 rounded-full bg-accent" />
                <span className="dot-blink h-1.5 w-1.5 rounded-full bg-accent [animation-delay:0.2s]" />
                <span className="dot-blink h-1.5 w-1.5 rounded-full bg-accent [animation-delay:0.4s]" />
              </span>
              Researching…
            </div>
          </AgentRow>
        )}
        <div ref={bottom} />
      </div>

      <ChatComposer onSend={send} disabled={loading} />
    </div>
  );
}
