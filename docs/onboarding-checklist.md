# Onboarding release checks

Use the installed package's denest-setup skill with the scenario below. Verify actions and outcomes, not exact prose. These scenarios also document the limits of package-only changes: the host owns connection UI and tool loading.

| Scenario | Required behavior |
| --- | --- |
| Tool access already works; user asks to open current project | Call list_projects, continue opening the requested workspace; no repeated sign-in, project-choice question or “say retry” stop. |
| New account with zero projects | Empty list_projects succeeds; report Ready and continue. Do not create a diagnostic test project. |
| Installed, host explicitly reports not connected | Open that installed connection's native sign-in; retain original request. Verify list_projects after completion before reporting Ready. |
| Host says connected; tools absent in current chat | Refresh discovery once and select/refresh the hosted plugin if supported. Do not infer expired credentials or add a manual MCP duplicate. |
| Local Codex works; ChatGPT project chat lacks hosted connection | Inspect/register the personal hosted connection with user authorization and complete its account sign-in. Do not use the author's personal app ID or treat local auth as hosted proof. |
| Tool returns authentication required | Complete native sign-in, rediscover and retry once; no repeated loop. |
| Tool returns network, permission or schema error | Report the observed error and its relevant next action, not a generic reconnect instruction. |
| Browser shows successful sign-in but tool check fails | Do not say Ready. Explain the remaining tool-access failure. |
| Host does not expose controls or diagnostics | State what cannot be verified and give one supported next step; do not invent a button or claim sign-in is broken. |
| Existing canvas, no model key | Read-only readiness check does not require model generation. Explain a key requirement only if the actual server/page requires it. |

For every release, run `node scripts/check-package.mjs` and the packaged helper's existing tests. Validate both SKILL.md files with the skill validator when available. Test a clean installation with no credentials and an authenticated installation separately. A local protocol check does not establish that a hosted project chat or a fresh user's entire sign-in flow has passed.
