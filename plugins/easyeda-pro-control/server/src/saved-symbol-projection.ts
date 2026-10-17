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
export const CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION = Object.freeze({
  relativePath: "pro-mgr/3.2.184.355087e9/js/project-worker.js", bytes: 2_181_284,
  sha256: "b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928",
  editorVersion: "3.2.206",
} as const);
export interface CurrentDocumentCacheSavedSymbolProjection extends Omit<SavedSymbolProjection, "profile"> {
  readonly profile: "private.current-document-cache-saved-symbol-getstr-projection.v1";
  readonly workerSourceSha256: typeof CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256;
  readonly cacheBranchObserved: false;
}
export interface CurrentSingleCanvasSegmentSavedSymbolProjection extends Omit<CurrentDocumentCacheSavedSymbolProjection, "profile"> {
  readonly profile: "private.current-single-canvas-segment-saved-symbol-getstr-projection.v1";
  readonly canvasChunkIndex: number;
  readonly maximumTargetHeaderTime: number;
  readonly segmentOrderIndependent: true;
}
export interface CurrentCanvasSegmentsSavedSymbolProjection extends Omit<CurrentDocumentCacheSavedSymbolProjection, "profile"> {
  readonly profile: "private.current-canvas-segments-saved-symbol-getstr-projection.v1";
  readonly canvasSegmentCount: number; readonly maximumTargetHeaderTime: number;
  readonly rawPrefixOrderIndependent: boolean; readonly segmentOrderIndependent: false;
  readonly maximumConcurrentChunks: 101;
}
type Projection = SavedSymbolProjection | CurrentDocumentCacheSavedSymbolProjection | CurrentSingleCanvasSegmentSavedSymbolProjection | CurrentCanvasSegmentsSavedSymbolProjection;
type Strategy = "raw" | "current-document-cache" | "current-single-canvas-segment-cache" | "current-canvas-segments-cache";
interface ProjectionInput {
  readonly chunks: readonly string[]; readonly targetUuid: string; readonly maximumTicket: number; readonly currentEditVersion: string | null;
}
interface Prepared { readonly descriptor: Projection; readonly header: Header; readonly metadata: ObjectData; readonly metadataTicket: number;
  readonly currentEditVersion: string | null; readonly canvas: readonly string[];
  readonly canvasOrder?: Readonly<{ streams: readonly (readonly string[])[]; idsByLine: ReadonlyMap<string, string> }> }
interface SingleCanvasSegmentScope {
  readonly types: Map<string, string>;
  canvasChunkIndex?: number;
  latestHeaderTime: number; latestHeaderCount: number; latestHeaderTicket: number; maximumHeaderTicket: number;
}
interface CanvasSegmentsScope {
  readonly headers: SingleCanvasSegmentScope; readonly streams: Map<number, string[]>;
  latestHeaderChunkIndex?: number; rawHeader?: Header;
}
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

function observeSingleCanvasHeader(scope: SingleCanvasSegmentScope | undefined, value: ObjectData, ticketValue: unknown): void {
  if (scope === undefined) { return; }
  const ticket = number(ticketValue), time = number(value["updateTime"]);
  need(time > 0, "single-canvas-segment requires explicit positive header times");
  scope.maximumHeaderTicket = Math.max(scope.maximumHeaderTicket, ticket);
  if (time > scope.latestHeaderTime) { scope.latestHeaderTime = time; scope.latestHeaderCount = 1; scope.latestHeaderTicket = ticket; }
  else if (time === scope.latestHeaderTime) { scope.latestHeaderCount += 1; }
}

function observeSingleCanvasAtom(scope: SingleCanvasSegmentScope | undefined, atom: Atom, chunkIndex: number): void {
  if (scope === undefined) { return; }
  need(!scope.types.has(atom.id) || scope.types.get(atom.id) === atom.type, "single-canvas-segment atom type changed"); scope.types.set(atom.id, atom.type);
  if (!IGNORED.has(atom.type)) {
    need(scope.canvasChunkIndex === undefined || scope.canvasChunkIndex === chunkIndex, "canvas occurrences span multiple history segments");
    scope.canvasChunkIndex = chunkIndex;
    need(atom.raw === "" || (atom.raw.startsWith("{") && atom.raw.endsWith("}")), "canvas body would be discarded by the native serializer");
  }
}

