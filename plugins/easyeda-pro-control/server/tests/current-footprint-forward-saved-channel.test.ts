/** Synthetic CDP/native boundaries only. The accounted saved observation
 * intentionally lacks the copy-specific saved dependency's authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyForwardSavedStartupChannel, isOriginalFootprintSavedDependency } from "../src/current-pcb-worker-startup-channel.ts";
import { CurrentFootprintCopySavedWorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import { currentPcb209WorkerStartupNativeParentCases } from "../src/current-pcb-worker-startup-native.ts";
import { currentFootprintCopySavedQueueCommand } from "../src/current-footprint-copy-saved-queue.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } from "../src/current-pcb-209-startup-opening-program.ts";

void test("accounted saved observation refuses opening and legacy saved admission before any native exchange", async context => {
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 319 });
  const replies: Buffer[] = [], requests: Readonly<Record<string, string | number>>[] = [];
  let exited = false;
  const channel = new CurrentFootprintCopyForwardSavedStartupChannel({
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.equal(exited, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => undefined,
    exchange: (request): Promise<unknown> => {
      if (request.action === "poll") { return Promise.resolve({ bytes: (replies.shift() ?? Buffer.alloc(0)).toString("base64") }); }
      assert.ok("requestId" in request && typeof request["requestId"] === "number");
      assert.equal(request["action"], "footprint-saved-upload-queue");
      requests.push(request);
      replies.push(Buffer.from(`${JSON.stringify({ id: request["requestId"], sessionId: parent.sessionId, result: {} })}\0`));
      return Promise.resolve({ written: true });
    },
  }, (): void => undefined);
  const dependency = await channel.start(); dependency.subscribe((): void => undefined);
  context.after(async () => { exited = true; await channel.releaseAfterTermination(); });
  assert.equal(isOriginalFootprintSavedDependency(dependency), false);
  assert.throws(() => new CurrentFootprintCopySavedWorkerStartupTransport(dependency), /PURPOSE/u);
  const opening = currentPcb209WorkerStartupNativeParentCases().filter(command => command.method === "Runtime.callFunctionOn" &&
    command.params.arguments.length === 2 && ["preflight", "open-project"].includes(command.params.arguments[1].value));
  assert.equal(opening.length, 3);
  for (const command of opening) {
    assert.ok(command.method === "Runtime.callFunctionOn");
    const expected = command.params.functionDeclaration === CURRENT_PCB_209_STARTUP_OPENING_FUNCTION ? /OBSERVATION_ONLY/u : /PCB_WORKER_STARTUP_WIRE/u;
    await assert.rejects(dependency.request({ ...command, sessionId: parent.sessionId }), expected);
  }
  await assert.rejects(dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: parent.sessionId }), /OBSERVATION_ONLY/u);
  assert.equal(requests.length, 0); assert.equal(channel.status().nextRequestId, 319);
  const preflight = opening[0]; assert.ok(preflight?.method === "Runtime.callFunctionOn");
  const queue = currentFootprintCopySavedQueueCommand({ sessionId: parent.sessionId, uniqueContextId: preflight.params.uniqueContextId,
    projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) });
  await channel.requestFootprintSavedUploadQueue(queue);
  assert.equal(requests.length, 1); assert.equal(requests[0]?.["requestId"], 319);
  await assert.rejects(channel.requestFootprintSavedUploadQueue(queue), /OBSERVATION_ONLY/u);
  await assert.rejects(dependency.request({ method: "Target.getTargets", params: {} }), /REQUEST_BUDGET/u);
  assert.equal(requests.length, 1); assert.equal(channel.status().nextRequestId, 320);
  assert.equal(channel.status().pendingReplies, 0);
});
