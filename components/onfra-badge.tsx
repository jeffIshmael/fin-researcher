import { ONFRA_LINK } from "@/lib/config";

/** Placeholder mark. Replace the paths with the real OnFRA logo SVG when you have it. */
export function OnfraMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

/** "Powered by [logo] OnFRA". OnFRA links to the ERC-8004 page once ONFRA_LINK is set. */
export function OnfraBadge({ className = "" }: { className?: string }) {
  const inner = (
    <>
      <OnfraMark className="h-3.5 w-3.5" />
      <span className="font-semibold">OnFRA</span>
      {ONFRA_LINK && <span aria-hidden>↗</span>}
    </>
  );
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] text-muted ${className}`}>
      Powered by
      {ONFRA_LINK ? (
        <a
          href={ONFRA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent underline-offset-2 hover:underline"
        >
          {inner}
        </a>
      ) : (
        <span className="inline-flex items-center gap-1 text-accent">{inner}</span>
      )}
    </span>
  );
}
