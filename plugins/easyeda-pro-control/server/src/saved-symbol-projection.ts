/** Private data-only reconstruction of pinned native symbol.getStr output.
 * Caller data is not an original SQL comparison, producer proof or dispatch grant.
 */
import { createHash } from "node:crypto";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
import { materializeNativeHistoryCooperatively, parseNativeRecords } from "./native-history.ts";

type ObjectData = Record<string, unknown>;
interface Atom { readonly id: string; readonly type: string; readonly ticket: number; readonly client: string; readonly raw: string }
interface AtomChain { readonly clocks: Map<string, Atom>; first: Atom; last: Atom }
interface Header { readonly updateTime: number; readonly version: string; readonly ticket: number; readonly user: ObjectData; readonly editVersion?: string }
export interface SavedSymbolProjection {
  readonly profile: "private.saved-symbol-getstr-projection.v1";
  readonly targetUuid: string; readonly maximumTicket: number; readonly rawHistorySha256: string;
  readonly rawHistoryBytes: number; readonly canvasRecords: number;
  readonly executionAuthorized: false; readonly producerBindingVerified: false;
}
interface Prepared { readonly descriptor: SavedSymbolProjection; readonly header: Header; readonly metadata: ObjectData; readonly metadataTicket: number;
  readonly currentEditVersion: string | null; readonly canvas: readonly string[] }
