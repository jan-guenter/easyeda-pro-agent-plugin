import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import process from "node:process";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { currentSymbolMetadataResultSchema } from "./current-symbol-metadata.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
// oxlint-disable-next-line import/max-dependencies -- Reuse the complete-project metadata preparation instead of creating a second serializer or duplicate-name rule.
import { prepareProjectSymbolMetadata } from "./project-symbol-metadata.ts";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/u);
const idSchema = z.string().regex(/^[a-f0-9]{32}$/u);
const symbolIdSchema = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u);
const maximumCheckpointBytes = 256 * 1024 * 1024;
// Preserve the native metadata and path UTF-16 budgets under Zod's code-point max.
const nativeText = (maximum: number): z.ZodString => z.string().max(maximum)
  .refine((value) => value.length <= maximum, "Symbol preparation text exceeds its UTF-16 unit bound.");
const checkpointSchema = z.object({ path: nativeText(4096).min(1).refine((path) =>
  isAbsolute(path) && resolve(path) === path && path.endsWith(".eprj2"), "Checkpoint must be a canonical absolute .eprj2 path."),
bytes: z.number().int().positive().max(maximumCheckpointBytes), sha256: hashSchema }).strict();
const targetSchema = z.object({ projectUuid: hashSchema, branchUuid: idSchema, ownerUuid: idSchema, symbolUuid: symbolIdSchema }).strict();
const patchSchema = z.object({ name: nativeText(512).min(1).refine((name) => name.trim().length > 0, "Name must not be blank.").optional(),
  description: nativeText(65_536).optional() }).strict().refine((patch) => patch.name !== undefined || patch.description !== undefined,
  "A name or non-null description patch is required.");
export const currentSymbolMetadataPreparationRequestSchema = z.object({ checkpoint: checkpointSchema, target: targetSchema, patch: patchSchema,
  observationProjection: currentSymbolMetadataResultSchema.optional() }).strict();
export type CurrentSymbolMetadataPreparationRequest = z.infer<typeof currentSymbolMetadataPreparationRequestSchema>;

const metadataSchema = z.object({ name: nativeText(512).min(1), description: nativeText(65_536),
  tags: z.array(nativeText(512)).max(256), source: nativeText(4096) }).strict();
const peerNamesSchema = z.array(nativeText(512).min(1)).max(4096);
export const currentSymbolMetadataPreparationResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.current-symbol-metadata-preparation.v1"), offline: z.literal(true),
  checkpoint: checkpointSchema, target: targetSchema, patch: patchSchema,
  history: z.object({ profile: z.literal("easyeda.native-history.linear-gcm-gzip.v1"), headHistoryUuid: idSchema,
    historyRows: z.number().int().positive().max(4096), chunks: z.number().int().positive(), plaintextBytes: z.number().int().nonnegative(),
    documents: z.number().int().positive(), selectedBranchRecordsSha256: hashSchema, targetHeaderSha256: hashSchema,
    targetHeaderEditVersion: nativeText(128).min(1).nullable() }).strict(),
  metadata: z.object({ before: metadataSchema, after: metadataSchema, peerNames: peerNamesSchema }).strict(),
  correlation: z.object({ observationProjectionSha256: hashSchema.nullable(), metadataMatches: z.boolean(),
    freshnessVerified: z.literal(false), ticketCompared: z.literal(false), versionCompared: z.literal(false) }).strict(),
  liveSourceRead: z.literal(false), cadAuthority: z.literal(false), writerReady: z.literal(false), inverseReady: z.literal(false),
  executionAuthorized: z.literal(false), persistenceVerified: z.literal(false), sqlInventoryVerified: z.literal(false), preparationSha256: hashSchema,
}).strict();
export type CurrentSymbolMetadataPreparationResult = z.infer<typeof currentSymbolMetadataPreparationResultSchema>;

