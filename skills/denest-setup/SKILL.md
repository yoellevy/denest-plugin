---
name: denest-setup
description: Set up or troubleshoot a DeNest connection, verify access and export a connection report when requested.
---

Discover the installed DeNest MCP tools before changing configuration. If authentication is required, guide the user through the client's native sign-in action. Let the user complete Google sign-in and approve the connection. Use the endpoint packaged in this plugin's mcp.json. Avoid adding a duplicate standalone server when this plugin already supplies it.

After authentication, ask which project to open only if the current project is ambiguous. Resolve the packaged scripts/connector.mjs from this plugin's installed directory and run its scan command with the local workspace as --root. It requires Node.js 20 or later and returns a stable workspaceId. Check repository instructions before creating local state. Send that opaque ID and a display title to open_workspace. Keep absolute local paths out of remote tool arguments. Return the actual canvasUrl from the successful result. The scan stays local until the user requests mapping and the denest skill syncs it.

If the hosted app requests an OpenRouter key, direct the user to its settings. Keys belong in the hosted settings form. Do not request keys or OAuth codes in chat. Retry once after the user reports completing setup and report the actual remaining error if access still fails.

When the user requests an export, provide a connection report containing the packaged endpoint, client if known, verification time, observed connection status, workspace ID and canvas URL if available, and sanitized error text. Distinguish user-reported status from a successful tool call. Exclude tokens, authorization codes, cookies, keys and callback query strings.
