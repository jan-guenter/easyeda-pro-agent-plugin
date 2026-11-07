/** Native gate source only: no owner, app, native IPC or vendor code executes. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { applyCurrentPcbViaSaveGenerationNativeFragment as apply } from "../src/current-pcb-via-save-generation-native-fragment.ts";

const input = `||stage=="save"||stage=="create"&&!viaProducerPrefixEnrolled)throw Error("via-sdk-stage-eligibility");
viaSdkStages[index]=true;SendMessage(id,message);
if(phase!="via-save-source"&&!viaSdkStages[4])throw Error("via-save-original-attempt");
internal enum EasyedaPcbViaWriteBirth { Original }
    [EasyedaGeneratedInitialSyncProtocol]::VerifyPeriodicSmoke()
`;
void test("the original native Save gate keeps every source observer and planned SQL arm prerequisite", () => {
  const source = apply(input); assert.equal(apply(source), source);
  const match = /bool ViaSaveGenerationReady\(\)\{return ([^;]+);\}/u.exec(source); assert.ok(match?.[1] !== undefined);
  const predicate = match[1]; const positive: Record<string, unknown> = {};
  for (const term of predicate.split("&&")) {
    const array = /^(\w+)\[(\d+)\]$/u.exec(term), length = /^(\w+)\.Count==(\d+)$/u.exec(term);
    if (length?.[1] !== undefined && length[2] !== undefined) { positive[length[1]] = { Count: Number(length[2]) }; }
    else if (array?.[1] !== undefined && array[2] !== undefined) { const prior: unknown = positive[array[1]]; const values: boolean[] = Array.isArray(prior) && prior.every((value: unknown) => typeof value === "boolean") ? prior : []; values[Number(array[2])] = true; positive[array[1]] = values; }
    else if (/^!?\w+$/u.test(term)) { positive[term.replace(/^!/u, "")] = !term.startsWith("!"); }
    else if (term === "originalMain!=null") { positive["originalMain"] = {}; }
    else if (/^\w+==\d+$/u.test(term)) { const parts = term.split("=="); assert.ok(parts[0] !== undefined && parts[1] !== undefined); positive[parts[0]] = Number(parts[1]); }
  }
  positive["viaSdkStages"] = [true, true, true, true, false]; positive["viaSpatial"] = [{ released: true, reads: 1 }, { released: true, reads: 1 }];
  const evaluate = (value: Record<string, unknown>): unknown => runInNewContext(`(${predicate})`, value);
  assert.equal(evaluate(positive), true);
  for (const key of ["viaConstructionComplete", "viaMainPrecreateEnrolled", "viaWorkerParentRunning", "viaClockBound", "viaClockRegistration", "viaClockWorker", "viaStructureBootstrapResumed", "viaProducerPrefixEnrolled", "viaProducerIntrinsicsReproved", "viaInitialCacheCompleted", "viaInitialSyncCompleted", "viaStructureTransportCaptured"]) { assert.equal(evaluate({ ...positive, [key]: false }), false, key); }
  for (const key of ["viaAbortAttempted", "viaSaveGenerationAttempted", "viaStartupActive", "viaStructureTransportFailed", "viaStructureBodyEnrollmentAttempted"]) { assert.equal(evaluate({ ...positive, [key]: true }), false, key); }
  for (const key of ["viaSavePoints", "viaClockPoints", "viaStructurePoints", "viaProducerObserveArms", "viaStructureTransportPoints", "viaBeginArms", "viaHistoryArms", "viaStructureMainArms"]) { assert.equal(evaluate({ ...positive, [key]: { Count: 0 } }), false, key); }
  for (const key of ["viaClockCleanup", "viaStartupFinalizers", "viaPeriodicSyncStage", "viaBeginStep", "viaHistoryStep", "viaStructureMainStep"]) { assert.equal(evaluate({ ...positive, [key]: 1 }), false, key); }
  assert.equal(evaluate({ ...positive, viaSdkStages: [true, true, true, true, true] }), false);
  assert.equal(evaluate({ ...positive, viaSpatial: [{ released: true, reads: 1 }, { released: false, reads: 1 }] }), false);
  assert.match(source, /via-save-body-original-reservation/u);
  assert.match(source, /if\(stage=="save"\)ConsumeViaSaveGeneration\(\);viaSdkStages\[index\]=true;SendMessage/u);
  assert.throws(() => apply(input.replace('||stage=="save"||', '||stage=="foreign"||')), /ANCHOR/u);
});
