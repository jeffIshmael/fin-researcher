import { APP_NAME } from "@/lib/config";
import { OnfraBadge } from "@/components/onfra-badge";
import { AgentAvatar } from "@/components/chat/agent-avatar";

export type McpStatus = "connecting" | "connected" | "unavailable";

function StatusPill({ status }: { status: McpStatus }) {
  const label = status === "connected" ? "Connected" : status === "connecting" ? "Connecting" : "Unavailable";
  const dot =
    status === "connected"
      ? "bg-accent dot-glow"
      : status === "connecting"
        ? "animate-pulse border border-accent"
        : "border border-dashed border-muted";
  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-muted"
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />
      Celo · {label}
    </span>
  );
}

export function ChatHeader({
  status,
  onNewChat,
  onHelp,
  disabled,
}: {
  status: McpStatus;
  onNewChat: () => void;
  onHelp: () => void;
  disabled: boolean;
}) {
  return (
    <header className="border-b border-line bg-bg/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center gap-3">
        <AgentAvatar size="md" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-semibold leading-tight">{APP_NAME}</h1>
          <OnfraBadge />
        </div>
        <button
          onClick={onHelp}
          aria-label="About and help"
          className="h-9 w-9 shrink-0 rounded-full border border-line text-sm text-muted active:bg-surface-2"
        >
          ?
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <StatusPill status={status} />
        <button
          onClick={onNewChat}
          disabled={disabled}
          className="flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-medium active:bg-surface-2 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          New chat
        </button>
      </div>
    </header>
  );
}
