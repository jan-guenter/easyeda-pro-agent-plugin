/** The readonly scene codec cannot encode any historical writer phase. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_SCENE_FUNCTION as PROGRAM, currentSchematicRelevanceSavedSceneCommand as command,
  currentSchematicRelevanceSavedSceneNativeFrame as frame, validateCurrentSchematicRelevanceSavedSceneCommand as validate,
  currentSchematicRelevanceSavedSceneWire as wire } from "../src/current-schematic-relevance-saved-scene-protocol.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";

function argumentsData(): Readonly<Record<string, unknown>> {
  const original = data().args;
  return { target: original.target, operation: { operationId: original.operation.operationId, textId: original.operation.textId, body: original.operation.afterBody,
    peers: original.operation.peers, rootIds: original.operation.rootIds } };
}
void test("fixed saved scene frames round trip with separate context/tuple selectors and no writer phases", () => {
  const args = argumentsData();
  for (const phase of ["capture", "observe", "release"] as const) {
    const fixed = phase === "release" ? command(phase, "") : command(phase, phase === "capture" ? "original-context" : "original-tuple", args);
    const encoded = wire(fixed, 163, "original-session");
    const bytes = Buffer.from(`${JSON.stringify(encoded.command)}\0`);
    assert.deepEqual(frame(bytes, "original-session"), encoded.request);
    assert.throws(() => frame(bytes, "foreign-session"));
    assert.throws(() => frame(Buffer.from(`${JSON.stringify(encoded.command)} \0`), "original-session"));
    assert.throws(() => validate({ ...fixed, savedScenePhase: "save" }));
    if (fixed.savedScenePhase !== "release") {
      assert.equal(fixed.params.returnByValue, phase === "observe");
      assert.throws(() => validate({ ...fixed, params: { ...fixed.params, functionDeclaration: "function(){return true;}" } }));
      assert.throws(() => validate({ ...fixed, params: { ...fixed.params, arguments: [fixed.params.arguments[0], { value: "modify" }, fixed.params.arguments[2]] } }));
    }
  }
  let invoked = 0; const forged = Object.defineProperty({}, "params", { get() { invoked += 1; return {}; } });
  assert.throws(() => validate(forged)); assert.equal(invoked, 0);
  assert.throws(() => command("release", "foreign-tuple"));
  assert.throws(() => command("release", "", args));
  assert.throws(() => wire(command("capture", "context", args), Number.MAX_SAFE_INTEGER + 1, "session"));
});
void test("exact encoded readonly function preserves saved source and never touches SDK/action getters", async () => {
  const vm = fixture();
  vm.edit('for(const [key,value]of Object.entries(op.afterBody))textRecord.body[key]=value;globalThis.forbidden=0;Object.defineProperty(globalThis,"_EXTAPI_ROOT_",{get(){forbidden++;throw Error("SDK access");},configurable:true});Object.defineProperty(runner,"run",{get(){forbidden++;throw Error("run access");}});');
  const fn = vm.reference(`(${PROGRAM})`), root = vm.reference("globalThis"); assert.ok(typeof fn === "function");
  const encoded = command("capture", "original-context", argumentsData()); assert.ok(encoded.savedScenePhase === "capture");
  const input = encoded.params.arguments.map(item => item.value);
  const tuple: unknown = await Reflect.apply(fn, root, input);
  const result: unknown = await Reflect.apply(fn, tuple, [input[0], "observe", input[2]]);
  assert.ok(result !== null && typeof result === "object");
  assert.equal(Reflect.get(result, "persistentModels"), 6); assert.equal(Reflect.get(result, "endpointMarkers"), 2);
  assert.equal(Reflect.get(result, "reopenedVerified"), false); assert.equal(Reflect.get(result, "executionAuthorized"), false);
  assert.deepEqual(vm.counts(), { setSource: 0, setters: 0, transactions: 0, save: 0 }); assert.equal(vm.reference("forbidden"), 0);
  await assert.rejects(async () => { await Reflect.apply(fn, tuple, [input[0], "save", input[2]]); }, /STAGE/u);
});
