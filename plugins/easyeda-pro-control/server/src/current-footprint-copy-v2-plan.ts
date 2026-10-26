/** Pure copy preparation from a complete checkpoint and supplied source order.
 * The current209 Ni/oO projection is modeled separately from the source reader.
 * This does not bind a native observation, dispatch, dependencies or clocks. */
import { types } from "node:util";
import { z } from "zod";
import { isRecord, sha256Json, sha256Text } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { deriveCurrentSymbolCopyName } from "./current-symbol-copy-name.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { assertCurrentFootprintSourcePlanInventory, verifyCurrentFootprintSource } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
const metadataSchema = z.object({ title: z.string().min(1).max(512), description: z.string().max(65_536),
  tags: z.array(z.string().max(512)).max(256), source: z.string().max(4096) }).strict();
type Metadata = Readonly<Omit<z.infer<typeof metadataSchema>, "tags"> & { readonly tags: readonly string[] }>;
const inputSchema = z.object({ client: z.string().length(16).regex(/^[a-f0-9]{16}$/u),
  content: z.string().max(2_097_152).refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 2_097_152) }).strict();
const omitted = Object.freeze({ executionAuthorized: false, producerBindingVerified: false,
  nativeObservationBound: false, dependencyClosureVerified: false, sourceGetterEquivalent: false,
  actorAndClocksVerified: false, persistenceVerified: false } as const);
export interface CurrentFootprintCopyV2Plan extends Readonly<typeof omitted> {
  readonly profile: "private.current-footprint-copy-plan.v2";
  readonly source: CurrentFootprintSourcePlan["source"];
  readonly ownerUuid: string;
  readonly client: string;
  readonly beforeCheckpointSha256: string;
  readonly beforeSqlSha256: string;
  readonly beforeRawLinksSha256: string;
  readonly sourceMetadata: Metadata;
  readonly destinationMetadata: Metadata;
  readonly maximumTicket: number;
  readonly metadataTicket: number;
  readonly canvasHeaderTicket: number;
  readonly canvasRecords: number;
  readonly tombstones: number;
  readonly droppedFirstTicketFields: number;
  readonly indexIdsReordered: boolean;
  readonly nameCollisions: number;
  readonly suppliedSourceSha256: string;
  readonly suppliedOrderSha256: string;
  readonly copiedRowsSha256: string;
  readonly recordTypes: readonly string[];
  readonly workerSourceSha256: CurrentFootprintSourcePlan["workerSourceSha256"];
}
interface Atom { readonly id: string; readonly type: string; readonly raw: string }
interface Retained { readonly before: Inventory; readonly sourcePlan: CurrentFootprintSourcePlan;
  readonly rows: readonly string[]; readonly rawIdentityText: string }
