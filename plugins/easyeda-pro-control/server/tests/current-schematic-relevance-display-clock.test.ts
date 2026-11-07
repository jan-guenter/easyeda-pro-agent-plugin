/** Fixed bytes and original-custody refusals only. No owner or app is launched. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicDisplayClockNativeCases } from "../src/current-schematic-display-clock-protocol.ts";
import { currentSchematicDisplayClockTemplate, currentSchematicDisplayClockWire } from "../src/current-schematic-display-clock-wire.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicWireEditNativeRequest } from "../src/current-schematic-wire-edit-protocol.ts";
import { requireOriginalCurrentSchematicRelevanceDisplayClockOrigin } from "../src/current-pcb-diagnostic-owner.ts";
import { qualifyOriginalGeneratedSchematicRelevanceDisplayEffect, requireOriginalGeneratedSchematicRelevanceDisplayEffect } from "../src/generated-schematic-relevance-display-effect.ts";

const bytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("all37 seven-record clock cases keep distinct native verbs and reject six/Wire transport", () => {
  for (const command of currentSchematicDisplayClockNativeCases()) {
    const template = currentSchematicDisplayClockTemplate(command); const realm = template.realm === "worker" ? "worker" : "ui";
    const wire = currentSchematicDisplayClockWire(command, realm, 1);
    const message = { id: 1, ...wire.command, schematicRelevanceClockCommand: true, schematicClockRealm: realm, sessionId: "original-session" };
    const encoded = bytes(message);
    assert.deepEqual(currentSchematicRelevanceDisplayWriteNativeRequest(encoded), { ...wire.request, action: "schematic-relevance-display-clock" });
    assert.throws(() => currentSchematicDisplayWriteNativeRequest(encoded), /FOREIGN_ACTION_MARKER/u);
    assert.throws(() => currentSchematicWireEditNativeRequest(encoded), /OWN_MUTATION_ORIGIN_REQUIRED/u);
    assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(bytes({ ...message, objectIdOverride: "caller" })));
    const six = bytes({ id: 1, ...wire.command, schematicClockCommand: true, schematicClockRealm: realm, sessionId: "original-session" });
    assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(six), /OWN_MUTATION_ORIGIN_REQUIRED/u);
  }
});
void test("matching clock/effect packets and a predicted seven-record body cannot issue original custody", () => {
  assert.throws(() => Reflect.apply(requireOriginalCurrentSchematicRelevanceDisplayClockOrigin, undefined, [{ profile: "private.current-schematic-relevance-display-clock-origin.v1" }, {}, {}]), /CLOCK_ORIGINAL/u);
  const effect = Object.freeze({ profile: "private.generated-schematic-relevance-display-native-effect.v1", projection: {}, originalNativeStagesJoined: true });
  assert.throws(() => Reflect.apply(requireOriginalGeneratedSchematicRelevanceDisplayEffect, undefined, [effect, {}, {}]), /EFFECT_ORIGINAL/u);
  assert.throws(() => Reflect.apply(qualifyOriginalGeneratedSchematicRelevanceDisplayEffect, undefined, [{}, {}, {}, {}, {}]));
});
