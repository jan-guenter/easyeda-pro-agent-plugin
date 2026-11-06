/* oxlint-disable import/max-dependencies -- A read-only closed capture joins original owner callbacks, exact file descriptors, managed publication, complete SQL and native history decoders. */
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { join, win32 } from "node:path";
import { z } from "zod";
import { types } from "node:util";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { managedFixtureClosedFileMetadataSchema, managedFixtureDestinationObservationSchema } from "./managed-fixture-destination.ts";
import type { ManagedFixtureClosedFileMetadata, ManagedFixtureDestinationObservation } from "./managed-fixture-destination.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import { qualifyGeneratedFixtureInitialSql } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";
import { qualifyGeneratedSchematicFixtureInitialSql } from "./managed-schematic-fixture-initial-sql.ts";
import type { QualifiedGeneratedSchematicFixtureTarget } from "./managed-schematic-fixture-initial-sql.ts";

const row = z.object({ header: z.looseObject({ type: z.string(), id: z.string().optional() }), body: z.record(z.string(), z.unknown()) });
function expectedProjection(archive: Buffer): Readonly<Record<string, unknown>> {
  const qualification = qualifyManagedFixtureArchive(archive), source = readManagedLibraryZip(archive).get(qualification.source.member);
  if (source === undefined || qualification.documents.length !== 1 || qualification.documents[0]?.documentType !== "PCB") { throw new Error("Closed fixture comparison requires the sole generated root PCB source."); }
  const rows = source.toString("utf8").slice(0, -2).split("|\n").map((text) => {
    const boundary = text.indexOf("||"); return row.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown });
  });
  const head = rows[0], meta = rows[1];
  if (head?.header.type !== "DOCHEAD" || meta?.header.type !== "META" || rows.slice(2).some((entry) => !["VIA", "LINE", "ARC"].includes(entry.header.type) || entry.header.id === undefined)) { throw new Error("Closed fixture comparison refuses an unexpected source family."); }
  return { documents: [{ uuid: qualification.documents[0].uuid, docType: "PCB", metadata: head.body,
    records: rows.slice(1).map((entry) => ({ id: entry.header.id, type: entry.header.type, body: entry.body })).toSorted((left, right) => String(left.id).localeCompare(String(right.id))) }] };
}
/** Pure comparison, not proof issuance. It commits the complete document/META
 * and primitive body/ID roster but deliberately does not accept DOCHEAD clocks,
 * upload tickets, encryption framing, full SQL effects or registration.
 */
