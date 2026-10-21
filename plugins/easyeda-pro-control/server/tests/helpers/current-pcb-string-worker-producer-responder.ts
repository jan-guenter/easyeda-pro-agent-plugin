/** Synthetic native peer only: a local Inspector over inert test factories.
 * No EasyEDA source asset, network, Windows process or CAD state is accessed. */
import assert from "node:assert/strict";
import { Session } from "node:inspector";
import { createContext, runInContext } from "node:vm";
import { z } from "zod";
import { CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS, CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS, CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS,
  CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP } from "../../src/current-pcb-string-worker-producer-commands.ts";
import type { CurrentPcbStringWorkerProducerIdentity } from "../../src/current-pcb-string-worker-producer-runner.ts";
import { currentPcbStringWorkerProducerFixture } from "./current-pcb-string-worker-producer-fixture.ts";

let fixtureNumber = 0;
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
export function createCurrentPcbStringWorkerProducerResponder(identity: CurrentPcbStringWorkerProducerIdentity, expectedScriptId = "worker-script-1"):
Readonly<{ reply: (request: Readonly<Record<string, unknown>>) => unknown; close: () => void }> {
  fixtureNumber += 1; const filename = `synthetic-native-worker-${fixtureNumber}.js`, session = new Session(); session.connect();
  let scriptId = "", uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === filename) { uniqueContextId = z.object({ uniqueId: z.string() }).parse(params.context).uniqueId; }
  });
  session.on("Debugger.scriptParsed", ({ params }): void => { if (params.url === filename) { scriptId = params.scriptId; } });
  const post = (method: string, params: object = {}): unknown => {
    const pending: { done: boolean; failure: Error | null; value: unknown } = { done: false, failure: null, value: undefined };
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- The synchronous synthetic line peer explicitly refuses a deferred Inspector completion.
    session.post(method, params, (error, result): void => { pending.failure = error; pending.value = result; pending.done = true; });
    assert.equal(pending.done, true); if (pending.failure !== null) { throw pending.failure; } return pending.value;
  };
  post("Runtime.enable"); post("Debugger.enable");
  const context = createContext({}, { name: filename });
  runInContext(currentPcbStringWorkerProducerFixture(), context, { filename, timeout: 1000 });
  runInContext(`Object.assign(PROJECT,${JSON.stringify({ uuid: identity.projectUuid, _branchUuid: identity.branchUuid })});globalThis._TAB_ID_=${JSON.stringify(identity.windowTabId)};`, context);
  assert.ok(scriptId.length > 0 && uniqueContextId.length > 0);
  const effects = CURRENT_PCB_STRING_WORKER_PRODUCER_EFFECTS, group = CURRENT_PCB_STRING_WORKER_PRODUCER_OBJECT_GROUP;
  return { close: (): void => { session.disconnect(); }, reply: (request): unknown => {
    const phase = request["workerProducerPhase"];
    const evaluation = Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_EVALUATIONS).find(([name]) => name === phase);
    if (evaluation !== undefined) {
      assert.equal(request["method"], "Runtime.evaluate");
      return post("Runtime.evaluate", { ...effects, expression: evaluation[1], uniqueContextId, objectGroup: group,
        returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false });
    }
    if (phase === "properties") {
      assert.equal(request["method"], "Runtime.getProperties");
      const reply = post("Runtime.getProperties", { objectId: request["objectId"], ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
      // Only the synthetic admitted source identifier is translated. Function
      // Bodies, locations, descriptors, scopes and handles are genuine replies.
      if (record(reply) && Array.isArray(reply["internalProperties"])) {
        for (const property of reply["internalProperties"]) {
          if (record(property) && property["name"] === "[[FunctionLocation]]" && record(property["value"])) {
            const point = property["value"]["value"];
            assert.ok(record(point)); assert.equal(point["scriptId"], scriptId); point["scriptId"] = expectedScriptId;
          }
        }
      }
      return reply;
    }
    if (phase === "release") {
      assert.equal(request["method"], "Runtime.releaseObjectGroup"); const result = post("Runtime.releaseObjectGroup", { objectGroup: group });
      assert.equal(runInContext("trapCalls", context) as unknown, 0); session.disconnect(); return result;
    }
    const call = Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_CALLS).find(([name]) => name === phase);
    const signature = Object.entries(CURRENT_PCB_STRING_WORKER_PRODUCER_CALL_ARGUMENTS).find(([name]) => name === phase)?.[1];
    assert.ok(call !== undefined && signature !== undefined); assert.equal(request["method"], "Runtime.callFunctionOn");
    const args = Array.from({ length: signature.count }, (_, index) => ({ objectId: request[`workerArgument${index}`] }));
    return post("Runtime.callFunctionOn", { ...effects, objectId: request["objectId"], functionDeclaration: call[1], objectGroup: group,
      returnByValue: signature.returnByValue, arguments: args });
  } };
}
