# DeNest

Connect your coding agent to DeNest to create and review workflow maps. The plugin includes guided setup, workspace skills, a Claude guide agent, a local metadata helper and the hosted MCP connection.

## Install

Requires Node.js 20 or later for the local helper. It includes its dependencies.

In Claude Code, run `/plugin marketplace add yoellevy/denest-plugin`, then `/plugin install denest@denest`. Use `/mcp` to sign in to DeNest if prompted.

For Codex on a new PC:

1. Install Codex desktop and Node.js 20 or later.
2. Run `codex plugin marketplace add yoellevy/denest-plugin` once in a terminal.
3. Open Plugins in Codex, choose DeNest and install it. Alternatively, run `codex plugin add denest@denest`.
4. Run DeNest's setup action, or ask “Connect DeNest and open this project.” Setup checks access and opens Connect / Sign in only if needed.
5. Finish Google sign-in and the DeNest approval. Setup must successfully call `list_projects` before saying **Ready**, then continue your original request. An empty project list is valid. A new chat is needed only if your host cannot refresh the current chat's tools.

Once the marketplace is added, [open the install screen](codex://plugins/install/denest?marketplace=denest). The plugin supplies `https://denest.ai/api/mcp`; no manual MCP server entry, local DeNest server or project-specific connection is needed. Local desktop sign-in may briefly return to a `127.0.0.1` callback so Codex can receive the result. The service itself runs on denest.ai.

### Existing installations

Update the marketplace with `codex plugin marketplace upgrade denest`, then install the current package with `codex plugin add denest@denest`. If tools are missing, check the connection's actual startup status before repeating sign-in. Installed does not necessarily mean loaded into the current chat.

Older manual setups may have a global `[mcp_servers.denest]` entry in the Codex configuration. This can override the plugin's connection. If it still points to a `run.app` address, back up the configuration and correct that entry to `https://denest.ai/api/mcp`, then complete native sign-in for that endpoint. Do not copy tokens or account files from another PC. Do not add a second manual server to fix a bundled connection.

Ask your coding agent to use DeNest to map your current project. The setup skill guides workspace creation. Each user signs in with their own verified Google account. Model generation requires that user's OpenRouter key in the hosted app settings.

Version 0.3.2 fixes compatibility with Codex desktop's portable MCP parser: OAuth is discovered from the server because some desktop versions reject server-level `extensions` in `mcp.json`. If a diagnostic reports `unknown field extensions`, update the plugin. Run `node scripts/check-package.mjs` before publishing to check entry points, versions and connection settings.

### ChatGPT and project chats

The Git marketplace package supplies local coding-client skills and the bundled MCP connection. It is not a public ChatGPT directory listing, and a local Codex sign-in does not connect ChatGPT automatically.

In ChatGPT, use the existing personal DeNest plugin and choose **Connect** if no account is connected. If no hosted connection exists, use **Plugins → Add → Add custom MCP server**, enter `https://denest.ai/api/mcp`, choose OAuth with discovered Dynamic Client Registration, create the personal plugin and complete Connect. Each user connects their own account; do not copy someone else's technical app ID or credentials. Setup should guide these steps using the host's controls and verify a real tool call afterward. Once connected, select DeNest in a chat when needed.

### What setup verifies

Version 0.3.4's onboarding skill distinguishes **Ready**, **Finish connecting**, **Connected; tools unavailable in this chat**, **Connection setup needed**, and **Connection check failed**. Only a successful authenticated `list_projects` call in the current chat establishes Ready. Missing tools alone do not justify another login. Setup retains your original request, checks again after sign-in and continues it when access works.

These are setup-skill statuses, not new controls in ChatGPT/Codex's settings UI. The client still owns authentication, required approval prompts and tool loading. Model generation may separately require an OpenRouter key in DeNest settings; the readiness check does not invoke a model or upload project data.

## What runs locally

The helper inventories files, hashes and structural metadata. It recognizes Markdown headings and local links, plus explicitly declared `.logic.json` structures. Other text files are inventoried without semantic parsing. It skips common secret files, symbolic links, binary files, generated directories and its own `.denest` state. Review your project's contents and choose the workspace scope before uploading metadata. File names, paths and headings can themselves contain confidential information.

Source excerpts require explicit authorization and the helper's `--allow-evidence` option. Evidence reads are bounded to the server's requested paths, hashes and ranges. The helper writes local state under `.denest`, with a local ignore file. It makes no network requests and stores no account credentials. The coding agent sends approved data using its existing authenticated MCP connection.

The hosted service performs retrieval, graph generation and planning. The public package exposes the connection and data format, local inventory behavior, and user guidance.

## Local helper

Run `node scripts/connector.mjs scan --root <project-directory>` from the installed plugin directory. The output identifies the local metadata snapshot and stable workspace ID. The bundled skill handles sending that snapshot and requesting a graph.

For an authorized evidence request, pass its JSON request array on standard input to `node scripts/connector.mjs evidence --root <project-directory> --allow-evidence`. It writes a bounded local evidence packet. Remove the local `.denest/evidence.json` after use.

Use the setup skill to obtain a sanitized connection report when troubleshooting. Keep authorization codes, cookies and model keys out of support reports.

## Automatic Send

Version 0.3.5 adds a host-aware Automatic Send workflow and an optional local CLI bridge. Native MCP Events delivery has been verified end to end in ChatGPT Work. The Codex, Claude Code, Cursor and Antigravity CLI adapters are experimental and need a live test on the target computer; a CLI adapter does not imply support for waking an IDE chat.

Use the [another-computer checklist](docs/another-computer.md) and [bridge setup](bridge/README.md). Ordinary MCP connection and manual sync remain available independently.

This repository contains the public client package. Dependency licenses are included in `THIRD_PARTY_NOTICES.txt` and the installed dependencies.
