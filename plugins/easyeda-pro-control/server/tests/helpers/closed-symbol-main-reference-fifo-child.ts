import assert from "node:assert/strict";
import { constants } from "node:fs";
import fs from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, dirname, isAbsolute, join } from "node:path";
import { mock } from "node:test";
import { fileURLToPath } from "node:url";
import { MAIN_REFERENCE_FIFO_REQUEST, MAIN_REFERENCE_PLUGIN_URL, selectMainReferenceFifoCompiler, snapshotMainReferenceSources } from "./closed-symbol-main-reference-fifo-fixture.ts";

async function main(): Promise<void> {
  assert.equal(process.version, "v24.18.0");
  assert.ok(process.getuid !== undefined); const uid = process.getuid();
  const [kind, directory] = process.argv.slice(2);
  assert.ok(kind === "live" || kind === "recorded"); assert.ok(directory !== undefined);
  assert.equal(process.argv.length, 4);
  const childRoot = process.env["EASYEDA_CONTROL_DATA_DIR"], root = process.env["EASYEDA_FIFO_TEST_ROOT"];
  for (const path of [root, childRoot]) { assert.ok(path !== undefined && isAbsolute(path) && /^easyeda-test-control-[0-9]+-[a-zA-Z0-9]+$/u.test(basename(path))); }
  assert.ok(root !== undefined && childRoot !== undefined); assert.notEqual(childRoot, root);
  assert.equal(process.env["EASYEDA_BRIDGE_TOKEN_FILE"], join(childRoot, "bridge-token"));
  assert.equal(process.env["EASYEDA_UPSTREAM_DATA_DIR"], join(childRoot, "upstream"));
  assert.equal(dirname(directory), root); assert.match(basename(directory), /^main-reference-fifo-[A-Za-z0-9]+$/u);
  for (const path of [root, directory, childRoot]) {
    const stat = await fs.lstat(path);
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink() && stat.uid === uid);
    assert.equal(stat.mode % 512, 0o700); assert.equal(await fs.realpath(path), path);
  }
  const sources = await snapshotMainReferenceSources();
  const fifo = join(directory, "owner-source.fifo"), fifoBefore = await fs.lstat(fifo);
  assert.ok(fifoBefore.isFIFO() && !fifoBefore.isSymbolicLink() && fifoBefore.uid === uid && fifoBefore.nlink === 1);
  assert.equal(fifoBefore.mode % 512, 0o600);
  const open = fs.open;
  let intercepted = 0;
  let fifoFlags: Parameters<typeof fs.open>[1] | undefined;
  let fifoHandle: FileHandle | undefined;
  const ownerPath = fileURLToPath(new URL("scripts/main-reference/owner-command.ps1", MAIN_REFERENCE_PLUGIN_URL));
  const interception = mock.method(fs, "open", async (path: Parameters<typeof fs.open>[0], flags: Parameters<typeof fs.open>[1], mode?: Parameters<typeof fs.open>[2]) => {
    if (path !== ownerPath) { return open(path, flags, mode); }
    intercepted += 1; assert.equal(intercepted, 1); assert.equal(mode, undefined);
    // The exact compiler path alone is redirected to this child's owned FIFO;
    // No packaged bytes, compiler result or process-spawn API is replaced.
    const current = await fs.lstat(fifo);
    assert.equal(current.dev, fifoBefore.dev); assert.equal(current.ino, fifoBefore.ino); assert.ok(current.isFIFO());
    process.stdout.write("FIFO_OPEN\n");
    fifoHandle = await open(fifo, flags, mode);
    fifoFlags = flags;
    return fifoHandle;
  });
  syncBuiltinESMExports();
  try {
    const compile = await selectMainReferenceFifoCompiler(kind);
    await assert.rejects(compile(MAIN_REFERENCE_FIFO_REQUEST), { message: "Main reference transport refused." });
    assert.equal(intercepted, 1); assert.ok(fifoHandle !== undefined); assert.equal(fifoHandle.fd, -1);
    // oxlint-disable-next-line no-bitwise -- Check after the actual FIFO open and compiler cleanup so an O_NONBLOCK regression reaches the owned-child deadline, not a pre-open assertion.
    assert.equal(fifoFlags, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    process.stdout.write("FIFO_REFUSED_AND_CLOSED\n");
  } finally {
    interception.mock.restore(); syncBuiltinESMExports();
    assert.deepEqual(await snapshotMainReferenceSources(), sources);
  }
}
// oxlint-disable-next-line node/no-top-level-await -- This standalone owned child must await all filesystem work before normal exit; it is not a require(esm) library.
await main();
