import { Client, StreamableHTTPClientTransport } from "@modelcontextprotocol/client";
import { LIMITS } from "@/lib/config";
import { getServerEnv } from "@/lib/env";
import { errorMessage } from "@/lib/utils";
import type { McpCallResult, McpTool } from "@/lib/onfra/types";

export type McpErrorKind = "connection" | "timeout" | "payment" | "tool";

export class McpError extends Error {
  kind: McpErrorKind;
  constructor(message: string, kind: McpErrorKind) {
    super(message);
    this.name = "McpError";
    this.kind = kind;
  }
}

export interface McpSession {
  listTools(): Promise<McpTool[]>;
  callTool(name: string, args: Record<string, unknown>): Promise<McpCallResult>;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new McpError(`${label} timed out after ${Math.round(ms / 1000)}s`, "timeout")),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function looksLikePaymentError(text: string): boolean {
  return /\b402\b|payment required|x402/i.test(text);
}

/**
 * Opens a real MCP session (Streamable HTTP, full initialize handshake),
 * runs `fn`, then always closes the client/transport.
 */
export async function withMcp<T>(fn: (session: McpSession) => Promise<T>): Promise<T> {
  const { mcpUrl } = getServerEnv();
  const client = new Client({ name: "financial-researcher", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(mcpUrl));

  try {
    try {
      await withTimeout(client.connect(transport), LIMITS.mcpConnectTimeoutMs, "MCP connection");
    } catch (e) {
      if (e instanceof McpError) throw e;
      throw new McpError(`Could not connect to the OnFRA MCP server: ${errorMessage(e)}`, "connection");
    }

    const session: McpSession = {
      async listTools() {
        try {
          const all: McpTool[] = [];
          let cursor: string | undefined;
          do {
            const page = await withTimeout(
              client.listTools({ cursor }),
              LIMITS.mcpConnectTimeoutMs,
              "MCP tools/list",
            );
            all.push(...(page.tools as unknown as McpTool[]));
            cursor = page.nextCursor;
          } while (cursor);
          return all;
        } catch (e) {
          if (e instanceof McpError) throw e;
          throw new McpError(`Could not list OnFRA tools: ${errorMessage(e)}`, "connection");
        }
      },
      async callTool(name, args) {
        try {
          const res = await withTimeout(
            client.callTool({ name, arguments: args }),
            LIMITS.mcpCallTimeoutMs,
            `Tool ${name}`,
          );
          return res as unknown as McpCallResult;
        } catch (e) {
          if (e instanceof McpError) throw e;
          const msg = errorMessage(e);
          throw new McpError(msg, looksLikePaymentError(msg) ? "payment" : "tool");
        }
      },
    };

    return await fn(session);
  } finally {
    try {
      await client.close();
    } catch {
      /* ignore close errors */
    }
  }
}
