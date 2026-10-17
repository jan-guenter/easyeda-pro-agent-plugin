/** Data-only preparation from one existing managed checkpoint. Original receipt
 * identity is retained for its issuer; hashes do not issue lifecycle authority.
 */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { currentClosedSymbolMetadataResultSchema } from "./current-symbol-closed-target.ts";
// oxlint-disable-next-line import/max-dependencies -- Reuse the maintained closed observer and descriptor-bound history decoder instead of duplicating either trust boundary.
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";

const maximumBytes = 256 * 1024 * 1024;
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const id = z.string().regex(/^[a-f0-9]{32}$/u);
const nativeId = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const decimal = z.string().regex(/^(?:0|[1-9][0-9]{0,39})$/u);
const absolutePath = z.string().min(1).max(4096).refine(path => isAbsolute(path) && resolve(path) === path);
const identity = z.object({ birthtimeNs: decimal, ctimeNs: decimal, dev: decimal, ino: decimal }).strict();
const stat = z.object({ size: decimal, mtimeNs: decimal, ctimeNs: decimal }).strict();
const receiptSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"),
  createdAt: z.iso.datetime(), source: absolutePath.refine(path => path.endsWith(".eprj2")),
  checkpoint: absolutePath.refine(path => path.endsWith(".eprj2")), receiptPath: absolutePath.refine(path => path.endsWith(".checkpoint.json")),
  sourceIdentity: identity, checkpointIdentity: identity, sourceStatBefore: stat, sourceStatAfter: stat,
  sourceDataVersion: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash, receiptSha256: hash,
  quickCheck: z.object({ sourceBefore: z.literal("ok"), sourceAfter: z.literal("ok"), checkpoint: z.literal("ok") }).strict(),
  integrityModel: z.literal("Unkeyed SHA-256 values detect accidental corruption. They do not authenticate files against a writer with access to this directory."),
}).strict();
const sourceSchema = z.object({ projectUuid: hash, branchUuid: id, symbolUuid: nativeId }).strict();
const metadataSchema = z.object({ title: z.string().min(1).max(512), description: z.string().max(65_536),
  tags: z.array(z.string().max(512)).max(256), docType: z.literal(2), source: z.string().max(4096) }).strict();
const headerSchema = z.object({ uuid: nativeId, docType: z.literal("SYMBOL"), client: z.string().regex(/^[a-f0-9]{16}$/u),
  updateTime: z.number().int().nonnegative().max(8_640_000_000_000_000), version: z.string().min(1).max(128),
  editVersion: z.string().min(1).max(128).optional(), user: z.record(z.string(), z.unknown()).optional() }).strict();
const requestSchema = z.object({ checkpoint: receiptSchema, source: sourceSchema, observation: currentClosedSymbolMetadataResultSchema }).strict();

