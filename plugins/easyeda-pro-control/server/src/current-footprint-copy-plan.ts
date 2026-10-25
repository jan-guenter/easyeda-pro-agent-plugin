/** Closed-history preparation and record relation only. No native dispatch,
 * complete SQL effect, source-getter equivalence or lifecycle authority.
 * Current 3.2.209 worker 0e7a4743: Tg.create allocates a new identity, while
 * UI Eln/h2t and its worker W7/fb counterpart can match the existing footprint.
 */
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { deriveCurrentSymbolCopyName } from "./current-symbol-copy-name.ts";
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import type { NativeDocumentSnapshot } from "./native-history.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";
import type { DecodedSymbolSqlRawHistory } from "./symbol-sql-comparator.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
const sourceSchema = z.object({ projectUuid: z.string().regex(/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u),
  branchUuid: z.string().regex(/^[a-f0-9]{32}$/u), footprintUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u) }).strict();
type Source = z.infer<typeof sourceSchema>;
const metadataSchema = z.object({ title: z.string().min(1).max(512), description: z.string().max(65_536),
  tags: z.array(z.string().max(512)).max(256), source: z.string().max(4096) }).strict();
type Metadata = Readonly<Omit<z.infer<typeof metadataSchema>, "tags"> & { readonly tags: readonly string[] }>;
const PROFILE = "private.current-footprint-copy-plan.v1";
// No text, embedded image, 3D, group, font or external-library relation yet.
const CANVAS_TYPES: ReadonlySet<string> = new Set(["CANVAS", "PAD", "LINE", "NET"]);
export interface CurrentFootprintCopyPlan {
  readonly profile: typeof PROFILE;
  readonly source: Readonly<Source>;
  readonly ownerUuid: string;
  readonly beforeCheckpointSha256: string;
  readonly beforeSqlSha256: string;
  readonly beforeRawLinksSha256: string;
  readonly sourceRecordsSha256: string;
  readonly sourceMetadata: Metadata;
  readonly destinationMetadata: Metadata;
  readonly canvasRecords: number;
  readonly nameCollisions: number;
  readonly executionAuthorized: false;
  readonly producerBindingVerified: false;
}
interface Retained {
  readonly before: Inventory;
  readonly decoded: DecodedSymbolSqlRawHistory;
  readonly source: NativeDocumentSnapshot;
  readonly strings: readonly string[];
}
const plans = new WeakMap<object, Retained>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current footprint copy: ${message}`); }
}
function metadata(document: NativeDocumentSnapshot): Readonly<Record<string, unknown>> {
  const rows = document.records.filter(entry => entry.type === "META" || entry.id === "META");
  need(rows.length === 1 && rows[0]?.type === "META" && rows[0].id === "META", "one exact metadata record required");
  return rows[0].body;
}
function stringsIn(value: unknown): string[] {
  const pending: unknown[] = [value], result: string[] = []; let count = 0;
  while (pending.length > 0) {
    const item = pending.pop(); count += 1;
    need(count <= 1_000_000, "JSON traversal budget exceeded");
    if (typeof item === "string") {
      need(Buffer.from(item).toString("utf8") === item, "lossy Unicode refused"); result.push(item);
    } else if (item !== null && typeof item === "object") {
      for (const [key, child] of Object.entries(item)) { pending.push(key, child); }
    }
  }
  return result;
}
function retained(original: CurrentFootprintCopyPlan): Retained {
  const result = plans.get(original);
  need(result !== undefined && readerCompletion(result.before).exitCode === 0, "original completed plan required");
  return result;
}
function canvas(document: NativeDocumentSnapshot): NativeDocumentSnapshot["records"] {
  return document.records.filter(entry => entry.type !== "META");
}
function inspectSourceRows(decoded: DecodedSymbolSqlRawHistory, uuid: string): readonly string[] {
  const strings: string[] = []; let selected = false;
  for (const chunk of decoded.chunks) {
    const rows = parseNativeRecords(chunk); strings.push(...stringsIn(rows));
    for (const row of rows) {
      const type = row.header["type"];
      if (type === "DOCHEAD") { selected = row.body?.["uuid"] === uuid; }
      else if (selected && type !== "EDIT_HEAD" && type !== "META") {
        need(typeof type === "string" && CANVAS_TYPES.has(type), "unsupported raw canvas family or asset dependency");
        need(row.body !== null, "raw canvas tombstones need a separate source-getter projection");
        need(stringsIn(row.body).every(value => !value.toLowerCase().includes("blob:")), "blob dependency refused");
      }
    }
  }
  return Object.freeze([...new Set(strings)]);
}

/** Pure preparation from its original completed whole-project SQL reader.
 * The existing ASCII renamer is reused because current worker l6/ir/Ne and
 * footprint getDataByTitle use the same collision path. This is not a getter
 * observation, and does not admit the generic SDK copy or native clone.
 */
export async function prepareCurrentFootprintCopyPlan(before: Inventory, input: Source): Promise<CurrentFootprintCopyPlan> {
  const completion = readerCompletion(before), source = Object.freeze(sourceSchema.parse(input));
  const decoded = await decodeCurrentSymbolPreEditHistory(before, { projectUuid: source.projectUuid, branchUuid: source.branchUuid });
  const { history } = decoded, ownerUuid = history.projectOwnerUuid;
  need(typeof ownerUuid === "string" && /^[a-f0-9]{32}$/u.test(ownerUuid), "project owner identity refused");
  need(history.documents.length <= 4096 && history.historyRowCount < 64 && decoded.chunks.length < 100,
    "complete-history capacity for the new copy is required");
  need(decoded.maximumTicket <= Number.MAX_SAFE_INTEGER - 3, "copy ticket headroom exhausted");
  const sources = history.documents.filter(document => document.uuid === source.footprintUuid);
  const document = sources[0];
  need(sources.length === 1 && document?.docType === "FOOTPRINT" && !isNativeDocumentDeleted(document), "one active source footprint required");
  const sourceMetadata: Metadata = freezeDeep(metadataSchema.parse(metadata(document)));
  const titles = history.documents.filter(item => item.docType === "FOOTPRINT" && !isNativeDocumentDeleted(item)).map(item => {
    const title = metadata(item)["title"]; need(typeof title === "string", "footprint title absent"); return title;
  });
  const named = deriveCurrentSymbolCopyName(sourceMetadata.title, titles), rows = canvas(document);
  need(rows.length > 0 && rows.length <= 4096 && rows.every(row => CANVAS_TYPES.has(row.type)) && rows.some(row => row.type === "PAD" || row.type === "LINE"),
    "nonempty bounded supported canvas required");
  const strings = inspectSourceRows(decoded, source.footprintUuid);
  const destinationMetadata: Metadata = freezeDeep({ ...sourceMetadata, title: named.name, tags: [...sourceMetadata.tags], source: "" });
  const result: CurrentFootprintCopyPlan = freezeDeep({ profile: PROFILE, source, ownerUuid,
    beforeCheckpointSha256: before.checkpointSha256, beforeSqlSha256: before.logicalSha256,
    beforeRawLinksSha256: sha256Json(decoded.links), sourceRecordsSha256: sha256Json(rows), sourceMetadata, destinationMetadata,
    canvasRecords: rows.length, nameCollisions: named.collisions, executionAuthorized: false, producerBindingVerified: false });
  need(readerCompletion(before) === completion, "SQL reader provenance changed");
  plans.set(result, { before, decoded, source: document, strings }); return result;
}

export function assertCurrentFootprintCopyPlanInventory(original: CurrentFootprintCopyPlan, before: Inventory): void {
  need(retained(original).before === before, "exact original SQL inventory required");
}

/** Data for a future purpose-specific original-owner create coordinator.
 * Tg.create uses uuid/path to read the source and independently allocates its
 * new UUID. Empty lineage/version is intentional; native headers stamp time.
 * This pair must NEVER be passed to the default W7 import matcher or clone.
 * The source GET_STR includes META; its lower ticket must remain losing.
 */
export function currentFootprintCopyNativeCreateArguments(original: CurrentFootprintCopyPlan): readonly [Readonly<{
  uuid: string; path: string; isProject: true; docType: 4; title: string; display_title: string;
  description: string; custom_tags: string; source: ""; version: "";
}>, string] {
  retained(original);
  const meta = original.destinationMetadata;
  return freezeDeep([{ uuid: original.source.footprintUuid, path: original.source.projectUuid, isProject: true, docType: 4,
    title: meta.title, display_title: meta.title, description: meta.description, custom_tags: JSON.stringify(meta.tags), source: "", version: "" },
  original.source.projectUuid]);
}

/** Record-level necessary condition, never sufficient SQL or lifecycle proof.
 * Original ciphertext/history links and every old document must be unchanged.
 * The sole appended chunk may address only the fresh destination. Full atom
 * encoding/order, SQL bookkeeping, clocks, preview/structure completion and
 * independently saved/reopened source observations still need their adapters.
 */
export async function verifyCurrentFootprintCopyRecords(original: CurrentFootprintCopyPlan, after: Inventory, targetUuid: string): Promise<Readonly<{
  plan: CurrentFootprintCopyPlan; targetUuid: string; afterCheckpointSha256: string; recordsEffectVerified: true;
  executionAuthorized: false; producerBindingVerified: false; rawAppendVerified: false; sqlEffectVerified: false; completionProved: false;
}>> {
  const state = retained(original);
  need(/^[a-f0-9]{16}$/u.test(targetUuid) && !state.strings.some(value => value.includes(targetUuid)), "fresh ordinary destination UUID required");
  const completion = readerCompletion(after), decoded = await decodeCurrentSymbolPreEditHistory(after,
    { projectUuid: original.source.projectUuid, branchUuid: original.source.branchUuid });
  need(decoded.history.projectOwnerUuid === original.ownerUuid && decoded.history.historyRowCount === state.decoded.history.historyRowCount + 1 &&
    decoded.chunks.length === state.decoded.chunks.length + 1 && sha256Json(decoded.links.slice(0, -1)) === original.beforeRawLinksSha256,
  "original complete history changed or append count differs");
  const appended = decoded.chunks.at(-1); need(appended !== undefined, "copy append absent");
  let headers = 0, selected = false;
  for (const row of parseNativeRecords(appended)) {
    const type = row.header["type"];
    if (type === "EDIT_HEAD") { need(headers === 0, "edit header occurs inside destination records"); }
    else if (type === "DOCHEAD") {
      need(row.body?.["uuid"] === targetUuid && row.body["docType"] === "FOOTPRINT", "append addresses a foreign document");
      selected = true; headers += 1;
    } else {
      need(selected && typeof type === "string" && (type === "META" || CANVAS_TYPES.has(type)) && row.body !== null,
        "append contains unsupported or deleted records");
    }
  }
  need(headers === 2, "native create requires metadata and canvas document headers");
  const documents = decoded.history.documents;
  need(documents.length === state.decoded.history.documents.length + 1, "exactly one document addition required");
  for (const peer of state.decoded.history.documents) {
    need(documents.find(document => document.uuid === peer.uuid)?.semanticSha256 === peer.semanticSha256, "existing project document changed");
  }
  const target = documents.find(document => document.uuid === targetUuid);
  need(target?.docType === "FOOTPRINT" && !isNativeDocumentDeleted(target), "new active footprint absent");
  need(sha256Json(metadata(target)) === sha256Json(original.destinationMetadata), "destination metadata differs");
  need(sha256Json(canvas(target)) === original.sourceRecordsSha256, "destination canvas differs from exact source records");
  need(readerCompletion(after) === completion, "after reader provenance changed");
  return Object.freeze({ plan: original, targetUuid, afterCheckpointSha256: after.checkpointSha256, recordsEffectVerified: true,
    executionAuthorized: false, producerBindingVerified: false, rawAppendVerified: false, sqlEffectVerified: false, completionProved: false });
}
