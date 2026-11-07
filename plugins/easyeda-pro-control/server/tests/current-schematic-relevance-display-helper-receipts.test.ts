import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicRelevanceDisplayHelperReceipts } from "../src/current-schematic-relevance-display-helper-receipts.ts";
import { CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS } from "../src/current-project-library-refresh-programs.ts";

const command = (): object => Object.freeze({ method: "Runtime.callFunctionOn", params: Object.freeze({ functionDeclaration: CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.capture }) });
const event = (scriptId: string, executionContextId = 7): object => Object.freeze({ method: "Debugger.scriptParsed", params: Object.freeze({ scriptId, executionContextId, url: "" }) });
void test("a source receipt joins original command, actual script and original reply exactly once", async () => {
  const cursor = new CurrentSchematicRelevanceDisplayHelperReceipts(); const c = command(); const e = event("helper"); const raw = Object.freeze({ result: {} }); let reads = 0;
  cursor.register(c); cursor.observe(e, 7, "project");
  await cursor.verify(c, raw, id => { reads += 1; assert.equal(id, "helper"); return Promise.resolve({ scriptSource: `(${CURRENT_PROJECT_LIBRARY_REFRESH_PROGRAMS.capture})` }); });
  await cursor.requireVerified(e); assert.equal(reads, 1);
  await assert.rejects(cursor.verify({ ...c }, raw, () => { throw new Error("not reached"); }));
  await assert.rejects(cursor.verify(c, raw, () => { throw new Error("not reached"); })); assert.equal(reads, 1);
});
void test("missing or foreign original source refuses without a receipt or another native read", async () => {
  const missing = new CurrentSchematicRelevanceDisplayHelperReceipts(); const c = command(); missing.register(c); let reads = 0;
  await assert.rejects(missing.verify(c, {}, () => { reads += 1; return Promise.resolve({}); })); assert.equal(reads, 0);
  const foreign = new CurrentSchematicRelevanceDisplayHelperReceipts(); const f = command(); const e = event("changed"); foreign.register(f); foreign.observe(e, 7, "project");
  await assert.rejects(foreign.verify(f, {}, () => { reads += 1; return Promise.resolve({ scriptSource: "(function(){return true;})" }); }));
  await assert.rejects(foreign.requireVerified(e)); assert.equal(reads, 1);
  assert.throws(() => { new CurrentSchematicRelevanceDisplayHelperReceipts().observe(event("foreign", 8), 7, "project"); });
});
void test("getter and proxy source substitutions are rejected without invoking a hook", async () => {
  for (const kind of ["getter", "proxy"] as const) { const cursor = new CurrentSchematicRelevanceDisplayHelperReceipts(); const c = command(); cursor.register(c); cursor.observe(event(kind), 7, "project"); let hooks = 0;
    const raw = kind === "getter" ? Object.defineProperty({}, "scriptSource", { get: (): string => { hooks += 1; return ""; } }) : new Proxy({}, { ownKeys: (): string[] => { hooks += 1; return []; } });
    await assert.rejects(cursor.verify(c, {}, () => Promise.resolve(raw))); assert.equal(hooks, 0);
  }
});
