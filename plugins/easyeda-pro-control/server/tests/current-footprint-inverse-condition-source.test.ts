/** Inert Node Inspector only. No app, native helper, owner or resume grant. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { createContext, runInContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_FOOTPRINT_INVERSE_CONDITION_ROLES as ROLES, currentFootprintInverseConditionBudget, currentFootprintInverseConditionNativeFrame, currentFootprintInverseConditionText, currentFootprintInverseConditionWire, qualifyCurrentFootprintInverseConditionSource } from "../src/current-footprint-inverse-condition-source.ts";

const frame = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);

void test("inverse persistent conditions are exact registered literals with separate occurrence bounds", () => {
  assert.equal(currentFootprintInverseConditionBudget(512), 1026); assert.throws(() => currentFootprintInverseConditionBudget(513));
  for (const role of ROLES) {
    const text = currentFootprintInverseConditionText(role); const match = qualifyCurrentFootprintInverseConditionSource(text, [role], 9);
    assert.equal(match.maximum, role === "startupEntry" || role === "startupReturn" ? 18 : 1);
    assert.throws(() => qualifyCurrentFootprintInverseConditionSource(text, [], 9));
    assert.throws(() => qualifyCurrentFootprintInverseConditionSource(`(${text})`, [role], 9));
  }
  const wire = currentFootprintInverseConditionWire(79, "original-worker", "original-condition");
  assert.deepEqual(currentFootprintInverseConditionNativeFrame(frame(wire), "original-condition", "original-worker"), { action: "footprint-inverse-condition-source", requestId: 79, scriptId: "original-condition" });
  assert.throws(() => currentFootprintInverseConditionNativeFrame(frame({ ...wire, params: { scriptId: "foreign" } }), "original-condition", "original-worker"));
  assert.throws(() => currentFootprintInverseConditionNativeFrame(frame({ ...wire, expression: "caller text" }), "original-condition", "original-worker"));
});

void test("actual Node Inspector emits each executed condition verbatim after arm, separately from runtime helpers", async () => {
  const session = new Session(); session.connect(); const scripts: { scriptId: string; url: string }[] = []; let pauses = 0;
  const resumePromises:Promise<void>[]=[];

  session.on("Debugger.scriptParsed", event => { scripts.push({ scriptId: event.params.scriptId, url: event.params.url }); });
  session.on("Debugger.paused", () => { pauses += 1; resumePromises.push(session.post("Debugger.resume")); });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const context = createContext({}); runInContext("globalThis.inertInverseCondition=function(){ return 19; };\n//# sourceURL=inert-inverse-condition", context);
    const target = scripts.find(event => event.url === "inert-inverse-condition"); assert.ok(target !== undefined);
    const before = scripts.length, condition = currentFootprintInverseConditionText("startupEntry");
    await session.post("Debugger.setBreakpoint", { location: { scriptId: target.scriptId, lineNumber: 0, columnNumber: 43 }, condition });
    assert.equal(scripts.length, before);
    runInContext("inertInverseCondition()", context); runInContext("inertInverseCondition()", context);
    await Promise.all(resumePromises);
    let receipts = 0;
    for (const event of scripts.slice(before).filter(value => value.url === "")) {
      const reply = await session.post("Debugger.getScriptSource", { scriptId: event.scriptId });
      if (reply.scriptSource === condition) { receipts += 1; assert.equal(qualifyCurrentFootprintInverseConditionSource(reply.scriptSource, ["startupEntry"], 1).text, condition); }
    }
    assert.equal(pauses, 2); assert.equal(receipts, 2);
  } finally { session.disconnect(); }
});