const limitations = [
  "Reads an existing owner-owned, owner-only, single-link .eprj2 checkpoint below the managed control-root checkpoints directory. Missing paths stay missing. No original design, receipt, journal, application or network access is performed.",
  "Decodes the complete selected linked-history branch, verifies exact project/branch/owner and an undeleted ordinary SYMBOL with strict DOCHEAD and five-field META, and checks all active peer symbol names. Unsupported history, metadata, links, sidecars, identity changes or bytes refuse.",
  "The result prepares only name and non-null description; exact tags/source and complete selected-branch record hash are retained. It is not complete SQL inventory, all-branch comparison, a lock, writer-ready plan, inverse-ready plan, persistence proof or execution authority.",
  "Optional observationProjection is the exact core currentSymbolMetadataResultSchema projection, not the decorated tool envelope. Explicitly select ok/kind/method/target/value/samples/implementationKind/targetClosedInRegistry/hiddenEditorsVerified/workerIdentityVerified/cadAuthority/persistenceVerified/sourceMembershipVerified from the observer result. Supplied values establish no provenance or freshness. Ticket and version are not compared; source/version getter fallback semantics are not treated as lossless storage evidence.",
  "The complete {offline:true,result} JSON response must fit 512 KiB of UTF-8. Oversized metadata/peer-name results refuse without truncation or artifact publication.",
] as const;

export function queryCurrentSymbolMetadataPreparation(input: unknown = {}): Record<string, unknown> {
  const query = z.object({ includeSchemas: z.boolean().default(false) }).strict().parse(input);
  return { offline: true, executionAuthorized: false, writerReady: false, inverseReady: false,
    schema: "easyeda-pro-control.current-symbol-metadata-preparation.v1", limitations: [...limitations],
    provenance: { workerSha256: "b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928",
      serializer: "DOCHEAD xt at 241441; SYMBOL metaData at 661091; updateString at 1937501", liveValidation: "not-recorded" },
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(currentSymbolMetadataPreparationRequestSchema),
      resultSchema: z.toJSONSchema(currentSymbolMetadataPreparationResultSchema) } : {}) };
}
export function validateCurrentSymbolMetadataPreparationArguments(input: unknown): Record<string, unknown> {
  const parsed = currentSymbolMetadataPreparationRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false, writerReady: false } : {
    valid: false, executionAuthorized: false, writerReady: false,
    issues: parsed.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) };
}

function requireCheckpoint(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current symbol metadata checkpoint identity, scope or stability is not proven."); }
}
function sameFile(before: BigIntStats, after: BigIntStats): boolean {
  return after.isFile() && !after.isSymbolicLink() && before.dev === after.dev && before.ino === after.ino &&
    before.uid === after.uid && before.mode === after.mode && before.nlink === after.nlink && before.size === after.size &&
    before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs;
}
async function verifyBytes(file: FileHandle, descriptor: CurrentSymbolMetadataPreparationRequest["checkpoint"]): Promise<void> {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of file.createReadStream({ autoClose: false, start: 0 })) {
    requireCheckpoint(Buffer.isBuffer(chunk)); bytes += chunk.length;
    requireCheckpoint(bytes <= descriptor.bytes); hash.update(chunk);
  }
  requireCheckpoint(bytes === descriptor.bytes && hash.digest("hex") === descriptor.sha256);
}
async function requireNoSidecars(path: string): Promise<void> {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    let missing = false;
    try { await lstat(`${path}${suffix}`); }
    catch (error) { requireCheckpoint(isRecord(error) && error["code"] === "ENOENT"); missing = true; }
    requireCheckpoint(missing);
  }
}

/** Prepare from retained checkpoint descriptors only. No original-source path,
 * native executable, writer expression or caller-selected reader is accepted.
 */
export function prepareCurrentSymbolMetadata(input: unknown): Promise<CurrentSymbolMetadataPreparationResult> {
  return prepareMetadata(input, false);
}
/** Private inverse preparation preserves the saved reader's exact atom headers.
 * This read-only projection does not issue an owner or execution permission.
 */
