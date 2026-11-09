export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function humanize(key: string): string {
  const s = key
    .replace(/[_\-.]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Unknown error";
}

/** Non-cryptographic id. crypto.randomUUID is unavailable on plain-http LAN testing. */
export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function shortenHex(v: string): string {
  return /^0x[0-9a-fA-F]{40,}$/.test(v) ? `${v.slice(0, 6)}…${v.slice(-4)}` : v;
}
