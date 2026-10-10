/* oxlint-disable import/max-dependencies -- This verifier reuses each exact asset-family proof and the managed artifact reader rather than duplicating them. */
import { basename } from "node:path";
import { z } from "zod";
import { readArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { libraryOperationSchema } from "./library-operations.ts";
import { libraryExecutionKind } from "./library-runtime.ts";
import { prepareDeviceAssociation, verifyDeviceAssociationEffect } from "./device-association.ts";
import { DEVICE_CREATE_PROFILE, prepareDeviceCreate, verifyDeviceCreateEffect } from "./device-create.ts";
import { verifyProjectLibraryEffect } from "./library-persistence-proof.ts";
import { prepareDeviceTransform, verifyDeviceTransformEffect } from "./device-transform.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { prepareProjectSymbolMetadata, verifyProjectSymbolMetadataEffect } from "./project-symbol-metadata.ts";
import { prepareDocumentPageRename, verifyDocumentPageRenameEffect } from "./document-page-rename.ts";
import type { ExpectedContext } from "./engine.ts";

const receiptSchema = z.object({ schema: z.literal("easyeda-pro-control.library-mutation-receipt.v1"),
  kind: z.enum(["project-footprint-write", "project-device-association", "project-device-create", "project-device-transform", "project-symbol-metadata", "project-page-rename"]),
  createdId: z.string().min(1).max(256).nullable(), targetId: z.string().min(1).max(256).nullable(),
  nativeReturnSha256: z.string().regex(/^[a-f0-9]{64}$/u) }).strict();
export type LibraryMutationReceipt = z.infer<typeof receiptSchema>;

/** Retain this immediately after the one returned call. No asset lookup or
 * heuristic name matching can replace its exact native-created identity.
 */
export function libraryMutationReceipt(operationInput: unknown, nativeReturn: unknown): LibraryMutationReceipt {
  const operation = libraryOperationSchema.parse(operationInput);
  const kind = libraryExecutionKind(operation);
  if (!isRecord(nativeReturn) || nativeReturn["kind"] !== kind) { throw new Error("Library mutation acknowledgment kind is missing or contradictory."); }
  const creating = operation.action === "library.footprint.create" || operation.action === "library.device.create";
  const association = operation.action === "library.device.modify" || operation.action === "library.device.model-transform" || operation.action === "library.symbol.modify" || operation.action === "document.page.rename";
  if (!creating && !association && operation.action !== "library.footprint.modify") { throw new Error("No supported library mutation receipt for this action."); }
  const createdId = nativeReturn["createdId"] ?? null;
  let targetId: unknown = null;
  if (association) { targetId = nativeReturn["targetId"]; }
  else if ("target" in operation && "uuid" in operation.target) { targetId = operation.target.uuid; }
  if ((creating && (typeof createdId !== "string" || !/^[a-f0-9]{16}$/u.test(createdId))) || (!creating && createdId !== null) ||
      (association && (!("target" in operation) || !("uuid" in operation.target) || targetId !== operation.target.uuid))) {
    throw new Error("Library mutation acknowledgment does not retain its exact created/target identity.");
  }
  return receiptSchema.parse({ schema: "easyeda-pro-control.library-mutation-receipt.v1", kind,
    createdId, targetId, nativeReturnSha256: sha256Json(nativeReturn) });
}

/** Reads only a descriptor from a previously verified journal. Every page is
 * bounded and the complete original bytes must reproduce its retained hash.
 * Shortening a UTF-8 page avoids splitting a multibyte codepoint.
 */
export async function readLibraryRecoveryArtifact(descriptor: ArtifactDescriptor,
  read: typeof readArtifact = readArtifact): Promise<unknown> {
  if (!Number.isSafeInteger(descriptor.bytes) || descriptor.bytes < 1 || descriptor.bytes > 2_097_152) { throw new Error("Library recovery artifact exceeds its reviewed bound."); }
  let offset = 0, text = "";
  while (offset < descriptor.bytes) {
    let length = Math.min(256 * 1024, descriptor.bytes - offset), page: Awaited<ReturnType<typeof read>> | undefined;
    for (let retry = 0; retry < 4; retry += 1) {
      const result = await read(descriptor.path, offset, length);
      if (result.path !== descriptor.path || result.size !== descriptor.bytes || result.offset !== offset || result.bytesRead !== length) { throw new Error("Library recovery artifact identity/size changed."); }
      if (Buffer.byteLength(result.text, "utf8") === result.bytesRead) { page = result; break; }
      length -= 1;
    }
    if (page === undefined || page.bytesRead < 1) { throw new Error("Library recovery artifact UTF-8 is invalid."); }
    text += page.text; offset += page.bytesRead;
  }
  if (sha256Text(text) !== descriptor.sha256) { throw new Error("Library recovery artifact hash mismatch."); }
  return JSON.parse(text) as unknown;
}
export function uniqueLibraryRecoveryArtifact(artifacts: readonly ArtifactDescriptor[], phase: "native-return" | "device-prepared" | "symbol-prepared" | "activation-prepared" | "page-rename-prepared"): ArtifactDescriptor {
  const matches = artifacts.filter((entry) => new RegExp(`^[0-9]+-${phase}\\.json$`, "u").test(basename(entry.path)));
  if (matches.length !== 1 || matches[0] === undefined) { throw new Error(`Library recovery requires exactly one retained ${phase} artifact.`); }
  return matches[0];
}

export function verifyRecoveredLibraryMutation(input: {
  readonly operation: unknown; readonly before: NativeHistorySnapshot; readonly after: NativeHistorySnapshot;
  readonly nativeReturn: unknown; readonly retainedReceipt?: unknown; readonly preparedDevice?: unknown; readonly preparedSymbol?: unknown;
  readonly preparedPageRename?: unknown; readonly expectedContext?: ExpectedContext;
}): { receipt: LibraryMutationReceipt; proof: Record<string, unknown> } {
  const operation = libraryOperationSchema.parse(input.operation);
  const receipt = libraryMutationReceipt(operation, input.nativeReturn);
  if (input.retainedReceipt !== undefined && canonicalJson(receiptSchema.parse(input.retainedReceipt)) !== canonicalJson(receipt)) {
    throw new Error("Retained library creation/target identity cannot be rebound during recovery.");
  }
  const createdId = receipt.createdId ?? undefined;
  let proof: Record<string, unknown>;
  if (operation.action === "library.footprint.create" || operation.action === "library.footprint.modify") {
    proof = verifyProjectLibraryEffect(operation, input.before, input.after, createdId);
  } else if (operation.action === "document.page.rename") {
    if (input.expectedContext === undefined) { throw new Error("Original page rename context is required for recovery."); }
    const expected = prepareDocumentPageRename(operation, input.before, input.expectedContext);
    if (!isRecord(input.preparedPageRename) || canonicalJson(expected) !== canonicalJson(input.preparedPageRename)) { throw new Error("Retained page rename plan differs from the immutable operation and baseline."); }
    proof = verifyDocumentPageRenameEffect(expected, input.before, input.after);
  } else if (operation.action === "library.symbol.modify") {
    const expected = prepareProjectSymbolMetadata(operation, input.before);
    if (!isRecord(input.preparedSymbol) || canonicalJson(expected) !== canonicalJson(input.preparedSymbol)) { throw new Error("Retained symbol plan differs from the immutable operation and baseline."); }
    proof = verifyProjectSymbolMetadataEffect(expected, input.before, input.after);
  } else {
    if (!isRecord(input.preparedDevice)) { throw new Error("Original checkpoint-bound device plan is required for recovery."); }
    const model = input.preparedDevice["model"];
    const metadata = isRecord(model) ? model["metadata"] : undefined;
    // Deterministic proof recomputation is local only. It does not allocate an
    // Identity, dispatch a create or replace the original retained plan.
    if (operation.action === "library.device.model-transform") {
      const expected = prepareDeviceTransform(operation, input.before);
      if (canonicalJson(expected) !== canonicalJson(input.preparedDevice)) { throw new Error("Retained device transform plan differs from the immutable operation and baseline."); }
      return { receipt, proof: verifyDeviceTransformEffect(expected, input.before, input.after) };
    }
    const expected = operation.action === "library.device.create" ? prepareDeviceCreate(operation, input.before, metadata) : prepareDeviceAssociation(operation, input.before, metadata);
    if (canonicalJson(expected) !== canonicalJson(input.preparedDevice)) { throw new Error("Retained device plan differs from the immutable operation and baseline."); }
    proof = expected.profile === DEVICE_CREATE_PROFILE ? verifyDeviceCreateEffect(expected, input.before, input.after, createdId) : verifyDeviceAssociationEffect(expected, input.before, input.after);
  }
  return { receipt, proof };
}
