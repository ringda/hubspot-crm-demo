import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // MCP stdio client spawns @hubspot/mcp-server via npx at runtime;
  // keep it external so Next doesn't try to bundle the MCP SDK's node deps.
  serverExternalPackages: ["@modelcontextprotocol/sdk"],
};

export default nextConfig;
