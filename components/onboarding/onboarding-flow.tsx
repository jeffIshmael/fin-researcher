"use client";

import { useState } from "react";
import { APP_NAME } from "@/lib/config";
import { OnfraBadge } from "@/components/onfra-badge";
import { Glyph } from "@/components/chat/agent-avatar";

/** Slowly orbiting rings with tracked nodes: "following the flow of funds". */
function Orbit() {
  return (
    <div className="relative mx-auto h-56 w-56">
      <div className="absolute inset-0 rounded-full bg-accent/15 blur-3xl" />
      <svg viewBox="0 0 240 240" className="relative h-full w-full" fill="none" aria-hidden>
        <circle cx="120" cy="120" r="112" stroke="#e4e4e4" strokeWidth="1" />
        <g className="orbit-slow" style={{ transformOrigin: "120px 120px" }}>
          <circle cx="120" cy="120" r="84" stroke="#6b6b6b" strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 7" />
          <circle cx="120" cy="36" r="6" fill="#3cff8f" />
          <circle cx="193" cy="162" r="4" fill="#0a0a0a" />
        </g>
        <g className="orbit-slower" style={{ transformOrigin: "120px 120px" }}>
          <circle cx="120" cy="120" r="54" stroke="#0a0a0a" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="66" cy="120" r="5" fill="#3cff8f" />
          <circle cx="150" cy="167" r="3.5" fill="#a3a3a3" />
        </g>
      </svg>
      <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl bg-accent text-accent-ink shadow-[0_0_40px_rgba(60,255,143,0.45)]">
        <Glyph className="h-8 w-8" />
      </span>
    </div>
  );
}

const EXPLORE = [
  { title: "Follow the money", body: "See who a wallet sends to and receives from." },
  { title: "Understand cash flow", body: "Explore income, spending and changes over time." },
  { title: "Make sense of transactions", body: "Plain-language explanations of on-chain activity." },
  { title: "Create records", body: "Generate transaction statements when needed." },
];

const REASSURE = [
  "No wallet connection needed",
  "Research any public wallet",
  "No keys, seed phrases or sign-up",
];

const TOTAL = 3;

export function OnboardingFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const last = step === TOTAL - 1;

  return (
    <div className="app-bg flex h-full flex-col overflow-y-auto bg-bg pt-[env(safe-area-inset-top)] text-fg">
      <div className="flex items-center justify-between px-6 pt-5">
        <div className="flex items-center gap-3" aria-label={`Step ${step + 1} of ${TOTAL}`}>
          <span className="text-sm text-muted">
            {step + 1} of {TOTAL}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === step ? "w-7 bg-accent" : i < step ? "w-3 bg-accent/60" : "w-3 bg-line"}`}
              />
            ))}
          </div>
        </div>
        <button onClick={onDone} className="text-sm text-muted underline-offset-4 hover:underline">
          Skip
        </button>
      </div>

      <div key={step} className="animate-fade-up flex flex-1 flex-col justify-center px-6 py-6">
        {step === 0 && (
          <div className="text-center">
            <Orbit />
            <h1 className="mt-6 font-display text-[40px] font-semibold leading-[1.05] tracking-tight">{APP_NAME}</h1>
            <OnfraBadge className="mt-3 !text-xs" />
            <p className="mt-6 font-display text-2xl leading-snug">
              Understand what happens <span className="text-accent-deep">on-chain</span>. Just ask.
            </p>
            <p className="mx-auto mt-3 max-w-[300px] leading-relaxed text-muted">
              Explore wallet activity, follow the flow of funds, and make sense of transactions through a simple
              conversation.
            </p>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight">What you can explore</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {EXPLORE.map((item, i) => (
                <div key={item.title} className="rounded-2xl border border-line bg-surface p-4">
                  <span className="font-mono text-xs text-accent-deep">0{i + 1}</span>
                  <p className="mt-3 font-display text-[17px] font-semibold leading-snug">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight">
              Your research starts with a <span className="text-accent-deep">question.</span>
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Paste a public Celo wallet address or transaction hash into the chat, then ask what you want to
              understand.
            </p>
            <ul className="mt-6 space-y-3">
              {REASSURE.map((r) => (
                <li key={r} className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-ink">
                    ✓
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {step > 0 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 rounded-full border border-line py-3.5 text-base font-medium active:bg-surface-2"
          >
            Back
          </button>
        )}
        <button
          onClick={() => (last ? onDone() : setStep((s) => s + 1))}
          className="flex-[2] rounded-full bg-accent py-3.5 text-base font-semibold text-accent-ink shadow-[0_8px_30px_rgba(60,255,143,0.3)] active:scale-[0.98]"
        >
          {last ? "Start chatting" : "Continue"} <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}