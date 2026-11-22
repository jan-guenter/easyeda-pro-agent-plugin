/** Own finite guard grammar and actual original-source breakpoint ACKs only.
 * No EasyEDA process, original writer, native helper or function is invoked. */
/* oxlint-disable import/max-dependencies -- Own/legacy routes and both whole-source qualification and actual Inspector ACKs require independent modules. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { runInNewContext } from "node:vm";
import { matchCurrentSchematicDisplayActionGuardEvent } from "../src/current-schematic-display-action-guard-protocol.ts";
import { Session } from "node:inspector/promises";
import { join } from "node:path";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_WIRE_WRITER_V4_RUN_GUARD_REQUESTS as REQUESTS, currentSchematicWireWriterV4RunGuardCommand as command,
  decodeCurrentSchematicWireWriterV4RunGuardReply as reply, validateCurrentSchematicWireWriterV4RunGuardCommand as validate } from "../src/current-schematic-wire-writer-v4-run-guard.ts";
import { currentSchematicWireWriterV4NativeRequest as encode } from "../src/current-schematic-wire-writer-v4-protocol.ts";
import { currentSchematicWireEditNativeRequest as legacy } from "../src/current-schematic-wire-edit-protocol.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest as text } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as SOURCE } from "../src/generated-schematic-display-action-source.ts";
import { qualifyCurrentSchematicWireAccessorSource } from "../src/current-schematic-wire-accessor-observer.ts";

const wire = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("v4 run guard is one fixed refusal point, with no resume, setter or caller program", () => {
  assert.deepEqual(REQUESTS, { normal: 1, cleanup: 0, total: 1, bindingControls: 1, resumeRequests: 0 });
  for (const variant of [0, 1] as const) {
    const fixed = command(variant, "123.1"), packet = { id: 1, ...fixed, schematicWireWriterV4RunGuardCommand: true, sessionId: "123.2" };
    assert.deepEqual(encode(wire(packet)), { action: "schematic-wire-writer-v4-run-guard", requestId: 1 });
    assert.throws(() => legacy(wire(packet))); assert.throws(() => text(wire(packet)));
    assert.throws(() => encode(wire({ ...packet, params: { ...fixed.params, condition: "false" } })));
    for (const changed of [{ ...fixed, role: "x" }, { ...fixed, method: "Debugger.resume", params: {} }, { ...fixed, variant: 2 },
      { ...fixed, params: { location: { ...fixed.params.location, columnNumber: fixed.params.location.columnNumber + 1 } } }]) { assert.throws(() => validate(changed)); }
    assert.equal(reply({ breakpointId: "4:30:68474:123.1", actualLocation: fixed.params.location }, fixed), "4:30:68474:123.1");
    assert.throws(() => reply({ breakpointId: "foreign", actualLocation: { ...fixed.params.location, scriptId: "foreign" } }, fixed));
  }
});
void test("v4 fixed run locations resolve before the first statement in both complete qualified installed bundles", {
  skip: process.env["EASYEDA_ASSETS_ROOT"] === undefined ? "Installed assets root is required for original source checks" : false,
}, async () => {
  const assets = process.env["EASYEDA_ASSETS_ROOT"]; assert.ok(assets !== undefined);
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const variant of [0, 1] as const) {
      const profile = SOURCE[variant]; const source: string = await readFile(join(assets, profile.relativePath), { encoding: "utf8" });
      assert.equal(qualifyCurrentSchematicWireAccessorSource({ scriptSource: source }), variant);
      const prefix = "({", row = profile.methods.runnerRun;
      const inert = `${source.slice(0, row.start - prefix.length).replaceAll(/[^\r\n]/gu, character => " ".repeat(character.length))}${prefix}${source.slice(row.start, row.end)}})`;
      const compiled = await session.post("Runtime.compileScript", { expression: inert, sourceURL: `wire-v4-run-source-${String(variant)}`, persistScript: true });
      assert.equal(compiled.exceptionDetails, undefined); assert.ok(compiled.scriptId !== undefined);
      const fixed = command(variant, compiled.scriptId); const posted: Promise<unknown> = session.post("Debugger.setBreakpoint", fixed.params); const actual = await posted;
      const breakpoint = reply(actual, fixed); assert.ok(breakpoint.length > 0);
      const locations = await session.post("Debugger.getPossibleBreakpoints", { start: fixed.params.location, restrictToFunction: true });
      const first = locations.locations[0]; assert.ok(first !== undefined); assert.equal(first.lineNumber, fixed.params.location.lineNumber); assert.equal(first.columnNumber, fixed.params.location.columnNumber);
      await session.post("Debugger.removeBreakpoint", { breakpointId: breakpoint });
    }
  } finally { session.disconnect(); }
});

void test("unchanged Core run-event body retains the original matching pause and fails the same generation", async () => {
  const source = await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8");
  const start = source.indexOf("  #observeSchematicWireWriterV4RunGuardEvent(event: DiagnosticEvent): boolean {");
  const end = source.indexOf("  public async executeSchematicDisplayStage(", start); assert.ok(start !== -1 && end > start);
  const method = source.slice(start, end), site = command(0, "owned_script").params.location;
  const original = `class OriginalEventBody {
    #purpose="schematic-wire-writer-v4-209"; #wireV4RunGuardSession="owned_ui"; #wireV4RunGuardArming=null;
    #wireV4RunGuardPoints=new Map([["owned_breakpoint",{role:"run",...site}]]); #wireV4RunGuardHeld=null;
    #schematicFailed=false; #waiterFailures=0; #workerFailures=0;
    #schematicWorkerController={fail:()=>{this.#workerFailures+=1}};
    #refuseSchematicHistoryWaiters(){this.#waiterFailures+=1}
    ${method}
    observe(event){return this.#observeSchematicWireWriterV4RunGuardEvent(event)}
    inspect(){return{failed:this.#schematicFailed,held:this.#wireV4RunGuardHeld,waiters:this.#waiterFailures,worker:this.#workerFailures}}
  }`;
  const value: unknown = runInNewContext(`${stripTypeScriptTypes(original)}\nOriginalEventBody`, {
    site, CURRENT_SCHEMATIC_WIRE_WRITER_V4_NATIVE_PURPOSE: "schematic-wire-writer-v4-209", matchCurrentSchematicDisplayActionGuardEvent,
  });
  assert.equal(typeof value, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The sole VM class runs the unchanged Core method; its surrounding state is explicitly synthetic.
  const Class = value as new () => { observe: (event: unknown) => boolean; inspect: () => { failed: boolean; held: unknown; waiters: number; worker: number } };
  const owner = new Class(), paused = { method: "Debugger.paused", sessionId: "owned_ui", params: { hitBreakpoints: ["owned_breakpoint"], callFrames: [{ location: site }] } };
  assert.equal(owner.observe({ ...paused, sessionId: "foreign" }), false);
  assert.equal(owner.observe({ ...paused, params: { ...paused.params, hitBreakpoints: ["foreign"] } }), false);
  assert.equal(owner.observe({ ...paused, params: { ...paused.params, callFrames: [{ location: { ...site, scriptId: "foreign" } }] } }), false);
  assert.equal(owner.observe({ method: "Debugger.breakpointResolved", sessionId: "owned_ui", params: { breakpointId: "owned_breakpoint", location: site } }), true);
  assert.equal(owner.inspect().failed, false);
  assert.equal(owner.observe(paused), true); const state = owner.inspect(); assert.equal(state.failed, true); assert.equal(state.held, paused);
  assert.equal(state.waiters, 1); assert.equal(state.worker, 1);
});
