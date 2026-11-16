/** Focused negative cases for supplied async comparison data. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_SOURCE as SOURCE } from "../src/current-schematic-wire-async-source.ts";
import { currentSchematicWireAsyncCases, currentSchematicWireAsyncTemplate, validateCurrentSchematicWireAsyncCommand as validate } from "../src/current-schematic-wire-async-protocol.ts";
import { CurrentSchematicWireAsyncCursor } from "../src/current-schematic-wire-async-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_ASYNC_PROGRAMS as PROGRAMS } from "../src/current-schematic-wire-async-programs.ts";
import { decodeCurrentSchematicWireAsyncPromise as promiseState } from "../src/current-schematic-wire-async-replies.ts";
import { wireAsyncFixture } from "./helpers/current-schematic-wire-async-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function obj(value: unknown): object { assert.ok(value !== null && typeof value === "object"); return value; }
function invoke(graph: object, field: string): unknown { const fn: unknown = Reflect.get(graph, field); assert.ok(typeof fn === "function"); return Reflect.apply(fn, graph, []); }
function packet(state: string, result?: unknown): unknown { return ({ result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: "prototype" } }, { name: "[[PromiseState]]", value: { type: "string", value: state } }, { name: "[[PromiseResult]]", value: result ?? { type: "undefined" } }] }) }
void test("Wire async grammar rejects programs/resumes, consumes failures and parses only native pending/undefined fulfillment", () => {
  for (const command of currentSchematicWireAsyncCases()) { assert.deepEqual(validate(command), command); assert.ok(currentSchematicWireAsyncTemplate(command).template.length > 0); assert.throws(() => validate({ ...command, params: { ...command.params, callerCode: "value" } })); }
  assert.throws(() => validate({ phase: "wire-async-resume", method: "Debugger.resume", params: {} }));
  const input = { role: "entry", frame: "1.2.3", holder: "holder", native: "native", ast: "ast", tree: "tree", wrapper: "wrapper", scriptId: "script", variant: 0, treeRole: "objectContent" } as const; const cursor = new CurrentSchematicWireAsyncCursor(input); Reflect.set(input, "frame", "foreign"); const command = cursor.next(); assert.ok(command !== null && command.phase === "wire-async-frame"); assert.equal(command.params.callFrameId, "1.2.3"); assert.throws(() => { cursor.reserve(structuredClone(command)); }); cursor.reserve(command); assert.throws(() => { cursor.accept(command, { result: { type: "object", subtype: "proxy", objectId: "foreign" } }); }); assert.throws(() => cursor.next());

  assert.equal(promiseState(packet("pending")), "pending"); assert.equal(promiseState(packet("fulfilled")), "fulfilled"); assert.throws(() => promiseState(packet("rejected"))); assert.throws(() => promiseState(packet("fulfilled", { type: "boolean", value: false }))); assert.throws(() => promiseState({ ...obj(packet("pending")), result: [{ name: "then" }] }));
});
void test("Wire async entry comparison refuses stale work, changed arguments and foreign roots without invoking the child", { timeout: 30_000 }, async context => {
  const source = await readConfiguredEasyedaAsset(SOURCE[0].relativePath); if (source === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  const entry: unknown = runInThisContext(`(${PROGRAMS.entryObject})`); assert.ok(typeof entry === "function");
  for (const fault of ["pending", "queued", "args", "ast", "wrapper", "saved", "before"]) {
    const graph = obj(runInThisContext(wireAsyncFixture(source, 0))); const state = obj(Reflect.get(graph, "state")); const ast = obj(Reflect.get(graph, "ast")); const args = ["project", false, false]; const frame: unknown[] = [null, null, args, Reflect.get(graph, "target"), { previousCompleted: true }];
    if (fault === "pending") { frame[0] = Promise.resolve(); } else if (fault === "queued") { frame[1] = Promise.resolve(); } else if (fault === "args") { args[0] = "foreign"; } else if (fault === "ast") { Reflect.set(ast, "objectTreeManager", {}); } else if (fault === "wrapper") { Reflect.set(obj(Reflect.get(graph, "tree")), "passContentData", (): void => { assert.fail("foreign child invoked"); }); } else if (fault === "saved") { Reflect.set(state, "saveAttempted", true); } else { Reflect.set(obj(Reflect.get(state, "before")), "wire", {}); }
    assert.throws(() => Reflect.apply(entry, frame, [Reflect.get(graph, "native"), Reflect.get(graph, "holder"), ast, Reflect.get(graph, "tree"), Reflect.get(graph, "wrapper")]), /SCH209_WIRE_ASYNC/u); const counts = obj(Reflect.get(graph, "counts")); assert.equal(Reflect.get(counts, "fills"), 0); invoke(graph, "resolve");
  }
  const graph = obj(runInThisContext(wireAsyncFixture(source, 0))); const holder: unknown = Reflect.get(graph, "holder"); assert.ok(Array.isArray(holder)); const b = obj(holder[0]); const state = obj(holder[1]);
  const native: unknown = Reflect.get(graph, "native"); const ast: unknown = Reflect.get(graph, "ast"); const originalTree: unknown = Reflect.get(graph, "tree"); const wrapper: unknown = Reflect.get(graph, "wrapper");
  const snapshot: unknown = Reflect.apply(entry, [null, null, ["project", false, false], Reflect.get(graph, "target"), { completedEarlier: true }], [native, holder, ast, originalTree, wrapper]); assert.ok(Array.isArray(snapshot) && snapshot.length === 15);
  const caller: unknown = runInThisContext(`(${PROGRAMS.caller})`); assert.ok(typeof caller === "function"); assert.equal(Reflect.apply(caller, [ast, false, false], [native, holder, snapshot]), true);
  let traps = 0; const foreign = new Proxy({}, { getOwnPropertyDescriptor(): never { traps += 1; throw new Error("foreign traversal"); } });
  Reflect.set(b, "line", foreign); Reflect.set(obj(Reflect.get(state, "before")), "line", foreign);
  assert.throws(() => Reflect.apply(caller, [ast, false, false], [native, holder, snapshot]), /SCH209_WIRE_ASYNC/u); assert.equal(traps, 0); invoke(graph, "resolve");

});