const originals = new WeakMap<object, Prepared>();
const IGNORED = new Set(["META", "META_PLACEHOLDER", "DELETE_DOC", "META_CREATE", "META_MODIFY"]);
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(`Saved symbol projection: ${message}`); } }
function number(value: unknown): number { need(typeof value === "number" && Number.isSafeInteger(value) && value >= 0, "native integer refused"); return value; }
function text(value: unknown): string { need(typeof value === "string" && value.length > 0 && value.length <= 4096, "native string refused"); return value; }
function body(value: unknown): ObjectData { need(isRecord(value), "native object refused"); return value; }
function earlier(left: Atom, right: Atom): boolean { return left.ticket < right.ticket || (left.ticket === right.ticket && left.client < right.client); }
function digest(value: string): string { return createHash("sha256").update(value).digest("hex"); }
function nativeUser(header: ObjectData, edit: ObjectData | undefined): ObjectData {
  const hasUser = Boolean(header["user"]);
  if (hasUser) { return body(header["user"]); }
  // Native flowParseFull synthesizes the first missing EDIT_HEAD from the DOCHEAD.
  const actor = edit ?? { uuid: header["uuid"], username: undefined, nickname: undefined };
  return { uuid: actor["uuid"], username: actor["username"], nickname: actor["nickname"] };
}
function line(type: string, ticket: number, id: string, raw: string, firstTicket?: number): string {
  return `${JSON.stringify({ type, ticket, id, ...(firstTicket === undefined ? {} : { firstTicket }) })}||${raw}`;
}
function head(target: string, client: string, value: Header, ticket: number, version: string | null): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client, uuid: target,
    updateTime: value.updateTime, version: value.version, ...(version === null ? {} : { editVersion: version }), user: value.user })}`;
}
function applyHeader(current: ObjectData, edit: ObjectData, ticketValue: unknown, selected: Header | undefined): Header {
  need(current["docType"] === "SYMBOL", "target header type changed");
  const hasTime = Boolean(current["updateTime"]);
  const updateTime = number(hasTime ? current["updateTime"] : edit["updateTime"]);
  need(updateTime > 0, "clock-dependent missing/zero final header is not admitted");
  const version = text(current["version"]);
  const editVersion = current["editVersion"];
  need(editVersion === undefined || (typeof editVersion === "string" && editVersion.length > 0 && editVersion.length <= 128), "stored editor version refused");
  const ticket = number(ticketValue);
  return selected === undefined || selected.updateTime < updateTime
    ? { updateTime, version, ticket: selected === undefined ? ticket : Math.max(selected.ticket, ticket),
      user: nativeUser(current, edit), ...(editVersion === undefined ? {} : { editVersion }) } : selected;
}
function applyAtom(atoms: Map<string, AtomChain>, atom: Atom): boolean {
  let chain = atoms.get(atom.id);
  if (chain === undefined) { chain = { clocks: new Map(), first: atom, last: atom }; atoms.set(atom.id, chain); }
  const clock = `${atom.ticket}:${atom.client}`, duplicate = chain.clocks.get(clock);
  need(duplicate === undefined || (duplicate.raw === atom.raw && duplicate.type === atom.type), "duplicate native clock has different raw encoding");
  if (duplicate !== undefined) { return false; }
  const selected = chain.clocks.size === 0 || earlier(chain.last, atom);
  chain.clocks.set(clock, atom);
  if (earlier(atom, chain.first)) { chain.first = atom; }
  if (earlier(chain.last, atom)) { chain.last = atom; }
  return selected && atom.type !== "ELE_PLACEHOLDER" && atom.type !== "META_PLACEHOLDER";
}

/** Replays the already admitted no-snapshot, unpending, complete linear history.
 * Exact clock duplicates with different raw bodies remain explicitly unsupported:
 * native cache pointer replacement must be modeled before admitting that case.
 */
export async function prepareSavedSymbolProjection(input: Readonly<{
  chunks: readonly string[]; targetUuid: string; maximumTicket: number; currentEditVersion: string | null;
}>): Promise<SavedSymbolProjection> {
  const { targetUuid, maximumTicket, currentEditVersion } = input;
  need(/^[a-f0-9]{32}$/u.test(targetUuid) && Number.isSafeInteger(maximumTicket) && maximumTicket >= 0 && maximumTicket < Number.MAX_SAFE_INTEGER,
    "target/ticket input refused");
  need(currentEditVersion === null || (typeof currentEditVersion === "string" && currentEditVersion.length > 0 && currentEditVersion.length <= 128), "editor version refused");
  need(Array.isArray(input.chunks) && input.chunks.length > 0 && input.chunks.length <= 4096, "chunk count refused");
  const chunks = input.chunks.map((chunk) => {
    need(typeof chunk === "string" && Buffer.from(chunk).toString("utf8") === chunk, "chunk is not exact UTF8 text"); return chunk;
  });
  const rawHistoryBytes = chunks.reduce((total, chunk) => total + Buffer.byteLength(chunk), 0);
  need(rawHistoryBytes <= 8_388_608, "complete raw history byte bound exceeded");
  let checked = 0;
  for (const chunk of chunks) {
    const records = chunk.split("|\n"); if (records.at(-1) === "") { records.pop(); }
    for (const raw of records) {
      checked += 1;
      need(checked <= 250_000 && Buffer.byteLength(raw) <= 262_144, "raw record count/individual byte bound exceeded");
      if (checked % 128 === 0) { await yieldProofEventLoop(); }
    }
  }
  const materialized = await materializeNativeHistoryCooperatively(chunks);
  const document = materialized.find((item) => item.uuid === targetUuid);
  need(document?.docType === "SYMBOL", "target not an admitted SYMBOL");
  const atoms = new Map<string, AtomChain>();
  let maximum = 0, metadataTicket = 0, selected: Header | undefined, steps = 0;
  for (const chunk of chunks) {
    let current: ObjectData | undefined, edit: ObjectData | undefined;
    const records = chunk.split("|\n"); if (records.at(-1) === "") { records.pop(); }
    for (const raw of records) {
      need(Buffer.byteLength(raw) <= 262_144, "individual raw record exceeds the cooperative proof bound");
      const parsed = parseNativeRecords(raw)[0]; need(parsed !== undefined, "empty record refused");
      const { header } = parsed;
      if (header["ticket"] !== undefined) { maximum = Math.max(maximum, number(header["ticket"])); }
      if (header["type"] === "EDIT_HEAD") { edit = body(parsed.body); }
      else if (header["type"] === "DOCHEAD") {
        current = body(parsed.body);
        edit ??= { uuid: current["uuid"], username: isRecord(current["user"]) ? current["user"]["username"] : undefined,
          nickname: isRecord(current["user"]) ? current["user"]["nickname"] : undefined, updateTime: current["updateTime"] };
        if (current["uuid"] === targetUuid) {
          selected = applyHeader(current, edit, header["ticket"], selected);
        }
      } else if (current?.["uuid"] === targetUuid) {
        const id = text(header["id"]), type = text(header["type"]);
        // Native normalization is type-sensitive; these types are not symbol canvas primitives in the first profile.
        need(type !== "NET" && type !== "RULE_SELECTOR", "case-insensitive cross-type key replay is not admitted");
        need(type !== "META" || (id === "META" && parsed.body !== null), "noncanonical target META history refused");
        const hasClient = Boolean(header["client"]);
        const client = text(hasClient ? header["client"] : current["client"]), ticket = number(header["ticket"]);
        need(/^[a-f0-9]{16}$/u.test(client), "record client refused");
        const atom: Atom = { id, type, ticket, client, raw: raw.slice(raw.indexOf("||") + 2) };
        if (applyAtom(atoms, atom)) { metadataTicket = Math.max(metadataTicket, ticket); }
      }
      steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
    }
  }
  need(maximum === maximumTicket && selected !== undefined, "global ticket/header differs from the prepared edit");
  const meta = atoms.get("META")?.last;
  need(meta?.type === "META" && meta.raw !== "", "exact target META missing");
  const value = body(JSON.parse(meta.raw));
  need(value["docType"] === 2, "block/other symbol types are not admitted");
  const deleted = atoms.get("DELETE_DOC")?.last;
  need(deleted === undefined || body(JSON.parse(deleted.raw))["isDelete"] === false, "deleted target refused");
  const metadata = { title: value["title"], description: value["description"], tags: value["tags"], docType: value["docType"], source: value["source"] };
  const canvas: string[] = [];
  for (const chain of atoms.values()) {
    const atom = chain.last;
    if (!IGNORED.has(atom.type)) { canvas.push(line(atom.type, atom.ticket, atom.id, atom.raw, atom.ticket === chain.first.ticket ? undefined : chain.first.ticket)); }
    steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
  }
  const descriptor: SavedSymbolProjection = Object.freeze({ profile: "private.saved-symbol-getstr-projection.v1", targetUuid, maximumTicket,
    rawHistorySha256: sha256Json(chunks.map((chunk) => digest(chunk))), rawHistoryBytes, canvasRecords: canvas.length, executionAuthorized: false, producerBindingVerified: false });
  originals.set(descriptor, { descriptor, header: selected, metadata, metadataTicket, currentEditVersion, canvas });
  return descriptor;
}

export function expectedSavedSymbolContent(original: SavedSymbolProjection, currentWorkerClient: string): string {
  const retained = originals.get(original);
  need(retained !== undefined && canonicalJson(original) === canonicalJson(retained.descriptor), "original pure projection required");
  need(/^[a-f0-9]{16}$/u.test(currentWorkerClient), "verification worker client refused");
  const { header, currentEditVersion, metadataTicket, metadata, canvas } = retained;
  const output = [head(original.targetUuid, currentWorkerClient, header, original.maximumTicket + 1, currentEditVersion),
    line("META", metadataTicket, "META", JSON.stringify(metadata))];
  if (canvas.length > 0) { output.push(head(original.targetUuid, currentWorkerClient, header, header.ticket, header.editVersion ?? currentEditVersion), ...canvas); }
  return output.join("|\n");
}

/** Exact relation only. A matching caller-supplied string grants no live read authority. */
export function verifySavedSymbolContent(original: SavedSymbolProjection, observation: unknown): Readonly<Record<string, unknown>> {
  need(isRecord(observation) && observation["profile"] === "private.saved-symbol-content-observation.v1" && observation["targetUuid"] === original.targetUuid &&
    observation["maximumTicket"] === original.maximumTicket && typeof observation["workerClient"] === "string" && typeof observation["content"] === "string",
  "native observation shape/identity differs");
  const expected = expectedSavedSymbolContent(original, observation["workerClient"]);
  need(observation["content"] === expected, "native saved content differs from the complete raw-history projection");
  return Object.freeze({ profile: "private.saved-symbol-content-relation.v1", targetUuid: original.targetUuid, rawHistorySha256: original.rawHistorySha256,
    contentSha256: digest(expected), contentBytes: Buffer.byteLength(expected), exactContent: true, producerBindingVerified: false, executionAuthorized: false, completionProved: false });
}
