/** Pure exact native Ni/oO append and whole-history record relation. Actor,
 * clock, SQL and original dispatch provenance are deliberately separate. */
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { assertCurrentFootprintCopyV2FreshUuid, assertCurrentFootprintCopyV2Inventory,
  currentFootprintCopyV2Before, currentFootprintCopyV2Rows } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import { isNativeDocumentDeleted, parseNativeRecords } from "./native-history.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`Current footprint copy v2 append: ${detail}`); }
}

/** Body and order are checked as exact bytes. Header identities and tickets
 * are necessary structure only; their actors/times need the separate SQL
 * witness, and supplied witness values still are not live clock provenance. */
export function verifyCurrentFootprintCopyV2Append(plan: CurrentFootprintCopyV2Plan,
  targetUuid: string, chunk: string): Readonly<{ targetUuid: string; plaintextSha256: string;
    rawAppendRecordsVerified: true; actorAndClocksVerified: false; executionAuthorized: false; producerBindingVerified: false }> {
  assertCurrentFootprintCopyV2FreshUuid(plan, targetUuid);
  need(typeof chunk === "string" && chunk.isWellFormed() && Buffer.byteLength(chunk) <= 2_097_152, "append byte bound exceeded");
  const copied = currentFootprintCopyV2Rows(plan), lines = chunk.split("|\n");
  need(lines.length === copied.length + 4, "exact append count required");
  const metadata = `${JSON.stringify({ type: "META", ticket: plan.metadataTicket, id: "META" })}||${JSON.stringify(plan.destinationMetadata)}`;
  need(lines[2] === metadata && canonicalJson(lines.slice(4)) === canonicalJson(copied), "exact metadata/canvas bytes or order differ");
  for (const [index, ticket] of [[1, plan.metadataTicket], [3, plan.canvasHeaderTicket]] as const) {
    const row = parseNativeRecords(lines[index] ?? "")[0];
    need(row !== undefined && sha256Json(row.header) === sha256Json({ type: "DOCHEAD", ticket }) &&
      row.body?.["uuid"] === targetUuid && row.body["docType"] === "FOOTPRINT" && row.body["client"] === plan.client,
    "destination header identity/client/ticket differs");
  }
  const edit = parseNativeRecords(lines[0] ?? "")[0];
  need(edit !== undefined && canonicalJson(edit.header) === canonicalJson({ type: "EDIT_HEAD" }) && edit.body !== null,
    "backend edit header missing");
  return Object.freeze({ targetUuid, plaintextSha256: sha256Text(chunk), rawAppendRecordsVerified: true,
    actorAndClocksVerified: false, executionAuthorized: false, producerBindingVerified: false });
}

/** The before decoder remains read-only library-header preservation. Exact
 * original links and one fresh destination append keep all old document
 * records unchanged, including historical tombstones and unknown body data. */
export async function verifyCurrentFootprintCopyV2Records(plan: CurrentFootprintCopyV2Plan,
  after: Inventory, targetUuid: string): Promise<Readonly<{ recordsEffectVerified: true;
    executionAuthorized: false; producerBindingVerified: false; sqlEffectVerified: false }>> {
  const before = currentFootprintCopyV2Before(plan);
  const afterCompletion = readerCompletion(after), beforeCompletion = readerCompletion(before);
  assertCurrentFootprintCopyV2FreshUuid(plan, targetUuid);
  const identity = { projectUuid: plan.source.projectUuid, branchUuid: plan.source.branchUuid };
  const prior = await decodeCurrentFootprintSourceHistory(before, identity);
  const next = await decodeCurrentFootprintSourceHistory(after, identity);
  need(prior.history.projectOwnerUuid === plan.ownerUuid && next.history.projectOwnerUuid === plan.ownerUuid &&
    next.history.historyRowCount === prior.history.historyRowCount + 1 && next.chunks.length === prior.chunks.length + 1 &&
    sha256Json(next.links.slice(0, -1)) === plan.beforeRawLinksSha256 &&
    canonicalJson(next.chunks.slice(0, -1)) === canonicalJson(prior.chunks), "original complete history or append count changed");
  const appended = next.chunks.at(-1); need(appended !== undefined, "append missing");
  verifyCurrentFootprintCopyV2Append(plan, targetUuid, appended);
  need(next.history.documents.length === prior.history.documents.length + 1, "exactly one document addition required");
  const nextDocuments = new Map(next.history.documents.map(document => [document.uuid, document]));
  for (const document of prior.history.documents) {
    need(nextDocuments.get(document.uuid)?.semanticSha256 === document.semanticSha256, "existing project document changed");
  }
  const target = nextDocuments.get(targetUuid);
  need(target !== undefined && target.docType === "FOOTPRINT" && !isNativeDocumentDeleted(target), "fresh destination missing");
  const rows = currentFootprintCopyV2Rows(plan);
  const expected = new Map<string, Readonly<{ id: string; type: string; body: Record<string, unknown> }>>();
  for (const raw of rows) {
    const row = parseNativeRecords(raw)[0]; need(row !== undefined, "projected row absent");
    const id = row.header["id"], type = row.header["type"];
    need(typeof id === "string" && typeof type === "string", "projected row identity differs");
    if (id !== "META" && row.body !== null) {
      need(isRecord(row.body), "projected body differs"); expected.set(id, { id, type, body: row.body });
    }
  }
  expected.set("META", { id: "META", type: "META", body: { ...plan.destinationMetadata, tags: [...plan.destinationMetadata.tags] } });
  need(target.records.length === expected.size && target.records.every(row =>
    canonicalJson(expected.get(row.id)) === canonicalJson({ id: row.id, type: row.type, body: row.body })), "destination record effect differs");
  assertCurrentFootprintCopyV2Inventory(plan, before);
  need(readerCompletion(before) === beforeCompletion && readerCompletion(after) === afterCompletion, "original completed readers changed");
  return Object.freeze({ recordsEffectVerified: true, executionAuthorized: false, producerBindingVerified: false, sqlEffectVerified: false });
}
