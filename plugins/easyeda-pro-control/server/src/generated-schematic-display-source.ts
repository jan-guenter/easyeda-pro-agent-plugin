import { z } from "zod";
import { assertOriginalGeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import type { GeneratedSchematicFixtureOpenCheckpoint } from "./managed-schematic-fixture-open-checkpoint.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { MANAGED_SCHEMATIC_FIXTURE_TEXT } from "./managed-schematic-fixture-generator.ts";
import { projectSchematicLiteralDisplayBody } from "./schematic-layout-batch.ts";
import { generatedSchematicDisplayOperationIdSchema, generatedSchematicDisplayPatchSchema } from "./generated-schematic-display.ts";
import type { GeneratedSchematicDisplayPatch } from "./generated-schematic-display.ts";

/** Current c1/hv Text body and common root serializer. Both complete source
 * files must be pinned independently by the new native owner. These spans are
 * UTF16 half-open, not byte offsets; no constructor or setter is executed here. */
const sourceFiles = Object.freeze([
    Object.freeze({ relativePath: "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js", bytes: 6_289_622,
      sha256: "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c", text: Object.freeze({ start: 4_126_698, end: 4_127_069 }), common: Object.freeze({ start: 1_731_862, end: 1_732_248 }),
      accessors: Object.freeze({ start: 3_492_920, end: 3_495_716, sha256: "5a708c44324fac9042de60fd252b6962e077ada72f639c8948225a0159e5bc6d" }),
      decorators: Object.freeze({ start: 3_498_228, end: 3_498_706, sha256: "f6e2e2e58d805cda80f9fa4edcac4a3f9e3a721d733d4635caa895204c3dca2e" }) }),
    Object.freeze({ relativePath: "pro-sch/3.2.193.5dbe8bb3/js/sch.js", bytes: 6_472_538,
      sha256: "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd", text: Object.freeze({ start: 4_331_870, end: 4_332_241 }), common: Object.freeze({ start: 1_928_416, end: 1_928_802 }),
      accessors: Object.freeze({ start: 3_873_035, end: 3_875_831, sha256: "586665ca6252e6a41e3970cc53434aa6ce2e402c18bddd48287cd945d50d776d" }),
      decorators: Object.freeze({ start: 3_878_343, end: 3_878_821, sha256: "44e98701671dc16ee18a31b2c0f9955a1ec88ffd946834a25c153e73a308f4d2" }) }),
]);
export const GENERATED_SCHEMATIC_DISPLAY_TEXT_SOURCE = Object.freeze({
  files: sourceFiles,
  textSha256: "7d2e85b1288bf1ea018db7e6629414ab69b432331f2f5018445b2aa76f63f6c5",
  commonSha256: "71ba3ff796a1f52b2772ae0ed35d979112f417bf5d687af085921a85290b3066",
  originalSerializerExecutionObserved: false, sourceProjectionGrantsWriterAuthority: false,
});
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_SCHEMATIC_DISPLAY_TEXT_SOURCE_REFUSED"); } }
/** Exact fixed generated root Text input -> native consistency body projection.
 * The common serializer removes an absent combination ID, Text omits version,
 * and fillColor is copied from raw color. This is a declared data projection,
 * not permission to ignore those effects in an actual closed SQL comparison. */
export function projectGeneratedSchematicInitialNativeTextBody(input: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  need(canonicalJson(input) === canonicalJson(MANAGED_SCHEMATIC_FIXTURE_TEXT));
  const { groupId: _group, version: _version, ...body } = input;
  return Object.freeze({ ...body, fillColor: input["color"] });
}
export interface GeneratedSchematicDisplayBodyPlan {
  readonly schema: "easyeda-pro-control.generated-schematic-display-body-plan.v1";
  readonly patch: GeneratedSchematicDisplayPatch;
  readonly nativeBeforeBody: Readonly<Record<string, unknown>>;
  readonly nativeAfterBody: Readonly<Record<string, unknown>>;
  readonly beforeSha256: string; readonly afterSha256: string;
  readonly sourceProfileSha256: string;
  readonly literalTextValuePreserved: true; readonly sourceVersionAliased: false;
  readonly pageEligibilityVerified: false; readonly nativeOwnerVerified: false; readonly completeSourceVerified: false;
  readonly connectivityVerified: false; readonly persistenceVerified: false; readonly writerAuthority: false;
}
/** Reuses only the maintained pure display mapper. The old149 transaction gate
 * remains strict; current209 owner/page/source/clock/persistence must qualify
 * separately before this data may become an original native writer plan. */
export function prepareGeneratedSchematicDisplayBodyPlan(input: unknown): GeneratedSchematicDisplayBodyPlan {
  const patch = generatedSchematicDisplayPatchSchema.parse(input); const before = projectGeneratedSchematicInitialNativeTextBody(MANAGED_SCHEMATIC_FIXTURE_TEXT);
  const mapped = projectSchematicLiteralDisplayBody({ ...before }, patch);
  // Match the actual encoder JSON boundary, including coordinate -0 -> 0.
  // oxlint-disable-next-line unicorn/prefer-structured-clone -- This models native JSON source encoding, including -0, rather than cloning object identity.
  const after = z.record(z.string(), z.json()).parse(JSON.parse(JSON.stringify(mapped)) as unknown);
  need(canonicalJson(before) !== canonicalJson(after) && after["value"] === before["value"] && after["locked"] === false);
  return Object.freeze({ schema: "easyeda-pro-control.generated-schematic-display-body-plan.v1", patch: Object.freeze(patch), nativeBeforeBody: before, nativeAfterBody: Object.freeze(after),
    beforeSha256: sha256Json(before), afterSha256: sha256Json(after), sourceProfileSha256: sha256Json(GENERATED_SCHEMATIC_DISPLAY_TEXT_SOURCE),
    literalTextValuePreserved: true, sourceVersionAliased: false, pageEligibilityVerified: false, nativeOwnerVerified: false, completeSourceVerified: false,
    connectivityVerified: false, persistenceVerified: false, writerAuthority: false });
}

export interface GeneratedSchematicDisplayNativeArguments {
  readonly target: GeneratedSchematicFixtureOpenCheckpoint["qualification"]["target"];
  readonly operation: Readonly<{ operationId: string; textId: string; beforeBody: Readonly<Record<string, unknown>>; afterBody: Readonly<Record<string, unknown>>;
    peers: readonly Readonly<{ id: string; type: "CANVAS" | "WIRE" | "LINE" | "BUS"; body: Readonly<Record<string, unknown>> }>[] }>;
}
const originalArguments = new WeakMap<GeneratedSchematicDisplayNativeArguments, Readonly<{ prepared: GeneratedSchematicFixtureOpenCheckpoint; text: string }>>();
/** Data argument builder bound to the actual issued initial checkpoint. No raw
 * target, source or primitive selector can be supplied by a public request.
 * The new native owner must independently verify its original birth/context and
 * match the complete live source before any mutation can consume these data. */
export function buildGeneratedSchematicDisplayNativeArguments(prepared: GeneratedSchematicFixtureOpenCheckpoint, operationId: string, patch: unknown): GeneratedSchematicDisplayNativeArguments {
  assertOriginalGeneratedSchematicFixtureOpenCheckpoint(prepared); generatedSchematicDisplayOperationIdSchema.parse(operationId);
  const bodyPlan = prepareGeneratedSchematicDisplayBodyPlan(patch), target = prepared.qualification.target;
  const page = prepared.history.documents.find(document => document.uuid === target.pageUuid && document.docType === "SCH_PAGE"); need(page !== undefined);
  const textRows = page.records.filter(record => record.type === "TEXT"); const text = textRows[0];
  need(textRows.length === 1 && text !== undefined && canonicalJson(text.body) === canonicalJson(MANAGED_SCHEMATIC_FIXTURE_TEXT));
  const peers: { id: string; type: "CANVAS" | "WIRE" | "LINE" | "BUS"; body: Readonly<Record<string, unknown>> }[] = [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }];
  for (const row of page.records.filter(record => record.id !== "META" && record.id !== text.id)) {
    need(row.type === "WIRE" || row.type === "LINE" || row.type === "BUS");
    let body = structuredClone(row.body);
    if (row.type === "WIRE" || row.type === "BUS") { need(body["groupId"] === 0); const { groupId: _group, ...rest } = body; body = rest; }
    peers.push({ id: row.id, type: row.type, body });
  }
  need(peers.length === 5 && new Set(peers.map(row => row.id)).size === 5);
  const result = freezeDeep({ target: structuredClone(target), operation: { operationId, textId: text.id, beforeBody: bodyPlan.nativeBeforeBody,
    afterBody: bodyPlan.nativeAfterBody, peers: peers.toSorted((left, right) => left.id.localeCompare(right.id)) } });
  originalArguments.set(result, { prepared, text: canonicalJson(result) }); return result;
}
export function requireOriginalGeneratedSchematicDisplayNativeArguments(value: GeneratedSchematicDisplayNativeArguments, prepared: GeneratedSchematicFixtureOpenCheckpoint): void {
  const original = originalArguments.get(value); need(original !== undefined && original.prepared === prepared && original.text === canonicalJson(value));
  assertOriginalGeneratedSchematicFixtureOpenCheckpoint(prepared);
}
