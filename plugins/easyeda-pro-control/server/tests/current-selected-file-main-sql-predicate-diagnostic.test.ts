/** Isolated guard reevaluations and exact closed wire grammar. No original
 * app, SQL, inspector connection or native generation is allocated here. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { types } from "node:util";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS as CONDITIONS, CURRENT_SELECTED_FILE_MAIN_SQL_PREDICATE_DIAGNOSTIC_PROGRAM as PROGRAM } from "../src/current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FLAGS, validateCurrentSelectedFileMainSqlFenceCommand } from "../src/current-selected-file-main-sql-fence-protocol.ts";
import { currentSelectedFileMainSqlFenceNativeCases, currentSelectedFileMainSqlFenceWire } from "../src/current-selected-file-main-sql-fence-native.ts";
import { decodeCurrentSelectedFileMainSqlPredicateDiagnostic as decode, currentSelectedFileMainSqlPredicateDiagnosticSchema as schema } from "../src/current-selected-file-main-sql-predicate-diagnostic.ts";

void test("fixed failure probe identifies guard steps while every original armed condition remains exact", () => {
  assert.equal(createHash("sha256").update(JSON.stringify(CONDITIONS)).digest("hex"), "b16bb16601fcd44ddd3d762681fd1c6b75c672360649939af1f831c55dce2a33");
  const cases = [["", "condition-false"], ['delete F5.types', "util-types"], ['delete F5.types.isProxy', "proxy-member"],
    ['F5.types.isProxy=0', "proxy-kind"], ['F5.types.isProxy=forbidden', "proxy-source"],
    ['F5.types.isProxy=Array.isArray.bind(null)', "proxy-positive"], ['F5.types.isProxy=Boolean.bind(null)', "proxy-negative"],
    ['t=""', "path"], ['t="x".repeat(4097)', "path"], [String.raw`t="\ud800"`, "path"], [String.raw`t="x\0"`, "path"],
    ['Object.defineProperty(sc,"Database",{get:forbidden})', "database-member"],
    ['sc.Database=new Proxy(Map,{get:forbidden,getOwnPropertyDescriptor:forbidden})', "database-proxy"],
    ['sc.Database=forbidden', "database-source"], ['sc.Database=Date.now', "database-prototype"]] as const;
  for (const [mutation, expected] of cases) {
    const context = createContext({ nativeProxy: types.isProxy });
    runInContext(String.raw`let calls=0;const forbidden=()=>{calls++;throw Error("private error");};const F5={types:{isProxy:nativeProxy}},sc={Database:Map};let t="C:\\private\\fixture.eprj2";`, context);
    runInContext(mutation, context); assert.equal(runInContext(PROGRAM, context), expected, mutation);
    assert.equal(runInContext(CONDITIONS.initializerBirth, context), expected !== "condition-false", mutation);
    assert.equal(runInContext("calls", context), 0, mutation);
  }
});

void test("only the fixed failure probe admits scratch evaluation and a closed by-value label", () => {
  const command = { phase: "sql-fence-predicate-diagnostic", method: "Debugger.evaluateOnCallFrame",
    params: { ...FLAGS, throwOnSideEffect: false, returnByValue: true, callFrameId: "original-frame", expression: PROGRAM } };
  const checked = validateCurrentSelectedFileMainSqlFenceCommand(command); assert.equal(checked.phase, command.phase);
  assert.deepEqual(currentSelectedFileMainSqlFenceWire(command, 7).request,
    { action: "main-send", requestId: 7, phase: command.phase, method: command.method, callFrameId: "original-frame" });
  assert.equal(currentSelectedFileMainSqlFenceNativeCases().filter(row => row.phase === command.phase).length, 1);
  for (const params of [{ ...command.params, expression: "true" }, { ...command.params, sessionId: "copied" },
    { ...command.params, returnByValue: false }, { ...command.params, throwOnSideEffect: true }]) {
    assert.throws(() => validateCurrentSelectedFileMainSqlFenceCommand({ ...command, params }));
  }
  assert.equal(decode({ result: { type: "string", value: "database-member" } }), "database-member");
  for (const result of [{ result: { type: "string", value: "private-path" } }, { result: { type: "string", value: "path", objectId: "copied" } },
    { result: { type: "string", value: "path" }, exceptionDetails: {} }]) { assert.throws(() => decode(result)); }
  let getters = 0; const poison = Object.defineProperty({}, "result", { get: (): never => { getters += 1; throw new Error("private"); } });
  assert.throws(() => decode(poison)); assert.equal(getters, 0);
  const packet = { profile: "private.selected-file-main-sql-predicate-diagnostic.v1", site: "initializerBirth", probeState: "captured", stage: "path",
    diagnosticRequests: 1, sourceQualified: true, originalFailureRetained: true, originalPredicateBranchVerified: false,
    resumeAuthorized: false, executionAuthorized: false, saveAuthorized: false };
  assert.equal(schema.safeParse(packet).success, true);
  for (const changed of [{ stage: null }, { diagnosticRequests: 2 }, { resumeAuthorized: true }, { originalPredicateBranchVerified: true }, { sql: "private" }]) {
    assert.equal(schema.safeParse({ ...packet, ...changed }).success, false);
  }
});
