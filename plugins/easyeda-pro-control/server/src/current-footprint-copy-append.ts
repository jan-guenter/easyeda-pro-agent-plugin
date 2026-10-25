/** Pure current3.2.209 FOOTPRINT GET_STR and Tg.create append relation.
 * One historical target fragment, explicit header actor, unique CANVAS/PAD/LINE
 * atoms only. No live observation, ownership, persistence or writer authority.
 */
import { canonicalJson, isRecord, sha256Json, sha256Text } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { assertCurrentFootprintCopyPlanInventory } from "./current-footprint-copy-plan.ts";
import type { CurrentFootprintCopyPlan } from "./current-footprint-copy-plan.ts";
import { parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { decodeCurrentSymbolPreEditHistory } from "./symbol-sql-comparator.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Data = Readonly<Record<string, unknown>>;
const CLIENT = /^[a-f0-9]{16}$/u;
const FAMILIES = new Set(["CANVAS", "PAD", "LINE"]);
export const CURRENT_FOOTPRINT_COPY_WORKER_SHA256 = "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046";
export interface CurrentFootprintCopyAppendPlan {
  readonly profile: "private.current-footprint-copy-append-plan.v1";
  readonly copyPlan: CurrentFootprintCopyPlan;
  readonly maximumTicket: number;
  readonly metadataTicket: number;
  readonly canvasHeaderTicket: number;
  readonly sourceMetadataTicket: number;
  readonly canvasRecords: number;
  readonly workerSourceSha256: typeof CURRENT_FOOTPRINT_COPY_WORKER_SHA256;
  readonly executionAuthorized: false;
  readonly producerBindingVerified: false;
  readonly cacheBranchObserved: false;
}
interface Retained {
  readonly before: Inventory;
  readonly header: Data;
  readonly headerTicket: number;
  readonly canvas: readonly string[];
  readonly copied: readonly string[];
  readonly rawStrings: string;
}
const originals = new WeakMap<object, Retained>();
function need(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(`Current footprint append: ${message}`); }
}
function exactKeys(value: Data, names: readonly string[]): void {
  need(Object.keys(value).length === names.length && names.every(name => Object.hasOwn(value, name)), "exact native field set required");
}
function integer(value: unknown): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0), "native integer refused"); return value;
}
function ordinaryAtomId(value: unknown): value is string {
  // Ni copies atoms through object keys. Only canonical array indices reorder
  // Ahead of ordinary insertion-order keys; leading-digit hex IDs do not.
  return typeof value === "string" && /^[A-Za-z0-9_][A-Za-z0-9_-]{0,255}$/u.test(value) &&
    !["__proto__", "prototype", "constructor"].includes(value) &&
    !(/^(?:0|[1-9][0-9]{0,9})$/u.test(value) && Number(value) <= 4_294_967_294);
}
function head(target: string, client: string, ticket: number, stored: Data, editVersion: string): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid: target,
    updateTime: stored["updateTime"], version: stored["version"], editVersion, user: stored["user"] })}`;
}
function metadataRow(ticket: number, value: CurrentFootprintCopyPlan["sourceMetadata"]): string {
  return `${JSON.stringify({ type: "META", ticket, id: "META" })}||${JSON.stringify({ title: value.title,
    description: value.description, tags: value.tags, source: value.source })}`;
}
function retained(original: CurrentFootprintCopyAppendPlan): Retained {
  const state = originals.get(original); need(state !== undefined, "original prepared append plan required");
  assertCurrentFootprintCopyPlanInventory(original.copyPlan, state.before); return state;
}

/** The single-fragment restriction makes first-arrival ordering independent of
 * concurrent cache reads. Explicit DOCHEAD.user keeps raw replay and the
 * per-FOOTPRINT cache's synthesized EDIT_HEAD actor equivalent. NET, canonical
 * array-index and prototype-like IDs remain outside this serializer model.
 */
export async function prepareCurrentFootprintCopyAppendPlan(before: Inventory,
  copyPlan: CurrentFootprintCopyPlan): Promise<CurrentFootprintCopyAppendPlan> {
  assertCurrentFootprintCopyPlanInventory(copyPlan, before); const completion = readerCompletion(before);
  const decoded = await decodeCurrentSymbolPreEditHistory(before,
    { projectUuid: copyPlan.source.projectUuid, branchUuid: copyPlan.source.branchUuid });
  let fragments = 0, headerTicket = 0, selected = false, sourceHeader: Data | undefined, sourceMetadataTicket = 0, steps = 0;
  const canvas: string[] = [], ids = new Set<string>(), rawStrings: string[] = [];
  for (const chunk of decoded.chunks) {
    selected = false;
    for (const raw of chunk.split("|\n").filter(Boolean)) {
      const row = parseNativeRecords(raw)[0]; need(row !== undefined, "raw record missing");
      rawStrings.push(JSON.stringify(row)); const type = row.header["type"];
      if (type === "DOCHEAD") {
        selected = row.body?.["uuid"] === copyPlan.source.footprintUuid;
        if (selected) { sourceHeader = row.body ?? undefined; headerTicket = integer(row.header["ticket"]); fragments += 1; }
      } else if (selected && type !== "EDIT_HEAD") {
        exactKeys(row.header, ["type", "ticket", "id"]);
        const id = row.header["id"], ticket = integer(row.header["ticket"]);
        need(ordinaryAtomId(id) && !ids.has(id), "unique ordinary non-array-index atom IDs required");
        ids.add(id); sourceMetadataTicket = Math.max(sourceMetadataTicket, ticket);
        need(row.body !== null, "source tombstone refused");
        if (type === "META") { need(id === "META", "canonical META identity required"); }
        else {
          need(typeof type === "string" && FAMILIES.has(type), "source family needs a separate getter projection");
          const body = raw.slice(raw.indexOf("||") + 2);
          need(body.startsWith("{") && body.endsWith("}"), "native compressor requires unpadded object bytes");
          canvas.push(`${JSON.stringify({ type, ticket, id })}||${body}`);
        }
      }
      steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
    }
  }
  need(fragments === 1 && sourceHeader !== undefined && ids.has("META") && canvas.length === copyPlan.canvasRecords,
    "one complete historical target fragment required");
  exactKeys(sourceHeader, ["docType", "client", "uuid", "updateTime", "version", "editVersion", "user"]);
  need(sourceHeader["docType"] === "FOOTPRINT" && typeof sourceHeader["client"] === "string" && CLIENT.test(sourceHeader["client"]) &&
    integer(sourceHeader["updateTime"]) > 0 && typeof sourceHeader["version"] === "string" && sourceHeader["version"].length > 0 &&
    typeof sourceHeader["editVersion"] === "string" && sourceHeader["editVersion"].length > 0, "stored footprint header refused");
  const user = sourceHeader["user"]; need(isRecord(user), "explicit source header user required");
  exactKeys(user, ["uuid", "username", "nickname"]);
  need(typeof user["uuid"] === "string" && /^[a-f0-9]{32}$/u.test(user["uuid"]) &&
    typeof user["username"] === "string" && user["username"].length <= 4096 &&
    typeof user["nickname"] === "string" && user["nickname"].length <= 4096, "source header actor refused");
  const plan: CurrentFootprintCopyAppendPlan = freezeDeep({ profile: "private.current-footprint-copy-append-plan.v1", copyPlan,
    maximumTicket: decoded.maximumTicket, metadataTicket: decoded.maximumTicket + 1, canvasHeaderTicket: decoded.maximumTicket + 2,
    sourceMetadataTicket, canvasRecords: canvas.length, workerSourceSha256: CURRENT_FOOTPRINT_COPY_WORKER_SHA256,
    executionAuthorized: false, producerBindingVerified: false, cacheBranchObserved: false });
  const copied = [metadataRow(sourceMetadataTicket, copyPlan.sourceMetadata), ...canvas];
  need(readerCompletion(before) === completion, "original SQL reader changed");
  originals.set(plan, { before, header: freezeDeep(sourceHeader), headerTicket, canvas: Object.freeze(canvas), copied: Object.freeze(copied), rawStrings: rawStrings.join("\n") });
  return plan;
}

export function assertCurrentFootprintCopyAppendInventory(original: CurrentFootprintCopyAppendPlan, before: Inventory): void {
  need(retained(original).before === before, "exact original SQL inventory required");
}

/** Expected bytes only. This never invokes GET_STR or adopts a live return.
 * Tg.buildString consumes M+1 before source GET_STR; GET_STR itself consumes no
 * ticket. The compressed canvas retains the stored header's own ticket/version.
 */
export function expectedCurrentFootprintCopySource(original: CurrentFootprintCopyAppendPlan, client: string,
  phase: "before-create" | "create-source"): string {
  const state = retained(original); need(CLIENT.test(client), "worker client refused");
  need(phase === "before-create" || phase === "create-source", "source getter phase refused");
  const ticket = phase === "before-create" ? original.metadataTicket : original.canvasHeaderTicket;
  const target = original.copyPlan.source.footprintUuid;
  const sourceHeader = head(target, client, ticket, state.header, "3.2.209");
  // The sole historical header ticket can differ from all atom tickets.
  return [sourceHeader, metadataRow(original.sourceMetadataTicket, original.copyPlan.sourceMetadata),
    head(target, client, state.headerTicket, state.header, String(state.header["editVersion"])), ...state.canvas].join("|\n");
}

export function currentFootprintCopySourceRows(original: CurrentFootprintCopyAppendPlan): readonly string[] { return retained(original).copied; }

export function verifyCurrentFootprintCopySource(original: CurrentFootprintCopyAppendPlan, client: string,
  phase: "before-create" | "create-source", content: string): Readonly<Record<string, unknown>> {
  need(content === expectedCurrentFootprintCopySource(original, client, phase), "exact GET_STR source differs");
  return Object.freeze({ profile: "private.current-footprint-copy-source-match.v1", sourceSha256: sha256Text(content), phase,
    sourceGetterEquivalent: true, cacheBranchObserved: false, producerBindingVerified: false, executionAuthorized: false });
}

/** Headers/actor/clocks are checked separately by the full SQL composition.
 * This relation fixes exact metadata/canvas bytes, ordering and native tickets.
 */
export function verifyCurrentFootprintCopyAppend(original: CurrentFootprintCopyAppendPlan,
  targetUuid: string, chunk: string): Readonly<{ targetUuid: string; plaintextSha256: string; rawAppendRecordsVerified: true;
    actorAndClocksVerified: false; executionAuthorized: false; producerBindingVerified: false }> {
  const state = retained(original);
  need(CLIENT.test(targetUuid) && !state.rawStrings.includes(targetUuid), "fresh ordinary destination UUID required");
  need(Buffer.byteLength(chunk) <= 2_097_152, "append byte bound exceeded");
  const lines = chunk.split("|\n"); need(lines.length === state.copied.length + 4, "exact append record count required");
  need(lines[2] === metadataRow(original.metadataTicket, original.copyPlan.destinationMetadata) &&
    canonicalJson(lines.slice(4)) === canonicalJson(state.copied), "exact metadata/canvas append differs");
  for (const [index, ticket] of [[1, original.metadataTicket], [3, original.canvasHeaderTicket]] as const) {
    const parsed = parseNativeRecords(lines[index] ?? "")[0];
    need(parsed !== undefined && sha256Json(parsed.header) === sha256Json({ type: "DOCHEAD", ticket }) &&
      parsed.body?.["uuid"] === targetUuid && parsed.body["docType"] === "FOOTPRINT", "destination header identity/ticket differs");
  }
  need(parseNativeRecords(lines[0] ?? "")[0]?.header["type"] === "EDIT_HEAD", "backend edit header missing");
  return Object.freeze({ targetUuid, plaintextSha256: sha256Text(chunk), rawAppendRecordsVerified: true,
    actorAndClocksVerified: false, executionAuthorized: false, producerBindingVerified: false });
}