const originals = new WeakMap<object, Retained>();
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`Current footprint copy v2: ${detail}`); }
}
function captureInput(input: unknown): z.infer<typeof inputSchema> {
  need(!types.isProxy(input) && isRecord(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "plain source input required");
  const names = ["client", "content"]; const keys = Reflect.ownKeys(input);
  need(keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)), "exact source input fields required");
  const value: Record<string, unknown> = {};
  for (const name of names) {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "source input accessors refused");
    Object.defineProperty(value, name, { value: descriptor.value as unknown, enumerable: true });
  }
  // Zod's invalid-type formatter inspects object prototypes. Reject object
  // Scalars here so even a nested Proxy cannot execute a formatting trap.
  need(typeof value["client"] === "string" && typeof value["content"] === "string", "primitive source strings required");
  // Source transport supports two MiB. The shared clock-reply capture has a
  // Smaller scalar limit and must not silently narrow this content contract.
  return inputSchema.parse(value);
}
function original(plan: CurrentFootprintCopyV2Plan): Retained {
  const value = originals.get(plan); need(value !== undefined, "original plan required");
  assertCurrentFootprintSourcePlanInventory(value.sourcePlan, value.before);
  need(readerCompletion(value.before).exitCode === 0, "completed original reader required"); return value;
}
function arrayIndex(id: string): number | null {
  const value = Number(id);
  return Number.isInteger(value) && value >= 0 && value < 4_294_967_295 && String(value) === id ? value : null;
}
function projection(content: string): Readonly<{ rows: readonly string[]; metadata: Metadata;
  tombstones: number; droppedFirstTicketFields: number; indexIdsReordered: boolean; recordTypes: readonly string[] }> {
  const lines = content.split("|\n"), supplied = [lines[1], ...lines.slice(3)];
  const atoms: Atom[] = [], ids = new Set<string>(); let metadata: Metadata | undefined;
  let droppedFirstTicketFields = 0, tombstones = 0;
  for (const raw of supplied) {
    need(raw !== undefined, "complete source required"); const split = raw.indexOf("||");
    need(split > 0, "native source framing differs");
    const parsed: unknown = JSON.parse(raw.slice(0, split)); need(isRecord(parsed), "source atom header differs");
    const { type, ticket, id } = parsed, body = raw.slice(split + 2);
    need(typeof type === "string" && /^[A-Z][A-Z0-9_]{0,63}$/u.test(type) &&
      !["BLOB", "FONT", "DOCHEAD", "EDIT_HEAD", "META_CREATE", "META_MODIFY", "DELETE_DOC"].includes(type),
    "separate asset or metadata-effect projection required");
    // Native oO and Ni use ordinary objects. Prototype-sensitive spellings
    // Stay outside this pure model even when an empty-input path would appear
    // Harmless. Arbitrary non-index IDs such as LAYER tuples stay supported.
    need(typeof id === "string" && id.length > 0 && id.length <= 256 && id.isWellFormed() && !id.includes("\0") &&
      !["__proto__", "prototype", "constructor", "hasOwnProperty"].includes(id) && !ids.has(id), "unsafe or duplicate object key");
    need(typeof ticket === "number" && Number.isSafeInteger(ticket) && ticket >= 0 && !Object.is(ticket, -0), "source ticket differs");
    need(Object.keys(parsed).every(key => ["type", "ticket", "id", "firstTicket"].includes(key)), "source atom fields differ");
    if (Object.hasOwn(parsed, "firstTicket")) { droppedFirstTicketFields += 1; }
    if (type === "META") {
      need(id === "META" && metadata === undefined && body !== "", "canonical source META required");
      metadata = freezeDeep(metadataSchema.parse(JSON.parse(body) as unknown));
    } else if (body === "") { tombstones += 1; }
    ids.add(id);
    // Pinned Ni passes only type/ticket/id/data/client to $e. The admitted
    // Source serializer omits client, and Ni deliberately drops firstTicket.
    atoms.push({ id, type, raw: `${JSON.stringify({ type, ticket, id })}||${body}` });
  }
  need(metadata !== undefined && atoms[0]?.id === "META", "source metadata missing");
  const indexed = atoms.filter(atom => arrayIndex(atom.id) !== null).toSorted((left, right) =>
    (arrayIndex(left.id) ?? 0) - (arrayIndex(right.id) ?? 0));
  const ordinary = atoms.filter(atom => arrayIndex(atom.id) === null);
  const ordered = [...indexed, ...ordinary];
  return freezeDeep({ rows: ordered.map(atom => atom.raw), metadata, tombstones, droppedFirstTicketFields,
    indexIdsReordered: ordered.some((atom, index) => atom !== atoms[index]),
    recordTypes: [...new Set(atoms.map(atom => atom.type))].toSorted() });
}

/** Source bytes are caller-supplied evidence, independently checked against
 * the original complete checkpoint. A future owner must separately bind its
 * own actual paired sample and continuously reprove it before dispatch. */
