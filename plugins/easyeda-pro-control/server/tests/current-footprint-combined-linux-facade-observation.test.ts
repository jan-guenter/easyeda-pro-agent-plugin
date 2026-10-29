/** Actual observer with synthetic /proc metadata, never real process actions. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { test } from "node:test";
import { transform } from "esbuild";
import type { observeOtherCurrentFootprintCombinedLinuxFacade } from "../src/current-footprint-combined-linux-facade-observation.ts";

async function observer(argv: string, pid = "222", changedStart = false): Promise<typeof observeOtherCurrentFootprintCombinedLinuxFacade> {
  const path = new URL("../src/current-footprint-combined-linux-facade-observation.ts", import.meta.url);
  const originalRequire = createRequire(path);
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; let stats = 0;
  const evaluate: unknown = runInThisContext(`(function(require,module,exports,process){${transformed.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "node:fs/promises" ? {
    readdir: (): Promise<unknown> => Promise.resolve([{ name: pid, isDirectory: (): boolean => true }]),
    readFile: (selected: string): Promise<string> => {
      assert.equal(selected, `/proc/${pid}/stat`); stats += 1;
      const fields = ["S", ...Array.from({ length: 18 }, (): string => "0"), changedStart && stats > 1 ? "200" : "100"];
      return Promise.resolve(`${pid} (MainThread) ${fields.join(" ")}`);
    },
    open: (selected: string): Promise<unknown> => {
      assert.equal(selected, `/proc/${pid}/cmdline`);
      return Promise.resolve({ close: (): Promise<void> => Promise.resolve(), read: (buffer: Buffer): Promise<{ bytesRead: number }> => {
        const bytes = Buffer.from(argv); buffer.set(bytes.subarray(0, buffer.length)); return Promise.resolve({ bytesRead: Math.min(buffer.length, bytes.length) });
      } });
    },
  } : originalRequire(name) as unknown, loaded, loaded.exports, Object.freeze({ platform: "linux", pid: 111 })]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual module's only export is invoked unchanged; the fixture substitutes only inert process metadata reads.
  return loaded.exports["observeOtherCurrentFootprintCombinedLinuxFacade"] as typeof observeOtherCurrentFootprintCombinedLinuxFacade;
}
void test("custom roots and deleted/custom runtimes cannot hide normalized facade argv; self, drift and truncation stay bounded", async () => {
  for (const entry of ["/cache/easyeda-pro-control/old/server/dist/server.mjs", "/custom-checkout/server/dist/server.mjs", "server/dist/server.mjs", "./server/dist/server.mjs", "server/dist/./server.mjs", "../server/dist/server.mjs"]) {
    const probe = await observer(`/tmp/custom-pinned-runtime\0${entry}\0`); assert.equal(await probe(), true);
  }
  for (const entry of ["/custom-checkout/server/dist/other.mjs", "server/dist/server.mjs.backup"]) {
    const unrelated = await observer(`/tmp/custom-pinned-runtime\0${entry}\0`); assert.equal(await unrelated(), false);
  }
  const self = await observer("/tmp/custom-pinned-runtime\0/cache/easyeda-pro-control/old/server/dist/server.mjs\0", "111"); assert.equal(await self(), false);
  const drift = await observer("/tmp/custom-pinned-runtime\0/cache/easyeda-pro-control/old/server/dist/server.mjs\0", "222", true); await assert.rejects(drift());
  const oversized = await observer("x".repeat(16_385)); await assert.rejects(oversized());
});
