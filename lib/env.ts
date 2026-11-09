// Server-only environment access. Never import this from a client component.
import { DEFAULT_MCP_URL } from "@/lib/config";

export function getServerEnv() {
  return {
    mcpUrl: process.env.ONFRA_MCP_URL?.trim() || DEFAULT_MCP_URL,
    openaiKey: process.env.OPENAI_API_KEY?.trim() || "",
    model: process.env.OPENAI_MODEL?.trim() || "",
    reasoningEffort: process.env.OPENAI_REASONING_EFFORT?.trim() || "",
  };
}

/** Names (never values) of required variables that are not set. */
export function missingConfig(): string[] {
  const env = getServerEnv();
  const missing: string[] = [];
  if (!env.openaiKey) missing.push("OPENAI_API_KEY");
  if (!env.model) missing.push("OPENAI_MODEL");
  return missing;
}
