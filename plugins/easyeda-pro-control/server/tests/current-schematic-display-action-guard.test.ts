/** No application method runs here. Local V8 compiles only pinned definitions;
 * normalized event matching and fixed native messages grant no live owner. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_REQUESTS as REQUESTS, CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_ROLES as ROLES,
  CURRENT_SCHEMATIC_DISPLAY_ACTION_GUARD_SITES as SITES, currentSchematicDisplayActionGuardCommand as command,
  matchCurrentSchematicDisplayActionGuardEvent as match, validateCurrentSchematicDisplayActionGuardCommand as validate,
  currentSchematicDisplayActionGuardWire as wire } from "../src/current-schematic-display-action-guard-protocol.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as ACTION } from "../src/generated-schematic-display-action-source.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as ACCESSOR } from "../src/generated-schematic-display-accessor-source.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";

void test("original refusal guards have six fixed sites, selector-free wire and no resume grammar", () => {
  assert.deepEqual(REQUESTS, { cdpRequests: 3, bindingControls: 1, resumeRequests: 0, mutationAuthorized: false });
  for (const variant of [0, 1] as const) { for (const role of ROLES) {
    const original = command(role, variant, "original_script"); assert.deepEqual(original.params.location, { scriptId: "original_script", ...SITES[variant][role] });
    assert.deepEqual(wire(original, 67).request, { action: "schematic-display-action-guard", requestId: 67, role });
    assert.throws(() => validate({ ...original, method: "Debugger.resume" }));
    assert.throws(() => validate({ ...original, params: { location: { ...original.params.location, columnNumber: original.params.location.columnNumber + 1 } } }));
    assert.throws(() => validate({ ...original, callerCode: "void 0" }));
  } }
  assert.throws(() => command("run", 0, "script with caller input")); assert.throws(() => wire(command("run", 0, "script"), 0));
});

void test("only exact original session, installed point and location retain a guard pause", () => {
  const site = Object.freeze({ role: "run" as const, scriptId: "original_script", ...SITES[0].run }); const points = new Map([["original_point", site]]);
  const event: DiagnosticEvent = { method: "Debugger.paused", sessionId: "original_ui", params: { hitBreakpoints: ["original_point"], callFrames: [{ location: { scriptId: site.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } }] } };
  assert.equal(match(event, "original_ui", points, null), "held");
  assert.equal(match(event, null, points, null), null); assert.equal(match({ ...event, sessionId: "other_ui" }, "original_ui", points, null), null);
  assert.equal(match({ ...event, params: { ...event.params, hitBreakpoints: ["foreign_point"] } }, "original_ui", points, null), null);
  assert.equal(match({ ...event, params: { ...event.params, hitBreakpoints: ["original_point", "other_point"] } }, "original_ui", points, null), null);
  assert.equal(match({ ...event, params: { ...event.params, callFrames: [{ location: { ...site, columnNumber: site.columnNumber + 1 } }] } }, "original_ui", points, null), null);
  const resolved: DiagnosticEvent = { method: "Debugger.breakpointResolved", sessionId: "original_ui", params: { breakpointId: "original_point", location: { scriptId: site.scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } } };
  assert.equal(match(resolved, "original_ui", points, null), "resolved");
  // A pause may precede its original arm ACK. It can only refuse; the Core
  // Issues its packet from all three exact native replies independently.
  assert.equal(match(event, "original_ui", new Map(), site), "held"); assert.equal(match(resolved, "original_ui", new Map(), site), "resolved");
  assert.equal(match({ ...event, method: "Debugger.resumed" }, "original_ui", points, null), null);
});

const SETTER = 'set FIELD(t){t!==this._FIELD&&(this._guideLine=null,this.shapeManager.modifyMonitor.record({model:this,attr:"FIELD",oldValue:this._FIELD,newValue:this._FIELD=t}))}';
const RUN = String.raw`run(t,r){return new Promise(n=>{let s=this.useAction(r);s?(s.start(),HELPER(t,{success(a){s.end(),n(!0)},failure(a){console.warn("\u4E8B\u52A1\u8FD0\u884C\u5931\u8D25\uFF1A",a),s.cancel(),n(!1)}})):n(!1)})}`;
void test("actual Node24 resolves each pinned method to a pre-effect first statement without executing it", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const variant of [0, 1] as const) { for (const role of ROLES) {
      const raw = role === "run" ? RUN.replace("HELPER", variant === 0 ? "bO" : "PO") : SETTER.replaceAll("FIELD", role);
      const profile = role === "run" ? ACTION[variant].methods.runnerRun : ACCESSOR[variant].methods[role === "x" ? "x.set" : "y.set"];
      assert.equal(Buffer.byteLength(raw), profile.bytes); assert.equal(createHash("sha256").update(raw).digest("hex"), profile.sha256);
      const prefix = "(class{"; const expression = `${"\n".repeat(profile.lineNumber)}${prefix}${" ".repeat(profile.columnNumber - raw.indexOf("(") - prefix.length)}${raw}})`;
      const compiled = await session.post("Runtime.compileScript", { expression, sourceURL: `inert-sch-refusal-${String(variant)}-${role}.js`, persistScript: true }); assert.ok(compiled.scriptId !== undefined);
      const armed = await session.post("Debugger.setBreakpoint", { location: { scriptId: compiled.scriptId, lineNumber: profile.lineNumber, columnNumber: profile.columnNumber } });
      assert.deepEqual(armed.actualLocation, { scriptId: compiled.scriptId, ...SITES[variant][role] });
      const relative = armed.actualLocation.columnNumber - profile.columnNumber + raw.indexOf("("); assert.ok(relative < raw.indexOf(role === "run" ? "new Promise" : "this._guideLine=null"));
      await session.post("Debugger.removeBreakpoint", { breakpointId: armed.breakpointId });
    } }
  } finally { session.disconnect(); }
});
