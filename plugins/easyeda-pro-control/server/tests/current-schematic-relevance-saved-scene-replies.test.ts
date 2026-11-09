/** Actual Node24 Inspector envelopes on the fixed readonly scene in an inert
 * graph. This supplies no Chrome owner, cold-load or persistence evidence. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { GENERATED_SCHEMATIC_RELEVANCE_SAVED_READER_FUNCTION as PROGRAM } from "../src/generated-schematic-relevance-saved-reader-function.ts";
import { decodeCurrentSchematicRelevanceSavedSceneCapture as capture, decodeCurrentSchematicRelevanceSavedSceneReply as observe,
  requireCurrentSchematicRelevanceSavedSceneRelease as release } from "../src/current-schematic-relevance-saved-scene-replies.ts";
import { compareGeneratedSchematicRelevanceSavedSourceData } from "../src/generated-schematic-relevance-display-effect-data.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";

void test("actual Inspector tuple, scene and empty release envelopes retain all false authority fields", async () => {
  assert.equal(process.versions.node, "24.18.0"); const vm = fixture();
  vm.edit('for(const [key,value]of Object.entries(op.afterBody))textRecord.body[key]=value;');
  const fn = vm.reference(`(${PROGRAM})`); const root = vm.reference("globalThis");
  const args = vm.reference('({target:t,operation:{operationId:op.operationId,textId:op.textId,body:op.afterBody,peers:op.peers,rootIds:op.rootIds}})');
  assert.ok(typeof fn === "function" && args !== null && typeof args === "object" && "target" in args && "operation" in args);
  const tuple: unknown = await Reflect.apply(fn, root, [args.target, "capture", args.operation]);
  const result: unknown = await Reflect.apply(fn, tuple, [args.target, "observe", args.operation]);
  const group = "saved-scene-replies-test", tupleKey = "__savedSceneTupleTest", valueKey = "__savedSceneReplyTest";
  const session = new Session(); session.connect(); let releaseAttempted = false;
  Object.defineProperty(globalThis, tupleKey, { value: tuple, configurable: true }); Object.defineProperty(globalThis, valueKey, { value: result, configurable: true });
  try {
    const selected = await session.post("Runtime.evaluate", { expression: `globalThis.${tupleKey}`, objectGroup: group, generatePreview: false });
    assert.equal(capture(selected), selected.result.objectId);
    const packet = await session.post("Runtime.evaluate", { expression: `globalThis.${valueKey}`, objectGroup: group, returnByValue: true, generatePreview: false });
    const tab: unknown = vm.reference("_TAB_ID_"); assert.ok(typeof tab === "string"); const decoded = observe(packet, tab);
    const projection = compareGeneratedSchematicRelevanceSavedSourceData(data().args, decoded.source);
    assert.equal(projection.exactProjectedTextBodyVerified, true); assert.equal(decoded.persistentModels, 6); assert.equal(decoded.endpointMarkers, 2);
    for (const key of ["readerNativeOriginVerified", "coldLoadVerified", "persistenceVerified", "reopenedVerified", "executionAuthorized"] as const) { assert.equal(decoded[key], false); }
    assert.throws(() => observe(packet, "foreign-window"));
    assert.throws(() => observe({ result: { type: "object", value: { ...decoded, coldLoadVerified: true } } }, tab));
    assert.throws(() => observe({ result: { type: "object", value: { ...decoded, endpointMarkers: 1 } } }, tab));
    releaseAttempted = true;
    // oxlint-disable-next-line typescript/no-confusing-void-expression -- Node declares this Inspector reply void; validate its actual empty runtime envelope as unknown rather than fabricating an acknowledgment.
    const releaseReply: unknown = await session.post("Runtime.releaseObjectGroup", { objectGroup: group });
    release(releaseReply);
  } finally {
    Reflect.deleteProperty(globalThis, tupleKey); Reflect.deleteProperty(globalThis, valueKey);
    if (!releaseAttempted) { releaseAttempted = true; await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); }
    session.disconnect();
  }
  assert.deepEqual(vm.counts(), { setSource: 0, setters: 0, transactions: 0, save: 0 });
});
void test("scene decoders refuse accessor packets, exceptions and fabricated release acknowledgments", () => {
  let invoked = 0; const input = Object.defineProperty({}, "result", { enumerable: true, get() { invoked += 1; return {}; } });
  assert.throws(() => capture(input)); assert.throws(() => observe(input, "window")); assert.throws(() =>{  release(input); }); assert.equal(invoked, 0);
  assert.throws(() => capture({ exceptionDetails: { text: "foreign" } })); assert.throws(() =>{  release({ result: {} }); }); assert.throws(() =>{  release({ released: true }); });
});
