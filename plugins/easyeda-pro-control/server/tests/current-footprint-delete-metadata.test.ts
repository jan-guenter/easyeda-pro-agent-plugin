/** Synthetic CDP replies over exact pinned method fragments. These tests
 * exercise no EasyEDA process, native owner, deletion or saved lifecycle. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { CURRENT_FOOTPRINT_DELETE_METADATA_BUDGET as BUDGET, CURRENT_FOOTPRINT_DELETE_METADATA_ORDER as ORDER,
  decodeCurrentFootprintDeleteMetadataTuple, decodeCurrentFootprintDeleteMethodMetadata,
  validateCurrentFootprintDeleteMetadataCommand } from "../src/current-footprint-delete-metadata-protocol.ts";
import type { CurrentFootprintDeleteMetadataCommand as Command } from "../src/current-footprint-delete-metadata-protocol.ts";
import { CurrentFootprintDeleteMetadataRunner } from "../src/current-footprint-delete-metadata-runner.ts";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_PROGRAMS as PROGRAMS } from "../src/current-footprint-delete-trigger-programs.ts";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_METHODS as METHODS } from "../src/current-footprint-delete-trigger-source.ts";
import { footprintDeleteMethodFixture as SOURCES } from "./helpers/footprint-delete-method-fixture.ts";

type Data = Record<string, unknown>;
const binding = Object.freeze({ sessionId: "original-session", scriptId: "original-script", project: "project", bus: "bus",
  manager: "manager", consistency: "consistency", constructors: "constructors" });
const expected = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), targetUuid: "c".repeat(16),
  client: "d".repeat(16), maximumTicket: 100 });
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data =>
  ({ name, value, writable, enumerable, configurable, isOwn: true });
function tupleReply(regenerated = false, corrupt = false): Data {
  const fields = METHODS.map((method, index) => property(String(index), { type: "function", className: method.async ? "AsyncFunction" : "Function",
    description: SOURCES[index] + (corrupt && index === 8 ? " " : ""), objectId: `${regenerated ? "fresh" : "method"}-${String(index)}` }, true, true));
  fields.push(property("length", { type: "number", value: METHODS.length }, true, false, false));
  return { result: fields, internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array",
    description: "Array(0)", objectId: regenerated ? "new-array-prototype" : "array-prototype" } }] };
}
function methodReply(index: number, drift = false, parentDrift = false): Data {
  const method = METHODS[index]; assert.ok(method);
  const parentType = method.async ? "object" : "function";
  return { result: [property("length", { type: "number", value: method.arity }), property("name", { type: "string", value: method.name })],
    internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: binding.scriptId,
        lineNumber: method.lineNumber, columnNumber: method.columnNumber + (drift ? 1 : 0) } } },
      { name: "[[Prototype]]", value: { type: parentDrift ? "string" : parentType, objectId: "function-prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: "scopes" } },
    ] };
}
type Mode = "normal" | "wrong-location" | "wrong-source" | "preflight-drift" | "transport-drift" | "reply-getter";
function fixture(mode: Mode = "normal", cleanupFails = false): Readonly<{ runner: CurrentFootprintDeleteMetadataRunner;
  commands: Command[]; transport: { assertCurrent: () => Promise<void>; request: (command: Command) => Promise<unknown> };
  reads: () => number; replacementCalls: () => number; replyGetterCalls: () => number }> {
  const commands: Command[] = []; let getters = 0, reads = 0, replacements = 0;
  const transport = { assertCurrent: (): Promise<void> => Promise.resolve(), request: (command: Command): Promise<unknown> => {
    validateCurrentFootprintDeleteMetadataCommand(command); commands.push(command);
    if (command.phase === "capture") {
      return Promise.resolve({ result: { type: "object", subtype: "array", className: "Array", description: "Array(9)", objectId: "original-tuple" } });
    }
    if (command.phase === "tuple-before" || command.phase === "tuple-after") { return Promise.resolve(tupleReply(command.phase === "tuple-after", mode === "wrong-source")); }
    if (command.phase === "preflight-before" || command.phase === "preflight-after") {
      assert.equal(command.params.arguments[4].objectId, "original-tuple");
      return Promise.resolve({ result: { type: "string", value: JSON.stringify({ ...expected,
        maximumTicket: expected.maximumTicket + (mode === "preflight-drift" && command.phase === "preflight-after" ? 1 : 0),
        ownLiveFootprintPresent: true, managerUserAbsent: true, dependencyEligibilityVerified: false, executionAuthorized: false }) } });
    }
    if (command.phase === "release") { return cleanupFails ? Promise.reject(new Error("cleanup refused")) : Promise.resolve({}); }
    assert.ok(command.phase === "method-properties");
    reads += 1; assert.equal(command.params.objectId, `method-${String(command.index)}`);
    if (mode === "transport-drift" && command.index === 2) {
      transport.request = (): Promise<unknown> => { replacements += 1; return Promise.reject(new Error("replacement must not run")); };
    }
    if (mode === "reply-getter" && command.index === 1) {
      return Promise.resolve(Object.defineProperty({}, "result", { enumerable: true, get: (): unknown => { getters += 1; return []; } }));
    }
    return Promise.resolve(methodReply(command.index, mode === "wrong-location" && command.index === 8));
  } };
  return Object.freeze({ runner: new CurrentFootprintDeleteMetadataRunner(transport, binding, expected), commands, transport,
    reads: (): number => reads, replacementCalls: (): number => replacements, replyGetterCalls: (): number => getters });
}

void test("complete delete metadata schedule matches all pinned sources and tolerates regenerated CDP aliases without invoking methods", async () => {
  for (const [index, source] of SOURCES.entries()) {
    const method = METHODS[index]; assert.ok(method);
    assert.equal(Buffer.byteLength(source), method.bytes); assert.equal(createHash("sha256").update(source).digest("hex"), method.sha256);
    const metadata: unknown = runInNewContext(`(()=>{const d=Object.getOwnPropertyDescriptors({${source}})[${JSON.stringify(method.name.replace(/^get /u, ""))}],f=d.value||d.get;return JSON.stringify({name:f.name,length:f.length});})()`, {}, { timeout: 1000 });
    assert.equal(metadata, JSON.stringify({ name: method.name, length: method.arity }));
    decodeCurrentFootprintDeleteMethodMetadata(methodReply(index), binding.scriptId, index);
  }
  const value = fixture();
  const packet = await value.runner.observe();
  assert.equal(value.reads(), METHODS.length);
  assert.deepEqual(value.commands.map(command => ({ phase: command.phase, ...("index" in command ? { index: command.index } : {}), cleanup: command.phase === "release" })), ORDER);
  assert.equal(BUDGET.normalRequests, 14); assert.equal(BUDGET.cleanupRequests, 1);
  assert.equal(value.runner.retained()["ownerAssertions"], BUDGET.ownerAssertionCallbacks);
  assert.equal(packet.functionMetadataMatchedDeclaredProfiles, 9); assert.equal(packet.originalTupleComparedByFixedProgram, true);
  assert.equal(packet.functionPrototypeMetadataQualified, false);
  assert.equal(packet.objectGroupReleaseAcknowledged, true); assert.equal(packet.nativeObjectsQualified, false);
  assert.equal(packet.originalRuntimeOwnerQualified, false); assert.equal(packet.entryProducerQualified, false);
  assert.equal(packet.fullWorkerSourceQualified, false); assert.equal(packet.deleteInvoked, false); assert.equal(packet.executionAuthorized, false);
  assert.equal(BUDGET.wholeNativeBudgetReserved, false);
});

void test("read-only command grammar refuses the writer program, side-effect changes and extra authority fields", async () => {
  const value = fixture(); await value.runner.observe();
  for (const command of value.commands) {
    assert.throws(() => validateCurrentFootprintDeleteMetadataCommand({ ...command, executionAuthorized: true }));
    assert.throws(() => validateCurrentFootprintDeleteMetadataCommand({ ...command, phase: "invoke" }));
    if (command.method === "Runtime.callFunctionOn") {
      for (const alteration of [{ functionDeclaration: PROGRAMS.invoke.program }, { throwOnSideEffect: false }, { awaitPromise: true }]) {
        assert.throws(() => validateCurrentFootprintDeleteMetadataCommand({ ...command, params: { ...command.params, ...alteration } }));
      }
    }
  }
  assert.throws(() => decodeCurrentFootprintDeleteMetadataTuple({ ...tupleReply(), extra: true }));
  assert.throws(() => { decodeCurrentFootprintDeleteMethodMetadata(methodReply(0), "other-script", 0); });
  assert.throws(() => { decodeCurrentFootprintDeleteMethodMetadata(methodReply(0), binding.scriptId, -0); });
  assert.throws(() => { decodeCurrentFootprintDeleteMethodMetadata(methodReply(0, false, true), binding.scriptId, 0); });
  assert.throws(() => { decodeCurrentFootprintDeleteMethodMetadata({ ...methodReply(0), privateProperties: [] }, binding.scriptId, 0); });
});

void test("bad source, last-getter location and final preflight drift fail with one reserved cleanup and no replay", async () => {
  for (const mode of ["wrong-source", "wrong-location", "preflight-drift"] as const) {
    const value = fixture(mode); await assert.rejects(value.runner.observe());
    assert.equal(value.commands.filter(command => command.phase === "release").length, 1);
    assert.equal(value.runner.retained()["failed"], true); assert.equal(value.runner.retained()["completed"], false);
    assert.equal(value.runner.retained()["objectGroupReleaseAcknowledged"], true);
    assert.equal(value.reads(), mode === "wrong-source" ? 0 : 9);
    const count = value.commands.length;
    await assert.rejects(value.runner.observe(), /ATTEMPT_CONSUMED/u); assert.equal(value.commands.length, count);
  }
});

void test("post-await transport replacement is never called, and raw reply survives the refused cleanup", async () => {
  const value = fixture("transport-drift");
  await assert.rejects(value.runner.observe(), (error: unknown): boolean => error instanceof AggregateError && error.errors.length === 2);
  assert.equal(value.replacementCalls(), 0); assert.equal(value.reads(), 3);
  assert.equal(value.commands.some(command => command.phase === "release"), false);
  const retained = value.runner.retained(); assert.equal(retained["cleanupAttempted"], true);
  assert.equal(retained["objectGroupReleaseAcknowledged"], false); assert.ok(Array.isArray(retained["replies"]));
  assert.equal(retained["replies"].length, value.commands.length);
});

void test("unsafe reply getters stay uninvoked and cleanup failure preserves both failures", async () => {
  const value = fixture("reply-getter", true);
  await assert.rejects(value.runner.observe(), (error: unknown): boolean => error instanceof AggregateError && error.errors.length === 2 &&
    error.errors[0] instanceof Error && error.errors[0].message === "PCB_STRING_CLOCK_REPLY_CAPTURE" &&
    error.errors[1] instanceof Error && error.errors[1].message === "cleanup refused");
  assert.equal(value.replyGetterCalls(), 0); assert.equal(value.commands.filter(command => command.phase === "release").length, 1);
  assert.equal(value.runner.retained()["completed"], false); assert.equal(value.runner.retained()["objectGroupReleaseAcknowledged"], false);
});

void test("a second collector cannot consume the original transport or release its group again", async () => {
  const value = fixture(); await value.runner.observe();
  const count = value.commands.length, second = new CurrentFootprintDeleteMetadataRunner(value.transport, binding, expected);
  await assert.rejects(second.observe(), /ATTEMPT_CONSUMED/u); assert.equal(value.commands.length, count);
  assert.equal(second.retained()["cleanupAttempted"], false);
});
