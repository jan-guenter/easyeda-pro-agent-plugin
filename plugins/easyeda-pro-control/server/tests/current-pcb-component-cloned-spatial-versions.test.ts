/** Historical envelopes are independent explicit fixtures; parsing them never
 * supplies a reader owner or permits old results on the live decoder. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { decodeCurrentPcb209ComponentClonedPointReply as decode, currentPcb209ComponentClonedPointResultV1Schema as legacy } from "../src/current-pcb-209-component-cloned-point-read.ts";
import { currentPcbComponentClonedSpatialObservationV1Schema as legacyObservation, currentPcbComponentClonedSpatialObservation as observe } from "../src/current-pcb-component-cloned-spatial-validation.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const old = {
  schema: "easyeda-pro-control.pcb209-component-cloned-point.v1", documentUuid: "b".repeat(32),
  query: { kind: "point", xMil: 50, yMil: 0 }, identities: [{ primitiveId: "d".repeat(32), family: "Pad" }],
  sceneComponentCount: 1, scenePadCount: 1, sceneHiddenAttributeCount: 2, selectedPrimitiveIds: [], samples: 2,
  nativeOrderingPreserved: true, retainedSceneDescriptorsUnchanged: true, selectionUnchanged: true,
  allowedExistingStateEffect: "D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ",
  scope: "generated-component-cloned-pad-point-scene", nativeFunctionGraphVerified: false, cloneModelState: 0,
  templateGeometryMatched: true, templateReferenceLinked: false, nativeIntrinsicsVerified: false,
  sourceMembershipVerified: false, persistenceVerified: false,
};
void test("normalized model64 has new result and record versions while released v1 remains exact", () => {
  legacy.parse(old); assert.throws(() => legacy.parse({ ...old, cloneModelState: 64 }));
  assert.throws(() => decode({ result: { type: "string", value: JSON.stringify(old) } }));
  const result = decode({ result: { type: "string", value: JSON.stringify({ ...old, schema: "easyeda-pro-control.pcb209-component-cloned-point.v2", cloneModelState: 64 }) } });
  const current = observe([result]), previous = legacyObservation.parse({ schema: "easyeda-pro-control.pcb209-component-cloned-point-observation.v1", results: [old], executionAuthorized: false, saveAuthorized: false });
  const common = { operationId: "pcb209-spatial-component-version-fixture", createdAt: "2026-11-07T00:00:00.000Z", stage: "spatial209", intentSha256: "a".repeat(64), executionAuthorized: false, saveAuthorized: false };
  const oldRecord = { ...common, schema: "easyeda-pro-control.pcb209-component-cloned-point-observation-result.v1", result: previous };
  const newRecord = { ...common, schema: "easyeda-pro-control.pcb209-component-cloned-point-observation-result.v2", result: current };
  diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse(oldRecord); diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse(newRecord);
  assert.throws(() => diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse({ ...oldRecord, result: current }));
  assert.throws(() => diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse({ ...newRecord, result: previous }));
});
