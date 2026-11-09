/** Inert router/transport deliveries exercise the real finite controller.
 * No listener, worker owner, native channel or sender grant is created. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { CurrentSchematicRelevanceModifyControlController } from "../src/current-schematic-relevance-modify-control-controller.ts";
import type { CurrentSchematicRelevanceModifyControlHeld as Held, CurrentSchematicRelevanceModifyControlHost as Host } from "../src/current-schematic-relevance-modify-control-controller.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_REQUESTS as REQUESTS, currentSchematicRelevanceModifyControlFunctionPoint as functionPoint, currentSchematicRelevanceModifyControlPoint as point } from "../src/current-schematic-relevance-modify-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyControlRole as Role } from "../src/current-schematic-relevance-modify-control-protocol.ts";
import { currentSchematicRelevanceModifyControlCases as cases, currentSchematicRelevanceModifyControlTemplate as template } from "../src/current-schematic-relevance-modify-control-wire.ts";
import { currentSchematicRelevanceModifyControlNativeSource } from "../src/current-schematic-relevance-modify-control-native.ts";
import { currentSchematicRelevanceModifyWorkerPrograms } from "../src/current-schematic-relevance-modify-worker-native.ts";

type Event = Parameters<CurrentSchematicRelevanceModifyControlController["observe"]>[0];
function paused(role: Role, shift = 0): Event {
  const kind = role === "handler" || role === "handlerReturned" ? "handler" : "batch"; const at = point(role); const source = functionPoint(kind);
  const frames: unknown[] = [{ callFrameId: `original-${role}`, functionLocation: { scriptId: "worker-script", ...source }, location: { scriptId: "worker-script", ...at, columnNumber: at.columnNumber + shift }, ...(role === "batchReturned" || role === "handlerReturned" ? { returnValue: { type: "undefined" } } : {}) }];
  if (kind === "batch") { frames.push({ callFrameId: "original-execute", functionLocation: { scriptId: "worker-script", lineNumber: 0, columnNumber: 8090 }, location: { scriptId: "worker-script", lineNumber: 0, columnNumber: 8125 } }); }
  return Object.freeze({ sessionId: "worker", method: "Debugger.paused", params: { reason: "other", hitBreakpoints: [`point-${role}`], callFrames: frames } });
}
function harness(mode: "normal" | "rounded" | "foreign" | "badRemove" = "normal"): Readonly<{ lane: CurrentSchematicRelevanceModifyControlController; requests: string[]; reserved: Event[]; failed: () => boolean }> {
  let failed = false; const requests: string[] = [], reserved: Event[] = [];
  const host: Host = {
    current: (): void => { assert.equal(failed, false); },
    request: (command): Promise<unknown> => {
      requests.push(command.phase);
      if (command.phase === "modify-control-possible") { return Promise.resolve({ locations: [{ ...command.params.end, columnNumber: command.params.end.columnNumber - 1, type: "return" }] }); }
      if (command.phase === "modify-control-return") { return Promise.resolve({ breakpointId: `point-${command.kind}Returned`, actualLocation: { ...command.params.location, columnNumber: command.params.location.columnNumber + (mode === "rounded" ? 1 : 0) } }); }
      if (command.phase === "modify-control-function") { return Promise.resolve({ breakpointId: mode === "foreign" ? "foreign-point" : `point-${command.kind}` }); }
      assert.equal(command.phase, "modify-control-remove"); return Promise.resolve(mode === "badRemove" ? { refused: true } : {});
    },
    register: (_role, _id, at): void => { assert.equal(at.scriptId, "worker-script"); },
    reserveOriginalResume: (event): void => { assert.ok(!reserved.includes(event)); reserved.push(event); },
    fail: (): void => { failed = true; },
  };
  return Object.freeze({ lane: new CurrentSchematicRelevanceModifyControlController(host, "worker", "worker-script", ["foreign-point"]), requests, reserved, failed: (): boolean => failed });
}
async function advance(lane: CurrentSchematicRelevanceModifyControlController, held: Held, target: Role, early: boolean): Promise<Held> {
  const reservation = lane.reserve(held); lane.markSubmitted(reservation);
  assert.equal(lane.observe({ sessionId: "worker", method: "Debugger.resumed", params: {} }), true); await lane.waitResumed(reservation);
  if (early) { assert.equal(lane.observe(paused(target)), true); lane.acknowledge(reservation, {}); return lane.complete(reservation); }
  lane.acknowledge(reservation, {}); const next = lane.complete(reservation); assert.equal(lane.observe(paused(target)), true); return next;
}
function table(source: string, name: string): readonly (readonly string[])[] {
  const match = new RegExp(`string\\[\\]\\[\\] ${name}=EasyedaDiagnosticFixedTable\\.Load\\(@"([A-Za-z\\d+/=]+)",([1-9]\\d*),@"([a-f\\d]{64})",@"([a-f\\d]{64})",([1-9]\\d*),([1-9]\\d*)\\);`, "u").exec(source); assert.ok(match !== null && match[1] !== undefined);
  // oxlint-disable-next-line node/no-sync -- Decode bounded in-memory immutable emitted data; no files or native actor.
  const raw = gunzipSync(Buffer.from(match[1], "base64"), { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[2])); assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]); assert.equal(createHash("sha256").update(Buffer.from(match[1], "base64")).digest("hex"), match[4]); return raw.toString().split("\0").map(row => row.split("\t"));
}
void test("original worker waits for native initial pause, joins both ACK orders, retires guards and consumes terminal release", async () => {
  for (const early of [false, true]) {
    const h = harness(); await h.lane.arm("original-handler", "original-batch"); assert.equal(h.requests.length, 6); assert.ok(h.requests.every(value => value !== "modify-control-resume"));
    let initialReady = false; const initial = (async (): Promise<Held> => { const value = await h.lane.waitInitial(); initialReady = true; return value; })(); await Promise.resolve(); assert.equal(initialReady, false);
    assert.equal(h.lane.observe(paused("handler")), true); let held = await initial;
    for (const role of ["batch", "batchReturned", "handlerReturned"] as const) { held = await advance(h.lane, held, role, early); }
    assert.throws(() => h.lane.reserveTerminal(held)); await h.lane.retire(held); assert.equal(h.requests.filter(value => value === "modify-control-remove").length, 4); await assert.rejects(h.lane.retire(held));
    const terminal = h.lane.reserveTerminal(held); h.lane.markSubmitted(terminal); h.lane.acknowledge(terminal, {}); assert.throws(() => { h.lane.completeReturned(terminal); });
    assert.equal(h.lane.observe({ sessionId: "worker", method: "Debugger.resumed", params: {} }), true); await h.lane.waitResumed(terminal); h.lane.completeReturned(terminal); h.lane.requireCompleted(); assert.equal(h.reserved.length, 4); assert.equal(h.failed(), false);
    assert.throws(() => h.lane.reserveTerminal(held)); assert.equal(h.requests.filter(value => value === "modify-control-resume").length, 0);
  }
  for (const mode of ["rounded", "foreign"] as const) { const h = harness(mode); await assert.rejects(h.lane.arm("handler", "batch")); assert.equal(h.failed(), true); assert.equal(h.reserved.length, 0); }
  const shifted = harness(); await shifted.lane.arm("handler", "batch"); assert.equal(shifted.lane.observe(paused("handler", 1)), true); assert.equal(shifted.failed(), true);
  const bad = harness("badRemove"); await bad.lane.arm("handler", "batch"); bad.lane.observe(paused("handler")); let held = await bad.lane.waitInitial();
  for (const role of ["batch", "batchReturned", "handlerReturned"] as const) { held = await advance(bad.lane, held, role, true); }
  await assert.rejects(bad.lane.retire(held)); assert.equal(bad.failed(), true); assert.equal(bad.requests.filter(value => value === "modify-control-remove").length, 1); assert.throws(() => bad.lane.reserveTerminal(held));
  assert.equal(REQUESTS.resumes, 4); assert.equal(REQUESTS.removals, 4);
  const source = currentSchematicRelevanceModifyControlNativeSource(); assert.ok(source.includes("EasyedaSchematicRelevanceModifyWorkerProtocol.Programs")); const rows = table(source, "Rows"); const local = table(source, "OwnPrograms"); const shared = currentSchematicRelevanceModifyWorkerPrograms();
  assert.equal(rows.length, cases().length); assert.deepEqual(local.map(row => { const value: unknown = JSON.parse(row[1] ?? ""); assert.ok(typeof value === "string"); return value; }), CALLS.map(row => row[1]).filter(program => !shared.includes(program)));
  const programs = [...shared];
  for (const row of local) { const program: unknown = JSON.parse(row[1] ?? ""); assert.ok(typeof program === "string"); programs[Number(row[0])] = program; }
  const smoke = /VerifySmoke\(Rows,EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",([1-9]\d*)\),Encode,Need\)/u.exec(source); assert.ok(smoke?.[1] !== undefined); const hashes = Buffer.from(smoke[1], "base64"); assert.equal(hashes.length, cases().length * 32);
  for (const [index, command] of cases().entries()) {
    const row = rows[index]; assert.ok(row !== undefined && row[3] !== undefined); const fixed = template(command); assert.equal(row[0], fixed.phase); assert.equal(row[1], command.method);
    let expanded = row[3].replaceAll(/"__schematic_modifycontrol_program(\d+)__"/gu, (_value, raw: string) => { const program = programs[Number(raw)]; assert.ok(program !== undefined); return JSON.stringify(program); });
    for (const name of fixed.names) { const value = fixed.values[name]; assert.ok(value !== undefined); expanded = expanded.replaceAll(`__schematic_modifycontrol_${name}__`, value); }
    assert.equal(expanded, JSON.stringify({ method: command.method, params: command.params }));
    const message = `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`; assert.deepEqual(createHash("sha256").update(message).digest(), hashes.subarray(index * 32, (index + 1) * 32));
  }
});
