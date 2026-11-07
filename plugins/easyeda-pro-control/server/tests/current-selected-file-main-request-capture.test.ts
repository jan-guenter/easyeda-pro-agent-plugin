/** Actual request reader and its private correlated capture map, with the
 * existing explicit builtin-source peer. No Main owner or grant is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { selectedRequestPeer, selectedRequestReaderConstructor } from "./helpers/selected-main-request-reader-fixture.ts";
import type { CurrentSelectedFileMainSqlFenceCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";

void test("only the original observed GET object retains its actual pre-resume request capture",async()=>{
  const Constructor=await selectedRequestReaderConstructor();
  const bindings=Object.freeze({appScriptId:"app",captureObjectId:"sql-capture",request:(command:CurrentSelectedFileMainSqlFenceCommand):Promise<unknown>=>Promise.resolve(selectedRequestPeer(command,{method:"GET",url:`/api/v4/projects/${"a".repeat(64)}`})),assertCurrent:():Promise<void>=>Promise.resolve(),assertFetchScript:(scriptId:string):void=>{assert.equal(scriptId,"builtin-fetch");}});
  const reader=new Constructor(bindings);const other=new Constructor(bindings);const packet=await reader.observe("original-driver-frame");
  assert.equal(reader.requireOriginalCapture(packet),"request-capture");assert.throws(()=>reader.requireOriginalCapture({...packet}));assert.throws(()=>other.requireOriginalCapture(packet));
});
