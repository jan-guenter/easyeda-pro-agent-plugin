/** Node V8 metadata of exact callback bodies. This is not the app's V8 or a
 * project-owned callback and does not establish hidden lexical receivers. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { z } from "zod";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { CURRENT_FOOTPRINT_COPY_ASYNC_CALLS as CALLS, decodeCurrentFootprintCopyAsyncFunction, decodeCurrentFootprintCopyAsyncScope } from "../src/current-footprint-copy-async-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_ASYNC_PROFILES as PROFILES } from "../src/current-footprint-copy-async-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_BUFFERED_STREAM_FIXTURE as BUFFER, CURRENT_FOOTPRINT_COPY_ASYNC_FIXTURE as SOURCES } from "./helpers/current-footprint-copy-async-fixture.ts";

void test("actual V8 callback metadata matches source offsets and permits opaque arrow receivers without claiming them", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    for (const [index, profile] of PROFILES.entries()) {
      const body = SOURCES[index]; assert.ok(body !== undefined);
      const offset = profile.kind === "function" ? body.indexOf("(") : 0;
      const prefix = `"use strict";${"\n".repeat(profile.lineNumber)}${" ".repeat(profile.columnNumber - offset - 1)}`;
      const response = await session.post("Runtime.evaluate", { expression: `${prefix}(${body})`, objectGroup: "footprint-async-v8-test" });
      const id = response.result.objectId; assert.ok(id !== undefined);
      const properties = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true });
      const location = properties.internalProperties?.find(entry => entry.name === "[[FunctionLocation]]");
      const point: unknown = location?.value?.value; assert.ok(isRecord(point));
      const scriptId = point["scriptId"]; assert.equal(typeof scriptId, "string");
      decodeCurrentFootprintCopyAsyncFunction(properties, String(scriptId), index);
    }
    const response = await session.post("Runtime.evaluate", { expression: `(()=>{const project={${BUFFER}};return project.bufferedStream(async()=>{},500)})()`, objectGroup: "footprint-async-v8-test" });
    const id = response.result.objectId; assert.ok(id !== undefined);
    const properties = await session.post("Runtime.getProperties", { objectId: id, ownProperties: true });
    const scopesId = properties.internalProperties?.find(entry => entry.name === "[[Scopes]]")?.value?.objectId; assert.ok(scopesId !== undefined);
    const scopes = await session.post("Runtime.getProperties", { objectId: scopesId, ownProperties: true });
    const closureId = decodeCurrentFootprintCopyAsyncScope(scopes);
    const closure = await session.post("Runtime.getProperties", { objectId: closureId, ownProperties: true });
    assert.deepEqual(closure.result.map(entry => entry.name).toSorted(), ["a", "c", "i", "n", "o", "r", "s", "t"]);
  } finally {
    try { await session.post("Runtime.releaseObjectGroup", { objectGroup: "footprint-async-v8-test" }); } finally { session.disconnect(); }
  }
});

function fixedCall(session: Session, objectId: string, functionDeclaration: string, ids: readonly string[], returnByValue = false): Promise<unknown> {
  const params = { objectId, functionDeclaration, arguments: ids.map(id => ({ objectId: id })), returnByValue,
    objectGroup: "footprint-async-construction-test", throwOnSideEffect: true };
  return session.post("Runtime.callFunctionOn", params);
}
const callReply = z.looseObject({ result: z.looseObject({ objectId: z.string().optional(), value: z.unknown().optional() }), exceptionDetails: z.unknown().optional() });
void test("actual V8 scope wrapper joins the retained constructor upload callback without invoking it", async () => {
  const session = new Session(); session.connect(); const group = "footprint-async-construction-test";
  try {
    await session.post("Runtime.enable");
    await session.post("Runtime.evaluate", { expression: `globalThis.PROJECT=(()=>{
const project={${BUFFER},task1:new Set,task2:new Set,task3:new Set,cachePromise:new Set,bufferUploadData:new Map,bufferUploadCache:new Map,localCache:{},cache:{},isUploadingCloud:false,isBatchUpload:false,pendingSyncCloud:false};
const callback=async()=>{throw Error('must-not-invoke');};project.originalUpload=callback;project.foreignUpload=async()=>{throw Error('must-not-invoke');};
project.workerBus={};project.footprint={projectManager:project};project.consistencyManager={headCbArr:[()=>{}],cbArr:[()=>{}],getCache:()=>{}};
project.bufferedUploadCloud=project.bufferedStream(callback,500);return project;})()`, objectGroup: group });
    const handles: string[] = [];
    for (const expression of ["PROJECT", "PROJECT.workerBus", "PROJECT.footprint", "PROJECT.consistencyManager", "PROJECT.originalUpload", "PROJECT.foreignUpload", "PROJECT.bufferedUploadCloud"]) {
      const reply = await session.post("Runtime.evaluate", { expression, objectGroup: group }); const id = reply.result.objectId; assert.ok(id !== undefined); handles.push(id);
    }
    const [project, bus, manager, consistency, upload, foreign, buffered] = handles;
    assert.ok(project !== undefined && bus !== undefined && manager !== undefined && consistency !== undefined && upload !== undefined && foreign !== undefined && buffered !== undefined);
    const metadata = await session.post("Runtime.getProperties", { objectId: buffered, ownProperties: true });
    const scopesId = metadata.internalProperties?.find(entry => entry.name === "[[Scopes]]")?.value?.objectId; assert.ok(scopesId !== undefined);
    const scope = decodeCurrentFootprintCopyAsyncScope(await session.post("Runtime.getProperties", { objectId: scopesId, ownProperties: true }));
    const original = callReply.parse(await fixedCall(session, project, CALLS.capture.program, [bus, manager, consistency]));
    assert.equal(original.exceptionDetails, undefined); const originalId = original.result.objectId; assert.ok(originalId !== undefined);
    const captured = callReply.parse(await fixedCall(session, scope, CALLS.captureConstructedUpload.program, [project, bus, manager, consistency, upload]));
    assert.equal(captured.exceptionDetails, undefined); const uploadId = captured.result.objectId; assert.ok(uploadId !== undefined);
    const sampled = callReply.parse(await fixedCall(session, scope, CALLS.sample.program, [project, bus, manager, consistency, originalId, uploadId], true));
    assert.equal(sampled.exceptionDetails, undefined); const snapshot: unknown = sampled.result.value; assert.ok(isRecord(snapshot)); assert.equal(snapshot["task1"], 0);
    const rejected = callReply.parse(await fixedCall(session, scope, CALLS.captureConstructedUpload.program, [project, bus, manager, consistency, foreign]));
    assert.ok(rejected.exceptionDetails !== undefined);
  } finally {
    try { await session.post("Runtime.evaluate", { expression: "delete globalThis.PROJECT" }); await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); }
    finally { session.disconnect(); }
  }
});
