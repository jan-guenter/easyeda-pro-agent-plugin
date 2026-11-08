/** Actual fixed-program Inspector exceptions, no app/native owner or SQL. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { currentSelectedFileMainSqlCaptureError as classify } from "../src/current-selected-file-main-sql-capture-error.ts";
import { currentSelectedFileMainSqlFenceImportsError as importsError } from "../src/current-selected-file-main-sql-fence-replies.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as CAPTURE } from "../src/current-selected-file-main-sql-fence-programs.ts";

void test("fixed capture guard and debugger side-effect errors retain only a static failure code", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const setup = await session.post("Runtime.evaluate", { expression: 'globalThis.sqlCaptureExceptionFixture={calls:0,root:[class Z2{},class Yo{},{Database:Map,Statement:Set},{}]}' });
    assert.equal(setup.exceptionDetails, undefined);
    const frame = await session.post("Runtime.evaluate", { expression: "globalThis.sqlCaptureExceptionFixture.root" }); assert.ok(frame.result.objectId !== undefined);
    const call = (): Promise<unknown> => session.post("Runtime.callFunctionOn", { objectId: frame.result.objectId, functionDeclaration: CAPTURE,
      arguments: [{ value: "C:\\Synthetic\\fixture.eprj2" }], returnByValue: false, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false });
    assert.equal(classify(await call()), "SELECTED_SQL_CAPTURE_BINDING");
    await session.post("Runtime.evaluate", { expression: 'globalThis.sqlCaptureExceptionFixture.root[3]=new Proxy({},{getOwnPropertyDescriptor(){globalThis.sqlCaptureExceptionFixture.calls++;return undefined}})' });
    assert.equal(classify(await call()), "SELECTED_SQL_CAPTURE_SIDE_EFFECT");
    const count = await session.post("Runtime.evaluate", { expression: "globalThis.sqlCaptureExceptionFixture.calls", returnByValue: true }); assert.equal(count.result.value, 0);
  } finally { session.disconnect(); Reflect.deleteProperty(globalThis, "sqlCaptureExceptionFixture"); }
});
void test("raw paths and inconsistent remote exception descriptions grant nothing", () => {
  const remote = { type: "object", subtype: "error", className: "TypeError", objectId: "original", description: "TypeError: C:\\private\\design.eprj2\nprivate stack" };
  const packet = { result: remote, exceptionDetails: { text: "Uncaught", exception: { ...remote, objectId: "second-error-handle" } } };
  assert.equal(classify(packet), "SELECTED_SQL_CAPTURE_TYPE_ERROR");
  assert.equal(classify({ ...packet, exceptionDetails: { text: "Uncaught", exception: { ...remote, description: "TypeError: inconsistent" } } }), null);
  assert.equal(classify({ result: { type: "object", subtype: "array", className: "Array", description: "Array(11)", objectId: "original" } }), null);
  let calls = 0; const hostile = Object.defineProperty({}, "result", { get() { calls += 1; return packet.result; } });
  assert.throws(() => { classify(hostile); }); assert.equal(calls, 0);
});
void test("passive import metadata rejects an actual accessor without calling it", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const frame = await session.post("Runtime.evaluate", { expression: 'globalThis.sqlCaptureImportsFixture={calls:0,root:[class Z2{},class Yo{},{Database:Map,Statement:Set},{types:{}}]};globalThis.sqlCaptureImportsFixture.root' });
    assert.ok(frame.result.objectId !== undefined);
    const read = (): Promise<unknown> => session.post("Runtime.getProperties", { objectId: frame.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
    assert.equal(importsError(await read()), null);
    await session.post("Runtime.evaluate", { expression: 'globalThis.sqlCaptureImportsFixture.root[2]=undefined' });
    assert.equal(importsError(await read()), "SELECTED_SQL_IMPORT_SQLITE");
    await session.post("Runtime.evaluate", { expression: 'Object.defineProperty(globalThis.sqlCaptureImportsFixture.root,"2",{get(){globalThis.sqlCaptureImportsFixture.calls++;return {}}})' });
    assert.equal(importsError(await read()), "SELECTED_SQL_IMPORT_ARRAY_METADATA");
    const count = await session.post("Runtime.evaluate", { expression: "globalThis.sqlCaptureImportsFixture.calls", returnByValue: true }); assert.equal(count.result.value, 0);
  } finally { session.disconnect(); Reflect.deleteProperty(globalThis, "sqlCaptureImportsFixture"); }
});
