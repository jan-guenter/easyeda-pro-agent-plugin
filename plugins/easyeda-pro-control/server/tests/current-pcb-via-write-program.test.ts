/** Actual fixed program and installed SDK method bodies in inert V8. The
 * maintained target-observation function is an explicit external test seam.
 * No native owner, generated fixture proof or writer admission is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { createContext, runInContext, runInThisContext } from "node:vm";
import type { Context } from "node:vm";
import { transform } from "esbuild";
import { currentPcbViaWriteRequestSchema, requireOriginalCurrentPcbViaWritePlan } from "../src/current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWritePlan } from "../src/current-pcb-via-write-plan.ts";
import { currentPcbViaWriteStageResultSchema } from "../src/current-pcb-via-write-contract.ts";
import { CURRENT_PCB_VIA_WRITE_SDK_METHODS as METHODS } from "../src/current-pcb-via-write-program.ts";

async function fixture(): Promise<Context> {
  const url = new URL("../src/current-pcb-via-write-program.ts", import.meta.url);
  const sourceRequire = createRequire(url);
  const output = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-pcb-diagnostic-pcb-opening.ts" ? {
    CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION: 'async function(target,phase){return JSON.stringify({...target,phase,ok:true,frameObserved:true});}',
  } : sourceRequire(name) as unknown, loaded, loaded.exports]);
  const program = loaded.exports["CURRENT_PCB_VIA_WRITE_FUNCTION"]; assert.equal(typeof program, "string");
  const context = createContext({});
  runInContext(`globalThis.calls={create:0,save:0};globalThis.createDeferred=Promise.withResolvers();globalThis.saveDeferred=Promise.withResolvers();
const T={extensionApiMessageBus2:{rpcCall:async(topic)=>{if(topic!=="extensionApi.PCB_Document.save")throw new Error("wrong topic");calls.save++;return await saveDeferred.promise;}}};
class qi{constructor(net,x,y,holeDiameter,diameter,viaType,designRuleBlindViaName,solderMaskExpansion,primitiveLock){Object.assign(this,{net,x,y,holeDiameter,diameter,viaType,designRuleBlindViaName,solderMaskExpansion,primitiveLock});}async create(){calls.create++;await createDeferred.promise;this.primitiveId="original-new-via";return this;}}
class LT{${METHODS.create}}class Doc{${METHODS.save}}
globalThis._EXTAPI_ROOT_={pcb_PrimitiveVia:new LT,pcb_Document:new Doc};
globalThis.target={rawWindowsPath:"C:\\\\Synthetic\\\\Fixture.eprj2",projectUuid:"${"a".repeat(64)}",branchUuid:"${"b".repeat(32)}",documentUuid:"${"c".repeat(32)}",expectedSourceSha256:"${"d".repeat(64)}"};
globalThis.operation={operationId:"pcb209-via-write-synthetic",via:{netName:"",xMil:100,yMil:200,holeDiameterMil:10,diameterMil:20,viaType:0,designRuleBlindViaName:"",solderMaskExpansion:{topSolderMask:0,bottomSolderMask:0},primitiveLock:false}};
globalThis.program=(${String(program)});`, context);
  const binding: unknown = await runInContext('program.call(globalThis,target,"capture",operation)', context);
  assert.ok(Array.isArray(binding)); context["binding"] = binding; return context;
}
async function stage(context: Context, name: string): Promise<ReturnType<typeof currentPcbViaWriteStageResultSchema.parse>> {
  const result: unknown = await runInContext(`program.call(binding,target,${JSON.stringify(name)},operation)`, context);
  return currentPcbViaWriteStageResultSchema.parse(result);
}
async function created(context: Context): Promise<void> {
  const pending = stage(context, "create"); await nextTurn(); assert.equal(runInContext("calls.create", context), 1);
  runInContext("createDeferred.resolve();", context); const result = await pending; assert.equal(result.ok, true);
}

void test("fixed current209 method bodies and the ninth lock argument create one original Via", async () => {
  const f = await fixture(); const preflight = await stage(f, "preflight"); assert.equal(preflight.ok, true);
  await created(f); const result = await stage(f, "observe"); assert.equal(result.primitiveId, "original-new-via");
  assert.equal(result.createAcknowledged, true); assert.equal(result.saveAttempted, false); assert.equal(runInContext("calls.save", f), 0);
  assert.equal(result.persistenceVerified, false); assert.equal(result.inverseAvailable, false);
});
void test("one Save waits its original SDK Promise and never grants durability from its acknowledgement", async () => {
  const f = await fixture(); await created(f); let done = false;
  const pending = (async (): Promise<ReturnType<typeof currentPcbViaWriteStageResultSchema.parse>> => { const result = await stage(f, "save"); done = true; return result; })();
  await nextTurn(); assert.equal(runInContext("calls.save", f), 1); assert.equal(done, false);
  runInContext("saveDeferred.resolve(true);", f); const result = await pending;
  assert.equal(result.saveAttempted, true); assert.equal(result.saveAcknowledged, true); assert.equal(result.persistenceVerified, false);
  const duplicate = await stage(f, "save"); assert.equal(duplicate.ok, false); assert.equal(runInContext("calls.save", f), 1);
});
void test("a rejected Save consumes the original attempt and a later call cannot replay it", async () => {
  const f = await fixture(); await created(f); const pending = stage(f, "save"); await nextTurn();
  runInContext('saveDeferred.reject(new Error("synthetic save refused"));', f);
  const result = await pending; assert.equal(result.ok, false); assert.equal(result.saveAttempted, true);
  await assert.rejects(stage(f, "save")); assert.equal(runInContext("calls.save", f), 1);
});
void test("SDK receiver drift during original create prevents Save and preserves its consumed attempt", async () => {
  const f = await fixture(), pending = stage(f, "create"); await nextTurn();
  runInContext("_EXTAPI_ROOT_={..._EXTAPI_ROOT_};createDeferred.resolve();", f);
  const result = await pending; assert.equal(result.ok, false); assert.equal(result.createAttempted, true);
  await assert.rejects(stage(f, "save")); assert.equal(runInContext("calls.create", f), 1); assert.equal(runInContext("calls.save", f), 0);
});
void test("copied retained arrays and copied plans cannot regain original ownership", async () => {
  const f = await fixture(); runInContext("globalThis.binding=Array.from(binding);", f);
  await assert.rejects(stage(f, "preflight")); assert.equal(runInContext("calls.create", f), 0);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately malformed data must fail the private issuance lookup before property or native access.
  assert.throws(() => requireOriginalCurrentPcbViaWritePlan({} as CurrentPcbViaWritePlan));
  for (const via of [{ netName: "GND", xMil: 0, yMil: 0, holeDiameterMil: 1, diameterMil: 2 },
    { netName: "", xMil: -0, yMil: 0, holeDiameterMil: 1, diameterMil: 2 },
    { netName: "", xMil: 0, yMil: 0, holeDiameterMil: 2, diameterMil: 2 }]) {
    assert.equal(currentPcbViaWriteRequestSchema.safeParse({ schema: "easyeda-pro-control.pcb209-via-write-request.v1", operationId: "pcb209-via-write-synthetic", via }).success, false);
  }
});
