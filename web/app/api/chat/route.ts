import { experimental_createMCPClient, streamText } from "ai";
import { Experimental_StdioMCPTransport } from "ai/mcp-stdio";
import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { groq } from "@ai-sdk/groq";
import path from "node:path";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

// Resolve the MCP server entry from the project's node_modules on disk.
// Turbopack intercepts ANY require.resolve (even a dynamically-built specifier)
// and rewrites it to a virtual path that doesn't exist, so we sidestep module
// resolution entirely: process.cwd() is the web/ dir at dev/runtime, a real
// on-disk path the bundler never touches.
function resolveMcpServerEntry(): string {
  return path.join(
    process.cwd(),
    "node_modules",
    "@hubspot",
    "mcp-server",
    "dist",
    "index.js"
  );
}

export const maxDuration = 60;

// Some providers validate tool JSON Schemas strictly: every `type: "array"`
// MUST carry an `items` definition, or the whole tool batch is rejected
// (Gemini → INVALID_ARGUMENT, Groq → 400 tool_use_failed). HubSpot's MCP
// schemas have a few arrays (e.g. filterGroups…values) with no items, which
// Claude tolerates but Gemini and Groq do not. Recursively patch any
// items-less array so the strict providers accept the tools.
function patchStrictSchema(node: unknown): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach(patchStrictSchema);
    return;
  }
  const obj = node as Record<string, unknown>;
  if (obj.type === "array" && !obj.items) {
    obj.items = { type: "string" };
  }
  for (const v of Object.values(obj)) patchStrictSchema(v);
}

// Apply the patch to every MCP tool's JSON Schema in place.
function sanitizeToolsForStrictSchema(tools: Record<string, any>): Record<string, any> {
  for (const tool of Object.values(tools)) {
    const schema = tool?.parameters?.jsonSchema ?? tool?.parameters;
    patchStrictSchema(schema);
  }
  return tools;
}

const HUBSPOT_TOKEN = process.env.PRIVATE_APP_ACCESS_TOKEN;

// The HubSpot MCP server exposes many tools, but this GTM demo only needs the
// read/write core: find a contact, read its props, create a contact, and, on
// Claude, log an activity. Two reasons to scope down to these:
//   1. Every tool's JSON Schema is sent on every request. The full 21 push a
//      single call to ~12.3k tokens, over Groq's free-tier 12k TPM limit.
//   2. Fewer, relevant tools = better tool selection, especially for smaller
//      models — the agent is scoped to exactly the GTM workflow it serves.
const BASE_DEMO_TOOL_NAMES = new Set([
  "hubspot-list-objects", // browse contacts/companies/deals
  "hubspot-search-objects", // find a contact by name/email
  "hubspot-batch-read-objects", // read a record's properties
  "hubspot-batch-create-objects", // create a contact (WRITE path)
]);

const CLAUDE_WRITE_TOOL_NAMES = new Set([
  "hubspot-create-engagement", // log note/task when Claude formats args safely
]);

function filterToDemoTools(
  tools: Record<string, any>,
  provider: "anthropic" | "groq" | "google"
): Record<string, any> {
  const allowed = new Set(BASE_DEMO_TOOL_NAMES);
  if (provider === "anthropic") {
    for (const name of CLAUDE_WRITE_TOOL_NAMES) allowed.add(name);
  }
  return Object.fromEntries(
    Object.entries(tools).filter(([name]) => allowed.has(name))
  );
}

// Pick the LLM by whichever key is present. Claude is preferred when both are
// set (its tool-calling tolerates the HubSpot MCP schemas natively); Gemini is
// the free-tier fallback. Returns null when no key is set → MOCK mode.
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
// The @ai-sdk/groq provider reads GROQ_API_KEY by default.
const GROQ_KEY = process.env.GROQ_API_KEY;
// The @ai-sdk/google provider reads GOOGLE_GENERATIVE_AI_API_KEY by default.
const GEMINI_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

