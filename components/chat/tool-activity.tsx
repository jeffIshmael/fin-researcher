import type { ToolActivityItem } from "@/lib/types";

export function ToolActivity({ items }: { items: ToolActivityItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-2 space-y-1.5">
      {items.map((item) => (
        <details key={item.id} className="overflow-hidden rounded-xl border border-line bg-surface/60 text-sm">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2">
            <span
              aria-hidden
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
                item.status === "success" ? "bg-accent text-accent-ink" : "border border-muted text-muted"
              }`}
            >
              {item.status === "success" ? "✓" : "✕"}
            </span>
            <span className="min-w-0 flex-1 truncate text-fg">{item.label}</span>
            <span className="text-[11px] text-muted">{item.status === "success" ? "Done" : "Failed"}</span>
          </summary>
          <div className="space-y-2 border-t border-line px-3 py-2 text-xs">
            <p className="break-all">
              <span className="text-muted">Tool: </span>
              <code className="font-mono text-fg">{item.name}</code>
            </p>
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-surface-2 p-2 font-mono text-[11px] text-fg">
              {JSON.stringify(item.args, null, 2)}
            </pre>
            {item.error && <p className="break-words text-muted">Error: {item.error}</p>}
          </div>
        </details>
      ))}
    </div>
  );
}
