import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async path => JSON.parse(await readFile(new URL('../' + path, import.meta.url), 'utf8'));
const plugin = await read('plugin.json');
const claude = await read('.claude-plugin/plugin.json');
const portable = await read('mcp.json');
const legacy = await read('.mcp.json');
assert.equal(plugin.$schema, 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
assert.equal(plugin.version, claude.version, 'Client package versions must match');
assert.equal(portable.mcpServers.denest.type, 'streamable-http');
// Current Codex desktop rejects server-level extensions in portable mcp.json.
// OAuth is discovered from the protected HTTPS endpoint instead.
assert.equal(portable.mcpServers.denest.extensions, undefined);
assert.equal(claude.mcpServers, './.mcp.json');
for (const config of [portable, legacy]) {
  assert.equal(config.mcpServers.denest.url, 'https://denest.ai/api/mcp', 'Use the canonical OAuth resource in every client');
}
await readFile(new URL('../' + plugin.extensions['com.openai'].onboardingSkill, import.meta.url));
console.log(`DeNest ${plugin.version}: package identity, entry points and connection settings verified.`);
