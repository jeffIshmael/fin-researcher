// Central place for product naming and limits. Safe to import from client and server.
export const APP_NAME = "Financial Researcher";
export const APP_ATTRIBUTION = "Powered by OnFRA";
// Paste the OnFRA ERC-8004 (Celo) link here. While empty, "OnFRA" renders as plain text.
export const ONFRA_LINK = "";
export const DEFAULT_MCP_URL = "https://app.onfra.xyz/api/mcp";

export const LIMITS = {
  maxMessageChars: 4000,
  maxHistory: 20,
  maxToolRounds: 5,
  maxCompletionTokens: 4000,
  mcpConnectTimeoutMs: 15_000,
  mcpCallTimeoutMs: 45_000,
  toolCacheMs: 5 * 60_000,
} as const;
