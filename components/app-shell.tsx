"use client";

import { useState, useSyncExternalStore } from "react";
import { ChatScreen } from "@/components/chat/chat-screen";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

const KEY = "financial-researcher:onboarded";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}
function getSnapshot(): "done" | "new" {
  try {
    return localStorage.getItem(KEY) === "1" ? "done" : "new";
  } catch {
    return "new";
  }
}
const getServerSnapshot = () => "loading" as const;

export function AppShell() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [finished, setFinished] = useState(false);
  const [replay, setReplay] = useState(false);

  const showOnboarding = replay || (stored === "new" && !finished);

  function completeOnboarding() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* storage unavailable: `finished` still lets the user through this session */
    }
    setFinished(true);
    setReplay(false);
  }

  return (
    <main className="app-bg flex min-h-dvh flex-col items-center justify-center md:gap-4 md:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-bg md:h-[min(844px,calc(100dvh-7rem))] md:max-w-[390px] md:rounded-[2.5rem] md:border md:border-line md:shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        {stored !== "loading" && (
          <>
            <ChatScreen onHelp={() => setReplay(true)} />
            {showOnboarding && (
              <div className="absolute inset-0 z-20 bg-bg">
                <OnboardingFlow onDone={completeOnboarding} />
              </div>
            )}
          </>
        )}
      </div>
      <p className="hidden max-w-[390px] text-center text-sm text-muted md:block">
        Financial Researcher is designed for mobile. Open this experience on your phone to continue.
      </p>
    </main>
  );
}
