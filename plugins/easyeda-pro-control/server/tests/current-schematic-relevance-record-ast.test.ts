/** Original event/closure identity and the separate record-to-AST codebook. */
import assert from "node:assert/strict";
import { runInThisContext } from "node:vm";
import { test } from "node:test";
import { CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_BEFORE as BEFORE } from "../src/current-schematic-relevance-record-ast-programs.ts";
import { currentSchematicRelevanceRecordAstCases } from "../src/current-schematic-relevance-record-ast-wire.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest as ownWire } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest as oldWire } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicWireEditNativeRequest as wireWire } from "../src/current-schematic-wire-edit-protocol.ts";
import { validateCurrentSchematicRelevanceRecordAstCommand as validate } from "../src/current-schematic-relevance-record-ast-protocol.ts";
void test("the original record may call only its retained AST with the same connected model and exact event", () => {
  let invoked = 0; const native: unknown[] = [Object.getOwnPropertyDescriptor, null, null, null, Object.hasOwn, Reflect.ownKeys, null, Array.isArray];
  const ast = (): void => { invoked += 1; }, record = (): void => { invoked += 1; }; const monitor = { record }; const shapes = { modifyMonitor: monitor }; const text = { _underline: true, isConnected: true, shapeManager: shapes }; const event = { model: text, attr: "underline", oldValue: false, newValue: true }; const entry: unknown[] = Array.from({ length: 13 }, () => ({})); entry[8] = text; entry[11] = monitor; const refs: unknown[] = Array.from({ length: 24 }, () => ({})); refs[10] = shapes; const primitive = [{}, false, true];
  const fn: unknown = runInThisContext(`(${BEFORE})`); assert.ok(typeof fn === "function"); const frame = [monitor, event, ast]; const args = [native, refs, entry, event, ast, primitive, record]; const check = (): unknown => Reflect.apply(fn, frame, args); assert.equal(check(), true); assert.equal(invoked, 0);
  frame[2] = (): void => { invoked += 1; }; assert.throws(check); frame[2] = ast; text.isConnected = false; assert.throws(check); text.isConnected = true; Object.defineProperty(event, "model", { get(): unknown { invoked += 1; return text; } }); assert.throws(check); assert.equal(invoked, 0);
});
void test("the record-to-AST lane has one exact resume and no route to run the AST or monitor body", () => {
  const cases = currentSchematicRelevanceRecordAstCases(); assert.equal(cases.filter(command => command.method === "Debugger.resume").length, 1);
  for (const command of cases) { const bytes = Buffer.from(`${JSON.stringify({ id: 1, ...command, schematicRelevanceRecordAstCommand: true, sessionId: "original-session" })}\0`); assert.equal(ownWire(bytes)["action"], "schematic-relevance-record-ast"); assert.throws(() => oldWire(bytes)); assert.throws(() => wireWire(bytes)); }
  assert.throws(() => validate({ phase: "ast-resume", method: "Debugger.resume", params: {} })); assert.throws(() => validate({ phase: "frame", role: "record", method: "Debugger.evaluateOnCallFrame", params: { expression: "t()" } }));
});
