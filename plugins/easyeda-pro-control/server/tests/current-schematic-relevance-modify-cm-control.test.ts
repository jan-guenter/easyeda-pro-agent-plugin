/** Exercise real finite CM custody with inert router deliveries. None of the
 * fixtures owns an app, native channel, worker sender or completion token. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import { CurrentSchematicRelevanceModifyCmControlController } from "../src/current-schematic-relevance-modify-cm-control-controller.ts";
import type { CurrentSchematicRelevanceModifyCmControlHeld as Held, CurrentSchematicRelevanceModifyCmControlHost as Host } from "../src/current-schematic-relevance-modify-cm-control-controller.ts";
import { currentSchematicRelevanceModifyCmControlNativeSource } from "../src/current-schematic-relevance-modify-cm-control-native.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_REQUESTS as REQUESTS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES as ROLES, currentSchematicRelevanceModifyCmControlFunctionPoint as functionPoint, currentSchematicRelevanceModifyCmControlPoint as point } from "../src/current-schematic-relevance-modify-cm-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmControlKind as Kind, CurrentSchematicRelevanceModifyCmControlRole as Role } from "../src/current-schematic-relevance-modify-cm-control-protocol.ts";
import { currentSchematicRelevanceModifyCmControlCases as cases, currentSchematicRelevanceModifyCmControlTemplate as template } from "../src/current-schematic-relevance-modify-cm-control-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as WORKER } from "../src/current-schematic-relevance-modify-worker-replies.ts";

function kindOf(role: Role): Kind { if (role === "remoteReturned") { return "remote"; } if (role === "ticketReturned") { return "ticket"; } return role === "canWsReturned" ? "canWs" : role; }
function paused(role: Role, shift = 0, returned?: unknown): DiagnosticEvent {
  const at = point(role); const source = functionPoint(kindOf(role));
  const frames: unknown[] = [{ callFrameId: `original-${role}`, functionLocation: { scriptId: "worker-script", ...source }, location: { scriptId: "worker-script", ...at, columnNumber: at.columnNumber + shift }, ...(role === "ticketReturned" || role === "remoteReturned" ? { returnValue: { type: "undefined" } } : {}), ...(role === "canWsReturned" ? { returnValue: { type: "boolean", value: returned ?? false } } : {}) }];
  if (role === "remote" || role === "remoteReturned") { const batch = WORKER.roles.batch; frames.push({ callFrameId: "original-batch-caller", functionLocation: { scriptId: "worker-script", lineNumber: batch.lineNumber, columnNumber: batch.columnNumber }, location: { scriptId: "worker-script", lineNumber: batch.lineNumber, columnNumber: batch.columnNumber + 50 } }); }
  if (role === "ticket" || role === "ticketReturned" || role === "canWs" || role === "canWsReturned") { const callerSource = functionPoint("onChange"); frames.push({ callFrameId: "original-onChange-caller", functionLocation: { scriptId: "worker-script", lineNumber: callerSource.lineNumber, columnNumber: callerSource.columnNumber }, location: { scriptId: "worker-script", lineNumber: callerSource.lineNumber, columnNumber: callerSource.columnNumber + 50 } }); }
  return Object.freeze({ sessionId: "worker", method: "Debugger.paused", params: { reason: "other", hitBreakpoints: [`point-${role}`], callFrames: frames } });
}
function harness(mode: "normal" | "rounded" | "foreign" | "badRemove" = "normal"): Readonly<{ lane: CurrentSchematicRelevanceModifyCmControlController; requests: string[]; reserved: DiagnosticEvent[]; retired: Role[]; failed: () => boolean }> {
  let failed = false; const requests: string[] = []; const reserved: DiagnosticEvent[] = []; const retired: Role[] = [];
  const host: Host = {
    current: (): void => { assert.equal(failed, false); },
    request: (command): Promise<unknown> => {
      requests.push(command.phase);
      if (command.phase === "modify-cm-control-possible") { return Promise.resolve({ locations: [{ ...command.params.end, columnNumber: command.params.end.columnNumber - 1, type: "return" }] }); }
      if (command.phase === "modify-cm-control-return") { return Promise.resolve({ breakpointId: `point-${command.kind}Returned`, actualLocation: { ...command.params.location, columnNumber: command.params.location.columnNumber + (mode === "rounded" ? 1 : 0) } }); }
      if (command.phase === "modify-cm-control-function") { return Promise.resolve({ breakpointId: mode === "foreign" ? "foreign-point" : `point-${command.kind}` }); }
      assert.equal(command.phase, "modify-cm-control-remove"); return Promise.resolve(mode === "badRemove" ? { refused: true } : {});
    },
    register: (_role, _id, at): void => { assert.equal(at.scriptId, "worker-script"); },
    retire: (role, _id, original): void => { assert.deepEqual(original.params["hitBreakpoints"], ["point-remoteReturned"]); retired.push(role); },
    reserveOriginalResume: (event): void => { assert.ok(!reserved.includes(event)); reserved.push(event); },
    fail: (): void => { failed = true; },
  };
  return Object.freeze({ lane: new CurrentSchematicRelevanceModifyCmControlController(host, "worker", "worker-script", ["foreign-point"]), requests, reserved, retired, failed: (): boolean => failed });
}
const originalFunctions = Object.freeze({ remote: "original-remote", onChange: "original-onChange", ticket: "original-ticket", canWs: "original-canWs" });
const resumed = Object.freeze({ sessionId: "worker", method: "Debugger.resumed", params: {} });
async function start(h: ReturnType<typeof harness>): Promise<Held> { await h.lane.arm(originalFunctions); h.lane.assertArmed(); h.lane.markParentSubmitted(); const initial = h.lane.waitInitial(); assert.equal(h.lane.observe(paused("remote")), true); return initial; }
async function advance(lane: CurrentSchematicRelevanceModifyCmControlController, held: Held, target: Role, early: boolean): Promise<Held> {
  const reservation = lane.reserve(held); lane.markSubmitted(reservation); assert.equal(lane.observe(resumed), true); await lane.waitResumed(reservation);
  if (early) { assert.equal(lane.observe(paused(target)), true); lane.acknowledge(reservation, {}); return lane.complete(reservation); }
  lane.acknowledge(reservation, {}); const next = lane.complete(reservation); assert.equal(lane.observe(paused(target)), true); return next;
}
void test("nested original CM guards join both ACK orders, enforce false canWs, retire once and retain false completion", async () => {
  for (const early of [false, true]) {
    const h = harness(); let held = await start(h); assert.equal(h.requests.length, REQUESTS.setup); assert.equal(held.callerFrameId, "original-batch-caller");
    for (const role of ROLES.slice(1)) { held = await advance(h.lane, held, role, early); }
    assert.deepEqual([held.workerCompleted, held.modifyCompleted, held.saveAuthorized], [false, false, false]); assert.throws(() => h.lane.reserve(held));
    await h.lane.retire(held); assert.equal(h.retired.length, REQUESTS.removals); await assert.rejects(h.lane.retire(held));
    const terminal = h.lane.reserve(held); h.lane.markSubmitted(terminal); h.lane.acknowledge(terminal, {}); assert.throws(() => { h.lane.completeReturned(terminal); });
    assert.equal(h.lane.observe(resumed), true); await h.lane.waitResumed(terminal); h.lane.completeReturned(terminal); h.lane.requireCompleted();
    assert.equal(h.reserved.length, ROLES.length); assert.equal(h.requests.filter(value => value === "modify-cm-control-resume").length, 0); assert.equal(h.failed(), false); assert.equal(h.lane.observe(paused("remote")), false);
  }
  const bad = harness(); let held = await start(bad);
  for (const role of ["onChange", "ticket", "ticketReturned", "canWs"] as const) { held = await advance(bad.lane, held, role, true); }
  const reserved = bad.lane.reserve(held); bad.lane.markSubmitted(reserved); bad.lane.acknowledge(reserved, {}); bad.lane.observe(resumed); await bad.lane.waitResumed(reserved); const pending = bad.lane.complete(reserved);
  bad.lane.observe(paused("canWsReturned", 0, true)); await assert.rejects(pending); assert.equal(bad.failed(), true);
});
void test("unsolicited, rounded, collided and unacknowledged CM events cannot authorize any resume", async () => {
  for (const mode of ["rounded", "foreign"] as const) { const h = harness(mode); await assert.rejects(h.lane.arm(originalFunctions)); assert.equal(h.failed(), true); assert.equal(h.reserved.length, 0); }
  const unsolicited = harness(); await unsolicited.lane.arm(originalFunctions); unsolicited.lane.observe(paused("remote")); assert.equal(unsolicited.failed(), true); assert.throws(() => { unsolicited.lane.markParentSubmitted(); });
  const shifted = harness(); await shifted.lane.arm(originalFunctions); shifted.lane.markParentSubmitted(); shifted.lane.observe(paused("remote", 1)); assert.equal(shifted.failed(), true); assert.equal(shifted.reserved.length, 0);
  const unsubmitted = harness(); const held = await start(unsubmitted); unsubmitted.lane.reserve(held); unsubmitted.lane.observe(resumed); assert.equal(unsubmitted.failed(), true); assert.throws(() => { unsubmitted.lane.requireHeld(held); });
  const bad = harness("badRemove"); let terminal = await start(bad); for (const role of ROLES.slice(1)) { terminal = await advance(bad.lane, terminal, role, true); } await assert.rejects(bad.lane.retire(terminal)); assert.equal(bad.retired.length, 0); assert.equal(bad.requests.filter(value => value === "modify-cm-control-remove").length, 1); assert.throws(() => bad.lane.reserve(terminal));
});
void test("later CM entry requires the original onChange caller before any next reservation", async () => {
 const h = harness(); const remote = await start(h); const onChange = await advance(h.lane, remote, "onChange", true);
 const reservation = h.lane.reserve(onChange); h.lane.markSubmitted(reservation); h.lane.acknowledge(reservation, {}); h.lane.observe(resumed); await h.lane.waitResumed(reservation); const next = h.lane.complete(reservation);
 const original = paused("ticket"); const frames = original.params["callFrames"]; assert.ok(Array.isArray(frames)); const top: unknown = frames[0];
 h.lane.observe({ ...original, params: { ...original.params, callFrames: [top] } }); await assert.rejects(next); assert.equal(h.failed(), true); assert.equal(h.reserved.length, 2);
});
function table(source: string): readonly (readonly string[])[] {
  const match = /string\[\]\[\] Rows=EasyedaDiagnosticFixedTable\.Load\(@"([A-Za-z\d+/=]+)",([1-9]\d*),@"([a-f\d]{64})",@"([a-f\d]{64})",([1-9]\d*),([1-9]\d*)\);/u.exec(source); assert.ok(match?.[1] !== undefined);
  // oxlint-disable-next-line node/no-sync -- Decompress bounded in-memory table data; no file or native actor is used.
  const raw = gunzipSync(Buffer.from(match[1], "base64"), { maxOutputLength: 65_536 }); assert.equal(raw.length, Number(match[2])); assert.equal(createHash("sha256").update(raw).digest("hex"), match[3]); assert.equal(createHash("sha256").update(Buffer.from(match[1], "base64")).digest("hex"), match[4]); return raw.toString().split("\0").map(row => row.split("\t"));
}
void test("CM command codebook reconstructs every exact CDP byte including the one fixed cancellation without a control grant", () => {
  const source = currentSchematicRelevanceModifyCmControlNativeSource(); const rows = table(source); assert.equal(rows.length, 42); assert.equal(REQUESTS.total, REQUESTS.setup + REQUESTS.captures + REQUESTS.removals + REQUESTS.resumes + REQUESTS.events + REQUESTS.cancellations + REQUESTS.helpers);
  const smoke = /VerifySmoke\(Rows,EasyedaDiagnosticFixedTable\.Hashes\(@"([A-Za-z\d+/=]+)",([1-9]\d*)\),Encode,Need\)/u.exec(source); assert.ok(smoke?.[1] !== undefined); const hashes = Buffer.from(smoke[1], "base64"); assert.equal(hashes.length, rows.length * 32);
  for (const [index, command] of cases().entries()) {
    const row = rows[index]; assert.ok(row?.[3] !== undefined); const fixed = template(command); let expanded = row[3];
    if (command.method === "Runtime.callFunctionOn") { expanded = expanded.replaceAll('"__schematic_modifycmcontrol_program0__"', JSON.stringify(command.params.functionDeclaration)); }
    for (const name of fixed.names) { const value = fixed.values[name]; assert.ok(value !== undefined); expanded = expanded.replaceAll(`__schematic_modifycmcontrol_${name}__`, value); }
    assert.equal(expanded, JSON.stringify({ method: command.method, params: command.params })); const message = `${JSON.stringify({ id: 83, method: command.method, params: command.params, sessionId: "original_ui" })}\0`; assert.deepEqual(createHash("sha256").update(message).digest(), hashes.subarray(index * 32, (index + 1) * 32));
  }
});
