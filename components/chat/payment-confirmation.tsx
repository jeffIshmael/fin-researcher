import type { PendingPaidCall, PendingState } from "@/lib/types";
import { toolLabel } from "@/lib/onfra/tools-labels";

export function PaymentConfirmation({
  call,
  state,
  onConfirm,
  onCancel,
  busy,
}: {
  call: PendingPaidCall;
  state: PendingState;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl bg-paper text-sm text-ink shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between bg-accent px-4 py-2 text-accent-ink">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Paid tool</p>
        <p className="text-[11px] font-medium">Confirm to run</p>
      </div>
      <div className="p-4">
        <p className="font-display text-lg font-semibold leading-tight">{toolLabel(call.toolName)}</p>
        <p className="mt-1 text-ink-muted">{call.purpose}</p>

        <p className="mt-3 font-display text-3xl tracking-tight">
          {call.priceUsdt} <span className="text-base text-ink-muted">USDT · x402 on Celo</span>
        </p>

        <dl className="mt-3 space-y-1.5 border-t border-paper-line pt-3">
          {Object.entries(call.args).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="shrink-0 text-ink-muted">{k}</dt>
              <dd className="min-w-0 break-all text-right font-mono text-xs">
                {typeof v === "string" ? v : JSON.stringify(v)}
              </dd>
            </div>
          ))}
        </dl>

        {state === "awaiting" && (
          <>
            <p className="mt-3 text-xs text-ink-muted">
              Nothing is charged unless you confirm. If payment isn&apos;t set up in this demo, the call won&apos;t
              complete.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onCancel}
                disabled={busy}
                className="h-11 flex-1 rounded-full border border-paper-line font-medium active:bg-paper-2 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={busy}
                className="h-11 flex-[2] rounded-full bg-ink font-semibold text-accent active:opacity-80 disabled:opacity-40"
              >
                Confirm and run
              </button>
            </div>
          </>
        )}
        {state === "running" && <p className="mt-3 text-ink-muted">Running…</p>}
        {state === "done" && <p className="mt-3 text-ink-muted">Confirmed.</p>}
        {state === "cancelled" && <p className="mt-3 text-ink-muted">Cancelled. Nothing was run.</p>}
      </div>
    </div>
  );
}
