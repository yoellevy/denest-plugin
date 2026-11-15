# Optional local Automatic Send bridge

This bridge polls one hosted DeNest pipeline and starts the explicitly selected agent CLI session when a saved request arrives. The canvas and its data remain hosted at `denest.ai`. The temporary loopback listener is used only to finish this bridge's own OAuth sign-in and closes afterward.

Native MCP Events delivery was verified end to end with ChatGPT Work on November 15, 2026. The CLI bridge has automated delivery, interruption and storage tests. Codex, Claude Code, Cursor and Antigravity command adapters are experimental until tested with the installed CLI version on the target computer. They do not promise to wake an existing IDE chat. Do not run a bridge against a session that is already active elsewhere.

## Install and connect

Install Node.js 20 or newer and the chosen agent's official CLI. Sign in to that CLI and connect its own DeNest MCP tools first. Then, from the DeNest plugin repository folder:

```sh
npm ci --prefix bridge --ignore-scripts
node bridge/cli.mjs login --profile my-project
```

Sign in to DeNest in the browser. The bridge verifies `list_projects` before reporting success. It does not borrow agent tokens. Its profile, signing-in state and delivery ledger are stored under your home directory's `.denest/bridge/<profile>`. Credentials are encrypted with a local key in that profile; protect the whole directory as you protect your agent configuration. Never put it in Git or share it.

Choose the exact existing CLI session ID, project ID and workspace folder. Ask the agent to show its session ID or use its own session history; do not guess the latest session. Obtain the project ID from the DeNest canvas URL. Example:

```sh
node bridge/cli.mjs link --profile my-project --agent codex --session SESSION_ID --workspace "C:/Projects/my-project" --project PROJECT_ID --pipeline main
node bridge/cli.mjs start --profile my-project
```

Agent names are `codex`, `claude`, `cursor`, `antigravity`. Executable defaults are `codex`, `claude`, `agent`, `agy`. If the native executable is not on PATH, add `--executable "ABSOLUTE_PATH_TO_EXECUTABLE"` to `link`. Windows batch and PowerShell wrappers are deliberately rejected; choose the native executable. No adapter adds force, unrestricted approval or permission-bypass flags.

Leave `start` running while using Automatic Send; Ctrl+C stops after current work finishes. The bridge is not installed as an always-on service. Each profile links one project/pipeline to one agent session. Use a different profile for a different canvas. Multiple profiles cannot run the same agent session concurrently.

## Verify and recover

Send a small note from the canvas. Confirm that the selected CLI processes it and the canvas reports completion. A successful process exit does not count unless the saved request was acknowledged through DeNest. If an action requires approval that the CLI cannot request in headless mode, review it in the agent rather than broadening permissions to pass the test.

```sh
node bridge/cli.mjs status --profile my-project
node bridge/cli.mjs start --profile my-project --once
```

An interrupted process is never automatically relaunched. Review the session, stop any surviving agent process and run `start --once` to mark interrupted work for review. If an abrupt shutdown left a `profile.lock` or session hash `.lock`, first confirm that its recorded process and any agent child have stopped, then remove only that lock. Do not remove a live worker's lock. Once reviewed, an explicit retry is:

```sh
node bridge/cli.mjs retry --profile my-project --request REQUEST_ID
node bridge/cli.mjs start --profile my-project
```

The host owns agent permissions. Delivery requests contain identifiers; the agent reads their actual contents through its authenticated DeNest tools. Automatic delivery adds no authorization to implement unrelated repository changes.

Adapter references: [Codex CLI](https://developers.openai.com/codex/cli/reference/), [Claude headless](https://code.claude.com/docs/en/headless), [Cursor CLI sessions](https://cursor.com/docs/cli/using), [Antigravity headless](https://antigravity.google/docs/cli/headless/).
