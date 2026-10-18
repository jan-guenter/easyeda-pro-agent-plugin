/** Pure original-SQL/native-observation comparison. No process, producer,
 * backend actor, clock or mutation authority is issued by this module.
 */
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { prepareCurrentPcbNativeMetadata } from "./current-pcb-native-metadata.ts";
import { CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES,
  validateCurrentPcbRenamePreflightResult } from "./current-pcb-rename-preflight.ts";
import type { CurrentPcbRenamePreflightRequest, CurrentPcbRenamePreflightResult } from "./current-pcb-rename-preflight.ts";
import { inventoryForOriginalCurrentPcbRenamePreparation } from "./current-pcb-rename-preparation.ts";
import type { CurrentPcbRenamePreparation } from "./current-pcb-rename-preparation.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Peer = CurrentPcbRenamePreflightResult["peers"][number];
const LIMITATIONS = Object.freeze({ executionAuthorized: false, originalOwnerVerified: false, producerBindingVerified: false,
  actorProvenanceVerified: false, clockProvenanceVerified: false, nativeNamePolicyVerified: false,
  queueCompletionVerified: false, generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false } as const);
export interface CurrentPcbRenameBinding extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-pcb-rename-binding.v1";
  readonly preparationSha256: string;
  readonly sqlSha256: string;
  readonly checkpointSha256: string;
  readonly rawHistorySha256: string;
  readonly request: Readonly<CurrentPcbRenamePreflightRequest>;
  readonly peers: readonly Readonly<Peer>[];
  readonly maximumTicket: number;
  readonly client: string;
  readonly nativeTitleSubset: "locale-invariant-printable-ascii-without-capital-i";
  readonly bindingSha256: string;
}
interface Original {
  readonly before: Inventory;
  readonly preparation: CurrentPcbRenamePreparation;
  readonly completion: ReturnType<typeof readerCompletion>;
}
const originals = new WeakMap<CurrentPcbRenameBinding, Original>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current PCB rename binding: ${message}`); }
}
/** Internal original-data identity check, never a native authority issuer. */
export function assertOriginalCurrentPcbRenameBinding(binding: CurrentPcbRenameBinding, preparation: CurrentPcbRenamePreparation): void {
  const original = originals.get(binding); need(original !== undefined, "original PCB binding required");
  need(original.preparation === preparation && inventoryForOriginalCurrentPcbRenamePreparation(preparation) === original.before &&
    readerCompletion(original.before) === original.completion, "original preparation/reader differs");
}
function ownFields(value: unknown, names: readonly string[]): Record<string, unknown> {
  need(isRecord(value) && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null) &&
    Reflect.ownKeys(value).length === names.length, "exact own-data input required");
  const result: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "input accessors or fields refused");
    Object.defineProperty(result, name, { value: descriptor.value as unknown, enumerable: true });
  }
  return result;
}
/** Build the request from the exact immutable SQL reader retained by preparation.
 * Input equality is object identity, not merely matching digests or JSON.
 */
export async function prepareCurrentPcbRenameBinding(input: Readonly<{ before: Inventory; preparation: CurrentPcbRenamePreparation }>): Promise<CurrentPcbRenameBinding> {
  const captured = ownFields(input, ["before", "preparation"]), preparation = input.preparation;
  need(captured["preparation"] === preparation, "original preparation changed");
  const before = inventoryForOriginalCurrentPcbRenamePreparation(preparation);
  need(captured["before"] === before, "original prepared SQL inventory required"); const completion = readerCompletion(before);
  const projection = await prepareCurrentPcbNativeMetadata({ before, target: preparation.target, desiredTitle: preparation.desiredTitle });
  need(canonicalJson(projection.baseline) === canonicalJson(preparation.baseline) && canonicalJson(projection.sourcePeers) === canonicalJson(preparation.peers),
    "original prepared baseline/peer projection differs");
  const { peers, request } = projection;
  const body = freezeDeep({ profile: "private.current-pcb-rename-binding.v1" as const, preparationSha256: preparation.preparationSha256,
    sqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256, rawHistorySha256: preparation.baseline.rawHistorySha256,
    request, peers, maximumTicket: projection.maximumTicket, client: preparation.witness.client,
    nativeTitleSubset: "locale-invariant-printable-ascii-without-capital-i" as const, ...LIMITATIONS });
  need(Buffer.byteLength(JSON.stringify(body)) <= CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, "binding exceeds preflight bound");
  need(readerCompletion(before) === completion && inventoryForOriginalCurrentPcbRenamePreparation(preparation) === before, "original inputs changed");
  const result = Object.freeze({ ...body, bindingSha256: sha256Json(body) }); originals.set(result, { before, preparation, completion }); return result;
}
function copyData(value: unknown, budget: { nodes: number; bytes: number }, depth = 0): unknown {
  budget.nodes += 1; need(depth <= 8 && budget.nodes <= 65_536, "preflight data bound exceeded");
  if (value === null || typeof value === "boolean" || typeof value === "number") { return value; }
  if (typeof value === "string") { budget.bytes += Buffer.byteLength(value); need(budget.bytes <= CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, "preflight data bound exceeded"); return value; }
  need(value !== null && typeof value === "object", "preflight data shape differs");
  const array = Array.isArray(value), prototype: unknown = Object.getPrototypeOf(value);
  need(array ? prototype === Array.prototype : prototype === Object.prototype || prototype === null, "preflight data prototype differs");
  const keys = Reflect.ownKeys(value); need(keys.length <= 4097, "preflight data bound exceeded");
  if (array) {
    const length = Object.getOwnPropertyDescriptor(value, "length");
    need(length !== undefined && Object.hasOwn(length, "value") && typeof length.value === "number" && keys.length === length.value + 1, "preflight array shape differs");
    return Array.from({ length: length.value }, (_, index) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "preflight accessors refused");
      return copyData(descriptor.value as unknown, budget, depth + 1);
    });
  }
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(typeof key === "string" && descriptor !== undefined && Object.hasOwn(descriptor, "value"), "preflight accessors refused");
    budget.bytes += Buffer.byteLength(key); need(budget.bytes <= CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, "preflight data bound exceeded");
    Object.defineProperty(result, key, { value: copyData(descriptor.value as unknown, budget, depth + 1), enumerable: true });
  }
  return result;
}

/** Data comparison only. Even a matching caller-created observation cannot
 * acquire native ownership, source admission, actor or timestamp provenance.
 */
export function verifyCurrentPcbRenamePreflightBinding(binding: CurrentPcbRenameBinding, raw: unknown): Readonly<Record<string, unknown>> {
  const original = originals.get(binding); need(original !== undefined, "original PCB binding required");
  assertOriginalCurrentPcbRenameBinding(binding, original.preparation);
  const observed = validateCurrentPcbRenamePreflightResult(binding.request, copyData(raw, { nodes: 0, bytes: 0 }));
  need(canonicalJson(observed.peers) === canonicalJson(binding.peers), "complete observed PCB map differs from original SQL");
  need(observed.clientTicketObservation.maxTicket === binding.maximumTicket && observed.clientTicketObservation.client === binding.client,
    "observed client/global ticket differs from preparation");
  return Object.freeze({ profile: "private.current-pcb-rename-preflight-binding-match.v1", originalSqlComparisonMatched: true,
    bindingSha256: binding.bindingSha256, preparationSha256: binding.preparationSha256, sqlSha256: binding.sqlSha256,
    observationSha256: sha256Json(observed), peerCount: binding.peers.length, ...LIMITATIONS });
}
