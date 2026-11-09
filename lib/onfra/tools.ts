import type OpenAI from "openai";
import Ajv2020 from "ajv/dist/2020";
import type { ValidateFunction } from "ajv";
import { LIMITS } from "@/lib/config";
import type { McpSession } from "@/lib/onfra/mcp-client";
import type { McpTool } from "@/lib/onfra/types";

export interface PaidToolMeta {
  priceUsdt: string;
  purpose: string;
  /** false = never offered to the model and never confirmable from the UI */
  userCallable: boolean;
}

export const PAID_TOOLS: Record<string, PaidToolMeta> = {
  generate_transaction_statement: {
    priceUsdt: "0.01",
    purpose: "Generate a PDF or CSV transaction statement and pin it to IPFS",
    userCallable: true,
  },
  explain_transaction: {
    priceUsdt: "0.02",
    purpose: "Explain a Celo transaction in plain language",
    userCallable: true,
  },
  // The model does its own orchestration with the free tools, so this one is hidden.
  chat_query: {
    priceUsdt: "0.01",
    purpose: "Answer a natural-language wallet question",
    userCallable: false,
  },
};

export const isPaidTool = (name: string) => name in PAID_TOOLS;

export { toolLabel, cardTitle } from "@/lib/onfra/tools-labels";

// ---- discovery (cached briefly; the live server list stays the source of truth) ----

let cache: { tools: McpTool[]; at: number } | null = null;

export async function getTools(session: McpSession): Promise<McpTool[]> {
  if (cache && Date.now() - cache.at < LIMITS.toolCacheMs) return cache.tools;
  const tools = await session.listTools();
  cache = { tools, at: Date.now() };
  return tools;
}

// ---- MCP tool -> OpenAI function tool ----

type OpenAITool = OpenAI.Chat.Completions.ChatCompletionTool;

export function toOpenAITools(tools: McpTool[]): OpenAITool[] {
  return tools
    .filter((t) => !(PAID_TOOLS[t.name] && !PAID_TOOLS[t.name].userCallable))
    .map((t) => {
      const parameters: Record<string, unknown> = { ...(t.inputSchema ?? {}) };
      delete parameters.$schema;
      if (parameters.type !== "object") parameters.type = "object";
      if (!parameters.properties) parameters.properties = {};
      return {
        type: "function" as const,
        function: {
          name: t.name,
          description: (t.description ?? "").slice(0, 1024),
          parameters,
        },
      };
    });
}

// ---- argument validation against the live schema ----

const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
const validators = new Map<string, ValidateFunction | null>();

/** Returns an error string, or null when valid (or when the schema can't be compiled). */
export function validateArgs(tool: McpTool, args: Record<string, unknown>): string | null {
  const key = `${tool.name}:${JSON.stringify(tool.inputSchema ?? {})}`;
  let validate = validators.get(key);
  if (validate === undefined) {
    try {
      const schema: Record<string, unknown> = { ...(tool.inputSchema ?? { type: "object" }) };
      delete schema.$schema;
      delete schema.$id;
      validate = ajv.compile(schema);
    } catch {
      validate = null; // let the MCP server validate instead
    }
    validators.set(key, validate);
  }
  if (!validate) return null;
  if (validate(args)) return null;
  return ajv.errorsText(validate.errors, { separator: "; " });
}
