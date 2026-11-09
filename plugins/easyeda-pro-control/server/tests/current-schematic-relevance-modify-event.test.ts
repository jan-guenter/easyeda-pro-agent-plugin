/** Local Inspector and inert descriptor fixtures only. Fake getters below
 * deliberately fail native metadata and issue no trusted delivery grant. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_PROGRAMS as P } from "../src/current-schematic-relevance-modify-event-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyEventCommand as validate } from "../src/current-schematic-relevance-modify-event-protocol.ts";
import { currentSchematicRelevanceModifyEventPayload as payload } from "../src/current-schematic-relevance-modify-event-replies.ts";
import { qualifyCurrentNativeMessageEventFunction } from "../src/current-native-message-event-metadata.ts";

function run(program: string, receiver: unknown, args: readonly unknown[]): unknown {
  const fn: unknown = runInThisContext(`(${program})`); assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args);
}
interface Fixture { readonly native: readonly unknown[]; readonly frame: readonly unknown[]; readonly busTuple: readonly unknown[]; readonly constructors: readonly unknown[]; readonly prototypes: readonly object[]; readonly members: readonly unknown[]; readonly known: readonly unknown[]; readonly event: object; readonly getTrusted: () => boolean; readonly calls: () => number; readonly distrust: () => void }
function EventFixture(): never { throw new Error("uninvoked Event fixture"); }
function MessageEventFixture(): never { throw new Error("uninvoked MessageEvent fixture"); }
function ChannelFixture(): never { throw new Error("uninvoked channel fixture"); }
function TargetFixture(): never { throw new Error("uninvoked target fixture"); }
function prototypeOf(fn: () => never): object { const value: unknown = Object.getOwnPropertyDescriptor(fn, "prototype")?.value; assert.ok(value !== null && typeof value === "object"); return value; }
function fixture(): Fixture {
  let calls = 0, trusted = true;
  const bc = {}; const bus = { bc }; const root = { PROJECT: { workerBus: bus }, Event: EventFixture, MessageEvent: MessageEventFixture };
  const eventPrototype = prototypeOf(EventFixture); const messagePrototype = prototypeOf(MessageEventFixture);
  Object.setPrototypeOf(messagePrototype, eventPrototype);
  const envelope = { type: "PUBLISH", uuid: "sender", topic: "/pro-mgr/worker/batchPendData", message: [{ page: { type: "SCH_PAGE", pend: [["text", 17, "TEXT", "original-json"]] } }, "client", "unique", "page"] };
  const event: unknown = Object.create(messagePrototype); assert.ok(event !== null && typeof event === "object");
  const getTrusted = (): boolean => { calls += 1; return trusted; };
  Object.defineProperty(event, "isTrusted", { get: getTrusted, enumerable: true, configurable: false });
  const data = [bc, "message", bc, 2, envelope, "https://client", null];
  const fields = ["target", "type", "currentTarget", "eventPhase", "data", "origin", "source"];
  const getters = fields.map((field, index) => {
    const getter = (): unknown => { calls += 1; return data[index]; };
    Object.defineProperty(index < 4 ? eventPrototype : messagePrototype, field, { get: getter, enumerable: true, configurable: true }); return getter;
  });
  const name = (): string => { calls += 1; return "/tab/project/original"; };
  const members = [name, (): undefined => undefined, (_value: unknown): void => { calls += 1; }, (): void => { calls += 1; }, ...getters];
  const constructors = [ChannelFixture, TargetFixture, EventFixture, MessageEventFixture];
  const prototypes = constructors.map(value => prototypeOf(value));
  const apply: unknown = Object.getOwnPropertyDescriptor(Function.prototype, "apply")?.value;
  const native = [Object.getOwnPropertyDescriptor, Object.getPrototypeOf, Object.hasOwn, Object.getOwnPropertyNames, Object.getOwnPropertySymbols, Array.isArray, apply, Object.prototype, Array.prototype, Function.prototype, root];
  const frame = [bus, event]; const busTuple = [bus, bc, {}];
  const cache = envelope.message[0]; assert.ok(cache !== null && typeof cache === "object" && "page" in cache); const row = cache.page;
  const known = [root, bus, bc, event, eventPrototype, messagePrototype, ...constructors, ...prototypes, ...members, getTrusted, envelope, envelope.message, cache, row, row.pend, row.pend[0], frame, busTuple, Object.prototype, Array.prototype, Function.prototype];
  return { native, frame, busTuple, constructors, prototypes, members, known, event, getTrusted, calls: (): number => calls, distrust: (): void => { trusted = false; } };
}

void test("opaque entry precedes native getter metadata and exact PUBLISH data refuses drift without any app callback", async () => {
  const m = fixture(); const args = [m.frame, m.busTuple, m.constructors, m.prototypes, m.members, m.known];
  assert.deepEqual(run(P.entry, m.native, [m.frame, m.busTuple]), [m.frame, m.event]); assert.equal(m.calls(), 0);
  const captured = run(P.members, m.native, args); assert.deepEqual(captured, [m.event, m.getTrusted]); assert.equal(m.calls(), 0);
  assert.throws(() => run(P.entry, m.native, [[{}, m.event], m.busTuple])); assert.equal(m.calls(), 0);
  const session = new Session(); session.connect();
  Object.defineProperty(globalThis, "__modifyEventFixture", { value: [m.native, ...args], configurable: true });
  try {
    const root = await session.post("Runtime.evaluate", { expression: "globalThis.__modifyEventFixture", objectGroup: "modify-event-inert" }); assert.ok(root.result.objectId !== undefined);
    const fields = await session.post("Runtime.getProperties", { objectId: root.result.objectId, ownProperties: true });
    const ids = Array.from({ length: 7 }, (_value, index) => { const id = fields.result.find(row => row.name === String(index))?.value?.objectId; assert.ok(id !== undefined); return id; });
    const receiver = ids[0]; assert.ok(receiver !== undefined);
    const parameters: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: true }> = { objectId: receiver, functionDeclaration: P.members, arguments: ids.slice(1).map(objectId => ({ objectId })), returnByValue: false, throwOnSideEffect: true };
    const result = await session.post("Runtime.callFunctionOn", parameters); assert.equal(result.exceptionDetails, undefined); assert.ok(result.result.objectId !== undefined); assert.equal(m.calls(), 0);
    const tuple = await session.post("Runtime.getProperties", { objectId: result.result.objectId, ownProperties: true }); const getter = tuple.result.find(row => row.name === "1")?.value?.objectId; assert.ok(getter !== undefined);
    const metadata = await session.post("Runtime.getProperties", { objectId: getter, ownProperties: true }); assert.throws(() => { qualifyCurrentNativeMessageEventFunction(metadata, 3); }); assert.equal(m.calls(), 0);
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: "modify-event-inert" }); session.disconnect(); Reflect.deleteProperty(globalThis, "__modifyEventFixture"); }
  // This direct inert recipe check uses fake getter functions. The native
  // Metadata refusal above prevents them reaching the production collector.
  const read = run(P.read, m.native, [...args, captured]); assert.equal(m.calls(), 8);
  for (const role of ["envelope", "message", "cache", "row", "pending"] as const) { const value = run(P[role], m.native, [read, m.known]); assert.ok(Array.isArray(value)); }
  const actual = run(P.payload, m.native, [read, m.busTuple, m.members, m.known]);
  const expected = ["sender", "/pro-mgr/worker/batchPendData", "page", "page", "text", 17, "original-json", "client", "unique", "/tab/project/original", "TEXT", "SCH_PAGE"] as const;
  assert.deepEqual(actual, expected); assert.deepEqual(payload({ result: { type: "object", value: actual } }, expected), expected);
  assert.throws(() => payload({ result: { type: "object", value: [...expected.slice(0, 5), 18, ...expected.slice(6)] } }, expected));
  m.distrust(); assert.throws(() => run(P.read, m.native, [...args, captured]));
  assert.equal(REQUESTS.controls, 0); assert.equal(REQUESTS.helpers, REQUESTS.reads);
  for (const row of CALLS) {
    assert.ok(row[1].length <= 16_384);
    const command = { phase: "modify-event-call", role: row[0], method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original", functionDeclaration: row[1], arguments: Array.from({ length: row[2] }, () => ({ objectId: "original" })), returnByValue: row[3], awaitPromise: false, userGesture: false } };
    assert.deepEqual(validate(command), command); assert.throws(() => validate({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
  }
  assert.throws(() => validate({ phase: "modify-event-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "original", expression: "[this,s.data]", returnByValue: false, includeCommandLineAPI: false } }));
  assert.throws(() => validate({ phase: "modify-event-control", method: "Debugger.resume", params: {} }));
});
