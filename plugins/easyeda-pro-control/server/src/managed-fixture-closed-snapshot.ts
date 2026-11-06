/* oxlint-disable import/max-dependencies -- A read-only closed capture joins original owner callbacks, exact file descriptors, managed publication, complete SQL and native history decoders. */
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { join, win32 } from "node:path";
import { z } from "zod";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { managedFixtureDestinationObservationSchema } from "./managed-fixture-destination.ts";
import type { ManagedFixtureDestinationObservation } from "./managed-fixture-destination.ts";
import { qualifyManagedFixtureArchive } from "./managed-fixture-archive.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import { qualifyGeneratedFixtureInitialSql } from "./managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedFixtureTarget } from "./managed-fixture-initial-sql.ts";

const row = z.object({ header: z.looseObject({ type: z.string(), id: z.string().optional() }), body: z.record(z.string(), z.unknown()) });
function expectedProjection(archive: Buffer): Readonly<Record<string, unknown>> {
  const qualification = qualifyManagedFixtureArchive(archive), source = readManagedLibraryZip(archive).get(qualification.source.member);
  if (source === undefined || qualification.documents.length !== 1 || qualification.documents[0]?.documentType !== "PCB") { throw new Error("Closed fixture comparison requires the sole generated root PCB source."); }
  const rows = source.toString("utf8").slice(0, -2).split("|\n").map((text) => {
    const boundary = text.indexOf("||"); return row.parse({ header: JSON.parse(text.slice(0, boundary)) as unknown, body: JSON.parse(text.slice(boundary + 2)) as unknown });
  });
  const head = rows[0], meta = rows[1];
  if (head?.header.type !== "DOCHEAD" || meta?.header.type !== "META" || rows.slice(2).some((entry) => !["VIA", "LINE"].includes(entry.header.type) || entry.header.id === undefined)) { throw new Error("Closed fixture comparison refuses an unexpected source family."); }
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

/** New immutable artifacts only. No SQLite attachment to the native file, no
 * native close/open, registry write, deletion, acceptance or opaque proof minting.
 * The coordinator supplies only its original live callbacks after its own
 * tracked cleanup has completed. Complete SQL data is retained for independent
 * effect qualification, rather than treating a few selected rows as sufficient.
 */
export async function captureManagedFixtureClosedSnapshot(options: ManagedFixtureClosedSnapshotOptions): Promise<Readonly<{
  report: Record<string, unknown>; qualifiedTarget: QualifiedGeneratedFixtureTarget | null;
}>> {
  const destination = managedFixtureDestinationObservationSchema.parse(options.destination), qualification = qualifyManagedFixtureArchive(options.archive);
  if (destination.state !== "held" || destination.expectedBasename !== qualification.expectedDestinationBasename) { throw new Error("Closed fixture destination differs from the original generated archive."); }
  const windowsPath = win32.join(destination.windowsDirectory, destination.expectedBasename);
  const projectUuid = createHash("sha256").update(windowsPath, "utf8").digest("hex");
  const sourcePath = `/mnt/${windowsPath[0]?.toLowerCase()}/${windowsPath.slice(3).replaceAll("\\", "/")}`;
  const owner = async (): Promise<void> => {
    options.assertOriginalOwner(); await options.observeOriginalTermination(); options.assertOriginalOwner();
    const current = managedFixtureDestinationObservationSchema.parse(await options.inspectOriginalDestination()); options.assertOriginalOwner();
    if (current.state !== "held" || current.ownerId !== destination.ownerId || current.windowsDirectory !== destination.windowsDirectory || current.directoryIdentity !== destination.directoryIdentity ||
        canonicalJson(current.libraries) !== canonicalJson(destination.libraries) || canonicalJson(current.entries) !== canonicalJson([destination.expectedBasename])) {
      throw new Error("Original closed fixture directory/watch identity or complete child roster changed.");
    }
  };
  await owner();
  if (await realpath(sourcePath) !== sourcePath) { throw new Error("Closed fixture source includes a filesystem alias."); }
  // oxlint-disable-next-line eslint/no-bitwise -- Read only, without following substituted links or blocking on a substituted FIFO.
  const source = await open(sourcePath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await source.stat({ bigint: true });
    if (!before.isFile() || before.nlink !== 1n || before.size < 512n || before.size > 64n * 1024n * 1024n) { throw new Error("Closed fixture is not a bounded single-link regular file."); }
    const chunks: Buffer[] = []; let count = 0;
    for await (const chunk of source.createReadStream({ autoClose: false, highWaterMark: 1_048_576 })) {
      options.assertOriginalOwner(); if (!Buffer.isBuffer(chunk)) { throw new TypeError("Closed fixture copy returned non-binary data."); }
      count += chunk.length; if (BigInt(count) > before.size) { throw new Error("Closed fixture grew during snapshot capture."); } chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks), digest = createHash("sha256").update(bytes).digest("hex");
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
    let qualified: Awaited<ReturnType<typeof qualifyGeneratedFixtureInitialSql>> | undefined; let qualificationFailure: string | null = null;
    try {
      qualified = await qualifyGeneratedFixtureInitialSql({ archive: options.archive, inventory, rawWindowsPath: windowsPath,
        sourceCreatedEpochMs: Number(before.birthtimeMs), sourceModifiedEpochMs: Number(before.mtimeMs) }); options.assertOriginalOwner();
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
    return { qualifiedTarget: qualified?.qualification ?? null, report: { schema: "easyeda-pro-control.managed-fixture-closed-snapshot.v1", projectUuid, branchUuid: qualified?.history.branchUuid ?? null,
      snapshot, sql, decoded, originalSourceSha256: snapshot.sha256, completeSqlInventoryCaptured: true,
      sqlReaderCompletion: readerCompletion(inventory), completeInitialSqlRowsQualified: qualified !== undefined, qualificationFailure,
      tableRoster: inventory.tables.map((table) => ({ name: table.name, rowCount: table.rows.length, sha256: table.sha256 })),
      historySemanticSha256: qualified?.history.semanticSha256 ?? null, sourceComparison: qualified === undefined ? null : compareGeneratedFixtureClosedSources(options.archive, qualified.history),
      issuedReadOpenTarget: qualified?.qualification ?? null, originalRootAndJobReobservedClosed: true,
      registrationVerified: false, completeSqlEffectsAccepted: false, importedFixtureAccepted: false, designExecutionAuthorized: false,
      sourceFileModified: false, sqliteSourceAttached: false, filesDeleted: false } };
  } finally { await source.close(); }
}