function observeCanvasSegmentsAtom(scope: CanvasSegmentsScope | undefined, atom: Atom, chunkIndex: number): void {
  if (scope === undefined) { return; }
  const { types } = scope.headers;
  need(!types.has(atom.id) || types.get(atom.id) === atom.type, "canvas-segments atom type changed"); types.set(atom.id, atom.type);
  if (!IGNORED.has(atom.type)) {
    need(atom.raw === "" || (atom.raw.startsWith("{") && atom.raw.endsWith("}")), "canvas body would be discarded by the native serializer");
    let stream = scope.streams.get(chunkIndex);
    if (stream === undefined) { stream = []; scope.streams.set(chunkIndex, stream); }
    stream.push(atom.id);
  }
}

function observeCanvasSegmentsHeader(scope: CanvasSegmentsScope | undefined, current: ObjectData, edit: ObjectData,
  ticket: unknown, chunkIndex: number, firstSymbolUuid: unknown, targetUuid: string): void {
  if (scope === undefined) { return; }
  need(firstSymbolUuid === targetUuid, "canvas-segments target follows a peer SYMBOL cache header");
  if (number(current["updateTime"]) > scope.headers.latestHeaderTime) { scope.latestHeaderChunkIndex = chunkIndex; }
  observeSingleCanvasHeader(scope.headers, current, ticket);
  scope.rawHeader = applyHeader(current, edit, ticket, scope.rawHeader);
}

/** Replays the already admitted no-snapshot, unpending, complete linear history.
 * Exact clock duplicates with different raw bodies remain explicitly unsupported:
 * native cache pointer replacement must be modeled before admitting that case.
 */
export async function prepareSavedSymbolProjection(input: Readonly<{
  chunks: readonly string[]; targetUuid: string; maximumTicket: number; currentEditVersion: string | null;
}>): Promise<SavedSymbolProjection> {
  const descriptor = await prepareProjection(input, "raw");
  need(descriptor.profile === "private.saved-symbol-getstr-projection.v1", "raw preparation profile differs");
  return descriptor;
}

/** Current flowParseFull caches each document's original records without EDIT_HEAD.
 * Pinned worker byte offsets: flowParseFull 239200, onDocHead 275156, getStr 1939611.
 * Replaying that fragment synthesizes its actor from its first target DOCHEAD,
 * not a preceding peer or original edit actor. Explicit header users survive.
 * The worker's 100 MiB cache split exceeds our complete 8 MiB history bound.
 * This models one possible producer path; it does not observe which path ran.
 * Canvas cache production is deliberately not admitted by this narrow profile.
 */
export async function prepareCurrentDocumentCacheSavedSymbolProjection(input: ProjectionInput): Promise<CurrentDocumentCacheSavedSymbolProjection> {
  need(input.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion, "document-cache editor version refused");
  const descriptor = await prepareProjection(input, "current-document-cache");
  need(descriptor.profile === "private.current-document-cache-saved-symbol-getstr-projection.v1", "document-cache preparation profile differs");
  return descriptor;
}

/** Pure candidate; live callers must independently bind disposable ownership.
 * Pinned WORKER xA at1709761 and pd at1851763 load segments concurrently;
 * getCompressKeys at291095 emits insertion order without needNum/clearDelete.
 * One canvas-bearing segment preserves its exact key order under that loading.
 * onDocHead at275156 keeps the first equal-time header and updates its ticket
 * only on a newer time: require a unique latest header with a maximal ticket.
 * flowParseFull.end at240741 omits lone-DOCHEAD target cache fragments;
 * refuse those rather than treating an omitted header as a replayed header.
 * compress at289242 discards nonempty bodies without literal outer braces;
 * refuse those lossy encodings instead of rewriting them in this projection.
 */
