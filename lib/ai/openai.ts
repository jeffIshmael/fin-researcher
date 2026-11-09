import OpenAI from "openai";
import { getServerEnv } from "@/lib/env";

let client: OpenAI | null = null;
let clientKey = "";

export function getOpenAI(): OpenAI {
  const { openaiKey } = getServerEnv();
  if (!client || clientKey !== openaiKey) {
    client = new OpenAI({ apiKey: openaiKey, timeout: 60_000, maxRetries: 1 });
    clientKey = openaiKey;
  }
  return client;
}
