/** Static build check only. Never imports the owner, refreshes pins, starts a
 * process or opens application/control data. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";

const MAX_BYTES = 1024 * 1024;
function refuse(reason: string): never { throw new Error(`Diagnostic helper identity check refused: ${reason}.`); }
async function readBounded(relative: string): Promise<Buffer> {
  // oxlint-disable-next-line eslint/no-bitwise -- Combine kernel open flags to refuse final-component symlink substitution in the static source check.
  const handle = await open(new URL(relative, import.meta.url), constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile() || before.size === 0 || before.size > MAX_BYTES) { refuse("regular bounded source required"); }
    const bytes = Buffer.alloc(MAX_BYTES + 1); let offset = 0;
    while (offset < bytes.length) {
      const chunk = await handle.read(bytes, offset, bytes.length - offset, null);
      if (chunk.bytesRead === 0) { break; } offset += chunk.bytesRead;
    }
    const after = await handle.stat();
    if (offset !== before.size || offset > MAX_BYTES || before.size !== after.size || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
      refuse("source changed or exceeded the unchanged1MiB bound");
    }
    return bytes.subarray(0, offset);
  } finally { await handle.close(); }
}
function one(source: string, pattern: RegExp, label: string): string {
  const matches = [...source.matchAll(pattern)]; const value = matches[0]?.[1];
  if (matches.length !== 1 || value === undefined) { refuse(`${label} must occur exactly once`); } return value;
}
async function main(): Promise<void> {
  if (process.argv.length !== 2) { refuse("no arguments or write mode are supported"); }
  const [helper, ownerBytes, smokeBytes] = await Promise.all([
    readBounded("pcb-diagnostic-owner.ps1"), readBounded("../server/src/current-pcb-diagnostic-owner.ts"), readBounded("pcb-diagnostic-launch-smoke.ps1"),
  ]);
  if (helper.some((byte) => byte > 0x7F)) { refuse("helper must remain ASCII for Windows PowerShell5 source loading"); }
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const owner = decoder.decode(ownerBytes), smoke = decoder.decode(smokeBytes);
  const digest = createHash("sha256").update(helper).digest("hex");
  const ownerLength = Number(one(owner, /^const HELPER_BYTES = ([0-9_]+);$/gmu, "owner byte pin").replaceAll("_", ""));
  const ownerHash = one(owner, /^const HELPER_SHA256 = "([a-f0-9]{64})";$/gmu, "owner hash pin");
  const smokeLength = Number(one(smoke, /^if \(\$bytes\.Length -ne ([0-9]+)\) \{throw 'synthetic-launch-helper-size'\}$/gmu, "Windows smoke byte pin"));
  const smokeHash = one(smoke, /^if \(\$helperHash -cne '([a-f0-9]{64})'\) \{$/gmu, "Windows smoke hash pin");
  const smokeCap = Number(one(smoke, /^\$bytes = Read-BoundedFile \$helper ([0-9]+)$/gmu, "Windows smoke byte cap"));
  if (ownerLength !== helper.length || smokeLength !== helper.length || ownerHash !== digest || smokeHash !== digest || smokeCap !== MAX_BYTES) {
    refuse("actual helper, owner pins or independent Windows smoke pins/cap differ");
  }
  process.stdout.write(`${JSON.stringify({ ok: true, bytes: helper.length, sha256: digest, maximumBytes: MAX_BYTES, ascii: true })}\n`);
}
// oxlint-disable-next-line node/no-top-level-await -- This fixed build command reads source files only and has no application runtime imports.
await main();
