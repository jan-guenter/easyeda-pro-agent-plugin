/** Real immutable data ledgers and exact bounded native field projections. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaSavedCacheLedger } from "../src/current-pcb-via-saved-cache-ledger.ts";
import { CurrentPcbViaSavedCacheMetadataLedger } from "../src/current-pcb-via-saved-cache-metadata-ledger.ts";
import { currentSchematicRelevanceSavedCacheFrame, currentSchematicRelevanceSavedCacheWire,
  currentSchematicRelevanceSavedMetadataFrame, currentSchematicRelevanceSavedMetadataWire,
  currentSchematicRelevanceSavedParentFrame, currentSchematicRelevanceSavedParentWire } from "../src/current-schematic-relevance-saved-cache-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "../src/current-schematic-relevance-saved-readback-profile.ts";

const session = "original_session"; const project = "a".repeat(64);
void test("new cache and native metadata frames retain exact original plans and reject foreign sessions or markers", () => {
  const ledger = new CurrentPcbViaSavedCacheLedger(Object.freeze({ sessionId: session, frameId: "original_frame", securityOrigin: "https://client", projectUuid: project }));
  const plan = ledger.prepare({ phase: "saved-cache-key", step: "initial" }); const wire = currentSchematicRelevanceSavedCacheWire(plan, 20, session); const bytes = Buffer.from(`${JSON.stringify(wire)}\0`);
  assert.deepEqual(currentSchematicRelevanceSavedCacheFrame(bytes, plan, session), { action: "schematic-saved-cache", requestId: 20, sessionId: session, savedCachePhase: "saved-cache-key", savedCacheStep: "initial", frameId: "original_frame" });
  assert.throws(() => currentSchematicRelevanceSavedCacheFrame(bytes, plan, "foreign_session"));
  assert.throws(() => currentSchematicRelevanceSavedCacheFrame(Buffer.from(`${JSON.stringify({ ...wire, savedReadbackCache: true })}\0`), plan, session));
  const metadata = new CurrentPcbViaSavedCacheMetadataLedger(Object.freeze({ sessionId: session, uniqueContextId: "original_context", executionContextId: 7, projectUuid: project }));
  const selected = metadata.prepare({ phase: "saved-cache-native-constructors", kind: "cache-response" }), selectedWire = currentSchematicRelevanceSavedMetadataWire(selected, 21, session);
  const fields = currentSchematicRelevanceSavedMetadataFrame(Buffer.from(`${JSON.stringify(selectedWire)}\0`), selected, session);
  assert.equal(fields["action"], "schematic-saved-metadata"); assert.equal(fields["uniqueContextId"], "original_context"); assert.equal(fields["intrinsicKind"], "cache-response");
  const parent = currentSchematicRelevanceSavedParentWire(22, session); const parentBytes = Buffer.from(`${JSON.stringify(parent)}\0`); assert.deepEqual(currentSchematicRelevanceSavedParentFrame(parentBytes, session), { action: "schematic-saved-parent", requestId: 22, sessionId: session });
  assert.equal(PROFILE.renderer.activeCache, 145); assert.equal(PROFILE.renderer.total, 19); assert.throws(() => currentSchematicRelevanceSavedCacheWire(plan, 146, session));
});
