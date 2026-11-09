/** Scheduling and exact-source tests issue no delivery or continuation grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentSchematicRelevanceModifyEchoControlController as Controller, assertOriginalCurrentSchematicRelevanceModifyEchoControlController as original } from "../src/current-schematic-relevance-modify-echo-control-controller.ts";
import type { CurrentSchematicRelevanceModifyEchoControlHeld as Held } from "../src/current-schematic-relevance-modify-echo-control-controller.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FUNCTIONS as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS as RETURNS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_UI_ROLES as UI, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_WORKER_ROLES as WORKER, currentSchematicRelevanceModifyEchoControlPoint as atPoint, currentSchematicRelevanceModifyEchoControlCaller as callerPoint, currentSchematicRelevanceModifyEchoControlFunction as fnPoint } from "../src/current-schematic-relevance-modify-echo-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoControlRole as Role } from "../src/current-schematic-relevance-modify-echo-control-protocol.ts";

void test("fixed worker and UI lanes join ACK and next-pause races, while worker post return hands back to its original timer", async () => {
  for (const realm of ["worker", "ui"] as const) { for (const early of [false, true]) {
    const roles: readonly Role[] = realm === "worker" ? WORKER : UI; let failed = false, removals = 0; const delivered = new WeakSet<object>(); const points = new Map<Role, string>();
    const current = (): void => { assert.equal(failed, false); };
    const lane = new Controller({ current, request: (command): Promise<unknown> => {
      if (command.phase === "modify-echo-control-function") { const id = `own-${command.role}`; points.set(command.role, id); return Promise.resolve({ breakpointId: id }); }
      if (command.phase === "modify-echo-control-possible") { return Promise.resolve({ locations: [{ ...command.params.end, columnNumber: command.params.end.columnNumber - 1, type: "return" }] }); }
      if (command.phase === "modify-echo-control-point") { const id = `own-${command.role}`; points.set(command.role, id); return Promise.resolve({ breakpointId: id, actualLocation: command.params.location }); }
      assert.equal(command.phase, "modify-echo-control-remove"); removals += 1; return Promise.resolve({});
    }, assertOriginalEvent: (event): void => { assert.equal(delivered.has(event), true); }, register: current, retire: current, reserveOriginalResume: current, held: current, resumed: current, fail: (): void => { failed = true; } }, realm, "original", "source", 0, ["foreign"]);
    const functions = Object.fromEntries(FUNCTIONS.filter(role => roles.includes(role)).map(role => [role, `function-${role}`])); await lane.arm(functions); original(lane); assert.throws(() => { original(new Proxy(lane, {})); });
    const pause = (role: Role): void => {
      const fn = fnPoint(0, role); const at = atPoint(0, role); const returns = RETURNS.some(value => value === role);
      let returnValue: unknown = { type: "undefined" }; if (role === "uiExecuteReturned") { returnValue = { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "unqualified-promise" }; } else if (role === "uiPublishReturned") { returnValue = { type: "boolean", value: false }; }
      const frames: unknown[] = [{ callFrameId: `frame-${role}`, functionLocation: { scriptId: "source", ...fn }, location: { scriptId: "source", ...at }, ...(returns ? { returnValue } : {}) }];
      const caller = callerPoint(0, role); if (caller !== null) { frames.push({ callFrameId: "original-source-caller", functionLocation: { scriptId: "source", ...caller.functionLocation }, location: { scriptId: "source", ...caller.location } }); }
      const event = { sessionId: "original", method: "Debugger.paused", params: { reason: "other", hitBreakpoints: [points.get(role)], callFrames: frames } }; delivered.add(event); assert.equal(lane.observe(event), true);
    };
    const first = roles[0]; assert.ok(first !== undefined); lane.markExpected(); pause(first); let held: Held = await lane.wait(first);
    for (const role of roles) {
      assert.equal(held.role, role); if (role === roles.at(-1)) { await lane.retire(held); }
      const reservation = lane.reserve(held); const active = held; assert.throws(() => lane.reserve(active)); lane.markSubmitted(reservation); const resumed = { sessionId: "original", method: "Debugger.resumed", params: {} }; delivered.add(resumed); assert.equal(lane.observe(resumed), true);
      if (early && reservation.target !== null) { pause(reservation.target); }
      lane.acknowledge(reservation, {}); const pending = lane.complete(reservation);
      if (!early && reservation.target !== null) { await Promise.resolve(); pause(reservation.target); }
      const next = await pending;
      if (role === "workerPostReturned") { assert.equal(next, null); const parentResumed = { sessionId: "original", method: "Debugger.resumed", params: {} }; delivered.add(parentResumed); assert.equal(lane.observe(parentResumed), false); lane.markExpected(); pause("workerLoopback"); held = await lane.wait("workerLoopback"); }
      else if (next !== null) { held = next; }
    }
    lane.requireCompleted(); assert.equal(removals, roles.length); assert.equal(failed, false);
  } }
});
