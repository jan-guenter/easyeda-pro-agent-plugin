/** Inert source, VM and codec checks. No original native inverse owner is issued. */
/* oxlint-disable import/max-dependencies -- These focused cases compare the separate inverse source, relation, pause, wire and native codebook boundaries. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS } from "../src/current-footprint-copy-clock-rpc-protocol.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_CALLS as CALLS } from "../src/current-footprint-delete-clock-programs.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_REQUESTS as REQUESTS, decodeCurrentFootprintDeleteClockPause } from "../src/current-footprint-delete-clock-protocol.ts";
import { CURRENT_FOOTPRINT_DELETE_CLOCK_SITES as SITES, assertCurrentFootprintDeleteClockMethod } from "../src/current-footprint-delete-clock-source.ts";
import { currentFootprintDeleteClockNativeCases, currentFootprintDeleteClockNativeSource } from "../src/current-footprint-delete-clock-native.ts";
import { currentFootprintDeleteClockWire } from "../src/current-footprint-delete-clock-wire.ts";
import { footprintDeleteFragments as fragments } from "./helpers/footprint-delete-fragments.ts";
import { decodeFixedNativeTable } from "./helpers/fixed-native-table.ts";

void test("actual inert pinned delete methods expose the single qe and adjacent deleteData caller sites", async () => {
  assertCurrentFootprintDeleteClockMethod(fragments.deleteString);
  assert.throws(() => { assertCurrentFootprintDeleteClockMethod(`${fragments.deleteString} `); });
  const line = `class Tg{${" ".repeat(40_022 - 9)}${fragments.deleteString}${fragments.deleteData}}`;
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const compiled = await session.post("Runtime.compileScript", { expression: `${"\n".repeat(109)}${line}`, sourceURL: "inert-delete-clock-sites.js", persistScript: true });
    assert.ok(compiled.scriptId !== undefined);
    for (const columnNumber of [SITES.entry.columnNumber, SITES.producer.columnNumber, 40_416]) {
      const location: { scriptId: string; lineNumber: number; columnNumber: number } = { scriptId: compiled.scriptId, lineNumber: 109, columnNumber };
      const allocated = await session.post("Debugger.setBreakpoint", { location });
      assert.deepEqual(allocated.actualLocation, location);
      await session.post("Debugger.removeBreakpoint", { breakpointId: allocated.breakpointId });
    }
  } finally { session.disconnect(); }
});
function relation(mode: string): unknown {
  return runInNewContext(`(()=>{const mode=${JSON.stringify(mode)},calls=[];
const expected={projectUuid:'a'.repeat(64),branchUuid:'b'.repeat(32),targetUuid:'c'.repeat(16),client:'d'.repeat(16),maximumTicket:100};
const clock=()=>{calls.push('clock');},consistency={client:expected.client,maxTicket:100},project={uuid:expected.projectUuid,_branchUuid:expected.branchUuid,consistencyManager:consistency};
const manager={projectManager:project,client:expected.client,user:undefined};project.footprint=manager;globalThis.PROJECT=project;globalThis.PRO_EDITOR_VERSION=undefined;
const bus={},worker=[project,bus,manager,clock,...Array(12).fill(null)],caller=[manager,expected.targetUuid],frame=[manager,expected.targetUuid,clock];
let entry=null,packet=null,error=null;
try{if(mode==='caller')caller[0]={};if(mode==='entry-target')frame[1]='e'.repeat(16);
entry=(${CALLS.entry.program}).call(frame,worker,caller,expected);
if(mode==='ticket')consistency.maxTicket++;if(mode==='version')globalThis.PRO_EDITOR_VERSION='changed';if(mode==='clock')frame[2]=()=>{};
if(mode==='user')manager.user={};if(mode==='getter')Object.defineProperty(manager,'client',{get(){calls.push('getter');return expected.client;}});
const pending={unsafe:true,isRunning:false,callback:null};if(mode==='running')pending.isRunning=true;
const push=[worker,bus,null,null,null,pending,null,null,null],producer=[manager,expected.targetUuid,1700000000123,mode==='clock'?frame[2]:clock];
packet=(${CALLS.producer.program}).call(producer,entry,push,{value:mode==='value'?1700000000124:1700000000123});}catch(e){error=e.message;}
return JSON.stringify({error,calls,entry:entry!==null,packet:packet===null?null:[packet[2],packet[3]]});})()`, {}, { timeout: 1000 });
}
void test("one inverse entry retains original target, pending RPC and worker version; drift refuses without application calls", () => {
  const normal: unknown = JSON.parse(String(relation("normal")));
  assert.deepEqual(normal, { error: null, calls: [], entry: true, packet: ["c".repeat(16), 1_700_000_000_123] });
  for (const mode of ["caller", "entry-target", "ticket", "version", "clock", "user", "getter", "running", "value"]) {
    const result: unknown = JSON.parse(String(relation(mode))); assert.ok(result !== null && typeof result === "object");
    assert.equal(Reflect.get(result, "error"), "FOOTPRINT_DELETE_CLOCK_RELATION");
    assert.deepEqual(Reflect.get(result, "calls"), []); assert.equal(Reflect.get(result, "packet"), null);
  }
});
void test("the inverse pause requires the exact adjacent deleteData caller before any continuation", () => {
  const site = SITES.entry;
  const frame = { callFrameId: "entry", functionName: "deleteString", location: { scriptId: "worker", lineNumber: 109, columnNumber: site.columnNumber }, functionLocation: { scriptId: "worker", lineNumber: 109, columnNumber: site.functionColumn } };
  const caller = { callFrameId: "caller", functionName: "deleteData", location: { scriptId: "worker", lineNumber: 109, columnNumber: 40_416 }, functionLocation: { scriptId: "worker", lineNumber: 109, columnNumber: 40_299 } };
  const pause = { reason: "other", hitBreakpoints: ["entry-bp"], callFrames: [frame, caller] };
  assert.deepEqual(decodeCurrentFootprintDeleteClockPause(pause, "entry", "worker", "entry-bp"), { frameId: "entry", uiCallerId: null, deleteCallerId: "caller" });
  for (const callFrames of [[frame], [caller, frame], [frame, { ...caller, functionName: "copy" }], [frame, { ...caller, location: { ...caller.location, columnNumber: 40_417 } }]]) {
    assert.throws(() => decodeCurrentFootprintDeleteClockPause({ ...pause, callFrames }, "entry", "worker", "entry-bp"));
  }
});
void test("all26 inverse wire templates reconstruct exact commands and refuse second-wave/caller program substitution", async () => {
  const cases = currentFootprintDeleteClockNativeCases(), source = currentFootprintDeleteClockNativeSource();
  const { rows } = await decodeFixedNativeTable(source, 26, 5); assert.equal(cases.length, 26);
  const phases = new Set<string>();
  for (const [index, command] of cases.entries()) {
    const row = rows[index]?.split("\t"), wire = currentFootprintDeleteClockWire(command, 73, "deleteclock_worker", "deleteclock_ui");
    assert.ok(row !== undefined && row[0] !== undefined && row[4] !== undefined); assert.equal(phases.has(row[0]), false); phases.add(row[0]);
    const template = row[4].replaceAll("__deleteclock_inlineBus__", String(wire.request["busUuid"]));
    const restored: unknown = JSON.parse(template.replaceAll(/"__deleteclock_([A-Za-z\d]+)__"/gu, (_whole, name: string) => JSON.stringify(name === "sessionId" ? command.sessionId : wire.request[name])));
    assert.deepEqual(restored, { method: command.method, sessionId: command.sessionId, params: command.params });
    assert.equal(wire.request["action"], "footprint-delete-clock-send");
    for (const name of ["program", "sessionId", "expression", "condition", "functionDeclaration"]) { assert.equal(Object.hasOwn(wire.request, name), false); }
    assert.throws(() => currentFootprintDeleteClockWire({ ...command, program: "function(){}" }, 73, "deleteclock_worker", "deleteclock_ui"));
    assert.throws(() => currentFootprintDeleteClockWire({ ...command, sessionId: "other" }, 73, "deleteclock_worker", "deleteclock_ui"));
    if (command.phase === "delete-clock-push") {
      const raw = command.params["arguments"]; assert.ok(Array.isArray(raw)); const args: readonly unknown[] = raw;
      assert.throws(() => currentFootprintDeleteClockWire({ ...command, params: { ...command.params, arguments: [...args.slice(0, 2), { value: 2 }] } }, 73, "deleteclock_worker", "deleteclock_ui"));
    }
  }
  assert.deepEqual(REQUESTS, { normal: 35, cleanup: 14, total: 49 });
  assert.deepEqual(CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS, { normal: 49, cleanup: 18, total: 67 });
});
