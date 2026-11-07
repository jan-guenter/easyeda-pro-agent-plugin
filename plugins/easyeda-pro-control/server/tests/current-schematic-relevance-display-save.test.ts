/** Inert bytes and VM result data only, with no native writer or SQL grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicRelevanceDisplayNativeCommand } from "../src/current-schematic-relevance-display-native-command.ts";
import { currentSchematicRelevanceDisplayWriteNativeRequest } from "../src/current-schematic-relevance-display-write-protocol.ts";
import { currentSchematicDisplayWriteNativeRequest } from "../src/current-schematic-display-write-protocol.ts";
import { currentSchematicWireEditNativeRequest } from "../src/current-schematic-wire-edit-protocol.ts";
import { assertGeneratedSchematicRelevanceDisplaySaveStage, compareGeneratedSchematicRelevanceDisplayEffect } from "../src/generated-schematic-relevance-display-effect-data.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "../src/generated-schematic-relevance-display.ts";
import { data } from "./generated-schematic-relevance-display-fixture.ts";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";

const bytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("Save generation encodes one selector-only original request and rejects foreign owners or phases", () => {
  const { args } = data(); const command = currentSchematicRelevanceDisplayNativeCommand("save", "original-holder", args.target, args.operation);
  const message = { id: 1, ...command, schematicRelevanceSaveGeneration: true, sessionId: "original-session" };
  assert.deepEqual(currentSchematicRelevanceDisplayWriteNativeRequest(bytes(message)), { action: "schematic-relevance-display-save-generate", requestId: 1 });
  assert.throws(() => currentSchematicDisplayWriteNativeRequest(bytes(message)), /FOREIGN_ACTION_MARKER/u);
  assert.throws(() => currentSchematicWireEditNativeRequest(bytes(message)), /OWN_MUTATION_ORIGIN_REQUIRED/u);
  assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(bytes({ ...message, body: "caller" })));
  const modify = currentSchematicRelevanceDisplayNativeCommand("modify", "original-holder", args.target, args.operation);
  assert.throws(() => currentSchematicRelevanceDisplayWriteNativeRequest(bytes({ id: 1, ...modify, schematicRelevanceSaveGeneration: true, sessionId: "original-session" })), /SAVE_GENERATION_WIRE/u);
});
void test("acknowledged Save source data still require every peer and normalized root before stage acceptance", async () => {
  const vm = fixture(), { args } = data(); await vm.call("capture"); const before = await vm.call("preflight"), modified = await vm.call("modify"), observed = await vm.call("observe");
  const effect = compareGeneratedSchematicRelevanceDisplayEffect(args, before, modified, observed), saved = generatedSchematicRelevanceDisplayStageResultSchema.parse(await vm.call("save"));
  const source = saved.source; assert.ok(typeof source === "string");
  assert.doesNotThrow(() => { assertGeneratedSchematicRelevanceDisplaySaveStage(args, effect, saved); });
  assert.throws(() => { assertGeneratedSchematicRelevanceDisplaySaveStage(args, effect, { ...saved, savePromiseSettled: false }); });
  assert.throws(() => { assertGeneratedSchematicRelevanceDisplaySaveStage(args, effect, { ...saved, source: source.replace('"type":"ATTR"', '"type":"LINE"') }); });
  assert.throws(() => { assertGeneratedSchematicRelevanceDisplaySaveStage(args, { ...effect, rootIndices: effect.rootIndices.map(row => ({ id: row.id, zIndex: 0 })) }, saved); });
});
