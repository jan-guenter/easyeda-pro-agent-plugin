import { currentSchematicRelevanceDisplayModifyEntryNativeCases } from "../src/current-schematic-relevance-display-modify-entry-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_WRITE_NATIVE_PROFILE as DISPLAY } from "../src/current-schematic-relevance-display-write-native-profile.ts";
/** Finite transport data only; no original owner, helper or native process. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicWireEditNativeCommand as command, validateCurrentSchematicWireEditNativeCommand as validate } from "../src/current-schematic-wire-edit-native-command.ts";
import { currentSchematicWireEditNativeRequest as encode } from "../src/current-schematic-wire-edit-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_EDIT_NATIVE_PROFILE as PROFILE } from "../src/current-schematic-wire-edit-native-profile.ts";
import { currentSchematicRelevanceDisplayNativeCommand as display } from "../src/current-schematic-relevance-display-native-command.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest as displayEncode } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { wireData } from "./generated-schematic-wire-edit-fixture.ts";

const wire = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("existing-LINE stages keep their original Wire grammar; display aliases, Save, unknown code and over-budget requests refuse", () => {
  const { args } = wireData();
  for (const phase of ["start", "navigate", "capture", "preflight", "modify", "observe"] as const) {
    const fixed = command(phase, "original-binding", args.target, args.operation), raw = { id: PROFILE.renderer.total, ...fixed, sessionId: "original-session" };
    assert.deepEqual(validate(fixed), fixed); const native = encode(wire(raw));
    assert.equal(native["action"], "schematic-wire-edit-native"); assert.equal(native["phase"], phase);
    assert.equal(Object.hasOwn(native, "functionDeclaration"), false); assert.ok(wire(raw).length <= 65_536);
    assert.throws(() => displayEncode(wire(raw))); assert.throws(() => encode(wire({ ...raw, id: PROFILE.renderer.total + 1 })));
    assert.throws(() => encode(wire({ ...raw, params: { ...fixed.params, functionDeclaration: "function(){return true}" } })));
    assert.throws(() => validate({ ...fixed, schematicWireEditPhase: "save" }));
  }
  assert.equal(encode(wire({ id: PROFILE.renderer.total, method: "Target.getTargets" }))["requestId"], PROFILE.renderer.total);
  assert.throws(() => encode(wire({ id: 1, ...display("start", "original-binding"), sessionId: "original-session" })));
  assert.throws(() => command("capture", "original-binding", args.target, { ...args.operation, peers: args.operation.peers.slice(0, 5) }));
  assert.throws(() => command("capture", "original-binding", args.target, { ...args.operation, textId: "foreign" }));
});

void test("Wire retains its own read budget and refuses seven-record pending-Modify selectors", () => {
  assert.equal(PROFILE.renderer.modifyEntryObservation, 0);
  assert.equal(PROFILE.renderer.total, DISPLAY.renderer.total - DISPLAY.renderer.modifyEntryObservation - DISPLAY.renderer.stageCalls - DISPLAY.renderer.stageBrackets + PROFILE.renderer.stageCalls + PROFILE.renderer.stageBrackets);
  const entry = currentSchematicRelevanceDisplayModifyEntryNativeCases()[0]; assert.ok(entry !== undefined);
  assert.throws(() => encode(wire({ id: 1, ...entry, schematicRelevanceModifyEntryCommand: true, sessionId: "original-session" })), /OWN_MUTATION_ORIGIN_REQUIRED/u);
  assert.throws(() => encode(wire({ id: 1, ...display("start", "original-binding"), schematicRelevanceModifyGeneration: true, sessionId: "original-session" })), /OWN_MUTATION_ORIGIN_REQUIRED/u);
});
