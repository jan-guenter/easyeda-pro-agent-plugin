/** Actual fixed worker programs over inert vendor-method data. Function
 * metadata/native peer and original Main body are explicitly synthetic. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CurrentFootprintForwardWriterBranchQueryCursor } from "../src/current-footprint-forward-writer-branch-query-cursor.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_BRANCH_QUERY_CALLEE as CALLEE } from "../src/current-footprint-forward-writer-branch-query-programs.ts";
import type { CurrentFootprintForwardWriterBranchQueryCommand } from "../src/current-footprint-forward-writer-branch-query-protocol.ts";
import { currentFootprintForwardWriterBranchQueryNativeCases } from "../src/current-footprint-forward-writer-branch-query-protocol.ts";
import { currentFootprintForwardWriterBranchQueryWire } from "../src/current-footprint-forward-writer-branch-query-wire.ts";
import { CURRENT_GENERATED_INITIAL_BRANCH_API_FIELDS as FIELDS } from "../src/current-generated-initial-branch-source.ts";
import { forwardWriterClockChannelFixture } from "./helpers/footprint-forward-writer-clock-channel-fixture.ts";
import type { CreateClockNativeCommand } from "./helpers/footprint-forward-writer-clock-channel-fixture.ts";
import { currentFootprintForwardWriterProducerWire } from "../src/current-footprint-forward-writer-producer-wire.ts";

const prop = (name: string, value: unknown, writable = true, enumerable = true, configurable = true): object => ({ name, value, writable, enumerable, configurable, isOwn: true });
function fixture(options: Readonly<{ wrongLocation?: boolean; lostAck?: boolean; pendingFirst?: boolean }> = {}): Readonly<{ cursor: CurrentFootprintForwardWriterBranchQueryCursor; calls: () => unknown; state: { requests: number; failed: boolean; samples: number } }> {
  const context = vm.createContext({}); const row = Object.fromEntries(FIELDS.map(name => { let value: string | null = null; if (name === "uuid") { value = "a".repeat(32); } else if (name === "project_uuid") { value = "b".repeat(64); } return [name, value]; }));
  const body = JSON.stringify(row);
  vm.runInContext(`let calls=0;const reply={success:true,result:${body}},Re={getInstance:()=>({branch:{get:()=>{calls++;return Promise.resolve(reply)}}})};
class Gd {${CALLEE.source}}class Lg extends Gd{};const project=new Lg();Object.assign(project,{uuid:"b".repeat(64),_branchUuid:"a".repeat(32)});globalThis.PROJECT=project;`, context);
  const objects = new Map<string, unknown>([["project", vm.runInContext("project", context)]]);
  const state = { requests: 0, failed: false, samples: 0 };
  const cursor = new CurrentFootprintForwardWriterBranchQueryCursor(Object.freeze({ project: "project", branchUuid: "a".repeat(32), scriptId: "original",
    assertCurrent: (): Promise<void> => Promise.resolve(), originalMainBody: (): Promise<string> => Promise.resolve(body), fail: (): void => { state.failed = true; },
    request: async (command: CurrentFootprintForwardWriterBranchQueryCommand): Promise<unknown> => {
      state.requests += 1;
      if (command.phase === "forward-branch-query-tuple") { return { result: [prop("0", { type: "object", objectId: "project" }), prop("1", { type: "function", objectId: "method" }), prop("2", { type: "function", objectId: "guard" }), prop("length", { type: "number", value: 3 }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", objectId: "array-prototype" } }] }; }
      if (command.phase === "forward-branch-query-callee") { return { result: [prop("name", { type: "string", value: CALLEE.name }, false, false), prop("length", { type: "number", value: 1 }, false, false)], internalProperties: [{ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "original", lineNumber: CALLEE.lineNumber, columnNumber: CALLEE.columnNumber + (options.wrongLocation === true ? 1 : 0) } } }, { name: "[[Prototype]]", value: { type: "object", className: "AsyncFunction", description: "AsyncFunction", objectId: "async" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", description: "Scopes[2]", objectId: "scope" } }] }; }
      if (command.phase === "forward-branch-query-promise-1" || command.phase === "forward-branch-query-promise-2") {
        state.samples += 1; const value = await objects.get("promise"); assert.equal(value, body); const pending = options.pendingFirst === true && state.samples === 1;
        return { result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "promise-prototype" } }, { name: "[[PromiseState]]", value: { type: "string", value: pending ? "pending" : "fulfilled" } }, { name: "[[PromiseResult]]", value: pending ? { type: "undefined" } : { type: "string", value } }] };
      }
      assert.ok(command.method === "Runtime.callFunctionOn"); const fn: unknown = vm.runInContext(`(${command.params.functionDeclaration})`, context); assert.ok(typeof fn === "function");
      const value: unknown = Reflect.apply(fn, objects.get(command.params.objectId), command.params.arguments.map(argument => argument.value));
      if (command.phase === "forward-branch-query-capture") { objects.set("tuple", value); return { result: { type: "object", subtype: "array", className: "Array", description: "Array(3)", objectId: "tuple" } }; }
      objects.set("promise", value); if (options.lostAck === true) {
        // oxlint-disable-next-line eslint/no-throw-literal,typescript/only-throw-error -- The actual null rejection must remain null while its single dispatched call stays consumed.
        throw null;
      }
      return { result: { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: "promise" } };
    },
  }));
  return { cursor, state, calls: (): unknown => vm.runInContext("calls", context) };
}
void test("one actual vendor branch GET joins the same retained Promise, including a bounded second metadata sample", async () => {
  for (const pendingFirst of [false, true]) {
    const f = fixture({ pendingFirst }), original = f.cursor.start(); assert.equal(f.cursor.start(), original); assert.equal(typeof await original, "string");
    assert.equal(f.calls(), 1); assert.equal(f.state.requests, pendingFirst ? 6 : 5); assert.equal(f.cursor.retained().completed, true);
  }
});
void test("wrong original function location refuses before GET and a lost invocation ACK preserves null failure without replay", async () => {
  const wrong = fixture({ wrongLocation: true }); await assert.rejects(wrong.cursor.start()); assert.equal(wrong.calls(), 0);
  const lost = fixture({ lostAck: true }), original = lost.cursor.start(); await assert.rejects(original); assert.equal(lost.calls(), 1); assert.equal(lost.cursor.failure(), null);
  assert.equal(lost.cursor.start(), original); await assert.rejects(lost.cursor.start()); assert.equal(lost.calls(), 1); assert.equal(lost.cursor.retained().failed, true);
});
void test("only one of the six finite branch rows can invoke the app; producer wires reject all rows", () => {
  const cases = currentFootprintForwardWriterBranchQueryNativeCases(); assert.equal(cases.length, 6);
  for (const command of cases) {
    const wire = currentFootprintForwardWriterBranchQueryWire(command, 7); assert.equal(wire.request["action"], "footprint-forward-branch-query"); assert.throws(() => currentFootprintForwardWriterProducerWire(command, 7, "worker"));
    if (command.method === "Runtime.callFunctionOn") { assert.throws(() => currentFootprintForwardWriterBranchQueryWire({ ...command, params: { ...command.params, functionDeclaration: "function(){return true}" } }, 7)); }
  }
});

void test("the actual full channel permits fixed branch reads only before the clock handoff, with no Create or cleanup spending", async () => {
  const commands = currentFootprintForwardWriterBranchQueryNativeCases(); const first = commands[0]; assert.ok(first !== undefined);
  let current: CreateClockNativeCommand = { ...first, sessionId: "worker" };
  const f = await forwardWriterClockChannelFixture(false, {}, { begin: (): void => assert.fail("no clock begin"),
    retire: (): Promise<void> => Promise.resolve(), create: (): void => assert.fail("no Create"),
    nextCommand: (): CreateClockNativeCommand => current, request: (): Promise<unknown> => Promise.resolve({}),
    pump: (): Promise<void> => Promise.resolve(), takeEvent: (): null => null,
  }, true, true, 9000);
  try {
    await assert.rejects(f.channel.requestForwardWriterBranchQuery(f.dependency, first), /ORIGINAL_PRECREATE/u);
    f.channel.prepareBranchQueryForTest(); const before = f.state.sent.length;
    for (const command of commands) { current = { ...command, sessionId: "worker" }; await f.channel.requestForwardWriterBranchQuery(f.dependency, command); }
    const sent = f.state.sent.slice(before).filter(row => row["action"] === "footprint-forward-branch-query");
    assert.equal(sent.length, 6); assert.ok(sent.every(row => row["cleanup"] === undefined && !Object.hasOwn(row, "functionDeclaration")));
    assert.equal(f.state.consumed, 0); assert.equal(f.channel.status().pendingReplies, 0);
  } finally { f.state.exited = true; await f.channel.releaseAfterTermination(); }
});