export async function prepareCurrentSingleCanvasSegmentSavedSymbolProjection(input: ProjectionInput): Promise<CurrentSingleCanvasSegmentSavedSymbolProjection> {
  need(input.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion, "single-canvas-segment editor version refused");
  const descriptor = await prepareProjection(input, "current-single-canvas-segment-cache");
  need(descriptor.profile === "private.current-single-canvas-segment-saved-symbol-getstr-projection.v1", "single-canvas-segment preparation profile differs");
  return descriptor;
}

/** Separate source-derived order relation, not a claim about observed cache use.
 * Pinned xA at1709761 launches 101 chunks before its first Promise.all barrier.
 * flowStrMatch at1685214 can yield between records within each cached fragment;
 * pd at1851763 can replay a partial cached prefix before an atomic raw fallback.
 * First appearances therefore form a shuffle of per-fragment ID sequences.
 * Stable types and exact duplicate clocks make final bodies/firstTicket invariant.
 * Na at238709 groups SYMBOL peers together. Refuse an earlier peer SYMBOL
 * header rather than synthesize the target actor from the wrong group header.
 * A raw winning header may share this order relation only when its chunk has
 * no target canvas or both header users serialize identically. Otherwise its
 * atomic parse could constrain the canvas order, unlike a cached stream.
 */
export async function prepareCurrentCanvasSegmentsSavedSymbolProjection(input: ProjectionInput): Promise<CurrentCanvasSegmentsSavedSymbolProjection> {
  need(input.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion, "canvas-segments editor version refused");
  need(Array.isArray(input.chunks) && input.chunks.length <= 101, "canvas-segments exceeds the first 101-chunk loader batch");
  const descriptor = await prepareProjection(input, "current-canvas-segments-cache");
  need(descriptor.profile === "private.current-canvas-segments-saved-symbol-getstr-projection.v1", "canvas-segments preparation profile differs");
  return descriptor;
}

