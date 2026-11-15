# DeNest on another computer or agent

1. Install the chosen coding agent and sign in to it.
2. Install the DeNest plugin from this repository using the agent's plugin installer. If it supports remote MCP but not plugins, add `https://denest.ai/api/mcp` as a remote HTTP MCP server and use this repository's DeNest skills where supported.
3. Complete DeNest's sign-in in that agent. Agent sign-in and DeNest sign-in are separate. Never copy tokens or the author's personal ChatGPT app ID to another computer.
4. Open the intended project folder. Ask the agent to connect the folder to DeNest and verify `list_projects` works in that exact chat. An empty project list is a successful connection.
5. Open or create the canvas through `open_workspace`. Reuse the folder's existing opaque workspace ID so reopening it returns to the same project.
6. Ask to enable Automatic Send for this canvas and chat. The agent must verify a real host event subscription before saying it is active.
7. Test a small canvas request: make an edit, press Send, and check that the agent starts without typing sync, then the request completes. A saved request or delivery receipt alone is not a completed test.

## Current delivery support

| Agent environment | Connection | Automatic delivery |
| --- | --- | --- |
| ChatGPT Work with Cloud, when MCP Events is exposed | Hosted DeNest OAuth | Native `canvas.requested` subscription; requires live verification in that chat |
| Codex local / desktop | DeNest plugin or remote MCP | Optional experimental CLI bridge; verify against the selected CLI session |
| Claude Code | DeNest Claude plugin or remote MCP | Optional experimental CLI bridge; verify against the selected CLI session |
| Cursor | Remote MCP and supported skills | Optional experimental CLI bridge; verify against the selected CLI session |
| Antigravity | Remote MCP and supported skills | Optional experimental CLI bridge; verify against the selected CLI session |

For local agents, follow the [bridge installation and commands](../bridge/README.md). Installing MCP alone does not provide automatic chat wake-up. Do not disable agent permissions to make a delivery test pass. Each agent must use its own authorized connection; the shared canvas remains hosted at DeNest.

If tools are missing, verify whether the plugin is enabled in this particular chat and whether the host exposes it. If tools exist but return an authentication error, reconnect DeNest in that host. Do not assume a working connection in another app or chat proves access here.
