/** Independent current209 source observation, separate from copy/append.
 * Concurrent cache loading determines native Map order. This plan proves exact
 * keyed source records and headers, never checkpoint-wide byte ordering. */
import { z } from "zod";
import { isRecord, sha256Json, sha256Text } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentFootprintSourceHistory } from "./symbol-sql-comparator.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Data = Readonly<Record<string, unknown>>;
const sourceSchema = z.object({
  projectUuid: z.string().refine(value => /^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.exec(value)?.[0] === value),
  branchUuid: z.string().refine(value => /^[a-f0-9]{32}$/u.exec(value)?.[0] === value),
  footprintUuid: z.string().refine(value => /^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.exec(value)?.[0] === value),
}).strict();
type Source = Readonly<z.infer<typeof sourceSchema>>;
const metadataSchema = z.object({ title: z.string().min(1).max(512), description: z.string().max(65_536),
  tags: z.array(z.string().max(512)).max(256), source: z.string().max(4096) }).strict();
const OMIT = new Set(["META", "META_PLACEHOLDER", "DELETE_DOC", "META_CREATE", "META_MODIFY"]);
const METADATA_EFFECTS = new Set(["DELETE_DOC", "META_CREATE", "META_MODIFY"]);
const MAX_SOURCE_BYTES = 2_097_152;
const WORKER = "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046";
export interface CurrentFootprintSourcePlan {
  readonly profile: "private.current-footprint-source-plan.v1";
  readonly source: Source;
  readonly maximumTicket: number;
  readonly canvasRecords: number;
  readonly tombstones: number;
  readonly fragments: number;
  readonly beforeCheckpointSha256: string;
  readonly beforeSqlSha256: string;
  readonly beforeRawLinksSha256: string;
  readonly workerSourceSha256: typeof WORKER;
  readonly executionAuthorized: false;
}
interface Atom { readonly id: string; readonly type: string; readonly ticket: number; readonly client: string;
  readonly firstTicket: number | undefined; readonly body: string; readonly header: Data }
interface Link { readonly id: string; readonly type: string; readonly history: Atom[]; readonly clocks: Map<string, Atom> }
interface Header { readonly body: Data; readonly ticket: number; readonly time: number }
interface Retained { readonly before: Inventory; readonly header: Header; readonly meta: string; readonly metaTicket: number;
  readonly rows: ReadonlyMap<string, string>; readonly keyedSha256: string; readonly chunks: readonly string[] }
const originals = new WeakMap<object, Retained>();
function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(`Current footprint source: ${message}`); } }
function integer(value: unknown): number {
  need(typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0), "native integer refused"); return value;
}
function text(value: unknown, limit: number): string {
  need(typeof value === "string" && value.length > 0 && value.length <= limit && value.isWellFormed() && !value.includes("\0"), "native text refused"); return value;
}
function clientId(value: unknown): string { const result = text(value, 16); need(/^[a-f0-9]{16}$/u.test(result), "native client refused"); return result; }
function normalized(type: string, id: string): string { return type === "NET" || type === "RULE_SELECTOR" ? id.toUpperCase() : id; }
function parsed(raw: string): Readonly<{ header: Data; body: Data | null; bodyText: string }> {
  const split = raw.indexOf("||"); need(split > 0, "native framing refused");
  const header: unknown = JSON.parse(raw.slice(0, split)); need(isRecord(header), "native header refused");
  const bodyText = raw.slice(split + 2);
  const body: unknown = bodyText === "" ? null : JSON.parse(bodyText);
  need(body === null || isRecord(body), "native body refused"); return { header, body, bodyText };
}
/** Actor JSON is retained whole and in its original property order. */
function actor(value: unknown): Data {
  need(isRecord(value) && /^[a-f0-9]{32}$/u.test(text(value["uuid"], 32)) &&
    typeof value["username"] === "string" && typeof value["nickname"] === "string", "explicit latest actor required");
  const pending: { value: unknown; depth: number }[] = [{ value, depth: 0 }]; let nodes = 0, units = 0;
  while (pending.length > 0) {
    const current = pending.pop(); nodes += 1; need(current !== undefined && nodes <= 4096 && current.depth <= 8, "actor JSON capacity exceeded");
    const item = current.value;
    if (typeof item === "string") { units += item.length; need(item.isWellFormed() && units <= 65_536, "actor string refused"); }
    else if (typeof item === "number") { need(Number.isFinite(item), "actor number refused"); }
    else if (item !== null && typeof item !== "boolean") {
      need(Array.isArray(item) || isRecord(item), "actor JSON refused");
      const children = Object.entries(item); need(children.length <= (Array.isArray(item) ? 256 : 64), "actor fields exceeded");
      for (const [key, child] of children) { units += key.length; need(key.isWellFormed() && key.length <= 256 && units <= 65_536, "actor key refused"); pending.push({ value: child, depth: current.depth + 1 }); }
    }
  }
  need(Buffer.byteLength(JSON.stringify(value)) <= 65_536, "actor bytes exceeded"); return value;
}
function atom(row: ReturnType<typeof parsed>, inheritedClient: string): Atom {
  const header = row.header;
  const id = text(header["id"], 256), type = text(header["type"], 64);
  need(/^[A-Z][A-Z0-9_]{0,63}$/u.test(type) && !METADATA_EFFECTS.has(type), "unsupported metadata-effect family");
  need(!Object.hasOwn(header, "pend") && !Object.hasOwn(header, "unique"), "pending or unique state refused");
  const firstTicket = Object.hasOwn(header, "firstTicket") ? integer(header["firstTicket"]) : undefined, ticket = integer(header["ticket"]);
  const rawClient = header["client"];
  const client = clientId(rawClient === undefined || rawClient === null || rawClient === "" ? inheritedClient : rawClient);
  need(row.bodyText === "" || row.bodyText.startsWith("{") && row.bodyText.endsWith("}"), "unpadded native object or empty tombstone required");
  return { id, type, ticket, client, firstTicket, body: row.bodyText, header };
}
function compare(left: Atom, right: Atom): number {
  if (left.ticket !== right.ticket) { return left.ticket - right.ticket; }
  return left.client < right.client ? -1 : Number(left.client > right.client);
}
function retained(plan: CurrentFootprintSourcePlan): Retained {
  const value = originals.get(plan); need(value !== undefined && readerCompletion(value.before).exitCode === 0, "original completed source plan required"); return value;
}
export function assertCurrentFootprintSourcePlan(plan: CurrentFootprintSourcePlan): void { retained(plan); }
export function assertCurrentFootprintSourcePlanInventory(plan: CurrentFootprintSourcePlan, before: Inventory): void {
  need(retained(plan).before === before, "exact original SQL inventory required");
}

