/** Pure closed-symbol copy relation. No native program, owner or write token. */
import { z } from "zod";
import { isRecord, sha256Json, sha256Text } from "./core.ts";
import { deriveCurrentSymbolCopyName } from "./current-symbol-copy-name.ts";
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import type { NativeDocumentSnapshot } from "./native-history.ts";
import { CURRENT_SYMBOL_COPY_CANVAS_TYPES, currentCanvasSegmentsCopySource, currentSymbolCopyPlaceholderStep, prepareCurrentCanvasSegmentsSavedSymbolProjection,
  prepareCurrentCreatedCopySavedSymbolProjection, prepareSavedSymbolProjection, verifyCurrentCanvasSegmentsCopySourceOrder,
  verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives } from "./saved-symbol-projection.ts";
import type { CurrentCanvasSegmentsSavedSymbolProjection, CurrentCreatedCopySavedSymbolProjection, SavedSymbolProjection } from "./saved-symbol-projection.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";
import type { DecodedSymbolSqlRawHistory } from "./symbol-sql-comparator.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
const sourceSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),
  branchUuid: z.string().regex(/^[a-f0-9]{32}$/u), symbolUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u) }).strict();
type Source = z.infer<typeof sourceSchema>;
const metadataSchema = z.object({ title: z.string().min(1).max(512), description: z.string().max(65_536),
  tags: z.array(z.string().max(512)).max(256), docType: z.literal(2), source: z.string().max(4096) }).strict();