async function prepareProjection(input: ProjectionInput, strategy: Strategy): Promise<Projection> {
  const { targetUuid, maximumTicket, currentEditVersion } = input;
  need(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u.test(targetUuid) && Number.isSafeInteger(maximumTicket) && maximumTicket >= 0 && maximumTicket < Number.MAX_SAFE_INTEGER,
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
  const singleCanvasScope: SingleCanvasSegmentScope | undefined = strategy === "current-single-canvas-segment-cache"
    ? { types: new Map(), latestHeaderTime: 0, latestHeaderCount: 0, latestHeaderTicket: 0, maximumHeaderTicket: 0 } : undefined;
  const canvasSegmentsScope: CanvasSegmentsScope | undefined = strategy === "current-canvas-segments-cache"
    ? { headers: { types: new Map(), latestHeaderTime: 0, latestHeaderCount: 0, latestHeaderTicket: 0, maximumHeaderTicket: 0 }, streams: new Map() } : undefined;
  for (const [chunkIndex, chunk] of chunks.entries()) {
    let current: ObjectData | undefined, documentCacheEdit: ObjectData | undefined, edit: ObjectData | undefined;
    let firstSymbolUuid: unknown;
    let targetFragmentRecords = 0;
    const records = chunk.split("|\n"); if (records.at(-1) === "") { records.pop(); }
    for (const raw of records) {
      need(Buffer.byteLength(raw) <= 262_144, "individual raw record exceeds the cooperative proof bound");
      const parsed = parseNativeRecords(raw)[0]; need(parsed !== undefined, "empty record refused");
      const { header } = parsed;
      if (header["ticket"] !== undefined) { maximum = Math.max(maximum, number(header["ticket"])); }
      if (header["type"] === "EDIT_HEAD") { edit = body(parsed.body); }
      else if (header["type"] === "DOCHEAD") {
        current = body(parsed.body);
        if (current["docType"] === "SYMBOL" && firstSymbolUuid === undefined) { firstSymbolUuid = current["uuid"]; }
        edit ??= { uuid: current["uuid"], username: isRecord(current["user"]) ? current["user"]["username"] : undefined,
          nickname: isRecord(current["user"]) ? current["user"]["nickname"] : undefined, updateTime: current["updateTime"] };
        if (current["uuid"] === targetUuid) {
          targetFragmentRecords += 1;
          observeSingleCanvasHeader(singleCanvasScope, current, header["ticket"]);
          observeCanvasSegmentsHeader(canvasSegmentsScope, current, edit, header["ticket"], chunkIndex, firstSymbolUuid, targetUuid);
          documentCacheEdit ??= { uuid: current["uuid"], username: isRecord(current["user"]) ? current["user"]["username"] : undefined,
            nickname: isRecord(current["user"]) ? current["user"]["nickname"] : undefined, updateTime: current["updateTime"] };
          selected = applyHeader(current, strategy === "raw" ? edit : documentCacheEdit, header["ticket"], selected);
        }
      } else if (current?.["uuid"] === targetUuid) {
        targetFragmentRecords += 1;
        const id = text(header["id"]), type = text(header["type"]);
        // Native normalization is type-sensitive; these types are not symbol canvas primitives in the first profile.
        need(type !== "NET" && type !== "RULE_SELECTOR", "case-insensitive cross-type key replay is not admitted");
        need(type !== "META" || (id === "META" && parsed.body !== null), "noncanonical target META history refused");
        const hasClient = Boolean(header["client"]);
        const client = text(hasClient ? header["client"] : current["client"]), ticket = number(header["ticket"]);
        need(/^[a-f0-9]{16}$/u.test(client), "record client refused");
        const atom: Atom = { id, type, ticket, client, raw: raw.slice(raw.indexOf("||") + 2) };
        observeSingleCanvasAtom(singleCanvasScope, atom, chunkIndex);
        observeCanvasSegmentsAtom(canvasSegmentsScope, atom, chunkIndex);
        if (applyAtom(atoms, atom)) { metadataTicket = Math.max(metadataTicket, ticket); }
      }
      steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
    }
    need(singleCanvasScope === undefined || targetFragmentRecords !== 1, "lone target DOCHEAD is omitted from the document cache");
    need(canvasSegmentsScope === undefined || targetFragmentRecords !== 1, "canvas-segments refuses a lone target DOCHEAD cache fragment");
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
  const idsByLine = new Map<string, string>();
  for (const chain of atoms.values()) {
    const atom = chain.last;
    if (!IGNORED.has(atom.type)) {
      const encoded = line(atom.type, atom.ticket, atom.id, atom.raw, atom.ticket === chain.first.ticket ? undefined : chain.first.ticket);
      canvas.push(encoded); if (canvasSegmentsScope !== undefined) { idsByLine.set(encoded, atom.id); }
    }
    steps += 1; if (steps % 128 === 0) { await yieldProofEventLoop(); }
  }
  need(strategy !== "current-document-cache" || canvas.length === 0, "document-cache canvas projection is not admitted");
  if (singleCanvasScope !== undefined) {
    need(singleCanvasScope.canvasChunkIndex !== undefined && canvas.length > 0, "single-canvas-segment requires historical canvas atoms");
    need(singleCanvasScope.latestHeaderCount === 1 && singleCanvasScope.latestHeaderTicket === singleCanvasScope.maximumHeaderTicket,
      "canvas header depends on segment arrival order");
  }
  if (canvasSegmentsScope !== undefined) {
    const { headers } = canvasSegmentsScope;
    need(canvasSegmentsScope.streams.size > 0 && canvas.length > 0, "canvas-segments requires historical canvas atoms");
    need(headers.latestHeaderCount === 1 && headers.latestHeaderTicket === headers.maximumHeaderTicket,
      "canvas header depends on segment arrival order");
  }
  const common = { targetUuid, maximumTicket,
    rawHistorySha256: sha256Json(chunks.map((chunk) => digest(chunk))), rawHistoryBytes, canvasRecords: canvas.length,
    executionAuthorized: false, producerBindingVerified: false } as const;
  let descriptor: Projection;
  if (strategy === "raw") { descriptor = Object.freeze({ profile: "private.saved-symbol-getstr-projection.v1", ...common }); }
  else if (canvasSegmentsScope !== undefined) {
    const { latestHeaderChunkIndex, rawHeader } = canvasSegmentsScope;
    need(latestHeaderChunkIndex !== undefined && rawHeader !== undefined, "canvas-segments selected header missing");
    descriptor = Object.freeze({ profile: "private.current-canvas-segments-saved-symbol-getstr-projection.v1", ...common,
      workerSourceSha256: CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256, cacheBranchObserved: false,
      canvasSegmentCount: canvasSegmentsScope.streams.size, maximumTargetHeaderTime: canvasSegmentsScope.headers.latestHeaderTime,
      rawPrefixOrderIndependent: !canvasSegmentsScope.streams.has(latestHeaderChunkIndex) || JSON.stringify(rawHeader.user) === JSON.stringify(selected.user),
      segmentOrderIndependent: false, maximumConcurrentChunks: 101 });
  }
  else if (singleCanvasScope === undefined) {
    descriptor = Object.freeze({ profile: "private.current-document-cache-saved-symbol-getstr-projection.v1", ...common,
      workerSourceSha256: CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256, cacheBranchObserved: false });
  } else {
    const { canvasChunkIndex } = singleCanvasScope;
    need(canvasChunkIndex !== undefined, "single-canvas-segment index missing");
    descriptor = Object.freeze({ profile: "private.current-single-canvas-segment-saved-symbol-getstr-projection.v1", ...common,
      workerSourceSha256: CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256, cacheBranchObserved: false,
      canvasChunkIndex, maximumTargetHeaderTime: singleCanvasScope.latestHeaderTime, segmentOrderIndependent: true });
  }
  originals.set(descriptor, { descriptor, header: selected, metadata, metadataTicket, currentEditVersion, canvas,
    ...(canvasSegmentsScope === undefined ? {} : { canvasOrder: { streams: [...canvasSegmentsScope.streams.values()], idsByLine } }) });
  return descriptor;
}

/** Canvas-segments descriptors return one legal representative. Permuting its
 * exact canvas lines changes neither UTF8 bytes nor JSON-envelope byte size.
 */
export function expectedSavedSymbolContent(original: Projection, currentWorkerClient: string): string {
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
export function verifySavedSymbolContent(original: Projection, observation: unknown): Readonly<Record<string, unknown>> {
  need(isRecord(observation) && observation["profile"] === "private.saved-symbol-content-observation.v1" && observation["targetUuid"] === original.targetUuid &&
    observation["maximumTicket"] === original.maximumTicket && typeof observation["workerClient"] === "string" && typeof observation["content"] === "string",
  "native observation shape/identity differs");
  const expected = expectedSavedSymbolContent(original, observation["workerClient"]);
  need(observation["content"] === expected, "native saved content differs from the complete raw-history projection");
  return Object.freeze({ profile: "private.saved-symbol-content-relation.v1", targetUuid: original.targetUuid, rawHistorySha256: original.rawHistorySha256,
    contentSha256: digest(expected), contentBytes: Buffer.byteLength(expected), exactContent: true, producerBindingVerified: false, executionAuthorized: false, completionProved: false });
}

/** Two exact source-derived strings, never field normalization. A match identifies
 * the modeled projection, not an observed cache branch. Raw wins identical ties.
 */
export function verifyCurrentSavedSymbolProjectionAlternatives(raw: SavedSymbolProjection,
  documentCache: CurrentDocumentCacheSavedSymbolProjection | undefined, observation: unknown): Readonly<Record<string, unknown>> {
  const retained = originals.get(raw);
  need(retained !== undefined && retained.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion &&
    raw.profile === "private.saved-symbol-getstr-projection.v1", "current original raw projection required");
  if (documentCache !== undefined) {
    const cached = originals.get(documentCache);
    need(cached !== undefined && documentCache.profile === "private.current-document-cache-saved-symbol-getstr-projection.v1" &&
      cached.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion &&
      documentCache.workerSourceSha256 === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256 && documentCache.canvasRecords === 0 &&
      documentCache.rawHistorySha256 === raw.rawHistorySha256 && documentCache.rawHistoryBytes === raw.rawHistoryBytes &&
      documentCache.targetUuid === raw.targetUuid && documentCache.maximumTicket === raw.maximumTicket && raw.canvasRecords === 0,
    "document-cache alternative has different complete history");
  }
  need(isRecord(observation) && typeof observation["workerClient"] === "string" && typeof observation["content"] === "string", "native observation shape/identity differs");
  const matched = observation["content"] === expectedSavedSymbolContent(raw, observation["workerClient"]) ? raw : documentCache;
  need(matched !== undefined, "native saved content differs from the complete raw-history projection");
  return Object.freeze({ ...verifySavedSymbolContent(matched, observation),
    matchedProjection: matched === raw ? "complete-raw-history" : "current-document-cache",
    workerSourceSha256: CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256, cacheBranchObserved: false });
}

/** Separate exact relation for the disposable-only single-canvas profile.
 * This helper is data-only; caller-owned JSON cannot authorize a saved read.
 * The META-only selector above deliberately continues to reject this profile.
 */
export function verifyCurrentSingleCanvasSegmentSavedSymbolProjectionAlternatives(raw: SavedSymbolProjection,
  documentCache: CurrentSingleCanvasSegmentSavedSymbolProjection, observation: unknown): Readonly<Record<string, unknown>> {
  const cached = originals.get(documentCache), retained = originals.get(raw);
  need(retained !== undefined && cached !== undefined && raw.profile === "private.saved-symbol-getstr-projection.v1" &&
    documentCache.profile === "private.current-single-canvas-segment-saved-symbol-getstr-projection.v1" &&
    retained.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion &&
    cached.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion &&
    documentCache.workerSourceSha256 === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256 &&
    documentCache.rawHistorySha256 === raw.rawHistorySha256 && documentCache.rawHistoryBytes === raw.rawHistoryBytes &&
    documentCache.targetUuid === raw.targetUuid && documentCache.maximumTicket === raw.maximumTicket &&
    raw.canvasRecords > 0 && documentCache.canvasRecords === raw.canvasRecords,
  "single-canvas-segment alternative has different complete history");
  need(isRecord(observation) && typeof observation["workerClient"] === "string" && typeof observation["content"] === "string", "native observation shape/identity differs");
  const matched = observation["content"] === expectedSavedSymbolContent(raw, observation["workerClient"]) ? raw : documentCache;
  return Object.freeze({ ...verifySavedSymbolContent(matched, observation),
    matchedProjection: matched === raw ? "complete-raw-history" : "current-single-canvas-segment-cache",
    workerSourceSha256: CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256, cacheBranchObserved: false });
}

/** Each occurrence is advanced once. Processing a previously seen ID cannot
 * change first-arrival order, so eagerly consuming it cannot lose a witness.
 * The next unseen ID must be at a stream's front; choosing it witnesses one
 * more native Map insertion. Tombstones remain occurrences and output keys.
 */
function verifyCanvasFirstArrivalOrder(streams: readonly (readonly string[])[], ids: readonly string[]): void {
  const cursors = streams.map(() => 0), seen = new Set<string>(), waiting = new Map<string, number[]>();
  function advance(index: number): void {
    const stream = streams[index]; let cursor = cursors[index];
    need(stream !== undefined && cursor !== undefined, "canvas stream cursor missing");
    while (cursor < stream.length) {
      const id = stream[cursor]; need(id !== undefined, "canvas occurrence missing");
      if (!seen.has(id)) {
        const indexes = waiting.get(id);
        if (indexes === undefined) { waiting.set(id, [index]); } else { indexes.push(index); }
        break;
      }
      cursor += 1;
    }
    cursors[index] = cursor;
  }
  for (const index of streams.keys()) { advance(index); }
  for (const id of ids) {
    const indexes = waiting.get(id);
    need(!seen.has(id) && indexes !== undefined, "canvas first-arrival order has no stream witness");
    seen.add(id); waiting.delete(id);
    for (const index of indexes) { advance(index); }
  }
  need(streams.every((stream, index) => cursors[index] === stream.length), "canvas first-arrival order omits occurrences");
}

/** Exact bounded line membership plus a producer-derived order witness. A
 * relation accepts no caller-selected profile, source normalization or cache
 * provenance claim. Existing META-only and single-segment selectors stay fixed.
 */
export function verifyCurrentCanvasSegmentsSavedSymbolProjectionAlternatives(raw: SavedSymbolProjection,
  documentCache: CurrentCanvasSegmentsSavedSymbolProjection, observation: unknown): Readonly<Record<string, unknown>> {
  const cached = originals.get(documentCache), retained = originals.get(raw);
  need(retained !== undefined && cached !== undefined && raw.profile === "private.saved-symbol-getstr-projection.v1" &&
    documentCache.profile === "private.current-canvas-segments-saved-symbol-getstr-projection.v1" &&
    retained.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion &&
    cached.currentEditVersion === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.editorVersion &&
    documentCache.workerSourceSha256 === CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256 &&
    documentCache.rawHistorySha256 === raw.rawHistorySha256 && documentCache.rawHistoryBytes === raw.rawHistoryBytes &&
    documentCache.targetUuid === raw.targetUuid && documentCache.maximumTicket === raw.maximumTicket &&
    raw.canvasRecords > 0 && documentCache.canvasRecords === raw.canvasRecords && cached.canvasOrder !== undefined,
  "canvas-segments alternative has different complete history");
  need(isRecord(observation) && observation["profile"] === "private.saved-symbol-content-observation.v1" &&
    observation["targetUuid"] === raw.targetUuid && observation["maximumTicket"] === raw.maximumTicket &&
    typeof observation["workerClient"] === "string" && typeof observation["content"] === "string", "native observation shape/identity differs");
  const content = observation["content"], workerClient = observation["workerClient"];
  const cacheContent = expectedSavedSymbolContent(documentCache, workerClient), rawContent = expectedSavedSymbolContent(raw, workerClient);
  if (content === rawContent) {
    return Object.freeze({ ...verifySavedSymbolContent(raw, observation), matchedProjection: "complete-raw-history",
      workerSourceSha256: CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256, cacheBranchObserved: false });
  }
  need(content.length <= Math.max(rawContent.length, cacheContent.length), "native saved content exceeds exact projection bound");
  const records = content.split("|\n");
  need(records.length === cached.canvas.length + 3, "native saved content has different canvas membership");
  const cachePrefix = cacheContent.split("|\n", 3).join("|\n"), prefix = records.slice(0, 3).join("|\n");
  const isCachePrefix = prefix === cachePrefix;
  need(isCachePrefix || (documentCache.rawPrefixOrderIndependent && prefix === rawContent.split("|\n", 3).join("|\n")),
    "native saved header differs or constrains canvas arrival order");
  const ids = records.slice(3).map((record) => {
    const id = cached.canvasOrder?.idsByLine.get(record);
    need(id !== undefined, "native saved canvas line differs from complete raw history"); return id;
  });
  verifyCanvasFirstArrivalOrder(cached.canvasOrder.streams, ids);
  return Object.freeze({ profile: "private.saved-symbol-content-relation.v1", targetUuid: raw.targetUuid, rawHistorySha256: raw.rawHistorySha256,
    contentSha256: digest(content), contentBytes: Buffer.byteLength(content), exactContent: true, producerBindingVerified: false,
    executionAuthorized: false, completionProved: false, firstArrivalOrderWitness: true,
    matchedProjection: isCachePrefix ? "current-canvas-segments-cache" : "current-canvas-segments-raw-header",
    workerSourceSha256: CURRENT_SAVED_SYMBOL_DOCUMENT_CACHE_IMPLEMENTATION.sha256, cacheBranchObserved: false });
}