export async function prepareCurrentFootprintSourcePlan(before: Inventory, input: Source): Promise<CurrentFootprintSourcePlan> {
  const completion = readerCompletion(before), source = freezeDeep(sourceSchema.parse(captureCurrentPcbStringClockReply(input).value));
  const decoded = await decodeCurrentFootprintSourceHistory(before, { projectUuid: source.projectUuid, branchUuid: source.branchUuid });
  const targets = decoded.history.documents.filter(value => value.uuid === source.footprintUuid);
  need(targets.length === 1 && targets[0]?.docType === "FOOTPRINT" && !isNativeDocumentDeleted(targets[0]), "one active source footprint required");
  need(decoded.maximumTicket <= Number.MAX_SAFE_INTEGER - 3, "ticket headroom exhausted");
  const atoms = new Map<string, Link>(), headers: Header[] = [];
  let maximumTime = 0, selectedAtoms = 0, steps = 0;
  for (const chunk of decoded.chunks) {
    let client = "", selected = false;
    const lines = chunk.split("|\n"); if (lines.at(-1) === "") { lines.pop(); }
    for (const raw of lines) {
      const row = parsed(raw), type = row.header["type"];
      if (type === "DOCHEAD") {
        selected = row.body?.["uuid"] === source.footprintUuid;
        if (selected) {
          need(row.body !== null && row.body["docType"] === "FOOTPRINT", "selected header type differs");
          client = clientId(row.body["client"]); const time = integer(row.body["updateTime"]);
          need(time > 0, "header time fallback is unsupported");
          headers.push({ body: row.body, ticket: integer(row.header["ticket"]), time });
          need(headers.length <= 65_536, "source header capacity exceeded"); maximumTime = Math.max(maximumTime, time);
        }
      } else if (selected && type !== "EDIT_HEAD") {
        const value = atom(row, client);
        const key = normalized(value.type, value.id);
        const previous: Link = atoms.get(key) ?? { id: value.id, type: value.type, history: [], clocks: new Map<string, Atom>() };
        selectedAtoms += 1;
        need(selectedAtoms <= 65_536 && previous.history.length < 4096 && previous.type === value.type, "source capacity or normalized ID cross-family collision");
        need(previous.id === value.id, "normalized raw-ID collision");
        const clock = `${value.ticket}:${value.client}`;
        const duplicate = previous.clocks.get(clock);
        need(duplicate === undefined || duplicate.body === value.body && duplicate.id === value.id &&
          duplicate.firstTicket === value.firstTicket && sha256Json(duplicate.header) === sha256Json(value.header), "contradictory duplicate clock");
        if (duplicate === undefined) { previous.history.push(value); previous.clocks.set(clock, value); }
        atoms.set(key, previous); need(atoms.size <= 4101, "source atom capacity exceeded");
      }
      steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
    }
  }
  const latest = headers.filter(value => value.time === maximumTime);
  const header = latest[0];
  need(latest.length === 1 && header !== undefined && headers.every(value => value.ticket <= header.ticket), "unique latest dominating header required");
  actor(header.body["user"]); text(header.body["version"], 512); text(header.body["editVersion"], 64);
  const rows = new Map<string, string>(); let meta: string | undefined, metaTicket = 0, tombstones = 0;
  for (const [key, link] of atoms) {
    const ordered = link.history.toSorted(compare);
    const first = ordered[0], last = ordered.at(-1); need(first !== undefined && last !== undefined, "empty native link");
    if (last.type !== "ELE_PLACEHOLDER" && last.type !== "META_PLACEHOLDER") { metaTicket = Math.max(metaTicket, last.ticket); }
    if (last.type === "META") {
      need(key === "META" && last.body !== "", "one live canonical metadata required"); const body: unknown = JSON.parse(last.body); need(isRecord(body), "metadata refused");
      // The vendor metadata serializer selects these four fields; unknown input
      // Fields remain committed by the complete original history and SQL proof.
      meta = JSON.stringify(metadataSchema.parse({ title: body["title"], description: body["description"], tags: body["tags"], source: body["source"] }));
    } else if (!OMIT.has(last.type)) {
      const firstTicket = first.firstTicket ?? first.ticket;
      const output = { type: last.type, ticket: last.ticket, id: last.id, ...(firstTicket === last.ticket ? {} : { firstTicket }) };
      rows.set(key, `${JSON.stringify(output)}||${last.body}`); if (last.body === "") { tombstones += 1; }
    }
  }
  need(meta !== undefined && rows.size <= 4096, "bounded metadata and canvas required");
  const keyedSha256 = sha256Json([...rows].toSorted(([left], [right]) => left < right ? -1 : Number(left > right)));
  const plan: CurrentFootprintSourcePlan = freezeDeep({ profile: "private.current-footprint-source-plan.v1", source,
    maximumTicket: decoded.maximumTicket, canvasRecords: rows.size, tombstones, fragments: headers.length,
    beforeCheckpointSha256: before.checkpointSha256, beforeSqlSha256: before.logicalSha256, beforeRawLinksSha256: sha256Json(decoded.links),
    workerSourceSha256: WORKER, executionAuthorized: false });
  // Every admitted runtime client is exactly 16 ASCII hexadecimal characters.
  // Row ordering cannot change total bytes, so reject the complete source size
  // Before an owner can use this plan to prepare a native observation intent.
  const sizeClient = "0".repeat(16);
  let sourceBytes = Buffer.byteLength(head(plan, sizeClient, plan.maximumTicket + 1, header, "3.2.209")) +
    Buffer.byteLength(`${JSON.stringify({ type: "META", ticket: metaTicket, id: "META" })}||${meta}`) +
    Buffer.byteLength(head(plan, sizeClient, header.ticket, header, String(header.body["editVersion"]))) + 2 * (rows.size + 2);
  for (const value of rows.values()) { sourceBytes += Buffer.byteLength(value); need(sourceBytes <= MAX_SOURCE_BYTES, "complete source byte bound refused"); }
  need(sourceBytes <= MAX_SOURCE_BYTES, "complete source byte bound refused");
  need(readerCompletion(before) === completion, "original reader changed");
  originals.set(plan, { before, header: freezeDeep(header), meta, metaTicket, rows, keyedSha256, chunks: decoded.chunks }); return plan;
}

