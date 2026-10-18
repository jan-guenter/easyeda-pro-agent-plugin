/** Synthetic preload/parent identity regression. Never imports application code. */
import assert from "node:assert/strict";
import { assertTestIsolation, testIsolation } from "../../../scripts/test-isolation.ts";
import { assertParentTestRoot } from "./parent-test-root.ts";

async function run(): Promise<void> {
  assert.equal(process.argv.length, 3);
  const parent = await assertParentTestRoot(process.argv[2]);
  const original = await assertTestIsolation();
  assert.equal(original, testIsolation);
  // A later fixture TMPDIR change must not redefine the original preload root.
  process.env["TMPDIR"] = "/nonexistent-synthetic-temporary-directory";
  assert.equal(await assertTestIsolation(), original);
  process.env["EASYEDA_CONTROL_DATA_DIR"] = parent;
  await assert.rejects(assertTestIsolation());
  process.env["EASYEDA_CONTROL_DATA_DIR"] = original.directory;
  assert.equal(await assertTestIsolation(), original);
  const repeated = await import("../../../scripts/test-isolation.ts");
  assert.equal(repeated.testIsolation, original);
  process.stdout.write(JSON.stringify({ ...original, parent }));
}
// oxlint-disable-next-line node/no-top-level-await -- Fixed child must finish identity checks before ordinary exit.
await run();
