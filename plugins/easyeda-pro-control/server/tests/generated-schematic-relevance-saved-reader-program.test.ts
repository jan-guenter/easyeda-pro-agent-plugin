/** Fresh readonly scene syntax on the established inert application graph. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { compareGeneratedSchematicRelevanceSavedSourceData } from "../src/generated-schematic-relevance-display-effect-data.ts";
import { GENERATED_SCHEMATIC_RELEVANCE_SAVED_READER_FUNCTION as PROGRAM, generatedSchematicRelevanceSavedReaderArguments } from "../src/generated-schematic-relevance-saved-reader-program.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";

void test("saved scene reader observes seven records and both endpoint markers without SDK or action access", async () => {
  const vm = fixture();
  // Model only the saved record values. No writer or Save stage is executed.
  vm.edit('for(const [key,value]of Object.entries(op.afterBody))textRecord.body[key]=value;globalThis.forbidden=0;Object.defineProperty(globalThis,"_EXTAPI_ROOT_",{get(){forbidden++;throw Error("SDK access");},configurable:true});Object.defineProperty(runner,"run",{get(){forbidden++;throw Error("run access");}});');
  const fn = vm.reference(`(${PROGRAM})`); const root = vm.reference("globalThis"); const args = vm.reference('({target:t,operation:{operationId:op.operationId,textId:op.textId,body:op.afterBody,peers:op.peers,rootIds:op.rootIds}})');
  assert.ok(typeof fn === "function" && args !== null && typeof args === "object" && "target" in args && "operation" in args);
  const holder: unknown = await Reflect.apply(fn, root, [args.target, "capture", args.operation]);
  const observed: unknown = await Reflect.apply(fn, holder, [args.target, "observe", args.operation]);
  assert.ok(observed !== null && typeof observed === "object" && "source" in observed && typeof observed.source === "string");
  assert.equal(compareGeneratedSchematicRelevanceSavedSourceData(data().args, observed.source).exactProjectedTextBodyVerified, true);
  assert.equal(Reflect.get(observed, "persistentModels"), 6); assert.equal(Reflect.get(observed, "endpointMarkers"), 2);
  for (const key of ["readerNativeOriginVerified", "coldLoadVerified", "persistenceVerified", "reopenedVerified", "executionAuthorized"]) { assert.equal(Reflect.get(observed, key), false); }
  assert.deepEqual(vm.counts(), { setSource: 0, setters: 0, transactions: 0, save: 0 }); assert.equal(vm.reference("forbidden"), 0);
  await assert.rejects(async () => { await Reflect.apply(fn, holder, [args.target, "observe", args.operation]); }, /CONSUMED/u);
  for (const stage of ["modify", "save", "navigate"]) { await assert.rejects(async () => { await Reflect.apply(fn, root, [args.target, stage, args.operation]); }, /STAGE/u); }
  assert.doesNotMatch(PROGRAM, /_EXTAPI_ROOT_|modifyAttempted|saveAttempted|reproveSetter|const setter=|b\.run\b|b\.save\b/u);
});
void test("saved reader argument issuer refuses copied preparation before inspecting caller properties", () => {
  let calls = 0; const forged = Object.defineProperty({}, "profile", { get() { calls += 1; throw new Error("getter"); } });
  assert.throws(() => Reflect.apply(generatedSchematicRelevanceSavedReaderArguments, undefined, [forged])); assert.equal(calls, 0);
});