function head(plan: CurrentFootprintSourcePlan, client: string, ticket: number, header: Header, editVersion: string): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "FOOTPRINT", client, uuid: plan.source.footprintUuid,
    updateTime: header.time, version: header.body["version"], editVersion, user: header.body["user"] })}`;
}
export function verifyCurrentFootprintSource(plan: CurrentFootprintSourcePlan, client: string, content: string): Readonly<{
  profile: "private.current-footprint-source-match.v1"; sourceSha256: string; keyedRecordsSha256: string; observedOrderSha256: string;
  canvasRecords: number; tombstones: number; exactKeyedSourceVerified: true; checkpointByteOrderVerified: false;
  sourceGetterEquivalent: false; cacheBranchObserved: false; producerBindingVerified: false; executionAuthorized: false;
}> {
  const state = retained(plan); clientId(client);
  need(typeof content === "string" && content.isWellFormed() && Buffer.byteLength(content) <= MAX_SOURCE_BYTES, "source byte bound refused");
  const lines = content.split("|\n"); need(lines.length === plan.canvasRecords + 3, "source record count differs");
  need(lines[0] === head(plan, client, plan.maximumTicket + 1, state.header, "3.2.209") &&
    lines[1] === `${JSON.stringify({ type: "META", ticket: state.metaTicket, id: "META" })}||${state.meta}` &&
    lines[2] === head(plan, client, state.header.ticket, state.header, String(state.header.body["editVersion"])), "generated header or metadata differs");
  const order: string[] = [], seen = new Set<string>();
  for (const raw of lines.slice(3)) {
    const row = parsed(raw);
    const key = normalized(text(row.header["type"], 64), text(row.header["id"], 256));
    need(!seen.has(key) && state.rows.get(key) === raw, "exact keyed source record differs"); seen.add(key); order.push(key);
  }
  need(seen.size === state.rows.size, "source keys differ");
  return Object.freeze({ profile: "private.current-footprint-source-match.v1", sourceSha256: sha256Text(content),
    keyedRecordsSha256: state.keyedSha256, observedOrderSha256: sha256Json(order), canvasRecords: plan.canvasRecords, tombstones: plan.tombstones,
    exactKeyedSourceVerified: true, checkpointByteOrderVerified: false, sourceGetterEquivalent: false,
    cacheBranchObserved: false, producerBindingVerified: false, executionAuthorized: false });
}