type Metadata = Readonly<Omit<z.infer<typeof metadataSchema>, "tags"> & { readonly tags: readonly string[] }>;
const PROFILE = "private.current-symbol-copy-plan.v1";
const TYPES: ReadonlySet<string> = new Set(CURRENT_SYMBOL_COPY_CANVAS_TYPES);
const DRAWING: ReadonlySet<string> = new Set(["ELLIPSE", "PIN", "RECT", "ARC", "CIRCLE", "POLY", "TEXT", "BEZIER"]);
export interface CurrentSymbolCopyPlan {
  readonly profile: typeof PROFILE;
  readonly source: Readonly<Source>;
  readonly ownerUuid: string;
  readonly beforeCheckpointSha256: string;
  readonly beforeSqlSha256: string;
  readonly beforeRawLinksSha256: string;
  readonly beforeRecordsSha256: string;
  readonly sourceCanvasSha256: string;
  readonly maximumTicket: number;
  readonly metadataTicket: number;
  readonly canvasHeaderTicket: number;
  readonly exportedHeaderTicket: number;
  readonly sourceMetadata: Metadata;
  readonly destinationMetadata: Metadata;
  readonly partId: string;
  readonly canvasRecords: number;
  readonly nameCollisions: number;
  readonly executionAuthorized: false;
  readonly producerBindingVerified: false;
}
interface Retained {
  readonly before: Inventory;
  readonly decoded: DecodedSymbolSqlRawHistory;
  readonly canvas: CurrentCanvasSegmentsSavedSymbolProjection;
  readonly raw: SavedSymbolProjection;
  readonly rows: readonly string[];
  readonly strings: readonly string[];
  readonly atomTickets: ReadonlyMap<string, number>;
}
const plans = new WeakMap<object, Retained>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current symbol copy: ${message}`); }
}
function exactText(value: string): boolean { return Buffer.from(value).toString("utf8") === value; }
function meta(document: NativeDocumentSnapshot): Readonly<Record<string, unknown>> {
  const values = document.records.filter((entry) => entry.id === "META" || entry.type === "META");
  need(values.length === 1 && values[0]?.id === "META" && values[0].type === "META", "one exact metadata record is required");
  return values[0].body;
}
function frozenMetadata(value: z.infer<typeof metadataSchema>): Metadata {
  Object.freeze(value.tags); return Object.freeze(value);
}
/** Iterative traversal avoids a second unbounded recursion over decoded JSON.
 * Values include deleted and overwritten records, not just visible references.
 */
function stringsIn(value: unknown): string[] {
  const pending: unknown[] = [value], strings: string[] = []; let count = 0;
  while (pending.length > 0) {
    const item = pending.pop(); count += 1;
    need(count <= 1_000_000, "JSON traversal budget exceeded");
    if (typeof item === "string") { need(exactText(item), "lossy Unicode is unsupported"); strings.push(item); }
    else if (item !== null && typeof item === "object") {
      for (const [key, child] of Object.entries(item)) { pending.push(key, child); }
    }
  }
  return strings;
}
function drawingPart(document: NativeDocumentSnapshot, rows: readonly string[]): string {
  const parts = document.records.filter((entry) => entry.type === "PART");
  const part = parts[0];
  need(parts.length === 1 && part !== undefined && part.id.length <= 256, "exactly one live part is required");
  need(document.records.some((entry) => DRAWING.has(entry.type)), "a nonempty supported drawing is required");
  // All rows plus every placeholder step bound each native family counter.
  const live = new Map(document.records.map((entry) => [entry.id, entry])); let numberingBudget = rows.length;
  for (const row of rows) {
    const records = parseNativeRecords(row);
    const record = records[0];
    need(records.length === 1 && record !== undefined && typeof record.header["type"] === "string" && TYPES.has(record.header["type"]),
      "unsupported canvas record or asset dependency");
    if (record.header["type"] === "ELE_PLACEHOLDER") {
      const step = currentSymbolCopyPlaceholderStep(record.body);
      need(step <= Number.MAX_SAFE_INTEGER - numberingBudget, "placeholder numbering exceeds exact integer capacity");
      numberingBudget += step;
    } else if (record.body !== null) {
      const body = record.body, type = record.header["type"];
      need(type === "PART" || type === "CANVAS" || body["partId"] === part.id, "drawing membership differs from the sole part");
      need(body["partId"] === undefined || body["partId"] === "" || body["partId"] === part.id, "foreign part reference");
      if (type === "ATTR" && body["parentId"] !== undefined) {
        const parent = body["parentId"];
        need(typeof parent === "string" && live.has(parent) && (parent === part.id || live.get(parent)?.body["partId"] === part.id),
          "attribute parent is outside the copied part");
      }
      need(stringsIn(body).every((value) => !value.toLowerCase().includes("blob:")), "external blob dependency");
    }
  }
  return part.id;
}
function retained(original: CurrentSymbolCopyPlan): Retained {
  const value = plans.get(original);
  need(value !== undefined && readerCompletion(value.before).exitCode === 0, "original completed copy plan required");
  return value;
}

/** Capture one exact SQL-reader result. No caller source, new name, UUID,
 * normalization mode or configurable verification callback is accepted.
 */
export async function prepareCurrentSymbolCopyPlan(before: Inventory, sourceInput: Source): Promise<CurrentSymbolCopyPlan> {
  const source = Object.freeze(sourceSchema.parse(sourceInput));
  const completion = readerCompletion(before);
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: source.projectUuid, branchUuid: source.branchUuid });
  const { history, maximumTicket } = decoded;
  const ownerUuid = history.projectOwnerUuid;
  need(typeof ownerUuid === "string" && /^[a-f0-9]{32}$/u.test(ownerUuid), "original project owner identity refused");
  need(maximumTicket <= Number.MAX_SAFE_INTEGER - 3, "metadata, canvas and exported tickets need three-slot headroom");
  need(history.documents.length <= 4096 && history.historyRowCount < 64 && decoded.chunks.length < 101,
    "one appended copy must fit the complete-history reader and first loader batch");
  const selected = history.documents.filter((document) => document.uuid === source.symbolUuid);
  const document = selected[0];
  need(selected.length === 1 && document?.docType === "SYMBOL" && !isNativeDocumentDeleted(document), "source is not one active symbol");
  const sourceMetadata = frozenMetadata(metadataSchema.parse(meta(document)));
  const titles = history.documents.filter((item) => item.docType === "SYMBOL" && !isNativeDocumentDeleted(item)).map((item) => {
    const title = meta(item)["title"]; need(typeof title === "string", "symbol title is absent"); return title;
  });
  const named = deriveCurrentSymbolCopyName(sourceMetadata.title, titles);
  const destinationMetadata = frozenMetadata({ title: named.name, description: sourceMetadata.description,
    tags: [...sourceMetadata.tags], docType: 2, source: "" });
  const projectionInput = { chunks: decoded.chunks, targetUuid: source.symbolUuid, maximumTicket, currentEditVersion: "3.2.206" };
  const canvas = await prepareCurrentCanvasSegmentsSavedSymbolProjection(projectionInput);
  const raw = await prepareSavedSymbolProjection(projectionInput);
  const rows = currentCanvasSegmentsCopySource(canvas);
  const partId = drawingPart(document, rows);
  const atomTickets = new Map<string, number>(), strings: string[] = [];
  for (const chunk of decoded.chunks) {
    const records = parseNativeRecords(chunk);
    for (const value of stringsIn(records)) { strings.push(value); }
    let current: string | undefined;
    for (const record of records) {
      if (record.header["type"] === "DOCHEAD") {
        const uuid = record.body?.["uuid"];
        current = record.body?.["docType"] === "SYMBOL" && typeof uuid === "string" ? uuid : undefined;
      } else if (current !== undefined && record.header["type"] !== "EDIT_HEAD") {
        const ticket = record.header["ticket"];
        need(typeof ticket === "number" && Number.isSafeInteger(ticket), "raw symbol atom ticket is absent");
        atomTickets.set(current, Math.max(atomTickets.get(current) ?? 0, ticket));
      }
    }
  }
  need(readerCompletion(before) === completion, "SQL reader provenance changed during preparation");
  const result: CurrentSymbolCopyPlan = Object.freeze({ profile: PROFILE, source, ownerUuid,
    beforeCheckpointSha256: before.checkpointSha256, beforeSqlSha256: before.logicalSha256,
    beforeRawLinksSha256: sha256Json(decoded.links), beforeRecordsSha256: history.semanticSha256,
    sourceCanvasSha256: sha256Json(rows), maximumTicket, metadataTicket: maximumTicket + 1,
    canvasHeaderTicket: maximumTicket + 2, exportedHeaderTicket: maximumTicket + 3, sourceMetadata, destinationMetadata,
    partId, canvasRecords: rows.length, nameCollisions: named.collisions, executionAuthorized: false, producerBindingVerified: false });
  plans.set(result, { before, decoded, canvas, raw, rows, strings: Object.freeze([...new Set(strings)]), atomTickets }); return result;
}

/** Identity check, not same-hash adoption or SQL writer authority. */
export function assertCurrentSymbolCopyPlanInventory(original: CurrentSymbolCopyPlan, before: Inventory): void {
  need(retained(original).before === before, "copy plan requires its exact original SQL inventory");
}

/** Exact source getter projection from complete retained history, including
 * the maximum raw atom ticket. This does not observe a live getter.
 */
export function currentSymbolCopySourceMetadata(original: CurrentSymbolCopyPlan): Readonly<{
  name: string; description: string; tagsJson: string; source: string; version: string; ticket: number;
}> {
  const state = retained(original);
  const document = state.decoded.history.documents.find(item => item.uuid === original.source.symbolUuid);
  const ticket = state.atomTickets.get(original.source.symbolUuid), version = document?.metadata["version"];
  need(typeof version === "string" && ticket !== undefined, "complete source metadata is absent");
  return Object.freeze({ name: original.sourceMetadata.title, description: original.sourceMetadata.description,
    tagsJson: JSON.stringify(original.sourceMetadata.tags), source: original.sourceMetadata.source, version, ticket });
}

/** Absence in every retained raw value and key, including prior tombstones.
 * This relation cannot prove that a supplied ID is a native return.
 */
export function assertCurrentSymbolCopyDestination(original: CurrentSymbolCopyPlan, targetUuid: string): void {
  const state = retained(original);
  need(typeof targetUuid === "string" && /^[a-f0-9]{16}$/u.test(targetUuid), "new destination identity refused");
  need(!state.strings.some((value) => value.includes(targetUuid)), "destination UUID already occurs in retained history");
}

export interface CurrentSymbolCopyProgramSource {
  readonly sourceContent: string;
  readonly sourceContentAfterCopy: string;
  readonly activeSymbols: readonly Readonly<{ uuid: string; maximumAtomTicket: number; header: Readonly<Record<string, unknown>>; metadata: Readonly<Record<string, unknown>> }>[];
  readonly occupiedStrings: readonly string[];
}

/** Validate supplied source-read bytes against the exact original history.
 * This is not a fresh-read witness. The future original-owner coordinator must
 * bind the observation's producer and keep its client/maximum stable.
 */
export function currentSymbolCopyProgramSource(original: CurrentSymbolCopyPlan, observation: unknown): CurrentSymbolCopyProgramSource {
  const state = retained(original);
  verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(state.raw, state.canvas, observation);
  need(isRecord(observation) && typeof observation["content"] === "string", "source observation content missing");
  const sourceContent = observation["content"];
  const lines = sourceContent.split("|\n");
  const first = lines[0];
  need(first !== undefined, "source outer header missing");
  const separator = first.indexOf("||");
  need(separator > 0, "source outer header framing differs");
  // The supplied source already matched the native serializer byte-for-byte.
  // Only its synthetic outer ticket changes when the worker maximum rises two.
  lines[0] = `${JSON.stringify({ type: "DOCHEAD", ticket: original.exportedHeaderTicket })}${first.slice(separator)}`;
  const activeSymbols = state.decoded.history.documents.filter((document) => document.docType === "SYMBOL" && !isNativeDocumentDeleted(document)).map((document) => {
    const maximumAtomTicket = state.atomTickets.get(document.uuid);
    need(maximumAtomTicket !== undefined, "complete symbol atom ticket is absent");
    return { uuid: document.uuid, maximumAtomTicket, header: structuredClone(document.metadata), metadata: structuredClone(meta(document)) };
  });
  return freezeDeep({ sourceContent, sourceContentAfterCopy: lines.join("|\n"), activeSymbols, occupiedStrings: state.strings });
}

/** Exact regenerated representative; legal concurrent first-arrival alternatives
 * are checked separately. Returning these bytes grants no dispatch authority.
 */
export function currentSymbolCopySourceRows(original: CurrentSymbolCopyPlan): readonly string[] { return retained(original).rows; }

export interface CurrentSymbolCopyAppend {
  readonly profile: "private.current-symbol-copy-append.v1";
  readonly plan: CurrentSymbolCopyPlan;
  readonly targetUuid: string;
  readonly appendSha256: string;
  readonly appendBytes: number;
  readonly projection: CurrentCreatedCopySavedSymbolProjection;
  readonly executionAuthorized: false;
  readonly producerBindingVerified: false;
  readonly sqlEffectVerified: false;
  readonly completionProved: false;
}

/** Relate supplied append evidence to an original plan. The destination ID must
 * later come from the original native return; this pure function cannot prove
 * that producer, SQL insertion, queue completion, saved reload or ownership.
 */
export async function verifyCurrentSymbolCopyAppend(original: CurrentSymbolCopyPlan,
  input: Readonly<{ targetUuid: string; chunk: string }>): Promise<CurrentSymbolCopyAppend> {
  const captured = z.object({ targetUuid: z.string().regex(/^[a-f0-9]{16}$/u), chunk: z.string().min(1).max(8_388_608) }).strict().parse(input);
  const state = retained(original), { targetUuid, chunk } = captured;
  need(exactText(chunk) && Buffer.byteLength(chunk) <= 8_388_608, "append byte bound or UTF8 differs");
  assertCurrentSymbolCopyDestination(original, targetUuid);
  const lines = chunk.split("|\n");
  need(lines.length === state.rows.length + 4 && lines[2] === `${JSON.stringify({ type: "META", ticket: original.metadataTicket, id: "META" })}||${JSON.stringify(original.destinationMetadata)}`,
    "append cardinality or exact destination metadata differs");
  verifyCurrentCanvasSegmentsCopySourceOrder(state.canvas, lines.slice(4));
  const projection = await prepareCurrentCreatedCopySavedSymbolProjection({ chunks: [...state.decoded.chunks, chunk], targetUuid,
    beforeMaximumTicket: original.maximumTicket, currentEditVersion: "3.2.206" });
  need(plans.get(original) === state, "original copy plan changed");
  return Object.freeze({ profile: "private.current-symbol-copy-append.v1", plan: original, targetUuid,
    appendSha256: sha256Text(chunk), appendBytes: Buffer.byteLength(chunk), projection,
    executionAuthorized: false, producerBindingVerified: false, sqlEffectVerified: false, completionProved: false });
}
