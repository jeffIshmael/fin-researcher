import type { ReactNode } from "react";
import type { UiMessage } from "@/lib/types";
import { ResultCard } from "@/components/results/result-card";
import { AgentAvatar } from "@/components/chat/agent-avatar";
import { Markdown } from "@/components/chat/markdown";
import { PaymentConfirmation } from "@/components/chat/payment-confirmation";
import { ToolActivity } from "@/components/chat/tool-activity";

/** Avatar + content column. min-w-0 is what lets long addresses wrap instead of overflow. */
export function AgentRow({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-up flex items-start gap-2">
      <AgentAvatar />
      <div className="min-w-0 flex-1 pr-4">{children}</div>
    </div>
  );
}

export function AgentBubble({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-3 text-[15px] text-fg [overflow-wrap:anywhere]">
      {children}
    </div>
  );
}

export function ChatMessage({
  message,
  busy,
  onConfirm,
  onCancel,
  onRetry,
}: {
  message: UiMessage;
  busy: boolean;
  onConfirm: (m: UiMessage) => void;
  onCancel: (m: UiMessage) => void;
  onRetry: (m: UiMessage) => void;
}) {
  if (message.role === "user") {
    return (
      <div className="animate-fade-up flex justify-end pl-10">
        <p className="min-w-0 whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] font-medium leading-relaxed text-accent-ink [overflow-wrap:anywhere]">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <AgentRow>
      <AgentBubble>
        {message.error && (
          <span
            aria-hidden
            className="mb-1 mr-2 inline-flex h-4 w-4 items-center justify-center rounded-full border border-accent text-[10px] font-bold text-accent"
          >
            !
          </span>
        )}
        <Markdown>{message.content}</Markdown>
        {message.error && (
          <button
            onClick={() => onRetry(message)}
            disabled={busy}
            className="mt-3 h-9 rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink active:opacity-80 disabled:opacity-40"
          >
            Retry
          </button>
        )}
      </AgentBubble>

      {message.toolActivity && <ToolActivity items={message.toolActivity} />}
      {message.cards?.map((c) => <ResultCard key={c.id} card={c} />)}
      {message.pending && (
        <PaymentConfirmation
          call={message.pending}
          state={message.pending.state}
          busy={busy}
          onConfirm={() => onConfirm(message)}
          onCancel={() => onCancel(message)}
        />
      )}
    </AgentRow>
  );
}
