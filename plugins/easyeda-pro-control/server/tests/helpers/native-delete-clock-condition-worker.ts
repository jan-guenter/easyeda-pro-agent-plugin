/** Probe actual condition compilation in an inert Inspector target. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Debugger } from "node:inspector/promises";
import { parentPort } from "node:worker_threads";
import { currentFootprintInverseNativeDeleteClockCases as cases, qualifyCurrentFootprintInverseNativeDeleteClockConditionSource as qualify } from "../../src/current-footprint-inverse-native-delete-clock-protocol.ts";

const nullable = parentPort; assert.ok(nullable !== null); const port = nullable;
const session = new Session(); session.connectToMainThread(); const keep = setInterval((): void => { port.ref(); }, 100);
const issued: Promise<unknown>[] = []; const events: Debugger.ScriptParsedEventDataType[] = [];
let capturing = false, pauses = 0, requests = 0;
function count(): void { requests += 1; assert.ok(requests <= 64); }
session.on("Debugger.scriptParsed", notification => { if (capturing) { assert.ok(events.length < 20); events.push(notification.params); } });
session.on("Debugger.paused", (): void => { pauses += 1; count(); issued.push(session.post("Debugger.resume")); });
async function run(): Promise<void> {
  count(); await session.post("Runtime.enable"); count(); await session.post("Debugger.enable");
  const commands = cases().filter(command => command.method === "Debugger.setBreakpoint");
  const source = "function push(e){return true}\nfunction qeReturned(){return true}\nfunction dispatch(e,t){return true}\nfunction result(y){return true}\nfunction reply(e,t){return true}\nfunction producer(){return true}";
  count(); const compiled = await session.post("Runtime.compileScript", { expression: source, sourceURL: "inert-clock-condition-fixture.js", persistScript: true }); assert.ok(compiled.scriptId !== undefined);
  const scriptId = compiled.scriptId; count(); await session.post("Runtime.runScript", { scriptId }); const points: string[] = [];
  for (const [index, command] of commands.entries()) { assert.equal(command.method, "Debugger.setBreakpoint");
    count(); const locations = await session.post("Debugger.getPossibleBreakpoints", { start: { scriptId, lineNumber: index, columnNumber: 0 }, end: { scriptId, lineNumber: index + 1, columnNumber: 0 }, restrictToFunction: false });
    const location = locations.locations[0]; assert.ok(location !== undefined); count(); const point = await session.post("Debugger.setBreakpoint", { location, condition: command.params.condition }); points.push(point.breakpointId);
  }
  capturing = true; let falseEvaluations = 0, qualified = 0;
  for (const command of commands) {
    const topic = command.role === "reply" ? "_MSG_BUS_RPC_-/pro-mgr/serverTime/now-11111111-2222-3333-4444-555555555555-7" : "/pro-mgr/serverTime/now";
    const args = command.role === "dispatch" || command.role === "reply" ? ["unused", topic] : [topic];
    const uuids = command.role === "qeReturned" || command.role === "producer" ? ["11111111-2222-3333-4444-555555555555"] : ["aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", "11111111-2222-3333-4444-555555555555"];
    for (const uuid of uuids) {
      const start = events.length; count(); await session.post("Runtime.evaluate", { expression: `${command.role  }.apply({uuid:${  JSON.stringify(uuid)  }},${  JSON.stringify(args)  })`, returnByValue: true });
      const observed = events.slice(start); assert.equal(observed.length, 2); let found = 0;
      for (const event of observed) { count(); const packet = await session.post("Debugger.getScriptSource", { scriptId: event.scriptId }); if (packet.scriptSource === command.params.condition) {
        assert.equal(event.url, ""); qualify(packet.scriptSource, command); found += 1; qualified += 1;
      } }
      assert.equal(found, 1); if (uuid.startsWith("aaaaaaaa")) { falseEvaluations += 1; }
    }
  }
  capturing = false; await Promise.allSettled(issued); assert.equal(qualified, 10); assert.equal(pauses, 6); assert.equal(issued.length, 6);
  for (const breakpointId of points) { count(); await session.post("Debugger.removeBreakpoint", { breakpointId }); }
  port.postMessage({ conditionEvaluations: 10, falseEvaluations, originalConditionSourcesQualified: qualified, actualPauses: pauses, actualResumes: issued.length,
    rendererRequests: requests, nativeOwnerIssued: false, applicationExecuted: false });
}
try {
  // oxlint-disable-next-line node/no-top-level-await -- Join the actual Inspector sequence before disconnecting this fixture.
  await run();
} catch (caughtError) { port.postMessage({ failure: caughtError instanceof Error ? caughtError.message : "condition probe failed" }); process.exitCode = 1; }
finally {
  // oxlint-disable-next-line node/no-top-level-await -- Retain every original resume request through its settlement.
  await Promise.allSettled(issued); session.disconnect(); clearInterval(keep); port.close();
}
