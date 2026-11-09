/** Fixed program behavior over real readonly SQLite with an explicit synthetic
 * Electron-driver callback seam. No native owner, issuer or callback provenance
 * is supplied by this fixture. Production still requires all original joins. */
/* oxlint-disable promise/prefer-await-to-callbacks -- Exercise the exact error-first Electron-driver shape through the explicit synthetic callback seam. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { DatabaseSync } from "node:sqlite";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SCOPE } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as MAIN } from "../src/current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_FORWARD_HEAD_CALLS as CALLS, CURRENT_FOOTPRINT_FORWARD_HEAD_GROUP as GROUP } from "../src/current-footprint-forward-head-programs.ts";
import { IDS, fixture } from "./helpers/symbol-sql-fixture.ts";

async function setup(context: TestContext): Promise<Readonly<{
  evaluate: (program: string) => unknown;
  call: (role: keyof typeof CALLS, ...args: unknown[]) => unknown;
  calls: () => number; fail: (error: unknown) => void;
}>> {
  const value = await fixture(); let calls = 0, failure: unknown = null;
  // Tiny readonly fixture; the Electron callback is explicitly synthetic, while the exact SELECT runs in actual SQLite.
  const database = new DatabaseSync(value.path, { readOnly: true }); context.after(() => { database.close(); });
  const require = createRequire(import.meta.url);
  const util: unknown = require("node:util");
  const vm = createContext({ util, path: value.path,
    get: (sql: string, parameters: string[], callback: (error: unknown, row?: unknown) => void): void => {
      calls += 1;
      queueMicrotask(() => {
        if (failure !== null) { callback(failure); return; }
        let row: unknown;
        try {
          // Execute only the reviewed fixed head JOIN against the readonly synthetic database.
          row = database.prepare(sql).get(...parameters);
        } catch (error) { callback(error); return; }
        callback(null, row);
      });
    } });
  runInContext(`
    class Database { constructor(filename){Object.defineProperty(this,'filename',{value:filename});} get(sql,parameters,callback){get(sql,parameters,callback);} }
    class Statement {} const sqlite={Database,Statement}; const logger={trace(){}};
    class Z2 {constructor(db){this.db=db;this.logger=logger;}queryOne(sql,parameters){this.logger.trace();return new Promise((resolve,reject)=>this.db.get(sql,parameters,(error,row)=>error?reject(error):resolve(row)));}}
    class yo {constructor(){this.path=path;this.logger=logger;this.db=new Database(path);this.dbWrap=new Z2(this.db);}}
    const owner=new yo(),ctx={logger,db:{[path]:Promise.resolve(owner)}},controller={ctx},frame=[controller,ctx,path,owner];
    function u(a){} function xC(a,b,c){} function L3(a,b){} function y(a,b){} function rl(a){}
    class Backend{interceptHttpProtocol(a,b,c){}}const backend=new Backend;backend.cb=function(a,b){};
    const source=[u,backend,{},xC,L3,y,Date,Date.now,rl];
  `, vm);
  const evaluate = (program: string): unknown => runInContext(program, vm);
  // All compiled programs below are production constants. The host never accepts caller code.
  const compile = (program: string): ((...args: unknown[]) => unknown) => {
    const result = evaluate(`(${program})`); assert.ok(typeof result === "function");
    return function invoke(this: unknown, ...args: unknown[]): unknown { return Reflect.apply(result, this, args); };
  };
  const scope: unknown = Reflect.apply(compile(SCOPE), evaluate("[Z2,yo,sqlite,util]"), [value.path]);
  const main: unknown = Reflect.apply(compile(MAIN.capture.program), evaluate("source"), []);
  const head: unknown = Reflect.apply(compile(CALLS.capture), evaluate("frame"), [scope, main]);
  return Object.freeze({ evaluate, call: (role: keyof typeof CALLS, ...args: unknown[]): unknown => Reflect.apply(compile(CALLS[role]), head, args),
    calls: (): number => calls, fail: (error: unknown): void => { failure = error; } });
}
void test("fixed head request consumes once, waits for its actual query Promise and copies only the original callback row", async context => {
  const f = await setup(context); assert.equal(f.call("require"), true);
  const pending: unknown = f.call("read", IDS.project, IDS.branch); assert.ok(pending !== null && typeof pending === "object");
  assert.throws(() => f.call("completed", pending)); assert.equal(f.calls(), 1);
  const row: unknown = await Promise.resolve(pending);
  assert.deepEqual(f.call("completed", pending, row), row); assert.throws(() => f.call("read", IDS.project, IDS.branch));
  assert.throws(() => f.call("completed", pending)); assert.equal(f.calls(), 1);
});
void test("an original native query rejection stays rejected and grants no completed row", async context => {
  const error = new Error("synthetic original SQLite get rejection"), f = await setup(context); f.fail(error);
  const pending: unknown = f.call("read", IDS.project, IDS.branch);
  await assert.rejects(Promise.resolve(pending), caught => caught === error);
  assert.throws(() => f.call("completed", pending)); assert.throws(() => f.call("read", IDS.project, IDS.branch)); assert.equal(f.calls(), 1);
});
void test("a changed DB Promise is refused before any head query", async context => {
  const f = await setup(context); f.evaluate("ctx.db[path]=Promise.resolve(owner)");
  assert.throws(() => f.call("read", IDS.project, IDS.branch)); assert.equal(f.calls(), 0);
});
void test("Promise species/constructor hooks cannot run during the retained callback join", async context => {
  const f = await setup(context); f.evaluate("globalThis.hookCalls=0;Object.defineProperty(Promise.prototype,'constructor',{get(){hookCalls++;return Promise;},configurable:true})");
  assert.throws(() => f.call("read", IDS.project, IDS.branch)); assert.equal(f.evaluate("hookCalls"), 0); assert.equal(f.calls(), 0);
});
void test("invalid head scalars refuse without dispatch or argument hooks", async context => {
  const f = await setup(context);
  for (const branch of [`${IDS.branch}\n`, "a".repeat(31), "g".repeat(32)]) { assert.throws(() => f.call("read", IDS.project, branch)); }
  assert.throws(() => f.call("read", { toString: (): never => assert.fail("No argument coercion") }, IDS.branch)); assert.equal(f.calls(), 0);
});
void test("a fulfilled query cannot qualify after its original connection Promise changes", async context => {
  const f = await setup(context), pending: unknown = f.call("read", IDS.project, IDS.branch);
  f.evaluate("ctx.db[path]=Promise.resolve(owner)"); await Promise.resolve(pending);
  assert.throws(() => f.call("completed", pending)); assert.equal(f.calls(), 1);
});
void test("a different fulfilled Promise cannot replace the original query outcome", async context => {
  const f = await setup(context), pending: unknown = f.call("read", IDS.project, IDS.branch);
  const row: unknown = await Promise.resolve(pending);
  assert.throws(() => f.call("completed", f.evaluate("Promise.resolve({})"), row));
  assert.deepEqual(f.call("completed", pending, row), row); assert.equal(f.calls(), 1);
});
void test("every fixed head program and its bounded arguments fit the unchanged inspector envelope", () => {
  const handle = "h".repeat(256);
  for (const [role, program] of Object.entries(CALLS)) {
    const args = role === "read" ? [{ value: "a".repeat(64) }, { value: "b".repeat(32) }] : [{ objectId: handle }, { objectId: handle }];
    const wire = { id: 999_999, method: "Runtime.callFunctionOn", params: { objectId: handle, functionDeclaration: program,
      arguments: args, objectGroup: GROUP, returnByValue: true, awaitPromise: false, throwOnSideEffect: false, silent: true,
      userGesture: false, generatePreview: false } };
    assert.ok(Buffer.byteLength(JSON.stringify(wire)) < 16_384);
  }
});
for (const [label, project, branch] of [
  ["branch", IDS.project, `${"a".repeat(31)}\n`],
  ["32-character project", `${"a".repeat(31)}\n`, IDS.branch],
  ["64-character project", `${"a".repeat(63)}\n`, IDS.branch],
] as const) {
  void test(`shortest ${label} terminal newline refuses before query dispatch`, async context => {
    const f = await setup(context); let pending: unknown = null, refused = false;
    try { pending = f.call("read", project, branch); } catch { refused = true; }
    // Consume any original unexpected query failure before asserting the
    // Pre-dispatch refusal. A failed SQL read is not the required scalar gate.
    try { await Promise.resolve(pending); }
    catch {
      // Keep the scalar assertion below as the failure, without an unhandled rejection.
    }
    assert.equal(refused, true); assert.equal(f.calls(), 0);
  });
}
