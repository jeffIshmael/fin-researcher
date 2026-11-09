"use client";

import { useRef, useState } from "react";
import { LIMITS } from "@/lib/config";

export function ChatComposer({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(resize);
  }

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="bg-gradient-to-t from-bg via-bg to-transparent px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-2 rounded-3xl border border-line bg-surface-2 py-2 pl-4 pr-2 shadow-[0_6px_24px_rgba(0,0,0,0.35)] focus-within:border-accent">
        <textarea
          ref={ref}
          value={value}
          rows={1}
          maxLength={LIMITS.maxMessageChars}
          placeholder="Ask anything about a Celo wallet..."
          aria-label="Message"
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
          className="max-h-[140px] min-w-0 flex-1 resize-none bg-transparent py-1.5 text-base leading-snug text-fg outline-none placeholder:text-muted"
        />
        <button
          onClick={submit}
          disabled={!canSend}
          aria-label="Send"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
            canSend ? "bg-accent text-accent-ink active:scale-95" : "bg-surface text-muted"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
      <p className="mt-1.5 text-center text-[10px] text-muted">
        On-chain research, not investment advice. Never share keys or seed phrases.
      </p>
    </div>
  );
}
