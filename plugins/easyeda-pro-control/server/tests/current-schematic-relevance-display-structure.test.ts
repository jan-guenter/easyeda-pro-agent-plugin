/** Purpose isolation and finite codebook tests, without an original runtime. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentSchematicRelevanceDisplayMainStructureWire } from "../src/current-schematic-relevance-display-main-structure-protocol.ts";
import { CurrentSchematicRelevanceDisplayMainStructureObserver } from "../src/current-schematic-relevance-display-main-structure-observer.ts";
import { currentSchematicRelevanceDisplayStructureNativeSource } from "../src/current-schematic-relevance-display-structure-native-fragment.ts";
import { currentPcbViaMainStructureNativeCases } from "../src/current-pcb-via-main-structure-protocol.ts";
import { currentPcbViaMainStructureWire } from "../src/current-pcb-via-main-structure-wire.ts";
import { consumeOriginalCurrentProjectStructureBodyReservation, consumeOriginalCurrentProjectStructureMainPublication } from "../src/current-pcb-diagnostic-owner.ts";

void test("seven-record STRUCTURE codebook changes only its native action and cannot accept a tree or grant", () => {
  for (const command of currentPcbViaMainStructureNativeCases()) {
    const original = currentPcbViaMainStructureWire(command, 79);
    assert.deepEqual(currentSchematicRelevanceDisplayMainStructureWire(command, 79), { command: original.command, request: { ...original.request, action: "schematic-relevance-display-main-structure" } });
    assert.throws(() => currentSchematicRelevanceDisplayMainStructureWire({ ...command, structureText: "caller tree", bodyReserved: true }, 79));
  }
  let hooks = 0; const input = {};
  Object.defineProperty(input, "phase", { get: (): never => { hooks += 1; throw new Error("caller getter"); } });
  assert.throws(() => currentSchematicRelevanceDisplayMainStructureWire(input, 79)); assert.equal(hooks, 0);
});
void test("native seven-record admission retains independent state while sharing only the fixed encoder", () => {
  const source = currentSchematicRelevanceDisplayStructureNativeSource();
  assert.match(source, /!schematicRelevanceDisplayWrite209\|\|schematicDisplayAbort/u);
  assert.match(source, /!relevanceSaveGenerated\|\|!relevanceSaveBodyEnrolled/u);
  assert.match(source, /relevanceBeginStep!=0\|\|relevanceHistoryStep!=0/u);
  assert.match(source, /schematicWorkerProjectUuid!=project/u);
  assert.match(source, /schematicStructureTransportBodyReserved=true/u);
  assert.match(source, /schematicStructureTransportPublished=true/u);
  assert.match(source, /EasyedaPcbViaMainStructureProtocol\.Encode/u);
  assert.doesNotMatch(source, /\b(?:via|Via)[A-Z]\w*|\bpcbViaWrite209\b|public static class EasyedaPcbViaMainStructureProtocol/u);
});
void test("copied origins and serialized reservation/publication profiles never create a continuation", () => {
  const args = {}, owner = {};
  for (const profile of ["private.current-schematic-relevance-display-save-main-origin.v1", "private.current-pcb-via-main-origin.v1"]) {
    assert.throws(() => Reflect.construct(CurrentSchematicRelevanceDisplayMainStructureObserver, [{ profile }, owner, args]), /SCHEMATIC_SAVE_MAIN_ORIGINAL_ORIGIN/u);
  }
  assert.throws(() => consumeOriginalCurrentProjectStructureBodyReservation({ profile: "private.current-project-structure-body-reservation.v1" }, owner, args), /ORIGINAL_RESERVATION/u);
  assert.throws(() => consumeOriginalCurrentProjectStructureMainPublication({ profile: "private.current-project-structure-main-publication.v1" }, owner, args), /PUBLICATION_ORIGINAL/u);
});
