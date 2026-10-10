import { sha256Json } from "./core.ts";
import { assertCopperClearProfile, expectedCopperClearSource } from "./design-copper-adapter.ts";
import { verifyDesignPersistence } from "./design-persistence.ts";
import { verifyCopperLifecycleEquivalence } from "./copper-lifecycle.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";

/** The native clear uploads {pourFill:[]} for a still-existing POUR. Public
 * FileSource uses the live child inventory and omits that empty POURED record.
 * This is a target-bound comparison projection, not an ignored record class.
 */
export function verifyCopperClearPersistence(input: Parameters<typeof verifyDesignPersistence>[0], operation: unknown): Record<string, unknown> {
  const parent = assertCopperClearProfile(operation, input.expectedBefore);
  if (expectedCopperClearSource(operation, input.expectedBefore).sha256 !== input.expectedAfter.sha256) { throw new Error("Copper clear persistence requires its exact authorized export delta."); }
  const id = JSON.stringify(["POURED", parent.id]);
  const storedBefore = input.before.documents.find((document) => document.uuid === input.expectedBefore.document["uuid"])?.records.find((record) => record.id === id);
  if (storedBefore?.type !== "POURED" || Object.keys(storedBefore.body).length !== 1 || !Array.isArray(storedBefore.body["pourFill"]) || storedBefore.body["pourFill"].length === 0) { throw new Error("Copper clear requires the exact nonempty durable target record."); }
  const priorBase = { schema: input.expectedBefore.schema, document: input.expectedBefore.document,
    objects: input.expectedBefore.objects.map((record) => record.id === id ? { id, type: "POURED", body: storedBefore.body } : record) };
  const prior: NativeSourceSnapshot = { ...priorBase, sha256: sha256Json(priorBase) };
  const beforeReload = verifyCopperLifecycleEquivalence(prior, input.expectedBefore);
  const nextBase = { schema: input.expectedAfter.schema, document: input.expectedAfter.document,
    objects: [...input.expectedAfter.objects, { id, type: "POURED", body: { pourFill: [] } }].toSorted((left, right) => left.id.localeCompare(right.id)) };
  const next: NativeSourceSnapshot = { ...nextBase, sha256: sha256Json(nextBase) };
  const persistence = verifyDesignPersistence({ ...input, expectedBefore: prior, expectedAfter: next });
  return { ...persistence, actualBeforeExportSha256: input.expectedBefore.sha256, actualAfterExportSha256: input.expectedAfter.sha256,
    copperClearRepresentation: { parentId: parent.id, recordId: id, beforeReload, afterDurableBody: { pourFill: [] }, scope: "one-cleared-parent-empty-derived-record-only" } };
}