export function compareGeneratedFixtureClosedSources(archive: Buffer, history: NativeHistorySnapshot): Readonly<Record<string, unknown>> {
  const expected = expectedProjection(archive); const actual = { documents: history.documents.map((document) => ({ uuid: document.uuid, docType: document.docType,
    metadata: document.metadata, records: document.records.map((entry) => ({ id: entry.id, type: entry.type, body: entry.body })).toSorted((left, right) => left.id.localeCompare(right.id)) })) };
  return { schema: "easyeda-pro-control.generated-fixture-closed-source-comparison.v1", expectedSha256: sha256Json(expected), actualSha256: sha256Json(actual),
    completeDocumentAndBodyRosterMatched: canonicalJson(expected) === canonicalJson(actual), documentCount: history.documents.length,
    docHeadClocksAccepted: false, uploadTicketsAccepted: false, completeSqlEffectsAccepted: false, registrationVerified: false,
    importedFixtureAccepted: false, designExecutionAuthorized: false };
}
/** Separate SCH/SCH_PAGE body comparison; no PCB projection is substituted. */
export function compareGeneratedSchematicFixtureClosedSources(archive: Buffer, history: NativeHistorySnapshot): Readonly<Record<string, unknown>> {
  const qualification = qualifyManagedFixtureArchive(archive), source = readManagedLibraryZip(archive).get(qualification.source.member);
  if (source === undefined || qualification.documents.length !== 2 || qualification.documents[0]?.documentType !== "SCH" || qualification.documents[1]?.documentType !== "SCH_PAGE") { throw new Error("Schematic closed source requires its complete SCH/SCH_PAGE roster."); }
  const documents: { uuid: string; docType: string; metadata: Record<string, unknown>; records: { id: string; type: string; body: Record<string, unknown> }[] }[] = [];
  for (const text of source.toString("utf8").slice(0, -2).split("|\n")) {
    const boundary = text.indexOf("||"), entry = row.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown });
    if (entry.header.type === "DOCHEAD") { documents.push({ uuid: String(entry.body["uuid"]), docType: String(entry.body["docType"]), metadata: entry.body, records: [] }); }
    else { const document = documents.at(-1); if (document === undefined || entry.header.id === undefined) { throw new Error("Schematic closed source lost its document/record identity."); }
      document.records.push({ id: entry.header.id, type: entry.header.type, body: entry.body }); }
  }
  const expected = { documents: documents.map(document => ({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
    records: document.records.toSorted((left, right) => left.id.localeCompare(right.id)) })) };
  const actual = { documents: history.documents.map(document => ({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
    records: document.records.map(entry => ({ id: entry.id, type: entry.type, body: entry.body })).toSorted((left, right) => left.id.localeCompare(right.id)) })) };
  return { schema: "easyeda-pro-control.generated-schematic-closed-source-comparison.v1", expectedSha256: sha256Json(expected), actualSha256: sha256Json(actual),
    completeDocumentAndBodyRosterMatched: canonicalJson(expected) === canonicalJson(actual), documentCount: history.documents.length,
    docHeadClocksAccepted: false, uploadTicketsAccepted: false, completeSqlEffectsAccepted: false, registrationVerified: false,
    importedFixtureAccepted: false, electricalConnectivityVerified: false, designExecutionAuthorized: false };
}
function sameFile(before: BigIntStats, after: BigIntStats): boolean {
  return after.isFile() && after.nlink === 1n && before.dev === after.dev && before.ino === after.ino && before.size === after.size && before.birthtimeNs === after.birthtimeNs && before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs;
}
export interface ManagedFixtureClosedSnapshotOptions {
  readonly archive: Buffer;
  /** Original retained helper observation, not a public pathname argument. */
  readonly destination: ManagedFixtureDestinationObservation;
  readonly assertOriginalOwner: () => void;
  /** Must reobserve the original retained runtime root and complete empty Job. */
  readonly observeOriginalTermination: () => Promise<void>;
  readonly inspectOriginalDestination: () => Promise<ManagedFixtureDestinationObservation>;
}
export interface ManagedFixtureWindowsClosedSnapshotOptions extends ManagedFixtureClosedSnapshotOptions {
  readonly captureWindowsFileMetadata: () => Promise<ManagedFixtureClosedFileMetadata>;
  readonly inspectWindowsFileMetadata: () => Promise<ManagedFixtureClosedFileMetadata>;
}
interface WindowsMetadataCapture { readonly capture: () => Promise<ManagedFixtureClosedFileMetadata>; readonly inspect: () => Promise<ManagedFixtureClosedFileMetadata> }
/** Snapshot every original input/callback before the first await. Public JSON,
 * accessors and replaced callbacks cannot redirect the original native lease. */
function windowsOptions(options: ManagedFixtureWindowsClosedSnapshotOptions): Readonly<{ options: ManagedFixtureClosedSnapshotOptions; metadata: WindowsMetadataCapture }> {
  const names = ["archive", "destination", "assertOriginalOwner", "observeOriginalTermination", "inspectOriginalDestination", "captureWindowsFileMetadata", "inspectWindowsFileMetadata"];
  if (types.isProxy(options) || Object.getPrototypeOf(options) !== Object.prototype || Reflect.ownKeys(options).length !== names.length || !names.every(name => {
    const descriptor = Object.getOwnPropertyDescriptor(options, name); return descriptor !== undefined && Object.hasOwn(descriptor, "value");
  })) { throw new Error("Original Windows capture requires exact plain data inputs."); }
  const archive = options.archive, destination = options.destination;
  const assertOwner = options.assertOriginalOwner, capture = options.captureWindowsFileMetadata, inspect = options.inspectWindowsFileMetadata,
    inspectDestination = options.inspectOriginalDestination, observe = options.observeOriginalTermination;
  if (!Buffer.isBuffer(archive) || types.isProxy(archive) || [assertOwner, capture, inspect, inspectDestination, observe].some(value => typeof value !== "function" || types.isProxy(value))) {
    throw new Error("Original Windows capture callbacks/archive differ.");
  }
  const copy = Buffer.from(archive), destinationCopy = structuredClone(destination);
  const values = names.map(name => { const descriptor = Object.getOwnPropertyDescriptor(options, name); const value: unknown = descriptor?.value; return { name, value }; });
  const current = (): void => {
    if (types.isProxy(options) || Object.getPrototypeOf(options) !== Object.prototype || Reflect.ownKeys(options).length !== names.length || values.some(({ name, value }) => {
      const descriptor = Object.getOwnPropertyDescriptor(options, name); return descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.value !== value;
    }) || !archive.equals(copy)) { throw new Error("Original Windows capture inputs/callback identities changed."); }
    assertOwner();
  };
  const checked = async <T>(call: () => Promise<T>): Promise<T> => { current(); try { return await call(); } finally { current(); } };
  current(); return { options: Object.freeze({ archive: copy, destination: destinationCopy, assertOriginalOwner: current,
    observeOriginalTermination: (): Promise<void> => checked(observe), inspectOriginalDestination: (): Promise<ManagedFixtureDestinationObservation> => checked(inspectDestination) }),
  metadata: Object.freeze({ capture: (): Promise<ManagedFixtureClosedFileMetadata> => checked(capture), inspect: (): Promise<ManagedFixtureClosedFileMetadata> => checked(inspect) }) };
}

