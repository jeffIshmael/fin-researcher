/** Brand glyph for Financial Researcher: a lens with a tracked node. */
export function Glyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L21 21" />
      <circle cx="10.5" cy="10.5" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AgentAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const box = size === "md" ? "h-10 w-10 rounded-2xl" : "h-7 w-7 rounded-full";
  const glyph = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <span className={`flex shrink-0 items-center justify-center bg-accent text-accent-ink ${box}`} aria-hidden>
      <Glyph className={glyph} />
    </span>
  );
}
