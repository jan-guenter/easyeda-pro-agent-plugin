/** Synthetic descriptors and catalog data only. No vendor SQL is embedded or
 * executed, and these peers establish no native inspector custody. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { bind, fixture, select } from "./helpers/startup-library-fixture.ts";
import { runInContext } from "node:vm";
import { CURRENT_MAIN_STARTUP_LIBRARY_CHUNKS as CHUNKS } from "../src/current-main-startup-library-catalog.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_CALLS as CALLS } from "../src/current-main-startup-library-programs.ts";
import { CurrentMainStartupLibraryProgress, captureCurrentMainStartupLibrarySelection } from "../src/current-main-startup-library-progress.ts";
import { compareCurrentMainStartupLibrarySql as compare, requireCurrentMainStartupLibraryEmptyParameters } from "../src/current-main-startup-library-sql.ts";

void test("the original config capture supplies private providers, while one JL receiver consumes only original ordered tuples", () => {
  for (const packaged of [false, true]) {
    const context = fixture(packaged);
    for (const name of ["sc", "F5", "nl", "Je", "Hr", "I", "ge", "$i", "Yt"]) { assert.equal(runInContext(`typeof ${name}`, context), "undefined"); }
    bind(context);
    const packet = captureCurrentMainStartupLibrarySelection(structuredClone(select(context, 0))); assert.equal(packet.recognized, true);
    if (packet.recognized) { assert.equal(packet.scriptIndex, 0); assert.equal(packet.sql.length, CHUNKS[0]?.utf16); assert.equal(compare(0, packet.sql, []), null); }
    assert.throws(() => { select(context, 0); });
    assert.throws(() => runInContext(`(${CALLS.select}).call(kit.tuple(1,params),kit.configTracker,[...tracker])`, context));
    assert.throws(() => runInContext(`(${CALLS.select}).call(kit.tuple(1,params),kit.configTracker,new Proxy(tracker,{getOwnPropertyDescriptor:forbidden}))`, context));
    for (let index = 1; index < 332; index += 1) { select(context, index); }
    assert.throws(() => { select(context, 0); }); assert.equal(runInContext("calls", context), 0);
    const progress = new CurrentMainStartupLibraryProgress(); progress.bind(); assert.throws(() => { progress.consume(packet); });
    assert.equal(progress.snapshot()["normalReturnProven"], false); assert.equal(progress.snapshot()["scriptCallsConsumed"], 0);
  }
});
void test("canonical stock path, original receiver/config and empty parameters are rechecked before effects", () => {
  const mutations = ['frame[1]=true', String.raw`frame[0].path="C:\\foreign\\easyeda-std.elib"`, String.raw`kit.app+="\\.."`, String.raw`kit.configFrame[5]="c:\\Synthetic\\Documents"`,
    'kit.configFrame[8]="LCEDA-Pro"', 'frame[0].transactionDepth=1', 'Object.defineProperty(frame[0],"path",{get:forbidden})',
    'frame[0]=new Proxy(frame[0],{getOwnPropertyDescriptor:forbidden,getPrototypeOf:forbidden})', 'frame[0].runScripts=forbidden'];
  for (const mutation of mutations) {
    const context = fixture(); runInContext(mutation, context); assert.throws(() => { bind(context); }); assert.equal(runInContext("calls", context), 0);
  }
  const context = fixture(); bind(context);
  assert.equal(JSON.stringify(runInContext(`(${CALLS.select}).call(kit.tuple(0,params,true),kit.configTracker,tracker)`, context)), '{"recognized":false}');
  for (const mutation of ['params=[1]', 'params=new Proxy([],{getPrototypeOf:forbidden})', 'Object.defineProperty(params,"0",{get:forbidden})', 'frame[0].transactionDepth=1', 'frame[2]+=" "', 'kit.configFrame[8]="LCEDA-Pro"']) {
    const failed = fixture(); bind(failed); runInContext(mutation, failed); assert.throws(() => { select(failed, 0); }); assert.equal(runInContext("calls", failed), 0);
  }
});
void test("hostile packets and parameters never invoke hooks or acquire sequence/return authority", () => {
  let calls = 0; const forbidden = (): never => { calls += 1; throw new Error("hook"); };
  const accessor: unknown[] = []; Object.defineProperty(accessor, "0", { get: forbidden });
  for (const params of [[1], accessor, new Proxy([], { getPrototypeOf: forbidden }), Object.create([])]) { assert.throws(() => { requireCurrentMainStartupLibraryEmptyParameters(params); }); }
  const packet = { recognized: true }; Object.defineProperty(packet, "sql", { get: forbidden });
  for (const input of [packet, new Proxy({}, { ownKeys: forbidden }), { recognized: false, extra: 1 }]) { assert.throws(() => { captureCurrentMainStartupLibrarySelection(input); }); }
  const progress = new CurrentMainStartupLibraryProgress(); assert.equal(progress.consume({ recognized: false }), false);
  assert.throws(() => { progress.requireAllCallsConsumed(); }); progress.bind(); assert.throws(() => { progress.bind(); });
  const selected = { recognized: true, role: "jl", site: "run", scriptIndex: 1, sql: "arbitrary SQL", parametersEmpty: true,
    transactionDepth: 0, designWriteGrant: false, nativeCompletionProven: false, normalReturnProven: false };
  assert.throws(() => { progress.consume(selected); }); assert.equal(progress.snapshot()["scriptCallsConsumed"], 0);
  assert.equal(compare(0, "arbitrary SQL", []), null); assert.equal(compare(-0, "arbitrary SQL", []), null); assert.equal(calls, 0);
});
