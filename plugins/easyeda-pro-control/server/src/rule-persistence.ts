import { canonicalJson, sha256Json } from "./core.ts";
import { buildExpectedDesignSource } from "./design-source-proof.ts";
import { expectedDesignBatchSource } from "./design-batch-adapter.ts";
import { compileDesignOperation } from "./design-operations.ts";
import { isDesignRuleAction } from "./design-rule-public-adapter.ts";
import { verifyDesignPersistence } from "./design-persistence.ts";
import type { NativeSourceObject } from "./document-source.ts";

function defaultNetSelector(record: NativeSourceObject): string | undefined {
  if (record.type !== "RULE_SELECTOR") { return undefined; }
  const key: unknown = JSON.parse(record.id);
  if (!Array.isArray(key) || key[0] !== record.type || key.length !== 2) { return undefined; }
  const selector: unknown = key[1];
  if (!Array.isArray(selector) || selector.length !== 2 || selector[0] !== "NET" || typeof selector[1] !== "string" || selector[1].length === 0) { return undefined; }
  const ordinaryDefault = { ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} };
  if (canonicalJson(record.body) !== canonicalJson(ordinaryDefault)) { return undefined; }
  return selector[1];
}

/** Only native-public uploads may materialize an already-exported unchanged
 * rule record. Compare its entire body and all remaining durable records.
 */
export function verifyRulePersistence(input: Parameters<typeof verifyDesignPersistence>[0], operation: unknown, createdIds?: Readonly<Record<string, string>>): ReturnType<typeof verifyDesignPersistence> {
  const batch = typeof operation === "object" && operation !== null && "action" in operation && operation.action === "pcb.batch";
  const expected = batch ? expectedDesignBatchSource(operation, input.expectedBefore, createdIds) : buildExpectedDesignSource(operation, input.expectedBefore);
  if (canonicalJson(expected) !== canonicalJson(input.expectedAfter)) { throw new Error("Rule persistence source does not match its exact typed effect."); }
  const actions: unknown[] = batch && "operations" in operation && Array.isArray(operation.operations) ? operation.operations : [operation];
  const compiled = actions.map((entry) => compileDesignOperation(entry)).filter((entry) => isDesignRuleAction(entry.action));
  if (compiled.length === 0) { throw new Error("Rule persistence requires an actual public-rule action."); }
  const full = compiled.some((entry) => entry.action.startsWith("pcb.rules.") || entry.effect.family === "differential-pair");
  const beforeSource = new Map(input.expectedBefore.objects.map((record) => [record.id, record]));
  const afterSource = new Map(input.expectedAfter.objects.map((record) => [record.id, record]));
  const targetUuid = input.expectedBefore.document["uuid"];
  const before = input.before.documents.find((document) => document.uuid === targetUuid);
  const after = input.after.documents.find((document) => document.uuid === targetUuid);
  if (before === undefined || after === undefined) { throw new Error("Missing complete rule checkpoint target."); }
  const durableIds = new Set(before.records.map((record) => record.id));
  const durable = new Map(before.records.map((record) => [record.id, record]));
  const materialized: string[] = [];
  const additions = after.records.filter((entry) => !durableIds.has(entry.id) && beforeSource.has(entry.id) && afterSource.has(entry.id) && canonicalJson(beforeSource.get(entry.id)) === canonicalJson(afterSource.get(entry.id)));
  for (const record of additions) {
    const next = afterSource.get(record.id);
    if (next === undefined) { throw new Error("Source-bound rule addition disappeared."); }
    const name = defaultNetSelector(next);
    const netId = name === undefined ? "" : JSON.stringify(["NET", name]);
    const newNet = afterSource.get(netId), oldNet = beforeSource.get(netId), persistedNet = durable.get(netId);
    const eligible = name !== undefined && persistedNet?.type === "NET" && oldNet?.type === "NET" && newNet?.type === "NET" && canonicalJson(persistedNet.body) === canonicalJson(oldNet.body) && (full || canonicalJson(oldNet) !== canonicalJson(newNet));
    if (eligible) {
      if (record.type !== next.type || canonicalJson(record.body) !== canonicalJson(next.body)) { throw new Error("Materialized rule record differs from its complete unchanged source."); }
      materialized.push(record.id);
    }
  }
  const absent = new Set(materialized);
  const projected = { schema: input.expectedBefore.schema, document: input.expectedBefore.document, objects: input.expectedBefore.objects.filter((record) => !absent.has(record.id)) };
  const persistence = verifyDesignPersistence({ ...input, expectedBefore: { ...projected, sha256: sha256Json(projected) } });
  return { ...persistence, ruleNativeStorage: { schema: "easyeda-pro-control.rule-materialization.v1", beforeSourceSha256: input.expectedBefore.sha256, afterSourceSha256: input.expectedAfter.sha256, materializedIds: materialized.toSorted(), ruleActions: compiled.map((entry) => entry.action), policy: "exact-empty-default-selector-for-an-already-persisted-nonempty-net-and-reviewed-public-upload-path" } };
}
