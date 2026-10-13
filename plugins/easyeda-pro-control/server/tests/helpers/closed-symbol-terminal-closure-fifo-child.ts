/** Owned synthetic Linux child only: reproduce the exact pre-open FIFO race. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { constants } from "node:fs";
import { lstat, open } from "node:fs/promises";
import { dirname, resolve } from "node:path";

async function run(): Promise<void> {
  const path = process.argv[2];
  const mode = process.argv[3];
  const root = process.env["EASYEDA_FIFO_TEST_ROOT"];
  assert.ok(root !== undefined && /^\/tmp\/easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u.test(root));
  assert.ok(path !== undefined && resolve(path) === path && dirname(dirname(path)) === root);
  assert.ok(mode === "old" || mode === "fixed");
  const before = await lstat(path); assert.equal(before.isFile(), true);
  process.stdout.write("REGULAR\n");
  await once(process.stdin, "data"); process.stdin.pause();
  // oxlint-disable-next-line eslint/no-bitwise -- Compare the exact old and proposed fixed native read flags in this isolated synthetic child.
  const flags = constants.O_RDONLY | constants.O_NOFOLLOW | (mode === "fixed" ? constants.O_NONBLOCK : 0);
  const handle = await open(path, flags);
  try { const opened = await handle.stat(); assert.equal(opened.isFile(), false); process.stdout.write("FIFO-REFUSED\n"); }
  finally { await handle.close(); }
}
// oxlint-disable-next-line node/no-top-level-await -- Fixed standalone test child, never loaded by production code.
await run();