export interface CurrentSymbolCopyCheckpointPreparation {
  readonly profile: "private.current-symbol-copy-checkpoint-preparation.v1";
  readonly checkpoint: CheckpointReceipt;
  readonly target: Readonly<z.infer<typeof sourceSchema> & { ownerUuid: string }>;
  readonly sourceMetadata: Readonly<Omit<z.infer<typeof metadataSchema>, "tags"> & { tags: readonly string[] }>;
  readonly sourceDocumentSemanticSha256: string;
  readonly sourceDocumentHeaderSha256: string;
  readonly sourceDocumentRecordsSha256: string;
  readonly historySemanticSha256: string;
  readonly observationProjectionSha256: string;
  readonly ticketCompared: false;
  readonly liveSourceRead: false;
  readonly sqlInventoryVerified: false;
  readonly producerBindingVerified: false;
  readonly executionAuthorized: false;
  readonly persistenceVerified: false;
  readonly preparationSha256: string;
}
function need(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current symbol copy checkpoint identity, scope or stability is not proven."); }
}
function plainData(input: unknown, depth = 0): unknown {
  need(depth <= 6);
  if (input === null || typeof input === "string" || typeof input === "boolean") { return input; }
  if (typeof input === "number") { need(Number.isFinite(input) && !Object.is(input, -0)); return input; }
  need(typeof input === "object");
  if (Array.isArray(input)) {
    need(Object.getPrototypeOf(input) === Array.prototype && input.length <= 256 && Reflect.ownKeys(input).length === input.length + 1);
    const values: unknown[] = [];
    for (let index = 0; index < input.length; index += 1) {
      const entry = Object.getOwnPropertyDescriptor(input, String(index)); need(entry !== undefined && Object.hasOwn(entry, "value"));
      values.push(plainData(entry.value as unknown, depth + 1));
    }
    return values;
  }
  need(Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null);
  const keys = Reflect.ownKeys(input), result: Record<string, unknown> = {}; need(keys.length <= 32);
  for (const key of keys) {
    const entry = Object.getOwnPropertyDescriptor(input, key);
    need(typeof key === "string" && entry !== undefined && Object.hasOwn(entry, "value"));
    Object.defineProperty(result, key, { value: plainData(entry.value as unknown, depth + 1), enumerable: true });
  }
  return result;
}
function originalReceipt(input: unknown): asserts input is CheckpointReceipt { receiptSchema.parse(plainData(input)); }
function sameFile(before: BigIntStats, after: BigIntStats): boolean {
  return after.isFile() && !after.isSymbolicLink() && before.dev === after.dev && before.ino === after.ino &&
    before.birthtimeNs === after.birthtimeNs && before.uid === after.uid && before.mode === after.mode && before.nlink === after.nlink &&
    before.size === after.size && before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs;
}
async function noSidecars(path: string): Promise<void> {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    let absent = false;
    try { await lstat(`${path}${suffix}`); }
    catch (error) { need(isRecord(error) && error["code"] === "ENOENT"); absent = true; }
    need(absent);
  }
}
async function verifyBytes(file: FileHandle, size: bigint, expectedHash: string): Promise<void> {
  const digest = createHash("sha256"); let bytes = 0;
  for await (const chunk of file.createReadStream({ autoClose: false, start: 0 })) {
    need(Buffer.isBuffer(chunk)); bytes += chunk.length; need(bytes <= maximumBytes && BigInt(bytes) <= size); digest.update(chunk);
  }
  need(BigInt(bytes) === size && digest.digest("hex") === expectedHash);
}

/** No source pathname, receipt pathname or journal is read. Missing checkpoints
 * stay missing. The retained receipt itself is not frozen or altered here; its
 * original issuer must continue to own and revalidate that identity.
 */
