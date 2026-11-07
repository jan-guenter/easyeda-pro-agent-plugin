/** The real pipe core runs against inert streams. Only original plan lookup is
 * an explicit seam; this creates no native owner, Save or SQL authority. */
/* oxlint-disable import/max-dependencies -- The actual VM-loaded core, original stream acknowledgements and legacy purpose are compared without a fake transport wrapper. */
/* oxlint-disable promise/prefer-await-to-callbacks -- Writable acknowledgement callbacks are the behavior under test and must be retained independently from CDP replies. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CurrentPcbDiagnosticPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import type { CurrentPcbViaWritePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentPcbViaClockNativeCases, validateCurrentPcbViaClockCommand } from "../src/current-pcb-via-clock-protocol.ts";
import { currentPcbViaWriteNativeRequest } from "../src/current-pcb-via-write-protocol.ts";
import type { DiagnosticEvent } from "../src/current-pcb-diagnostic-protocol.ts";
import type { CurrentPcbViaWritePlan } from "../src/current-pcb-via-write-plan.ts";
import { sha256Text } from "../src/core.ts";

const path = String.raw`C:\Synthetic\Codex_via_only_1111111111111111.eprj2`;
const plan: CurrentPcbViaWritePlan = Object.freeze({ schema: "private.current-pcb-via-write-plan.v1", operationId: "pcb209-via-write-duplex-test",
  target: Object.freeze({ rawWindowsPath: path, projectUuid: sha256Text(path), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) }),
  initialLogicalSha256: "e".repeat(64), via: Object.freeze({ netName: "", xMil: 1, yMil: 2, holeDiameterMil: 3, diameterMil: 4,
    viaType: 0, designRuleBlindViaName: "", solderMaskExpansion: Object.freeze({ topSolderMask: 0, bottomSolderMask: 0 }), primitiveLock: false }),
  expectedNative: Object.freeze({ family: "Via", net: "", x: .1, y: .2, radius: .2, holeRadius: .15, type: 0, startLayer: 1, endLayer: 2,
    expansionType: 2, topExpansion: 0, bottomExpansion: 0, locked: false }), inverseAvailable: false,
  footprintDocumentAllocationRequired: false, footprintStructureWriterRequired: false });
async function constructor(): Promise<typeof CurrentPcbViaWritePipe> {
  const url = new URL("../src/current-pcb-diagnostic-pipe.ts", import.meta.url);
  const sourceRequire = createRequire(url);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name === "./current-pcb-via-write-program.ts") {
      assert.ok(actual !== null && typeof actual === "object"); return { ...actual,
        currentPcbViaWriteProgramArguments: (input: unknown): unknown => { assert.equal(input, plan); return { target: plan.target, operation: { operationId: plan.operationId, via: plan.via } }; } };
    } return actual;
  }, loaded, loaded.exports]);
  const result = loaded.exports["CurrentPcbViaWritePipe"]; assert.equal(typeof result, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Runtime checked VM export is the original class/private core with only the stated plan lookup seam.
  return result as typeof CurrentPcbViaWritePipe;
}
async function fixture(context: TestContext, holdSaveWrite = false): Promise<Readonly<{ pipe: CurrentPcbViaWritePipe; sent: Record<string, unknown>[];
  replySave: () => void; acknowledgeSave: (error?: Error) => void; emitEvent: (event: DiagnosticEvent) => void }>> {
  const Constructor = await constructor(), input = new PassThrough(), sent: Record<string, unknown>[] = [];
  let save: Record<string, unknown> | null = null, saveCallback: ((error?: Error | null) => void) | null = null;
  const reply = (command: Record<string, unknown>, result: unknown): void => { const text = `${JSON.stringify({ id: command["id"], result,
    ...(Object.hasOwn(command, "sessionId") ? { sessionId: command["sessionId"] } : {}) })}\0`; input.write(Buffer.from(text)); };
  const output = new Writable({ write(chunk: Buffer, _encoding, callback): void {
    const value: unknown = JSON.parse(chunk.subarray(0, -1).toString()); assert.ok(value !== null && typeof value === "object" && !Array.isArray(value));
    const command = Object.fromEntries(Object.entries(value)); sent.push(command);
    if (command["viaWritePhase"] === "save") { save = command; if (holdSaveWrite) { saveCallback = callback; return; } }
    else if (command["method"] === "Target.attachToTarget") { reply(command, { sessionId: "original-session" }); }
    else if (command["method"] === "Debugger.getScriptSource") { reply(command, { scriptSource: "synthetic-observer-source" }); }
    else { reply(command, {}); }
    callback();
  } });
  const inputClose = Promise.withResolvers<true>(), outputClose = Promise.withResolvers<true>();
  input.once("close", () => { inputClose.resolve(true); }); output.once("close", () => { outputClose.resolve(true); });
  const closed = [inputClose.promise, outputClose.promise];
  const pipe = new Constructor(input, output); pipe.start();
  context.after(async () => { input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  await pipe.attachTarget("original-target", () => { assert.fail("Unexpected event"); }); await pipe.observeViaStage("capture", "original-context", plan);
  return { pipe, sent, emitEvent: (event: DiagnosticEvent): void => { input.write(Buffer.from(`${JSON.stringify(event)}\0`)); }, replySave: (): void => { assert.ok(save !== null); reply(save, { result: { type: "boolean", value: true } }); },
    acknowledgeSave: (error?: Error): void => { assert.ok(saveCallback !== null); const original = saveCallback; saveCallback = null; original(error); } };
}
void test("Via retains one SDK Save while a fixed original source read settles out of order on the same ID stream", async context => {
  const f = await fixture(context); let saved = false;
  const save = (async (): Promise<Readonly<Record<string, unknown>>> => { const value = await f.pipe.observeViaStage("save", "original-binding", plan); saved = true; return value; })();
  const observed = await f.pipe.getScriptSource("original-worker-script"); assert.equal(observed["scriptSource"], "synthetic-observer-source"); assert.equal(saved, false);
  assert.deepEqual(f.sent.map(command => command["id"]), [1, 2, 3, 4]); assert.equal(f.pipe.status().pendingRequestId, 3);
  assert.throws(() => f.pipe.observeViaStage("save", "original-binding", plan), /SEQUENCE/u);
  await assert.rejects(f.pipe.observePrimitives209("original-context", plan.target), /RETAINED_PENDING_SCOPE/u);
  f.replySave(); await save; assert.equal(saved, true); assert.equal(f.pipe.status().pendingRequestId, null);
});
void test("an earlier SDK response without its original write acknowledgement cannot settle Save or permit replay", async context => {
  const f = await fixture(context, true); let saved = false;
  const original = (async (): Promise<Readonly<Record<string, unknown>>> => { const value = await f.pipe.observeViaStage("save", "original-binding", plan); saved = true; return value; })();
  f.replySave(); await Promise.resolve(); assert.equal(saved, false);
  const refusal = assert.rejects(original, /OUTPUT/u); f.acknowledgeSave(new Error("lost native WriteFile acknowledgement")); await refusal;
  assert.equal(saved, false); assert.equal(f.pipe.status().failure, "output"); assert.throws(() => f.pipe.observeViaStage("save", "original-binding", plan));
});
void test("legacy diagnostic purpose keeps its original single pending request invariant", async context => {
  const input = new PassThrough(), output = new PassThrough(), pipe = new CurrentPcbDiagnosticPipe(input, output); pipe.start();
  context.after(async () => { const closed = [once(input, "close"), once(output, "close")]; input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  const pending = pipe.getVersion(), refused = assert.rejects(pending); await assert.rejects(pipe.getTargets(), /REQUEST_PENDING/u);
  input.emit("error", new Error("synthetic original pipe stop")); await refused;
});

void test("actual Via pipe binds only its observed suspended child and keeps worker observations on the retained SDK stream", async context => {
  const f = await fixture(context); const events: DiagnosticEvent[] = [];
  await assert.rejects(f.pipe.enableWorkerDiscovery(() => { assert.fail("legacy worker callback"); }), /DISCOVERY_INPUT/u);
  await f.pipe.enableViaWorkerDiscovery(event => { events.push(event); });
  assert.throws(() => { f.pipe.bindViaWorker("unobserved", "unobserved"); }, /ORIGINAL_ATTACHMENT/u);
  f.emitEvent({ method: "Target.attachedToTarget", sessionId: "original-session", params: { sessionId: "actual-worker", waitingForDebugger: true,
    targetInfo: { targetId: "actual-target", type: "worker", attached: true, title: "original", url: "https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0" } } });
  assert.equal(events.length, 1); f.pipe.bindViaWorker("actual-worker", "actual-target");
  assert.throws(() => { f.pipe.selectWorkerSession("actual-worker"); }, /WORKER_SELECTION/u);
  assert.throws(() => { f.pipe.bindViaWorker("actual-worker", "actual-target"); }, /ORIGINAL_ATTACHMENT/u);
  const saved = f.pipe.observeViaStage("save", "original-binding", plan);
  await f.pipe.observeViaWorker({ phase: "via-worker-runtime", method: "Runtime.enable", params: {} });
  const worker = f.sent.at(-1); assert.equal(worker?.["sessionId"], "actual-worker");
  const native = currentPcbViaWriteNativeRequest(Buffer.from(`${JSON.stringify(worker)}\0`)); assert.equal(native["action"], "pcb-via-worker"); assert.equal(Object.hasOwn(native, "sessionId"), false);
  await f.pipe.configureViaWorkerRunning();
  const running = f.sent.at(-1); assert.ok(running !== undefined);
  const parent = currentPcbViaWriteNativeRequest(Buffer.from(`${JSON.stringify(running)}\0`)); assert.equal(parent["phase"], "running");
  assert.equal(f.pipe.status().pendingRequestId, 4); f.replySave(); await saved;
});

void test("actual Via clock pipe substitutes only its retained original initial contexts while SDKSave remains pending", async context => {
  const f = await fixture(context);
  assert.throws(() => { f.pipe.bindViaClock("worker-context", "sdk-tuple"); }, /CLOCK_BINDING/u);
  await f.pipe.enableViaWorkerDiscovery(() => {
    // The original child attachment is retained by the production pipe.
  });
  f.emitEvent({ method: "Target.attachedToTarget", sessionId: "original-session", params: { sessionId: "clock-worker", waitingForDebugger: true,
    targetInfo: { targetId: "clock-target", type: "worker", attached: true, title: "original", url: "https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0" } } });
  f.pipe.bindViaWorker("clock-worker", "clock-target"); await f.pipe.configureViaWorkerRunning();
  await f.pipe.observeViaStage("create", "sdk-tuple", plan); f.pipe.bindViaClock("worker-context", "sdk-tuple");
  const saved = f.pipe.observeViaStage("save", "sdk-tuple", plan);
  const registration = currentPcbViaClockNativeCases().find(command => command.phase === "via-clock-registration"); assert.ok(registration !== undefined);
  const original = validateCurrentPcbViaClockCommand({ ...registration, params: { ...registration.params, objectId: "sdk-tuple" } });
  await f.pipe.observeViaClock(original, "ui"); const frame = f.sent.at(-1); assert.ok(frame !== undefined);
  const encoded = currentPcbViaWriteNativeRequest(Buffer.from(`${JSON.stringify(frame)}\0`)); assert.equal(encoded["action"], "pcb-via-clock"); assert.equal(Object.hasOwn(encoded, "objectId"), false);
  const count = f.sent.length; assert.throws(() => f.pipe.observeViaClock(validateCurrentPcbViaClockCommand({ ...registration, params: { ...registration.params, objectId: "foreign-sdk" } }), "ui"), /INITIAL_RECEIVER/u);
  assert.equal(f.sent.length, count); f.replySave(); await saved;
});
