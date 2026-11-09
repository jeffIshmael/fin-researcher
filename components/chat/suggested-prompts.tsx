const PROMPTS = [
  { send: "Analyze a wallet", title: "Analyze a wallet", sub: "Profile, holdings, activity" },
  { send: "Who does this wallet send to most?", title: "Top recipients", sub: "Who it sends to most" },
  { send: "Show its income and spending", title: "Income & spending", sub: "How money flows" },
  { send: "Compare two months", title: "Compare months", sub: "This month vs last" },
  { send: "Explain a transaction", title: "Explain a transaction", sub: "In plain language" },
];

export function SuggestedPrompts({ onPick, disabled }: { onPick: (text: string) => void; disabled: boolean }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {PROMPTS.map((p, i) => (
        <button
          key={p.send}
          disabled={disabled}
          onClick={() => onPick(p.send)}
          className={`group rounded-2xl border border-line bg-surface p-3 text-left transition active:scale-[0.98] active:border-accent disabled:opacity-40 ${
            i === 0 ? "col-span-2" : ""
          }`}
        >
          <p className="font-display text-[15px] font-semibold leading-snug">{p.title}</p>
          <p className="mt-0.5 text-xs text-muted">{p.sub}</p>
        </button>
      ))}
    </div>
  );
}
