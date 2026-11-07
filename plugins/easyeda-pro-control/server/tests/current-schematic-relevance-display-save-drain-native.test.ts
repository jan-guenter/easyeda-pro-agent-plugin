/** Fixed encoder/source parity only. No original owner, app or native call. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { applyCurrentSchematicRelevanceDisplaySaveDrainNativeFragment as apply, currentSchematicRelevanceDisplaySaveDrainOwnerNative as body } from "../src/current-schematic-relevance-display-save-drain-native-fragment.ts";
import { currentSchematicRelevanceDisplayDrainWire, currentSchematicRelevanceDisplayPostSyncWire, currentSchematicRelevanceDisplayTailDeleteWire, currentSchematicRelevanceDisplayTailExtraWire, currentSchematicRelevanceDisplayTailWire } from "../src/current-schematic-relevance-display-save-drain-wire.ts";
import { currentPcbViaSaveDrainNativeCases } from "../src/current-pcb-via-save-drain-protocol.ts";
import { currentPcbViaPostHistorySyncNativeCases } from "../src/current-pcb-via-post-history-sync-protocol.ts";
import { currentPcbViaSaveTailObservationNativeCases } from "../src/current-pcb-via-save-tail-observation-protocol.ts";
import { currentPcbViaSaveTailDeleteControlNativeCases } from "../src/current-pcb-via-save-tail-delete-control-protocol.ts";
import { currentProjectSaveProducerNativeCases } from "../src/current-project-save-producer-protocol.ts";

void test("own7 fixed tail selectors preserve their finite command bytes and reject caller code",()=>{
 for(const [make,cases,action] of [
  [currentSchematicRelevanceDisplayTailWire,currentPcbViaSaveTailObservationNativeCases(),"tail"],
  [currentSchematicRelevanceDisplayTailDeleteWire,currentPcbViaSaveTailDeleteControlNativeCases(),"tail-delete"],
  [currentSchematicRelevanceDisplayDrainWire,currentPcbViaSaveDrainNativeCases(),"drain"],
  [currentSchematicRelevanceDisplayPostSyncWire,currentPcbViaPostHistorySyncNativeCases(),"post-sync"],
 ] as const){for(const command of cases){const wire=make(command,79);assert.equal(wire.request["action"],`schematic-relevance-display-save-${action}`);assert.throws(()=>make({...command,owner:"foreign"},79));}}
 for(const command of currentProjectSaveProducerNativeCases()){if(command.phase==="project-save-producer-cache-caller"&&command.cacheRole==="localSave"){assert.equal(currentSchematicRelevanceDisplayTailExtraWire(command,79).request["action"],"schematic-relevance-display-save-tail-extra");}}
 assert.throws(()=>currentSchematicRelevanceDisplayPostSyncWire({phase:"via-post-sync-replay",params:{objectId:"foreign"}},79));
});
void test("own7 native composition is idempotent and preserves separate fields and exact pre-Save arms",()=>{
 const seed='case "schematic-relevance-display-main-observe":\npublic void AssertRelevanceSaveMainPrepared(){return;}\nObserveRelevanceSaveBodyRequest(phase,fields);\n        \'schematic-relevance-display-main-observe\' {\n        }\n    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()\ninternal enum EasyedaPcbViaWriteBirth { Original }';
 const source=apply(seed);assert.equal(apply(source),source);assert.ok(source.includes('if(relevanceTailObservationStep!=3)'));assert.ok(source.includes('relevanceTailExtraRequests!=42||relevanceLocalCacheRequests!=14'));assert.ok(source.includes('relevanceHistoryStep==20'));assert.ok(source.includes('relevancePollingQuiesced&&relevanceLibraryQuiesced'));assert.equal(/\bvia[A-Z]\w*\b/u.test(body()),false);assert.equal(body().includes('!pcbViaWrite209'),false);assert.throws(()=>apply(source.replace('// END ORIGINAL RELEVANCE SAVE DRAIN','foreign')));
});
