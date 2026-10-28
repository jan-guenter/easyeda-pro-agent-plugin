import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { test } from "node:test";
import { currentFootprintCopyExecutionWorkerNativeCases, currentFootprintCopyExecutionWorkerNativeSource } from "../src/current-footprint-copy-execution-worker-native.ts";
import { currentFootprintCopyExecutionWorkerWire } from "../src/current-footprint-copy-execution-worker-wire.ts";
import { currentFootprintCopyPreparationWire } from "../src/current-pcb-worker-startup-wire.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } from "../src/current-pcb-209-startup-opening-program.ts";

void test("copy-only worker grammar excludes caller programs, extra fields and legacy preparation admission", () => {
  for (const command of currentFootprintCopyExecutionWorkerNativeCases()) {
    const wire = currentFootprintCopyExecutionWorkerWire(command, 1); assert.ok(wire !== null);
    assert.equal(wire.request["action"], "footprint-copy-worker"); assert.equal(Object.hasOwn(wire.request, "sessionId"), false);
    assert.throws(() => currentFootprintCopyPreparationWire(command, 1));
    assert.equal(currentFootprintCopyExecutionWorkerWire({ ...command, privileged: true }, 1), null);
    if (command.method === "Runtime.callFunctionOn") {
      assert.equal(currentFootprintCopyExecutionWorkerWire({ ...command, params: { ...command.params, functionDeclaration: "function(){return true;}" } }, 1), null);
      assert.equal(currentFootprintCopyExecutionWorkerWire({ ...command, params: { ...command.params, throwOnSideEffect: false } }, 1), null);
      assert.equal(currentFootprintCopyExecutionWorkerWire({ ...command, params: { ...command.params, arguments: [] } }, 1), null);
    }
  }
  assert.equal(currentFootprintCopyExecutionWorkerWire({ method: "Debugger.setBreakpoint", sessionId: "worker",
    params: { location: { scriptId: "script", lineNumber: 9, columnNumber: 9017 } } }, 1), null);
  assert.ok(CURRENT_PCB_209_STARTUP_OPENING_FUNCTION.length > 16_384);
  assert.equal(currentFootprintCopyExecutionWorkerWire({ method: "Runtime.callFunctionOn", sessionId: "parent",
    params: { functionDeclaration: CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } }, 1), null);
  let calls = 0;
  const input = Object.defineProperty({}, "method", { get: (): string => { calls += 1; return "Debugger.setBreakpoint"; } });
  assert.throws(() => currentFootprintCopyExecutionWorkerWire(input, 1)); assert.equal(calls, 0);
});

void test("native copy encoder seals exact parser and async literals and supplies session only from its original owner", () => {
  const source = currentFootprintCopyExecutionWorkerNativeSource();
  const base64 = /FromBase64String\(@"([A-Za-z\d+/=]+)"\)/u.exec(source)?.[1]; assert.ok(base64 !== undefined);
  // oxlint-disable-next-line node/no-sync -- Verify one bounded in-memory generated table; no files are decompressed.
  const bytes = gunzipSync(Buffer.from(base64, "base64"));
  assert.ok(bytes.length <= 65_536); assert.ok(source.includes(createHash("sha256").update(bytes).digest("hex")));
  const rows = bytes.toString("utf8").split("\0"); assert.equal(rows.length, 11);
  for (const [index, sample] of currentFootprintCopyExecutionWorkerNativeCases().entries()) {
    const wire = currentFootprintCopyExecutionWorkerWire(sample, 1); assert.ok(wire !== null);
    const { id: _id, ...command } = wire.command;
    const row = rows[index]?.split("\t"); assert.ok(row !== undefined);
    assert.equal(row[0], wire.request["executionPhase"]); assert.equal(row[1], command.method); assert.equal(row[3], JSON.stringify(command));
    assert.equal(row[2]?.includes("sessionId"), false);
  }
  assert.ok(source.includes('Need(fields.Count==names.Length)')); assert.ok(source.includes('Field("sessionId",originalWorkerSession)'));
  assert.ok(source.includes('stream.ReadByte()==-1'));
});