export async function prepareCurrentFootprintCopyV2Plan(before: Inventory, sourcePlan: CurrentFootprintSourcePlan,
  input: Readonly<{ client: string; content: string }>): Promise<CurrentFootprintCopyV2Plan> {
  assertCurrentFootprintSourcePlanInventory(sourcePlan, before); const completion = readerCompletion(before);
  const supplied = captureInput(input);
  const source = verifyCurrentFootprintSource(sourcePlan, supplied.client, supplied.content);
  const projected = projection(supplied.content);
  need(projected.rows.length === sourcePlan.canvasRecords + 1 && projected.tombstones === sourcePlan.tombstones,
    "complete projected source differs");
  const decoded = await decodeCurrentFootprintSourceHistory(before, {
    projectUuid: sourcePlan.source.projectUuid, branchUuid: sourcePlan.source.branchUuid });
  const ownerUuid = decoded.history.projectOwnerUuid;
  need(typeof ownerUuid === "string" && /^[a-f0-9]{32}$/u.test(ownerUuid), "project owner identity differs");
  need(decoded.history.documents.length <= 4096 && decoded.history.historyRowCount < 64 && decoded.chunks.length < 100 &&
    decoded.maximumTicket === sourcePlan.maximumTicket, "complete history capacity or maximum ticket differs");
  const titles = decoded.history.documents.filter(document => document.docType === "FOOTPRINT" && !isNativeDocumentDeleted(document)).map(document => {
    const rows = document.records.filter(row => row.type === "META" || row.id === "META");
    need(rows.length === 1 && rows[0]?.type === "META" && rows[0].id === "META", "complete peer metadata required");
    const title = rows[0].body["title"]; need(typeof title === "string", "peer title missing"); return title;
  });
  const name = deriveCurrentSymbolCopyName(projected.metadata.title, titles);
  const rawIdentity: string[] = []; let steps = 0;
  for (const chunk of decoded.chunks) {
    // Parsing unfolds JSON escapes before checking a future generated UUID.
    // The bounded read-only decoder has already checked every complete chunk.
    for (const raw of chunk.split("|\n").filter(Boolean)) {
      const split = raw.indexOf("||"); need(split > 0, "complete history framing differs");
      const header: unknown = JSON.parse(raw.slice(0, split));
      const body: unknown = raw.slice(split + 2) === "" ? null : JSON.parse(raw.slice(split + 2));
      rawIdentity.push(JSON.stringify({ header, body }));
      steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
    }
    await yieldProofEventLoop();
  }
  const result: CurrentFootprintCopyV2Plan = freezeDeep({ profile: "private.current-footprint-copy-plan.v2",
    source: sourcePlan.source, ownerUuid, client: supplied.client,
    beforeCheckpointSha256: before.checkpointSha256, beforeSqlSha256: before.logicalSha256,
    beforeRawLinksSha256: sha256Json(decoded.links), sourceMetadata: projected.metadata,
    destinationMetadata: { ...projected.metadata, title: name.name, tags: [...projected.metadata.tags], source: "" },
    maximumTicket: sourcePlan.maximumTicket, metadataTicket: sourcePlan.maximumTicket + 1,
    canvasHeaderTicket: sourcePlan.maximumTicket + 2, canvasRecords: sourcePlan.canvasRecords,
    tombstones: projected.tombstones, droppedFirstTicketFields: projected.droppedFirstTicketFields,
    indexIdsReordered: projected.indexIdsReordered, nameCollisions: name.collisions,
    suppliedSourceSha256: sha256Text(supplied.content), suppliedOrderSha256: source.observedOrderSha256,
    copiedRowsSha256: sha256Json(projected.rows), recordTypes: projected.recordTypes,
    workerSourceSha256: sourcePlan.workerSourceSha256, ...omitted });
  need(readerCompletion(before) === completion, "original reader changed");
  originals.set(result, { before, sourcePlan, rows: projected.rows, rawIdentityText: rawIdentity.join("\n") }); return result;
}

export function assertCurrentFootprintCopyV2Inventory(plan: CurrentFootprintCopyV2Plan, before: Inventory): void {
  need(original(plan).before === before, "exact original inventory required");
}
export function currentFootprintCopyV2Before(plan: CurrentFootprintCopyV2Plan): Inventory { return original(plan).before; }
export function currentFootprintCopyV2Rows(plan: CurrentFootprintCopyV2Plan): readonly string[] { return original(plan).rows; }
export function assertCurrentFootprintCopyV2FreshUuid(plan: CurrentFootprintCopyV2Plan, targetUuid: string): void {
  need(typeof targetUuid === "string" && /^[a-f0-9]{16}$/u.exec(targetUuid)?.[0] === targetUuid &&
    !original(plan).rawIdentityText.includes(targetUuid), "fresh ordinary destination UUID required");
}