/** New immutable artifacts only. No SQLite attachment to the native file, no
 * native close/open, registry write, deletion, persistent acceptance or native
 * owner transfer.
 * The coordinator supplies only its original live callbacks after its own
 * tracked cleanup has completed. Complete SQL data is retained for independent
 * effect qualification, rather than treating a few selected rows as sufficient.
 */
export async function captureManagedFixtureClosedSnapshot(options: ManagedFixtureClosedSnapshotOptions): Promise<Readonly<{
  report: Record<string, unknown>; qualifiedTarget: QualifiedGeneratedFixtureTarget | null;
}>> {
  const result = await captureClosedSnapshot(options, "pcb"); return { report: result.report, qualifiedTarget: result.qualifiedTarget };
}
/** Dedicated schematic data result. Its private target cannot satisfy any
 * existing PCB opening/staging issuer; a fresh SCH owner is still required. */
export async function captureManagedSchematicFixtureClosedSnapshot(options: ManagedFixtureClosedSnapshotOptions): Promise<Readonly<{
  report: Record<string, unknown>; qualifiedSchematicTarget: QualifiedGeneratedSchematicFixtureTarget | null;
}>> {
  const result = await captureClosedSnapshot(options, "schematic"); return { report: result.report, qualifiedSchematicTarget: result.qualifiedSchematicTarget };
}
/** New Windows-clock report profile; old v1 report shape and qualifier guards
 * remain unchanged. This original helper file handle stays held through release. */
