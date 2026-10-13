import assert from "node:assert/strict";
import fsPromises, { lstat } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { claimClosedSymbolValidationTarget } from "../src/closed-symbol-target-claim.ts";
import { fixture, slotPath } from "./helpers/closed-symbol-target-claim-fixture.ts";

void test("UID support disappearing during final cleanup cannot issue a claim receipt", async (context) => {
  const f = fixture(), originalOpen = fsPromises.open, path = slotPath(f.request), uidDescriptor = Object.getOwnPropertyDescriptor(process, "getuid");
  assert.ok(uidDescriptor !== undefined); let changed = false, selected = false;
  context.mock.method(fsPromises, "open", async (...args: Parameters<typeof originalOpen>): ReturnType<typeof originalOpen> => {
    const handle = await originalOpen(...args);
    if (!selected && basename(String(args[0])) === basename(path)) {
      selected = true; const close = handle.close.bind(handle);
      context.mock.method(handle, "close", async (): Promise<void> => {
        await close(); Object.defineProperty(process, "getuid", { value: undefined, configurable: true }); changed = true;
      });
    }
    return handle;
  }); syncBuiltinESMExports();
  try { await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan), /UID/u); assert.equal(changed, true); }
  finally { Object.defineProperty(process, "getuid", uidDescriptor); context.mock.restoreAll(); syncBuiltinESMExports(); }
  const retained = await lstat(path); assert.equal(retained.isDirectory(), true);
  await assert.rejects(claimClosedSymbolValidationTarget(f.request, f.plan), { code: "EEXIST" });
});
