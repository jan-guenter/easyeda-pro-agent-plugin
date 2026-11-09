/** Actual request reader and its private correlated capture map, with the
 * existing explicit builtin-source peer. No Main owner or grant is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { selectedRequestPeer, selectedRequestReaderConstructor } from "./helpers/selected-main-request-reader-fixture.ts";
import type { CurrentSelectedFileMainSqlFenceCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { validateCurrentSelectedFileMainSqlFenceCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { currentSelectedFileMainSqlFenceNativeCases } from "../src/current-selected-file-main-sql-fence-native.ts";

void test("only the original observed GET object retains its actual pre-resume request capture",async()=>{
  const Constructor=await selectedRequestReaderConstructor();
  const bindings=Object.freeze({appScriptId:"app",captureObjectId:"sql-capture",request:(command:CurrentSelectedFileMainSqlFenceCommand):Promise<unknown>=>Promise.resolve(selectedRequestPeer(command,{method:"GET",url:`/api/v4/projects/${"a".repeat(64)}`})),assertCurrent:():Promise<void>=>Promise.resolve(),assertFetchScript:(scriptId:string):void=>{assert.equal(scriptId,"builtin-fetch");}});
  const reader=new Constructor(bindings);const other=new Constructor(bindings);const packet=await reader.observe("original-driver-frame");
  assert.equal(reader.requireOriginalCapture(packet),"request-capture");assert.throws(()=>reader.requireOriginalCapture({...packet}));assert.throws(()=>other.requireOriginalCapture(packet));
});

void test("the reader fuses the raw driver capture and reuses its metadata-owned legacy frame without another request", async () => {
  const Constructor = await selectedRequestReaderConstructor(), commands: CurrentSelectedFileMainSqlFenceCommand[] = [];
  const reader = new Constructor(Object.freeze({ appScriptId: "app", captureObjectId: "sql-capture",
    request: (input: CurrentSelectedFileMainSqlFenceCommand): Promise<unknown> => { const command = validateCurrentSelectedFileMainSqlFenceCommand(input); commands.push(command); return Promise.resolve(selectedRequestPeer(command, { method: "GET", url: `/api/v4/projects/${"a".repeat(64)}` })); },
    assertCurrent: (): Promise<void> => Promise.resolve(), assertFetchScript: (id: string): void => { assert.equal(id, "builtin-fetch"); } }));
  const packet = await reader.observe("original-driver-frame"); assert.equal(reader.requireOriginalCapture(packet), "request-capture");
  assert.deepEqual(commands.slice(0, 2).map(command => command.phase), ["sql-fence-driver-raw-frame", "sql-fence-driver-rebase-capture"]);
  assert.equal(commands.length, 18); assert.equal(commands.filter(command => command.method === "Debugger.evaluateOnCallFrame").length, 1);
  assert.equal(commands.some(command => command.phase === "sql-fence-request-capture" || command.phase === "sql-fence-driver-frame"), false);
  for (const command of commands) {
    if (command.phase === "sql-fence-driver-rebase-capture" || command.phase === "sql-fence-request-private-bind" || command.phase === "sql-fence-request-private-read") { assert.equal(command.params.throwOnSideEffect, false); }
  }
  const metadata = new Set(commands.filter(command => command.phase === "sql-fence-properties").map(command => command.params.objectId));
  assert.equal(metadata.has("request-frame"), true); assert.equal(metadata.has("request-raw-frame"), false);
});

void test("missing or malformed capture slot zero cannot send another frame request or reach a source/bind grant", async () => {
  for (const wrong of [undefined, { type: "object", subtype: "array", className: "Array", description: "Array(6)", objectId: "raw-frame" }]) {
    const Constructor = await selectedRequestReaderConstructor(), commands: CurrentSelectedFileMainSqlFenceCommand[] = [];
    const reader = new Constructor(Object.freeze({ appScriptId: "app", captureObjectId: "sql-capture",
      request: (command: CurrentSelectedFileMainSqlFenceCommand): Promise<unknown> => {
        commands.push(command);
        if (command.phase === "sql-fence-properties" && command.params.objectId === "request-capture") {
          return Promise.resolve({ result: [...(wrong === undefined ? [] : [{ name: "0", value: wrong, isOwn: true }]), { name: "7", value: { type: "string", value: "fetch" }, isOwn: true }] });
        }
        return Promise.resolve(selectedRequestPeer(command, { method: "GET", url: "/api/v4/projects/selected" }));
      }, assertCurrent: (): Promise<void> => Promise.resolve(), assertFetchScript: (): never => { throw new Error("UNEXPECTED_SOURCE"); } }));
    await assert.rejects(reader.observe("original-driver-frame"), /SELECTED_MAIN_REQUEST_REPLY/u);
    assert.deepEqual(commands.map(command => command.phase), ["sql-fence-driver-raw-frame", "sql-fence-driver-rebase-capture", "sql-fence-properties"]);
  }
});

void test("private bookkeeping flags are fixed new rows while every historical true-flag request row remains exact", () => {
  const cases = currentSelectedFileMainSqlFenceNativeCases();
  for (const phase of ["sql-fence-request-capture", "sql-fence-request-bind", "sql-fence-request-rebind", "sql-fence-request-read"] as const) {
    const command = cases.find(row => row.phase === phase); assert.ok(command?.method === "Runtime.callFunctionOn");
    assert.equal(command.params.throwOnSideEffect, true);
    assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, throwOnSideEffect: false } }));
  }
  for (const phase of ["sql-fence-driver-rebase-capture", "sql-fence-request-private-bind", "sql-fence-request-private-rebind", "sql-fence-request-private-read"] as const) {
    const command = cases.find(row => row.phase === phase); assert.ok(command?.method === "Runtime.callFunctionOn");
    assert.equal(command.params.throwOnSideEffect, false);
    assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, throwOnSideEffect: true } }));
    assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params: { ...command.params, functionDeclaration: "function(){return [];}" } }));
  }
});
