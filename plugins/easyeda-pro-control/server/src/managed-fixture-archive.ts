import { createHash } from "node:crypto";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { collectManagedProjectDocumentSources } from "./managed-project-document-sources.ts";
import { readManagedLibraryZip } from "./managed-library-files-zip.ts";

export const MANAGED_FIXTURE_ARCHIVE_MAX_DOCUMENTS = 32;
export const MANAGED_FIXTURE_ARCHIVE_MAX_REPORT_BYTES = 32_768;
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const title = z.string().min(1).max(96).regex(/^[A-Za-z0-9][A-Za-z0-9_ -]*[A-Za-z0-9_-]$|^[A-Za-z0-9]$/u)
  .refine((value) => !/^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])$/iu.test(value), "Reserved Windows filename.");
const identity = z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32}|[a-f0-9]{64})$/u);
const manifestSchema = z.looseObject({ title, cbb_project: z.literal(false).optional(), editorVersion: z.literal("3.2.209").optional() });
const headerSchema = z.looseObject({ type: z.string().min(1).max(64), id: z.string().min(1).max(128).optional() });
const documentSchema = z.object({ uuid: identity, documentType: z.string().regex(/^[A-Z][A-Z0-9_]{0,63}$/u),
  bytes: z.number().int().positive(), sha256: digest, recordCount: z.number().int().positive(),
  recordTypes: z.array(z.string().min(1).max(64)).min(1).max(128) }).strict();
export const managedFixtureArchiveQualificationSchema = z.object({
  schema: z.literal("easyeda-pro-control.managed-fixture-archive-qualification.v1"),
  archiveSha256: digest, archiveBytes: z.number().int().positive(),
  manifest: z.object({ member: z.literal("project2.json"), bytes: z.number().int().positive(), sha256: digest,
    title, cbbProject: z.literal(false), editorVersion: z.literal("3.2.209").nullable() }).strict(),
  source: z.object({ member: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_ -]*\.epru$/u), bytes: z.number().int().positive(), sha256: digest }).strict(),
  documents: z.array(documentSchema).min(1).max(MANAGED_FIXTURE_ARCHIVE_MAX_DOCUMENTS),
  expectedDestinationBasename: z.string().min(7).max(102),
  completeArchiveMemberRoster: z.literal(true), completeSuppliedDocumentRoster: z.literal(true),
  nativeImportExecuted: z.literal(false), nativeDestinationReserved: z.literal(false),
  registrationVerified: z.literal(false), geometryVerified: z.literal(false), dependencyClosureVerified: z.literal(false),
  executionAuthorized: z.literal(false), qualificationSha256: digest,
}).strict();
export type ManagedFixtureArchiveQualification = z.infer<typeof managedFixtureArchiveQualificationSchema>;

function sha256(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function refuse(reason: string): never { throw new Error(`Managed fixture archive refused: ${reason}.`); }

/** Qualify the entire supplied two-member archive before publishing a fixture
 * package. No native decoder is executed. This proves original archive framing
 * and membership, never that the native importer will preserve the roster. */
export function qualifyManagedFixtureArchive(bytes: Buffer): ManagedFixtureArchiveQualification {
  const members = readManagedLibraryZip(bytes);
  const manifestBytes = members.get("project2.json");
  const sourceEntries = [...members].filter(([name]) => /^[A-Za-z0-9][A-Za-z0-9_ -]*\.epru$/u.test(name));
  if (members.size !== 2 || manifestBytes === undefined || manifestBytes.length > 256 * 1024 || sourceEntries.length !== 1) {
    refuse("exact project2.json and one canonical root .epru member required; images and other members are unsupported");
  }
  const manifest = manifestSchema.parse(decodeCurrentPcbDiagnosticJson(manifestBytes));
  const sourceEntry = sourceEntries[0];
  if (sourceEntry === undefined) { refuse("source member missing"); }
  const [member, content] = sourceEntry;
  const set = collectManagedProjectDocumentSources(members, sha256(bytes));
  if (set.sourceLayout !== "combined-native" || set.sources.length === 0 || set.sources.length > MANAGED_FIXTURE_ARCHIVE_MAX_DOCUMENTS) {
    refuse("complete bounded native document roster required");
  }
  const documents = set.sources.map((source) => {
    const ids = new Set<string>(), rows = source.documentSource.slice(0, -2).split("|\n"), types = new Set<string>();
    for (const row of rows) {
      const boundary = row.indexOf("||");
      const headerBytes = Buffer.from(row.slice(0, boundary), "utf8");
      const header = headerSchema.parse(decodeCurrentPcbDiagnosticJson(headerBytes));
      const body = row.slice(boundary + 2);
      if (body.length === 0 || ["EDIT_HEAD", "DELETE"].includes(header.type)) { refuse("mutable histories and tombstones are unsupported"); }
      if (header.type !== "DOCHEAD") {
        if (header.id === undefined || ids.has(header.id)) { refuse("missing or repeated record identity"); }
        ids.add(header.id);
      }
      types.add(header.type);
    }
    return documentSchema.parse({ uuid: source.documentUuid, documentType: source.documentType,
      bytes: source.bytes, sha256: source.sha256, recordCount: rows.length, recordTypes: [...types].toSorted() });
  });
  const projection = { schema: "easyeda-pro-control.managed-fixture-archive-qualification.v1",
    archiveSha256: sha256(bytes), archiveBytes: bytes.length,
    manifest: { member: "project2.json", bytes: manifestBytes.length, sha256: sha256(manifestBytes), title: manifest.title,
      cbbProject: false, editorVersion: manifest.editorVersion ?? null },
    source: { member, bytes: content.length, sha256: sha256(content) }, documents,
    expectedDestinationBasename: `${manifest.title}.eprj2`, completeArchiveMemberRoster: true, completeSuppliedDocumentRoster: true,
    nativeImportExecuted: false, nativeDestinationReserved: false, registrationVerified: false,
    geometryVerified: false, dependencyClosureVerified: false, executionAuthorized: false };
  const projectionBytes = Buffer.from(JSON.stringify(projection), "utf8");
  const qualification = managedFixtureArchiveQualificationSchema.parse({ ...projection, qualificationSha256: sha256(projectionBytes) });
  if (Buffer.byteLength(JSON.stringify(qualification), "utf8") > MANAGED_FIXTURE_ARCHIVE_MAX_REPORT_BYTES) {
    refuse("complete qualification report byte bound");
  }
  return qualification;
}
