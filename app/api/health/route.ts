import { NextResponse } from "next/server";
import { missingConfig } from "@/lib/env";
import { errorMessage } from "@/lib/utils";
import { withMcp } from "@/lib/onfra/mcp-client";

export const maxDuration = 30;

export async function GET() {
  const missing = missingConfig();
  let mcp: "connected" | "unavailable" = "unavailable";
  let toolCount: number | undefined;
  let mcpError: string | undefined;

  try {
    const tools = await withMcp((s) => s.listTools());
    mcp = "connected";
    toolCount = tools.length;
  } catch (e) {
    mcpError = errorMessage(e);
  }

  return NextResponse.json({ configured: missing.length === 0, missing, mcp, toolCount, mcpError });
}
