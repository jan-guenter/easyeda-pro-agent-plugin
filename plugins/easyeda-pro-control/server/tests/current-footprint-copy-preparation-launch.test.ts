import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintCopyPreparationChannel, isOriginalFootprintPreparationDependency } from "../src/current-pcb-worker-startup-channel.ts";
import { currentFootprintCopyPreparationWire, currentPcb209WorkerStartupWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE as PROFILE } from "../src/current-footprint-copy-preparation-profile.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";
import { currentFootprintCopyPreparationValidationRequestSchema } from "../src/current-footprint-copy-preparation-validation.ts";
import { currentPcb209WorkerStartupValidationRequestSchema } from "../src/current-pcb-209-worker-startup-validation.ts";
import { bindFootprintPreparationConstructionTransport, isOriginalFootprintPreparationConstructionTransport } from "../src/current-footprint-copy-construction-purpose.ts";
import type { CurrentPcbWorkerConstructionTransport } from "../src/current-pcb-worker-construction-contract.ts";

void test("preparation purpose keeps old IDs and command vocabulary closed", () => {
  const request = { method: "Runtime.enable", sessionId: "worker", params: {} };
  assert.throws(() => currentPcb209WorkerStartupWire(request, 257));
  assert.equal(currentFootprintCopyPreparationWire(request, PROFILE.requestLimit).request["requestId"], PROFILE.requestLimit);
  assert.throws(() => currentFootprintCopyPreparationWire(request, PROFILE.requestLimit + 1));
  assert.throws(() => currentFootprintCopyPreparationWire({ method: "Runtime.evaluate", sessionId: "worker", params: { expression: "1" } }, 1));
  const launch = { action: "launch", operationId: "footprint-preparation-synthetic", confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  assert.equal(currentFootprintCopyPreparationValidationRequestSchema.safeParse(launch).success, true);
  assert.equal(currentPcb209WorkerStartupValidationRequestSchema.safeParse(launch).success, false);
  for (const action of ["create", "save", "execute", "copy", "delete"]) {
    assert.equal(currentFootprintCopyPreparationValidationRequestSchema.safeParse({ action, operationId: launch.operationId }).success, false);
  }
});

void test("preparation channel retains original branding and cleanup after its last normal request", async context => {
  const parent = Object.freeze({ targetId: "parent", sessionId: "parent-session", nextRequestId: PROFILE.normalRequestLimit });
  const chunks: Buffer[] = [], sent: Readonly<Record<string, string | number>>[] = [];
  let terminated = false;
  const channel = new CurrentFootprintCopyPreparationChannel({
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.equal(terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): void => {
      // No parent events are emitted by this fixture.
    },
    exchange: (request): Promise<unknown> => {
      if (request.action === "poll") { return Promise.resolve({ bytes: chunks.shift()?.toString("base64") ?? "" }); }
      assert.ok("requestId" in request);
      sent.push(request);
      if (request["method"] === "Target.setAutoAttach") {
        chunks.push(Buffer.from(`${JSON.stringify({ method: "Target.attachedToTarget", sessionId: parent.sessionId,
          params: { sessionId: "worker", waitingForDebugger: true,
            targetInfo: { targetId: "worker-target", type: "worker", attached: true } } })}\0`));
      }
      chunks.push(Buffer.from(`${JSON.stringify({ id: request["requestId"], sessionId: request["sessionId"], result: {} })}\0`));
      return Promise.resolve({ written: true });
    },
  });
  context.after(async () => { terminated = true; await channel.releaseAfterTermination(); });
  const dependency = await channel.start();
  dependency.subscribe((): void => {
    // The channel itself retains attachment identity.
  });
  assert.equal(isOriginalFootprintPreparationDependency(dependency), true);
  const copiedDependency = Object.freeze({ ...dependency });
  assert.equal(isOriginalFootprintPreparationDependency(copiedDependency), false);
  const transport: CurrentPcbWorkerConstructionTransport = Object.freeze({ scriptId: "original-worker-script",
    assertOriginalPinnedWorker: (): Promise<void> => Promise.resolve(),
    request: (): never => assert.fail("Construction-brand checks must not request native work"),
    subscribe: (): never => assert.fail("Construction-brand checks must not install listeners") });
  bindFootprintPreparationConstructionTransport(copiedDependency, transport);
  assert.equal(isOriginalFootprintPreparationConstructionTransport(transport), false);
  bindFootprintPreparationConstructionTransport(dependency, transport);
  assert.equal(isOriginalFootprintPreparationConstructionTransport(transport), true);
  assert.equal(isOriginalFootprintPreparationConstructionTransport(Object.freeze({ ...transport })), false);
  let traps = 0;
  const request = { method: "Target.setAutoAttach" as const, params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: parent.sessionId };
  const hostile = new Proxy(request, { has: (): never => { traps += 1; throw new Error("Unexpected grammar-selection trap"); } });
  await assert.rejects(dependency.request(hostile), /COMMAND/u);
  assert.equal(traps, 0); assert.equal(sent.length, 0);
  await dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: parent.sessionId });
  await assert.rejects(dependency.request({ method: "Runtime.getProperties", sessionId: "worker",
    params: { objectId: "object", ownProperties: true, generatePreview: false } }), /REQUEST_BUDGET/u);
  await dependency.request({ method: "Runtime.releaseObjectGroup", sessionId: "worker", params: { objectGroup: "easyeda-pro-control-worker-construction-v1" } });
  assert.deepEqual(sent.map(sentRequest => sentRequest["requestId"]), [PROFILE.normalRequestLimit, PROFILE.normalRequestLimit + 1]);
});