function pickModel() {
  if (ANTHROPIC_KEY) {
    return { model: anthropic("claude-opus-4-8"), provider: "anthropic" as const };
  }
  // Groq's free tier has real quota and no billing setup; llama-3.3-70b
  // handles multi-tool MCP calls well. Strict tool-schema validation, so it
  // reuses the same schema patch as Gemini.
  if (GROQ_KEY) {
    return { model: groq("llama-3.3-70b-versatile"), provider: "groq" as const };
  }
  if (GEMINI_KEY) {
    return { model: google("gemini-2.0-flash"), provider: "google" as const };
  }
  return null;
}

// Connect to the official HubSpot MCP server over stdio (same server the
// Claude Code demo uses). Returns the MCP client; caller must close it.
async function getHubSpotMCP() {
  if (!HUBSPOT_TOKEN) {
    throw new Error(
      "PRIVATE_APP_ACCESS_TOKEN is not set. Set it as an env var (setx) or in web/.env.local."
    );
  }
  // Spawn the MCP server via `node <entry.js>` instead of `npx`. On Windows,
  // npx resolves to npx.cmd which Node's spawn rejects with EINVAL; running the
  // installed entry point with the node binary is cross-platform and avoids the
  // one-time npx download too. @hubspot/mcp-server is a local dependency.
  const serverEntry = resolveMcpServerEntry();
  const transport = new Experimental_StdioMCPTransport({
    command: process.execPath, // the node binary
    args: [serverEntry],
    env: { PRIVATE_APP_ACCESS_TOKEN: HUBSPOT_TOKEN },
    stderr: "pipe",
  });
  return experimental_createMCPClient({ transport });
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const picked = pickModel();

  // ---- MOCK MODE: no LLM key yet. Prove UI + MCP wiring without the LLM. ----
  if (!picked) {
    let toolNames: string[] = [];
    let mcpNote = "";
    try {
      const mcp = await getHubSpotMCP();
      const tools = await mcp.tools();
      toolNames = Object.keys(tools);
      await mcp.close();
    } catch (e) {
      mcpNote = `\n\n(MCP connect note: ${(e as Error).message})`;
    }

    const last = messages[messages.length - 1]?.content ?? "";
    const body =
      `MOCK MODE - no LLM key set yet (need ANTHROPIC_API_KEY, GROQ_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY), so the LLM judgment layer is not running.\n\n` +
      `Retail GTM launch workflow is loaded: channel readiness, SKU risk, owner, next action, and human checkpoint before CRM updates.\n\n` +
      `But the HubSpot MCP connection ${
        toolNames.length ? "IS live" : "could not be reached"
      }.\n` +
      (toolNames.length
        ? `Connected — ${toolNames.length} HubSpot tools available, e.g.: ${toolNames
            .slice(0, 6)
            .join(", ")}…\n`
        : "") +
      `\nYour message was: "${last}"\n\n` +
      `Add ANTHROPIC_API_KEY (preferred), GROQ_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY to web/.env.local, ` +
      `and the skill will use these MCP tools to read/write HubSpot following the GTM judgment in SKILL.md.` +
      mcpNote;

    return new Response(toDataStream(body), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // ---- REAL MODE: LLM + MCP tools ----
  const mcp = await getHubSpotMCP();
  let tools = filterToDemoTools(await mcp.tools(), picked.provider);
  // Gemini and Groq validate tool schemas strictly; patch HubSpot's MCP schemas.
  if (picked.provider === "google" || picked.provider === "groq") {
    tools = sanitizeToolsForStrictSchema(tools);
  }

  const result = streamText({
    model: picked.model,
    system: SYSTEM_PROMPT,
    messages,
    tools,
    maxSteps: 10,
    onError: (e) => {
      // Surface the real cause; the data stream otherwise only shows "An error occurred."
      console.error("[streamText error]", JSON.stringify(e, null, 2));
    },
    onFinish: async () => {
      await mcp.close();
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage: (e) => (e instanceof Error ? e.message : String(e)),
  });
}

// Encode a plain string as a Vercel AI SDK data-stream so useChat renders it.
function toDataStream(text: string): ReadableStream {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      // 0:"..." is the text-part frame the AI SDK data stream protocol expects.
      controller.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
      controller.close();
    },
  });
}
