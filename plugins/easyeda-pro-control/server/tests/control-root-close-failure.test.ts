import assert from "node:assert/strict";
import fsPromises, { mkdir, mkdtemp } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join } from "node:path";
import { mock, test } from "node:test";

import { openControlRootCapability } from "../src/control-root.ts";

for (const nested of [false, true]) {
  void test(`directory transfer closes the new child when ${nested ? "nested" : "root"} parent close fails`, async () => {
    const isolated = process.env["EASYEDA_CONTROL_DATA_DIR"];
    assert.match(isolated ?? "", /easyeda-test-control-/u);
    assert.ok(isolated !== undefined);
    const directory = await mkdtemp(join(isolated, "close-failure-"));
    const parent = nested ? await openControlRootCapability(directory) : undefined;
    const target = nested ? join(directory, "child") : directory;
    if (nested) { await mkdir(target, { mode: 0o700 }); }
    const originalOpen = fsPromises.open;
    const opened: { path: string; closed: boolean; attempts: number; close: () => Promise<void> }[] = [];
    let injected = false;
    const failure = new Error("synthetic parent close failure");
    const spy = mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>) => {
      const handle = await originalOpen(...args);
      const originalClose = handle.close.bind(handle);
      const entry = { path: String(args[0]), closed: false, attempts: 0, close: originalClose };
      opened.push(entry);
      handle.close = async (): Promise<void> => {
        entry.attempts += 1;
        if (entry === opened[0] && !injected) {
          injected = true;
          throw failure;
        }
        await originalClose();
        entry.closed = true;
      };
      return handle;
    });
    syncBuiltinESMExports();
    try {
      await assert.rejects(parent === undefined ? openControlRootCapability(target) : parent.openDirectory(target, false),
        (error: unknown) => error === failure);
      assert.equal(injected, true);
      assert.ok(opened.length >= 2);
      assert.deepEqual(opened.filter((entry) => !entry.closed).map((entry) => entry.path), []);
      assert.equal(opened[1]?.attempts, 1, "The acquired child needs its own cleanup attempt.");
    } finally {
      spy.mock.restore();
      syncBuiltinESMExports();
      for (const entry of opened) { if (!entry.closed) { await entry.close(); } }
      await parent?.close();
    }
  });
}
