---
name: denest-setup
description: Connect DeNest, verify authenticated tool access in the current chat, recover incomplete setup and open the requested workspace.
---

## Verify before saying Ready

Installation and connection are separate steps. When setup is invoked or DeNest work is blocked, preserve the user's current project and original request. Do not make them restate it after sign-in.

1. Discover DeNest tools in the current chat using the host's tool discovery, including searching for DeNest if no namespace is initially listed. An installed badge, skill file, browser login, settings screenshot or working connection in another chat is not a successful tool check.
2. If available, call `list_projects` with no arguments. An empty project list is success. Do not create test projects, scan repositories, upload metadata or invoke a paid model to verify access.
3. Say **DeNest is ready** only after that authenticated, read-only call succeeds in this chat. Then continue the original request immediately. Do not disclose the project listing unless needed for the task.

| Observation | Status and next action |
| --- | --- |
| `list_projects` succeeds, including an empty list | **Ready.** Continue the user's request. |
| Host reports not connected/authentication required, or the tool returns an authentication error | **Finish connecting.** Open the installed plugin's native Connect / Sign in action when supported. Guide only the sign-in/approval the user must perform. |
| Host shows a connected account but this chat cannot discover tools | **Connected; tools unavailable in this chat.** Refresh discovery once, then use the host's DeNest plugin selection or tool-refresh action if needed. Do not prescribe another login without an authentication error. |
| No DeNest connection exists in this host | **Connection setup needed.** Use the host-specific path below; do not duplicate an existing connection. |
| Network, permission, service, schema or another error | **Connection check failed.** Explain the actual error briefly and use its relevant recovery action. Do not translate every failure into a sign-in request. |

After sign-in or a host tool refresh, rediscover tools and repeat `list_projects` once. Continue automatically when the host delivers a completion callback; otherwise ask only for “done” when user action is actually outstanding. A reported successful login still needs the tool check. If it fails again, retain the original request and report the concrete remaining state instead of cycling through reconnect/restart prompts. Suggest a new chat only when the host cannot update this chat's tools, and explain why.

## Use the host's connection

Use the canonical endpoint from the packaged `mcp.json`: `https://denest.ai/api/mcp`. Do not request tokens, codes, passwords or keys in chat or copy credentials between clients.

- **Codex desktop/CLI:** the plugin supplies the MCP connection. Use its native connection settings and sign-in action; do not add a duplicate standalone server. A temporary localhost callback returns sign-in to the desktop client; DeNest itself is remote. The standalone CLI login command may not find plugin-bundled servers, so do not create a manual entry as a workaround.
- **ChatGPT, including project chats:** inspect the installed/personal DeNest plugin's **Connected accounts** state. If it shows Connect, finish that connection, approve access and return to the originating app if the browser prompts. A Git marketplace install or local Codex OAuth login does not finish this hosted connection. If none exists, guide Plugins → Add → Add custom MCP server with the canonical URL, OAuth and discovered Dynamic Client Registration, then Connect. Register only when the user requests the connection and the host permits it. Use the installed plugin's identity and supported controls; never invent an app ID or hard-code the package author's personal connection. This Git package is not a public-directory listing.
- **Claude Code:** use the installed plugin's `/mcp` sign-in action, then verify with the same read-only tool call.

When host tools/UI are available and setup is authorized, open the relevant connection screen yourself. Give one concise next action instead of a generic settings checklist. Preserve host-required approvals and credential entry. Do not promise a button or deep link the host does not provide.

For a diagnosed older Codex setup, compare any global `mcp_servers.denest` override with the packaged URL. A stale Cloud Run URL can cause a same-origin rejection against denest.ai OAuth discovery. Back up configuration before an authorized repair; change only the stale entry and verify the bundled connection before removing a duplicate. Do not change unrelated plugins or permissions.

## Continue with the workspace

After verification, complete the original request. Ask which project only when the current project is ambiguous. For a request solely to connect or verify, report the successful check without creating workspace state.

For a requested local workspace, resolve `scripts/connector.mjs` from this installed plugin and run its scan command with the workspace as `--root`. Node.js 20 or later is required. Check repository instructions before creating local state. Reuse the returned stable `workspaceId`, send that opaque ID and a display title to `open_workspace`, and open/return the actual `canvasUrl`. Keep local absolute paths out of remote arguments. The scan stays local; follow the denest skill and the user's scope for mapping and metadata upload.

Connection readiness and model generation readiness are separate. Do not demand an OpenRouter key just to verify tool access or inspect a canvas. If the authorization page itself requires model setup, or a generation action reports a missing key, open the hosted settings form and explain that specific requirement. Keys belong in that form. Verify access afterward; do not imply this package bypasses server requirements.

## Connection report (only when requested)

Include endpoint, current client/chat if known, verification time, observed status, whether `list_projects` succeeded, and workspace ID/canvas URL if available. Distinguish tool-verified status from settings-only or user-reported status. Exclude project listings, local paths, credentials and callback query strings.
