/** Actual generated capture shape plus a real Inspector raw reader. The
 * surrounding EasyEDA graph is synthetic and no Modify or Save is dispatched. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_RELEVANCE_RAW_REFERENCE_PROGRAM as OLD } from "../src/current-schematic-relevance-action-raw-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_SCENE_RAW_REFERENCES as REFERENCES } from "../src/current-schematic-wire-scene-raw-programs.ts";
import { CURRENT_SCHEMATIC_WIRE_SCENE_RAW_REQUESTS as LIMIT, currentSchematicWireSceneRawCases, currentSchematicWireSceneRawTemplate, validateCurrentSchematicWireSceneRawCommand as validate } from "../src/current-schematic-wire-scene-raw-protocol.ts";
import { CurrentSchematicWireSceneRawCursor } from "../src/current-schematic-wire-scene-raw-cursor.ts";
import { wireNativeFixture } from "./generated-schematic-wire-native-fixture.ts";

function object(input: unknown): object { assert.ok(input !== null && typeof input === "object"); return input; }
function value(input: unknown, key: PropertyKey): unknown { return Reflect.get(object(input), key); }
function invoke(fn: unknown, receiver: unknown, args: readonly unknown[]): unknown { assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args); }
void test("separate scene raw reader consumes the generated six persistent rows and two markers at one real VM pause", { timeout: 30_000 }, async context => {
  const fixture = wireNativeFixture("raw-reader", "v3"); const holder = await fixture.call("capture"); await fixture.call("preflight");
  const b = value(holder, "0"); const state = object(value(holder, "1")); const before = value(state, "before"); const tree = value(before, "tree"); const markers = value(before, "markers");
  assert.ok(Array.isArray(tree) && Array.isArray(markers)); assert.equal(tree.length, 6); assert.equal(markers.length, 2);
  let getterCalls = 0; Object.defineProperty(object(value(b, "ui")), "opaqueExportGetter", { get(): never { getterCalls += 1; throw new Error("unqualified export getter must stay uncalled"); }, configurable: true });
  // This inert phase marker grants no operation. It exercises the real
  // Generated capture shape at the later reader's required held stage.
  Reflect.set(state, "modifyAttempted", true); Reflect.set(object(value(b, "handler")), "sourceCodeIdMap", value(before, "sourceMap"));
  const root = value(b, "root"); const ctor: unknown = Reflect.get(object(root), "Function"); assert.ok(typeof ctor === "function");
  const nativeFactory: unknown = Reflect.construct(ctor, ['return [Object.getOwnPropertyDescriptor,Object.getOwnPropertyDescriptors,Object.getPrototypeOf,Object.is,Object.hasOwn,Reflect.ownKeys,Reflect.apply,Array.isArray,Map.prototype.get,Map.prototype.has,Map.prototype.forEach,Object.getOwnPropertyDescriptor(Map.prototype,"size").get,Set.prototype.has,Set.prototype.forEach,Object.getOwnPropertyDescriptor(Set.prototype,"size").get,Object.prototype,Array.prototype,Map.prototype,Set.prototype]']); const native = invoke(nativeFactory, root, []);
  const oldFactory: unknown = Reflect.construct(ctor, [`return(${OLD})`]); const newFactory: unknown = Reflect.construct(ctor, [`return(${REFERENCES})`]);
  const oldFn = invoke(oldFactory, root, []); const newFn = invoke(newFactory, root, []); assert.throws(() => invoke(oldFn, holder, [native]), /RAW_REFERENCES/u);
  const refs = invoke(newFn, holder, [native]); assert.ok(Array.isArray(refs)); assert.equal(refs.length, 24); assert.equal(refs[7], markers[0]); assert.equal(refs[8], markers[1]); assert.equal(refs[10], value(b, "shapes")); assert.equal(refs[22], value(b, "runner"));
  const retainedMarker: unknown = markers[0]; markers[0] = value(tree[0], "model"); assert.throws(() => invoke(newFn, holder, [native]), /RAW_REFERENCES/u); markers[0] = retainedMarker;
  const factory: unknown = Reflect.construct(ctor, ["heldHolder", "return function originalSceneRawHeld(){debugger;return heldHolder;}"]); const drive = invoke(factory, root, [holder]);
  const worker = new Worker(new URL("helpers/current-schematic-wire-scene-raw-worker.ts", import.meta.url)); const done = Promise.withResolvers<unknown>(); context.after(async () => { await worker.terminate(); }); worker.on("error", done.reject);
  worker.on("message", (packet: unknown) => { if (packet !== null && typeof packet === "object" && "ready" in packet) { invoke(drive, root, []); } else { done.resolve(packet); } });
  const result = object(await done.promise); assert.ok(!("error" in result), JSON.stringify(result)); assert.equal(Reflect.get(result, "count"), LIMIT.rawObservation); assert.equal(Reflect.get(result, "helpers"), LIMIT.functionCalls); assert.equal(Reflect.get(result, "externalSources"), LIMIT.helperSources);
  assert.equal(Reflect.get(result, "modelAccessorRefused"), true); assert.equal(Reflect.get(result, "namespaceGetterDriftRefused"), true); assert.equal(getterCalls, 0);
  const data = object(Reflect.get(result, "data")); assert.equal(Reflect.get(data, "encoderInvoked"), false); assert.equal(Reflect.get(data, "continuationAuthorized"), false); assert.equal(Reflect.get(data, "originalPersistentSceneSlots"), 6); assert.equal(Reflect.get(data, "originalMarkerSceneSlots"), 2);
  assert.deepEqual(fixture.counts(), { actions: 0, points: 0, save: 0, allocation: 0 });
});
void test("scene raw grammar keeps released programs unchanged and consumes copied or malformed replies", () => {
  assert.notEqual(REFERENCES, OLD); assert.ok(OLD.includes('own(tree,"length")!==8'));
  for (const command of currentSchematicWireSceneRawCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireSceneRawTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-scene-raw-resume", method: "Debugger.resume", params: {} }));
  const cursor = new CurrentSchematicWireSceneRawCursor("1.2.3", "holder"); const command = cursor.next(); assert.ok(command !== null); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command);
  assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "foreign" } }); }); assert.throws(() => cursor.next()); assert.throws(() => cursor.requireCompleted());
});