export function prepareCurrentInverseSymbolMetadata(input: unknown): Promise<CurrentSymbolMetadataPreparationResult> {
  return prepareMetadata(input, true);
}
async function prepareMetadata(input: unknown, preserveHeaders: boolean): Promise<CurrentSymbolMetadataPreparationResult> {
  const request = currentSymbolMetadataPreparationRequestSchema.parse(input);
  const checkpointRoot = join(controlDataDirectory(), "checkpoints");
  const child = relative(checkpointRoot, request.checkpoint.path);
  requireCheckpoint(child.length > 0 && child !== ".." && !child.startsWith(`..${sep}`) && !isAbsolute(child));
  const root = await controlRootCapability(false);
  const directory = await root.openDirectory(dirname(request.checkpoint.path), false);
  try {
    const boundPath = `/proc/self/fd/${String(directory.handle.fd)}/${basename(request.checkpoint.path)}`;
    const named = await lstat(boundPath, { bigint: true });
    requireCheckpoint(named.isFile() && !named.isSymbolicLink() && named.nlink === 1n && named.mode % 64n === 0n && named.size === BigInt(request.checkpoint.bytes) &&
      (typeof process.getuid !== "function" || named.uid === BigInt(process.getuid())));
    // oxlint-disable-next-line no-bitwise -- Refuse substituted symlinks and FIFOs without opening a live pathname elsewhere.
    const file = await open(boundPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const before = await file.stat({ bigint: true }); requireCheckpoint(sameFile(named, before));
      // The maintained decoder hashes and reads its own retained file descriptor.
      // Its only pathname is relative to our retained managed parent directory.
      const history = await readNativeHistoryCheckpoint({ checkpointPath: boundPath, expectedSha256: request.checkpoint.sha256,
        projectUuid: request.target.projectUuid, ...(preserveHeaders ? { libraryAtomHeaders: "preserve" as const } : {}) });
      requireCheckpoint(history.projectUuid === request.target.projectUuid && history.branchUuid === request.target.branchUuid &&
        history.projectOwnerUuid === request.target.ownerUuid);
      const plan = prepareProjectSymbolMetadata({ id: "offline-current-symbol-metadata", action: "library.symbol.modify",
        libraryUuid: request.target.projectUuid, target: { uuid: request.target.symbolUuid }, patch: request.patch }, history);
      const target = history.documents.find((document) => document.uuid === request.target.symbolUuid);
      requireCheckpoint(target !== undefined);
      const observation = request.observationProjection;
      if (observation !== undefined) {
        const value = observation.value;
        requireCheckpoint(observation.target.projectUuid === request.target.projectUuid && observation.target.branchUuid === request.target.branchUuid &&
          observation.target.documentUuid !== request.target.symbolUuid && value.projectUuid === request.target.projectUuid &&
          value.uuid === request.target.symbolUuid && value.ownerUuid === request.target.ownerUuid && value.name === plan.beforeTitle &&
          value.description === plan.beforeDescription && value.source === plan.beforeSource &&
          canonicalJson(JSON.parse(value.tagsJson) as unknown) === canonicalJson(plan.beforeTags));
      }
      const beforeMetadata = { name: plan.beforeTitle, description: plan.beforeDescription, tags: plan.beforeTags, source: plan.beforeSource };
      const prepared = { schema: "easyeda-pro-control.current-symbol-metadata-preparation.v1", offline: true,
        checkpoint: request.checkpoint, target: request.target, patch: request.patch,
        history: { profile: history.profile, headHistoryUuid: history.headHistoryUuid, historyRows: history.historyRowCount,
          chunks: history.chunkCount, plaintextBytes: history.plaintextBytes, documents: history.documents.length,
          selectedBranchRecordsSha256: plan.beforeProjectSha256, targetHeaderSha256: sha256Json(target.metadata), targetHeaderEditVersion: plan.headerEditVersion },
        metadata: { before: beforeMetadata, after: { ...beforeMetadata, name: plan.desiredTitle, description: plan.desiredDescription }, peerNames: plan.peerTitles },
        correlation: { observationProjectionSha256: observation === undefined ? null : sha256Json(observation), metadataMatches: observation !== undefined,
          freshnessVerified: false, ticketCompared: false, versionCompared: false },
        liveSourceRead: false, cadAuthority: false, writerReady: false, inverseReady: false, executionAuthorized: false,
        persistenceVerified: false, sqlInventoryVerified: false };
      const result = currentSymbolMetadataPreparationResultSchema.parse({ ...prepared, preparationSha256: sha256Json(prepared) });
      if (Buffer.byteLength(JSON.stringify({ offline: true, result }), "utf8") > 512 * 1024) {
        throw new Error("Current symbol metadata preparation exceeds the 512 KiB offline response limit.");
      }
      await verifyBytes(file, request.checkpoint);
      requireCheckpoint(sameFile(before, await file.stat({ bigint: true })) && sameFile(before, await lstat(boundPath, { bigint: true })));
      const currentDirectory = await root.openDirectory(directory.absolute, false);
      try { requireCheckpoint(currentDirectory.info.dev === directory.info.dev && currentDirectory.info.ino === directory.info.ino); }
      finally { await currentDirectory.handle.close(); }
      await requireNoSidecars(boundPath);
      await root.assertCurrent();
      return result;
    } finally { await file.close(); }
  } finally { await directory.handle.close(); }
}