export async function captureManagedFixtureClosedSnapshotWithWindowsMetadata(input: ManagedFixtureWindowsClosedSnapshotOptions): ReturnType<typeof captureManagedFixtureClosedSnapshot> {
  const retained = windowsOptions(input); const result = await captureClosedSnapshot(retained.options, "pcb", retained.metadata); return { report: result.report, qualifiedTarget: result.qualifiedTarget };
}
export async function captureManagedSchematicFixtureClosedSnapshotWithWindowsMetadata(input: ManagedFixtureWindowsClosedSnapshotOptions): ReturnType<typeof captureManagedSchematicFixtureClosedSnapshot> {
  const retained = windowsOptions(input); const result = await captureClosedSnapshot(retained.options, "schematic", retained.metadata); return { report: result.report, qualifiedSchematicTarget: result.qualifiedSchematicTarget };
}
async function captureClosedSnapshot(options: ManagedFixtureClosedSnapshotOptions, kind: "pcb" | "schematic", metadata?: WindowsMetadataCapture): Promise<Readonly<{
  report: Record<string, unknown>; qualifiedTarget: QualifiedGeneratedFixtureTarget | null; qualifiedSchematicTarget: QualifiedGeneratedSchematicFixtureTarget | null;
}>> {
  const destination = managedFixtureDestinationObservationSchema.parse(options.destination), qualification = qualifyManagedFixtureArchive(options.archive);
  if (destination.state !== "held" || destination.expectedBasename !== qualification.expectedDestinationBasename) { throw new Error("Closed fixture destination differs from the original generated archive."); }
  const windowsPath = win32.join(destination.windowsDirectory, destination.expectedBasename);
  const projectUuid = createHash("sha256").update(windowsPath, "utf8").digest("hex");
  const sourcePath = `/mnt/${windowsPath[0]?.toLowerCase()}/${windowsPath.slice(3).replaceAll("\\", "/")}`;
  let windowsFile: ManagedFixtureClosedFileMetadata | undefined;
  const validateWindowsFile = (raw: ManagedFixtureClosedFileMetadata): ManagedFixtureClosedFileMetadata => {
    const value = managedFixtureClosedFileMetadataSchema.parse(raw); const owner = value.destination;
    if (owner.nonce !== destination.nonce || owner.ownerId !== destination.ownerId || owner.windowsDirectory !== destination.windowsDirectory || owner.directoryIdentity !== destination.directoryIdentity ||
      owner.expectedBasename !== destination.expectedBasename || canonicalJson(owner.libraries) !== canonicalJson(destination.libraries) ||
      windowsFile !== undefined && canonicalJson(value.file) !== canonicalJson(windowsFile.file)) { throw new Error("Original Windows closed file metadata lost its destination/file binding."); }
    return value;
  };
  const owner = async (): Promise<void> => {
    options.assertOriginalOwner(); await options.observeOriginalTermination(); options.assertOriginalOwner();
    const current = managedFixtureDestinationObservationSchema.parse(await options.inspectOriginalDestination()); options.assertOriginalOwner();
    if (current.state !== "held" || current.ownerId !== destination.ownerId || current.windowsDirectory !== destination.windowsDirectory || current.directoryIdentity !== destination.directoryIdentity ||
        canonicalJson(current.libraries) !== canonicalJson(destination.libraries) || canonicalJson(current.entries) !== canonicalJson([destination.expectedBasename])) {
      throw new Error("Original closed fixture directory/watch identity or complete child roster changed.");
    }
    if (windowsFile !== undefined && metadata !== undefined) { validateWindowsFile(await metadata.inspect()); options.assertOriginalOwner(); }
  };
  await owner();
  if (metadata !== undefined) { windowsFile = validateWindowsFile(await metadata.capture()); options.assertOriginalOwner(); }
  if (await realpath(sourcePath) !== sourcePath) { throw new Error("Closed fixture source includes a filesystem alias."); }
  // oxlint-disable-next-line eslint/no-bitwise -- Read only, without following substituted links or blocking on a substituted FIFO.
  const source = await open(sourcePath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await source.stat({ bigint: true });
    if (!before.isFile() || before.nlink !== 1n || before.size < 512n || before.size > 64n * 1024n * 1024n) { throw new Error("Closed fixture is not a bounded single-link regular file."); }
    if (windowsFile !== undefined && before.size !== BigInt(windowsFile.file.bytes)) { throw new Error("Windows/Linux closed file size differs."); }
    const chunks: Buffer[] = []; let count = 0;
    for await (const chunk of source.createReadStream({ autoClose: false, highWaterMark: 1_048_576 })) {
      options.assertOriginalOwner(); if (!Buffer.isBuffer(chunk)) { throw new TypeError("Closed fixture copy returned non-binary data."); }
      count += chunk.length; if (BigInt(count) > before.size) { throw new Error("Closed fixture grew during snapshot capture."); } chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks), digest = createHash("sha256").update(bytes).digest("hex");
    if (windowsFile !== undefined && digest !== windowsFile.file.sha256) { throw new Error("Windows/Linux complete closed file hashes differ."); }
    const reprove = async (): Promise<void> => {
      options.assertOriginalOwner(); const after = await source.stat({ bigint: true }), named = await lstat(sourcePath, { bigint: true }); options.assertOriginalOwner();
      if (!sameFile(before, after) || !sameFile(before, named) || BigInt(bytes.length) !== before.size || await realpath(sourcePath) !== sourcePath) { throw new Error("Original closed fixture changed during capture."); }
    };
    await reprove(); await owner();
    const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "fixture-import-closed")), id = randomUUID(); options.assertOriginalOwner();
    const snapshot = await publishManagedAttachmentExclusive(join(directory, `${id}.eprj2`), "Original closed generated fixture snapshot", bytes, "closed-fixture-snapshot", reprove);
    if (snapshot.sha256 !== digest || snapshot.bytes !== bytes.length) { throw new Error("Closed fixture snapshot differs from its original exact bytes."); }
    const runtime = await currentProcessSqlRuntime(); options.assertOriginalOwner();
    const inventory = await readExactSqlInventory({ checkpointPath: snapshot.path, expectedSha256: snapshot.sha256, runtime }); options.assertOriginalOwner();
    const sql = await publishManagedAttachmentExclusive(join(directory, `${id}.sql.json`), "Complete closed fixture SQL inventory", Buffer.from(JSON.stringify(inventory), "utf8"), "closed-fixture-sql", reprove);
    let qualified: Awaited<ReturnType<typeof qualifyGeneratedFixtureInitialSql>> | Awaited<ReturnType<typeof qualifyGeneratedSchematicFixtureInitialSql>> | undefined; let qualificationFailure: string | null = null;
    try {
      qualified = await (kind === "pcb" ? qualifyGeneratedFixtureInitialSql : qualifyGeneratedSchematicFixtureInitialSql)({ archive: options.archive, inventory, rawWindowsPath: windowsPath,
        sourceCreatedEpochMs: windowsFile?.file.createdEpochMs ?? Number(before.birthtimeMs), sourceModifiedEpochMs: windowsFile?.file.modifiedEpochMs ?? Number(before.mtimeMs) }); options.assertOriginalOwner();
    } catch (error) { qualificationFailure = error instanceof Error ? error.message : "Initial SQL/source profile refused."; }
    const decoded = qualified === undefined ? null : await publishManagedAttachmentExclusive(join(directory, `${id}.history.json`), "Complete closed fixture decoded native history",
      Buffer.from(JSON.stringify(qualified.history), "utf8"), "closed-fixture-history", reprove);
    await reprove(); await owner();
    const freshHash = createHash("sha256"); let reread = 0;
    for await (const chunk of source.createReadStream({ autoClose: false, start: 0, highWaterMark: 1_048_576 })) {
      options.assertOriginalOwner(); if (!Buffer.isBuffer(chunk)) { throw new TypeError("Closed fixture reproof returned non-binary data."); }
      reread += chunk.length; if (BigInt(reread) > before.size) { throw new Error("Closed fixture grew during final reproof."); } freshHash.update(chunk);
    }
    if (reread !== bytes.length || freshHash.digest("hex") !== snapshot.sha256) { throw new Error("Native closed fixture changed after complete SQL/history capture."); }
    await reprove();
    if (windowsFile !== undefined && metadata !== undefined) { validateWindowsFile(await metadata.inspect()); options.assertOriginalOwner(); }
    const target = qualified?.qualification;
    let schema = kind === "pcb" ? "easyeda-pro-control.managed-fixture-closed-snapshot.v1" : "easyeda-pro-control.managed-schematic-fixture-closed-snapshot.v1";
    if (windowsFile !== undefined) { schema = kind === "pcb" ? "easyeda-pro-control.managed-fixture-closed-snapshot.v2" : "easyeda-pro-control.managed-schematic-fixture-closed-snapshot.v2"; }
    return { qualifiedTarget: target?.schema === "easyeda-pro-control.qualified-generated-fixture-target.v1" ? target : null,
      qualifiedSchematicTarget: target?.schema === "easyeda-pro-control.qualified-generated-schematic-fixture-target.v1" ? target : null,
      report: { schema, projectUuid, branchUuid: qualified?.history.branchUuid ?? null,
      ...(windowsFile === undefined ? {} : { sourceClockSource: "original-destination-windows-filetime", windowsClosedFileMetadata: windowsFile }),
      snapshot, sql, decoded, originalSourceSha256: snapshot.sha256, completeSqlInventoryCaptured: true,
      sqlReaderCompletion: readerCompletion(inventory), completeInitialSqlRowsQualified: qualified !== undefined, qualificationFailure,
      tableRoster: inventory.tables.map((table) => ({ name: table.name, rowCount: table.rows.length, sha256: table.sha256 })),
      historySemanticSha256: qualified?.history.semanticSha256 ?? null, sourceComparison: qualified === undefined ? null :
        (kind === "pcb" ? compareGeneratedFixtureClosedSources : compareGeneratedSchematicFixtureClosedSources)(options.archive, qualified.history),
      ...(kind === "pcb" ? { issuedReadOpenTarget: target ?? null } : { issuedSchematicDataTarget: target ?? null, nativePageReadinessVerified: false, electricalConnectivityVerified: false }), originalRootAndJobReobservedClosed: true,
      registrationVerified: false, completeSqlEffectsAccepted: false, importedFixtureAccepted: false, designExecutionAuthorized: false,
      sourceFileModified: false, sqliteSourceAttached: false, filesDeleted: false } };
  } finally { await source.close(); }
}