export async function prepareCurrentSymbolCopyCheckpoint(input: unknown): Promise<CurrentSymbolCopyCheckpointPreparation> {
  const snapshot = plainData(input); need(Buffer.byteLength(JSON.stringify(snapshot)) <= 512 * 1024);
  const request = requestSchema.parse(snapshot);
  const checkpoint: unknown = Object.getOwnPropertyDescriptor(input, "checkpoint")?.value; originalReceipt(checkpoint);
  const receiptText = canonicalJson(request.checkpoint), { receiptSha256, ...receiptCore } = request.checkpoint;
  need(receiptSha256 === sha256Json(receiptCore) && request.checkpoint.sourceDumpSha256 === request.checkpoint.checkpointDumpSha256 &&
    dirname(request.checkpoint.checkpoint) === dirname(request.checkpoint.receiptPath) &&
    request.checkpoint.source !== request.checkpoint.checkpoint);
  const checkpointRoot = join(controlDataDirectory(), "checkpoints"), child = relative(checkpointRoot, request.checkpoint.checkpoint);
  need(child.length > 0 && child !== ".." && !child.startsWith(`..${sep}`) && !isAbsolute(child));
  const root = await controlRootCapability(false); await root.assertCurrent();
  const directory = await root.openDirectory(dirname(request.checkpoint.checkpoint), false);
  try {
    const boundPath = `/proc/self/fd/${String(directory.handle.fd)}/${basename(request.checkpoint.checkpoint)}`;
    await noSidecars(boundPath);
    const expected = request.checkpoint.checkpointIdentity, named = await lstat(boundPath, { bigint: true });
    need(named.isFile() && !named.isSymbolicLink() && named.nlink === 1n && named.mode % 64n === 0n && named.size > 0n && named.size <= BigInt(maximumBytes) &&
      (typeof process.getuid !== "function" || named.uid === BigInt(process.getuid())) && expected.dev === String(named.dev) && expected.ino === String(named.ino) &&
      expected.birthtimeNs === String(named.birthtimeNs) && expected.ctimeNs === String(named.ctimeNs));
    // oxlint-disable-next-line no-bitwise -- Retain a nonblocking read-only descriptor without following substituted symlinks or FIFOs.
    const file = await open(boundPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const before = await file.stat({ bigint: true }); need(sameFile(named, before));
      await root.assertCurrent(); await verifyBytes(file, before.size, request.checkpoint.checkpointSha256);
      const history = await readNativeHistoryCheckpoint({ checkpointPath: boundPath, expectedSha256: request.checkpoint.checkpointSha256,
        projectUuid: request.source.projectUuid, libraryAtomHeaders: "preserve", documentRecordHistory: "preserve" });
      need(history.projectUuid === request.source.projectUuid && history.branchUuid === request.source.branchUuid && id.safeParse(history.projectOwnerUuid).success);
      const matches = history.documents.filter(entry => entry.uuid === request.source.symbolUuid);
      const document = matches[0];
      need(matches.length === 1 && document?.docType === "SYMBOL" && !isNativeDocumentDeleted(document));
      const metaRows = document.records.filter(entry => entry.id === "META" || entry.type === "META");
      const meta = metaRows[0];
      need(metaRows.length === 1 && meta?.id === "META" && meta.type === "META");
      const header = headerSchema.parse(document.metadata), metadata = metadataSchema.parse(meta.body), raw = document.documentRecordHistory;
      need(header.uuid === document.uuid && raw !== undefined && raw.documentUuid === document.uuid &&
        raw.checkpointSha256 === request.checkpoint.checkpointSha256 && raw.recordCount >= 2);
      const observation = request.observation, value = observation.value;
      need(observation.target.projectUuid === request.source.projectUuid && observation.target.branchUuid === request.source.branchUuid &&
        observation.target.documentUuid !== request.source.symbolUuid && value.uuid === request.source.symbolUuid &&
        value.projectUuid === request.source.projectUuid && value.ownerUuid === history.projectOwnerUuid && value.name === metadata.title &&
        value.description === metadata.description && value.source === metadata.source && value.version === header.version &&
        canonicalJson(JSON.parse(value.tagsJson) as unknown) === canonicalJson(metadata.tags));
      const body = { profile: "private.current-symbol-copy-checkpoint-preparation.v1" as const, checkpoint,
        target: Object.freeze({ ...request.source, ownerUuid: value.ownerUuid }),
        sourceMetadata: Object.freeze({ ...metadata, tags: Object.freeze([...metadata.tags]) }),
        sourceDocumentSemanticSha256: document.semanticSha256, sourceDocumentHeaderSha256: sha256Json(document.metadata),
        sourceDocumentRecordsSha256: raw.chainSha256, historySemanticSha256: history.semanticSha256,
        observationProjectionSha256: sha256Json(observation), ticketCompared: false as const, liveSourceRead: false as const,
        sqlInventoryVerified: false as const, producerBindingVerified: false as const, executionAuthorized: false as const, persistenceVerified: false as const };
      const result: CurrentSymbolCopyCheckpointPreparation = Object.freeze({ ...body, preparationSha256: sha256Json(body) });
      need(Buffer.byteLength(JSON.stringify(result)) <= 512 * 1024);
      await verifyBytes(file, before.size, request.checkpoint.checkpointSha256);
      need(sameFile(before, await file.stat({ bigint: true })) && sameFile(before, await lstat(boundPath, { bigint: true })));
      const currentDirectory = await root.openDirectory(directory.absolute, false);
      try { need(currentDirectory.info.dev === directory.info.dev && currentDirectory.info.ino === directory.info.ino); }
      finally { await currentDirectory.handle.close(); }
      await noSidecars(boundPath); await root.assertCurrent();
      need(canonicalJson(plainData(checkpoint)) === receiptText && canonicalJson(plainData(input)) === canonicalJson(snapshot));
      return result;
    } finally { await file.close(); }
  } finally { await directory.handle.close(); }
}
