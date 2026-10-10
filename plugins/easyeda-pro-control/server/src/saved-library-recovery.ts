import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";

type RecordValue = Record<string, unknown>;
export type SavedLibraryFamily = "symbol" | "footprint";

/** Artifact hashes and native checkpoint decoding belong to the coordinator.
 * This guard binds their retained contents to the complete intended source.
 * A saved flag or previously computed persistence.ok is never evidence here.
 */
export function verifySavedLibraryArtifacts(input: {
  readonly family: SavedLibraryFamily;
  readonly expected: NativeSourceSnapshot;
  readonly current: NativeSourceSnapshot;
  readonly scope: unknown;
  readonly save: unknown;
  readonly durable: unknown;
}): { readonly checkpoint: RecordValue } {
  const { expected, current, save, durable, family } = input;
  for (const source of [expected, current]) {
    if (source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects })) {
      throw new Error("Saved library source hash changed.");
    }
  }
  if (canonicalJson(current) !== canonicalJson(expected)) { throw new Error("Current library source does not match the retained saved edit."); }
  if (!isRecord(save) || save["ok"] !== true || save["kind"] !== `${family}-save-requested`) {
    throw new Error("Retained library save acknowledgment is missing or invalid; do not repeat Save.");
  }
  if (!isRecord(durable) || !isRecord(durable["checkpoint"]) ||
      canonicalJson({ value: durable["snapshot"] }) !== canonicalJson({ value: expected }) ||
      canonicalJson({ value: durable["scope"] }) !== canonicalJson({ value: input.scope })) {
    throw new Error("Retained library durable evidence does not bind the intended source and asset scope.");
  }
  const checkpoint = durable["checkpoint"];
  if (checkpoint["schema"] !== "easyeda-pro-control.checkpoint.v2" ||
      typeof checkpoint["receiptPath"] !== "string" || typeof checkpoint["checkpoint"] !== "string" ||
      typeof checkpoint["checkpointSha256"] !== "string" || !/^[a-f0-9]{64}$/u.test(checkpoint["checkpointSha256"])) {
    throw new Error("Retained library saved checkpoint identity is incomplete.");
  }
  return { checkpoint };
}

/** The only remaining effects are a single navigation or receipt reuse. There
 * is deliberately no Save or original-edit action in this recovery plan.
 */
export function selectSavedLibraryReopen(input: {
  readonly documentUuid: string;
  readonly documentType: 2 | 4;
  readonly tabId: string;
  readonly receipts: readonly unknown[];
  readonly outstandingDispatch: boolean;
}): { readonly action: "reopen-once" } | { readonly action: "reuse-reopen"; readonly receipt: RecordValue } {
  const receipts = input.receipts.filter((receipt) => receipt !== undefined);
  if (receipts.length > 1) { throw new Error("Multiple library reopen receipts are not one lifecycle proof."); }
  const receipt = receipts[0];
  if (receipt !== undefined) {
    if (!isRecord(receipt) || receipt["ok"] !== true || receipt["saved"] !== true || receipt["closed"] !== true || receipt["reopened"] !== true ||
        !isRecord(receipt["document"]) || receipt["document"]["uuid"] !== input.documentUuid ||
        receipt["document"]["documentType"] !== input.documentType || receipt["document"]["tabId"] !== input.tabId) {
      throw new Error("Retained library reopen receipt does not match the exact current target.");
    }
    return { action: "reuse-reopen", receipt };
  }
  if (input.outstandingDispatch) { throw new Error("The recovery reopen was dispatched without a verified success receipt; do not repeat navigation."); }
  return { action: "reopen-once" };
}
