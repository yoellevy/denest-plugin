# DeNest

Connect your coding agent to DeNest to create and review workflow maps. The plugin includes guided setup, workspace skills, a Claude guide agent, a local metadata helper and the hosted MCP connection.

## Install

Requires Node.js 20 or later for the local helper. It includes its dependencies.

In Claude Code, run `/plugin marketplace add yoellevy/denest-plugin`, then `/plugin install denest@denest`. Use `/mcp` to sign in to DeNest if prompted.

For Codex, add the marketplace once with `codex plugin marketplace add yoellevy/denest-plugin`. Open Plugins in the desktop app, choose DeNest and install it. Complete the Denest sign-in action, then start a new chat. Once the marketplace is added, [open the install screen](codex://plugins/install/denest?marketplace=denest).

Ask your coding agent to use DeNest to map your current project. The setup skill guides workspace creation. Each user signs in with their own verified Google account. Model generation requires that user's OpenRouter key in the hosted app settings.

## What runs locally

The helper inventories files, hashes and structural metadata. It recognizes Markdown headings and local links, plus explicitly declared `.logic.json` structures. Other text files are inventoried without semantic parsing. It skips common secret files, symbolic links, binary files, generated directories and its own `.denest` state. Review your project's contents and choose the workspace scope before uploading metadata. File names, paths and headings can themselves contain confidential information.

Source excerpts require explicit authorization and the helper's `--allow-evidence` option. Evidence reads are bounded to the server's requested paths, hashes and ranges. The helper writes local state under `.denest`, with a local ignore file. It makes no network requests and stores no account credentials. The coding agent sends approved data using its existing authenticated MCP connection.

The hosted service performs retrieval, graph generation and planning. The public package exposes the connection and data format, local inventory behavior, and user guidance.

## Local helper

Run `node scripts/connector.mjs scan --root <project-directory>` from the installed plugin directory. The output identifies the local metadata snapshot and stable workspace ID. The bundled skill handles sending that snapshot and requesting a graph.

For an authorized evidence request, pass its JSON request array on standard input to `node scripts/connector.mjs evidence --root <project-directory> --allow-evidence`. It writes a bounded local evidence packet. Remove the local `.denest/evidence.json` after use.

Use the setup skill to obtain a sanitized connection report when troubleshooting. Keep authorization codes, cookies and model keys out of support reports.

This repository contains the public client package. Zod's license is included in `THIRD_PARTY_NOTICES.txt`.
