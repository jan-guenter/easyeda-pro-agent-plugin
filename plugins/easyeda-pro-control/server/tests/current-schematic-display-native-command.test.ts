/** Pure finite wire checks do not issue a checkpoint or native generation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicDisplayNativeCommand as command, validateCurrentSchematicDisplayNativeCommand as validate } from "../src/current-schematic-display-native-command.ts";
import { currentSchematicDisplayWriteNativeRequest as encode } from "../src/current-schematic-display-write-protocol.ts";
import { CURRENT_SCHEMATIC_DISPLAY_WRITE_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-display-write-native-profile.ts";

const target = { rawWindowsPath: String.raw`C:\Synthetic\CodexEasyedaFixture_${"a".repeat(32)}\Codex_schematic_${"b".repeat(16)}.eprj2`,
  projectUuid: "c".repeat(64), branchUuid: "d".repeat(32), schematicUuid: "e".repeat(32), pageUuid: "f".repeat(32), expectedSourceSha256: "1".repeat(64) };
const operation = { operationId: "sch209-display-native-codec", textId: "text-1", beforeBody: {}, afterBody: {},
  peers: Array.from({ length: 5 }, (_, i) => ({ id: `peer${String(i)}`, type: "LINE", body: {} })) };
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
void test("only seven fixed original SCH source calls encode, with bounded inert target/operation arguments", () => {
  for (const phase of ["start", "navigate", "capture", "preflight", "modify", "observe", "save"] as const) {
    const original = command(phase, "original-binding", target, operation), raw = { id: PROFILE.renderer.total, ...original, sessionId: "original-session" };
    assert.deepEqual(validate(original), original); const encoded = encode(wire(raw));
    assert.equal(encoded["action"], "schematic-display-native"); assert.equal(encoded["phase"], phase); assert.equal(encoded["requestId"], PROFILE.renderer.total);
    assert.equal(Object.hasOwn(encoded, "functionDeclaration"), false); assert.ok(wire(raw).length <= 65_536);
    assert.throws(() => encode(wire({ ...raw, params: { ...original.params, functionDeclaration: "function(){return true}" } })));
    assert.throws(() => encode(wire({ ...raw, callerCode: "void 0" })));
    assert.throws(() => encode(wire({ ...raw, id: PROFILE.renderer.total + 1 })));
  }
});
void test("source call selectors, context kinds and canonical JSON cannot drift across encoding", () => {
  const original = command("preflight", "original-holder", target, operation);
  assert.throws(() => validate({ ...original, schematicDisplayPhase: "modify" }));
  assert.throws(() => validate({ ...original, params: { ...original.params, uniqueContextId: "foreign" } }));
  assert.throws(() => validate({ ...original, params: { ...original.params, arguments: [{ value: JSON.stringify(target) }, { value: "preflight" }, original.params.arguments[2]] } }));
  assert.throws(() => command("capture", "original-context", { ...target, documentUuid: target.pageUuid }, operation));
  assert.throws(() => command("capture", "original-context", target, { ...operation, peers: operation.peers.slice(0, 4) }));
});
