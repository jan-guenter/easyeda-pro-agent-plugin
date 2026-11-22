/** Shared inert Inspector, vendor fixture and original worker for three Wire continuations. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { TestContext } from "node:test";
import { runInContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { wireNativeFixture } from "../generated-schematic-wire-native-fixture.ts";
import { installWireOriginalCompletionRoots } from "./current-schematic-wire-action-complete-fixture.ts";
import { installWireOriginalRunner } from "./current-schematic-wire-tick-body-fixture.ts";

interface ContinuationOptions {
  readonly fixture: (source: string, variant: 0) => string;
  readonly completion?: "held" | "postcondition";
}

export async function runWireContinuationFixture(context: TestContext, source: string, options: ContinuationOptions): Promise<object> {
  const variant = 0;
  const mode = `bbox-method-preparation-execution-hooks-dependencies-returns-children-prerequisites-attrs-points-data-setter-runner-tick-body${options.completion === undefined ? "" : "-complete"}`;
  const key = `__wireCallbackDriver${String(variant)}${mode.replaceAll("-", "")}`;
  const vendorUrl = `${key}Vendor.js`;
  const session = new Session();
  session.connect();
  let contextId = 0, stageScriptId = "", vendorScriptId = "";
  let vm: ReturnType<typeof wireNativeFixture>["fixtureContext"];
  try {
    await session.post("Debugger.enable");
    session.on("Debugger.scriptParsed", notification => {
      if (notification.params.url === "wireNativeStage-v4.js") {
        stageScriptId = notification.params.scriptId;
        contextId = notification.params.executionContextId;
      }
      if (notification.params.url === vendorUrl) { vendorScriptId = notification.params.scriptId; }
    });
    const native = wireNativeFixture("success", "v4", variant, true, mode.endsWith("-shared-source"));
    vm = native.fixtureContext;
    const refs: unknown = runInContext(options.fixture(source, variant), vm, { filename: vendorUrl });
    assert.ok(refs !== null && typeof refs === "object");
    Object.defineProperty(vm, "fixtureRefs", { value: refs, configurable: true });
    installWireOriginalRunner(vm);
    if (options.completion !== undefined) { installWireOriginalCompletionRoots(vm); }
    runInContext(`globalThis.fixtureAstGetterCalls=0;fixtureRoots.shapes.shouldUpdateAst=${String(false)};fixtureRefs.monitor.onModelAttributeChange=fixtureRefs.modifyView;fixtureRoots.shapes.bboxMonitor=fixtureRefs.bbox;fixtureRefs.bbox.shapeManager=fixtureRoots.shapes;fixtureRefs.bbox.onModelAttributeChange=fixtureRefs.bboxAttribute;fixtureRefs.bbox.add=fixtureRefs.bboxAdd;fixtureRefs.bbox._nextTickPromise=null;fixtureRefs.bbox._modelMapForOnBBoxChangeAsync=new Map;fixtureRefs.bbox._modelsShouldUpdateBBox=new Map;fixtureRefs.bbox._modelTypesShouldUpdateBBox=new Set;fixtureRefs.bbox._addCore=fixtureRefs.core.forCommon;fixtureRefs.bbox._addCoreMethods=fixtureRefs.core;fixtureRefs.bbox.shouldUpdateInAsync=false;fixtureRefs.bbox._onModelsBBoxChangeAsync=new fixtureRefs.dispatcherClass({});fixtureRefs.bbox._tryAddParent=fixtureRefs.bboxTryParent;globalThis.fixtureSavedSetAdd=Set.prototype.add;globalThis.fixtureSavedMapSet=Map.prototype.set;globalThis.fixtureProtoHistoryDescriptor=Object.getOwnPropertyDescriptor(Object.prototype,"notAddHistory");globalThis.fixtureProtoWireDescriptor=Object.getOwnPropertyDescriptor(Object.prototype,"Wire");globalThis.fixtureLineParentDescriptor=Object.getOwnPropertyDescriptor(fixtureRoots.line,"parent");globalThis.fixtureLineTypeDescriptor=Object.getOwnPropertyDescriptor(fixtureRoots.line,"modelType");globalThis.fixtureSavedPromise=Promise;globalThis.fixturePromiseDescriptors=Object.getOwnPropertyDescriptors(Promise);globalThis.fixturePromiseProtoDescriptors=Object.getOwnPropertyDescriptors(Promise.prototype);globalThis.fixtureModuleGetterCalls=0;globalThis.fixtureViewGetterCalls=0;fixtureRefs.monitor.modelsMayBeShouldUpdateView=new Set;
  fixtureRefs.monitor.shapeManager=fixtureRoots.shapes;fixtureRoots.shapes.modifyMonitor=fixtureRefs.monitor;Object.defineProperty(fixtureRoots.line,"points",Object.getOwnPropertyDescriptor(fixtureRefs.pointObject.prototype,"points"));globalThis.fixtureNative=Object.freeze([Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype]);`,vm);
    runInContext("Object.setPrototypeOf(fixtureRefs.childAttributesObject,fixtureRefs.baseAttributesObject)",vm);
    runInContext("fixtureRoots.group.setLines=fixtureRefs.setLines",vm);
    const captured = await native.call("capture");
    assert.ok(Array.isArray(captured));
    const before = await native.call("preflight");
    assert.ok(before !== null && typeof before === "object" && Reflect.get(before, "ok") === true);
    assert.ok(stageScriptId.length > 0 && vendorScriptId.length > 0);
  } finally { session.disconnect(); }

  Object.defineProperty(globalThis, key, { value: vm, configurable: true });
  context.after(() => { Reflect.deleteProperty(globalThis, key); });
  const result = Promise.withResolvers<unknown>();
  const originalExit = Promise.withResolvers<number>();
  const worker = new Worker(new URL("current-schematic-wire-callback-driver-worker.ts", import.meta.url), { workerData: {
    key, vendorScriptId, contextId, targetJson: JSON.stringify(Reflect.get(vm, "target")),
    operationJson: JSON.stringify(Reflect.get(vm, "operation")), variant, source, mode,
    ...(options.completion === "postcondition" ? { postconditionContinuation: true } : {}),
  } });
  context.after(async () => { await worker.terminate(); });
  let reported = false;
  worker.once("message", (raw: unknown) => { reported = true; result.resolve(raw); });
  worker.once("error", result.reject);
  worker.once("exit", (code: number): void => {
    originalExit.resolve(code);
    if (!reported) { result.reject(new Error(`Wire continuation worker exited before reporting its result (${String(code)})`)); }
  });
  const raw = await result.promise;
  const originalWorkerExitCode = await originalExit.promise;
  assert.equal(originalWorkerExitCode, 0, "original worker must finish its raw-reply write before teardown");
  context.diagnostic(JSON.stringify({schema:"test.schematic-wire-setter-worker-exit.v1",originalWorkerExitCode,writeCompletedBeforeTeardown:true}));
  assert.ok(raw !== null && typeof raw === "object" && !("error" in raw), JSON.stringify(raw));
  context.diagnostic(JSON.stringify(raw));
  return raw;
}
