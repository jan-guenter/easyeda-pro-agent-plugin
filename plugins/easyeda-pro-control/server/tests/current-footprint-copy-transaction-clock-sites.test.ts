/** Actual local V8 breakpoint placement over the two native continuation
 * expressions. This is synthetic Node evidence, not embedded EasyEDA V8. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_COPY_TRANSACTION_CLOCK_SITES as SITES } from "../src/current-footprint-copy-transaction-clock.ts";

void test("V8 accepts exact post-await executable clock sites without moving the breakpoints", async () => {
  // Preserve the native declaration positions and expressions independently of
  // The requested profile. Inserting preceding spaces only supplies coordinates.
  let line = "class FootprintClockSites { async buildString(r){let n=r.uuid,l=await qe(),";
  line += `${" ".repeat(36_821 - line.length)}u=r.version;return [this,n,l,qe,u];} async canvasString(s){let a=await qe(),`;
  line += `${" ".repeat(42_317 - line.length)}o=this.projectManager.consistencyManager.getClient();return [this,s,a,qe,o];}}`;
  const source = `${"\n".repeat(109)}${line}\n//# sourceURL=easyeda-footprint-clock-sites.js`;
  const session = new Session(); session.connect();
  let scriptId: string | null = null;
  const pointIds: string[] = [];
  session.on("Debugger.scriptParsed", (event): void => {
    if (event.params.url === "easyeda-footprint-clock-sites.js") { scriptId = event.params.scriptId; }
  });
  try {
    await session.post("Debugger.enable");
    const evaluated = await session.post("Runtime.evaluate", { expression: source }); assert.equal(evaluated.exceptionDetails, undefined);
    assert.ok(scriptId !== null);
    for (const site of SITES) {
      const location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> =
        { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber };
      const result = await session.post("Debugger.setBreakpoint", { location }); pointIds.push(result.breakpointId);
      assert.deepEqual(result.actualLocation, location);
    }
  } finally {
    try { for (const breakpointId of pointIds) { await session.post("Debugger.removeBreakpoint", { breakpointId }); } }
    finally { session.disconnect(); }
  }
});
