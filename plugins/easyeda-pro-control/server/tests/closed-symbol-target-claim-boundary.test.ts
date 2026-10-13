import assert from "node:assert/strict";
import fsPromises, { chmod, link, lstat, mkdir, readFile, readdir, rename, truncate, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, dirname, join } from "node:path";
import { test } from "node:test";
import { claimClosedSymbolValidationTarget } from "../src/closed-symbol-target-claim.ts";
import { fixture, slotPath } from "./helpers/closed-symbol-target-claim-fixture.ts";

for (const boundary of ["slot", "parent"] as const) {
  void test(`successful ${boundary} cleanup cannot hide a removed named reservation`, async (context) => {
    const f = fixture(), path = slotPath(f.request), selectedPath = boundary === "slot" ? path : dirname(path);
    const preserved = `${selectedPath}-preserved-${basename(path)}`;
    const originalOpen = fsPromises.open; let changed = false, selected = false;
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
      const handle = await originalOpen(...args);
      if (!selected && basename(String(args[0])) === basename(selectedPath)) {
        selected = true; const close = handle.close.bind(handle);
        context.mock.method(handle, "close", async (): Promise<void> => {
          await close();
          await rename(selectedPath, preserved); await mkdir(selectedPath, { mode: 0o700 });
          changed = true;
        });
      }
      return handle;
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan));
      assert.equal(changed, true);
      const claimPath = boundary === "slot" ? join(preserved, "claim.json") : join(preserved, basename(path), "claim.json");
      const bytes = await readFile(claimPath); assert.ok(bytes.length > 0); assert.deepEqual(await readdir(selectedPath), []);
      const info = await lstat(preserved); assert.equal(info.isDirectory(), true);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  });
}

for (const change of ["same-byte-inode", "same-size-bytes", "mode", "hardlink", "growth"] as const) {
  void test(`final slot cleanup ${change} cannot return a stale claim receipt`, async (context) => {
    const f = fixture(), originalOpen = fsPromises.open, path = slotPath(f.request); let changed = false, selected = false;
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
      const handle = await originalOpen(...args);
      if (!selected && basename(String(args[0])) === basename(path)) {
        selected = true; const close = handle.close.bind(handle);
        context.mock.method(handle, "close", async (): Promise<void> => {
          await close();
          const file = join(path, "claim.json"); const bytes = await readFile(file);
          if (change === "same-byte-inode") { await rename(file, join(path, "original-preserved.json")); await writeFile(file, bytes, { mode: 0o600, flag: "wx" }); }
          if (change === "same-size-bytes") { const changedBytes = Buffer.from(bytes); changedBytes[0] = 0x20; await writeFile(file, changedBytes); }
          if (change === "mode") { await chmod(file, 0o640); }
          if (change === "hardlink") { await link(file, join(path, "extra-link")); }
          if (change === "growth") { await truncate(file, 131_073); }
          changed = true;
        });
      }
      return handle;
    }); syncBuiltinESMExports();
    try { await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan)); assert.equal(changed, true); }
    finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
    await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan), { code: "EEXIST" });
  });
}
