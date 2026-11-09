const ADDRESS_RE = /(?<![0-9a-fA-F])0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/g;
const TX_HASH_RE = /(?<![0-9a-fA-F])0x[0-9a-fA-F]{64}(?![0-9a-fA-F])/g;

function uniqueMatches(text: string, re: RegExp): string[] {
  const seen = new Map<string, string>();
  for (const m of text.matchAll(re)) {
    const key = m[0].toLowerCase();
    if (!seen.has(key)) seen.set(key, m[0]);
  }
  return [...seen.values()];
}

export interface WalletContext {
  active: string | null;
  addressesInLatest: string[];
  txHashesInLatest: string[];
  ambiguous: boolean;
}

/**
 * Wallets only ever come from chat text. The active wallet is the most recent
 * message that mentioned exactly one address. A message with several addresses
 * clears the context until the user clarifies.
 */
export function resolveWalletContext(
  messages: { role: string; content: string }[],
): WalletContext {
  const userMessages = messages.filter((m) => m.role === "user");
  let active: string | null = null;
  let addressesInLatest: string[] = [];
  let txHashesInLatest: string[] = [];

  for (let i = 0; i < userMessages.length; i++) {
    const addrs = uniqueMatches(userMessages[i].content, ADDRESS_RE);
    if (addrs.length === 1) active = addrs[0];
    else if (addrs.length > 1) active = null;
    if (i === userMessages.length - 1) {
      addressesInLatest = addrs;
      txHashesInLatest = uniqueMatches(userMessages[i].content, TX_HASH_RE);
    }
  }

  return {
    active,
    addressesInLatest,
    txHashesInLatest,
    ambiguous: addressesInLatest.length > 1,
  };
}
