import { createHash, randomUUID } from "node:crypto";
import { basename, dirname, join } from "node:path";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive, readExactBinaryArtifact } from "./artifacts.ts";
import { MANAGED_LIBRARY_FILES_MAX_RESULT_BYTES, decodeManagedLibraryBase64, decodeManagedProjectArchive, extractManagedLibraryMetadata, extractManagedProjectMetadata,
  managedLibraryArchiveSourceListRequestSchema, managedLibraryArchiveSourceReadRequestSchema, managedLibraryArchiveSourcesRequestSchema,
  managedLibraryExtractRequestSchema, managedLibraryFileSchema, managedLibraryFilesRequestSchema, managedLibraryMetadataSchema,
  managedLibraryPrepareRequestSchema, managedPcbStackRulesRequestSchema, managedProjectDocumentSourceListRequestSchema, managedProjectDocumentSourceReadRequestSchema,
  managedProjectDocumentSourcesRequestSchema, managedProjectExtractRequestSchema, managedProjectFootprintSourceListRequestSchema,
  managedProjectFootprintSourceReadRequestSchema, managedProjectFootprintSourcesRequestSchema, managedProjectSymbolPinsRequestSchema, managedSchematicRecordsRequestSchema,
  managedSymbolPinsRequestSchema, managedSymbolSourceListRequestSchema, managedSymbolSourceReadRequestSchema,
  managedSymbolSourcesRequestSchema, validateManagedLibraryFileContents } from "./managed-library-files.ts";
import type { ManagedLibraryFile } from "./managed-library-files.ts";
import { collectManagedProjectFootprintSources, encodeManagedProjectFootprintSourceIndex,
  pageManagedProjectFootprintRoster, pageManagedProjectFootprintSource } from "./managed-project-footprint-sources.ts";
import { collectManagedProjectSymbolSources, collectManagedStandaloneSymbolSource, encodeManagedSymbolSourceIndex,
  pageManagedSymbolRoster, pageManagedSymbolSource } from "./managed-project-symbol-sources.ts";
import type { ManagedSymbolSource, ManagedSymbolSourceSet } from "./managed-project-symbol-sources.ts";
import { inspectManagedSymbolPins } from "./managed-symbol-pins.ts";
import { collectManagedProjectDocumentSources, encodeManagedProjectDocumentSourceIndex,
  pageManagedProjectDocumentRoster, pageManagedProjectDocumentSource } from "./managed-project-document-sources.ts";
import type { ManagedProjectDocumentSource, ManagedProjectDocumentSourceSet } from "./managed-project-document-sources.ts";
import { inspectManagedSchematicRecords } from "./managed-schematic-records.ts";
import { inspectManagedPcbStackRules } from "./managed-pcb-stack-rules.ts";
// oxlint-disable-next-line import/max-dependencies -- Fixed offline dispatch joins the exact artifact guards and each supported decoder; a pass-through module would hide the same operation dependencies.
import { collectManagedLibraryArchiveSources, encodeManagedLibraryArchiveSourceIndex, pageManagedLibraryArchiveRoster, pageManagedLibraryArchiveSource } from "./managed-library-archive-sources.ts";
import type { ManagedLibraryArchiveSourceSet } from "./managed-library-archive-sources.ts";

/** Resolve the sole prepared-input directory from the control root, never from caller paths. */
function inputsDirectory(): string { return join(controlDataDirectory(), "artifacts", "library-file-inputs"); }
/** Attach the fixed offline/no-authority scope and refuse an oversized serialized response. */
function result(value: Record<string, unknown>, metadataOnly = true): Record<string, unknown> {
  const output = { ...value, offline: true, implementationKind: "native-task-equivalent", publicSdkMethodExecuted: false,
    installedRuntimeAdmission: false, executionAuthorized: false, cadAuthority: false, metadataOnly,
    designValidityVerified: false, dependencyCompletenessVerified: false, connectedSdkValidation: "not-performed" };
  if (Buffer.byteLength(JSON.stringify(output), "utf8") > MANAGED_LIBRARY_FILES_MAX_RESULT_BYTES) { throw new Error("Managed library file result exceeds its byte bound."); }
  return output;
}

/** Require the original prepared UUID/name path and independently recheck its exact bytes.
 * An external path, renamed artifact, symlink, changed size or digest cannot substitute for it. */
async function exactInput(file: ManagedLibraryFile): Promise<Buffer> {
  const prefix = basename(file.path).slice(0, 37);
  if (dirname(file.path) !== inputsDirectory() || !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}-$/u.test(prefix) ||
      basename(file.path) !== prefix + file.name) { throw new Error("Managed library input path must retain its prepared directory and filename."); }
  const artifact = await readExactBinaryArtifact(file);
  return artifact.content;
}

/** Require local-artifact confirmation and recognize the full decoded container before
 * exclusive publication. No external pathname, application or project is read. */
export async function prepareManagedLibraryFile(input: unknown): Promise<Record<string, unknown>> {
  const request = managedLibraryPrepareRequestSchema.parse(input); const content = decodeManagedLibraryBase64(request.base64);
  validateManagedLibraryFileContents({ schema: "easyeda-pro-control.library-file.v1", name: request.name, path: "/not-opened",
    bytes: content.length, sha256: createHash("sha256").update(content).digest("hex") }, content);
  const directory = await ensureManagedDirectory(inputsDirectory());
  const artifact = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}-${request.name}`), "Prepared library metadata input", content, "library-file-input");
  const file = managedLibraryFileSchema.parse({ schema: "easyeda-pro-control.library-file.v1", name: request.name,
    path: artifact.path, bytes: artifact.bytes, sha256: artifact.sha256 });
  return result({ action: request.action, localArtifactWritten: true, file });
}

/** Combine validated standalone metadata from distinct prepared filenames.
 * Case aliases refuse instead of reproducing the vendor's last-wins behavior. */
export async function extractManagedLibraryFiles(input: unknown): Promise<Record<string, unknown>> {
  const request = managedLibraryExtractRequestSchema.parse(input); const names = new Set<string>();
  for (const file of request.files) {
    if (!/\.(?:efoo|esym|epanl)$/u.test(file.name) || names.has(file.name.toLowerCase())) { throw new Error("Library metadata requires distinct standalone library filenames."); }
    names.add(file.name.toLowerCase());
  }
  const metadata = managedLibraryMetadataSchema.parse({ devices: [], symbols: [], footprints: [], panelLibs: [] });
  for (const file of request.files) {
    const content = await exactInput(file); const single = extractManagedLibraryMetadata(file.name, content);
    metadata.symbols.push(...single.symbols); metadata.footprints.push(...single.footprints); metadata.panelLibs.push(...single.panelLibs);
  }
  return result({ action: request.action, methodEquivalent: "eda.sys_FileManager.extractLibInfo", inputs: request.files, metadata });
}

/** Read project metadata from one exact prepared archive after complete ZIP validation. */
export async function extractManagedProjectFile(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectExtractRequestSchema.parse(input);
  if (!/\.epro2?$/u.test(request.file.name)) { throw new Error("Project metadata requires a prepared .epro or .epro2 archive."); }
  const content = await exactInput(request.file); const metadata = extractManagedProjectMetadata(request.file.name, content);
  return result({ action: request.action, methodEquivalent: "eda.sys_FileManager.extractProjectInfo", input: request.file, metadata });
}

/** Publish the complete source roster, never the expanded source bodies. */
export async function extractManagedProjectFootprintSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectFootprintSourcesRequestSchema.parse(input); const content = await exactInput(request.file);
  const archive = decodeManagedProjectArchive(request.file.name, content);
  const sourceSet = collectManagedProjectFootprintSources(archive.members, request.file.sha256);
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "project-footprint-source-indexes"));
  const index = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.json`), "Supplied project footprint source index",
    encodeManagedProjectFootprintSourceIndex(sourceSet), "project-footprint-source-index");
  if (index.sha256 !== sourceSet.sourceSetSha256) { throw new Error("Supplied project footprint source index differs from its complete source-set digest."); }
  return result({ action: request.action, methodEquivalent: "eda.sys_FileManager.getDocumentFootprintSources", input: request.file,
    sourceSetSha256: sourceSet.sourceSetSha256, footprintCount: sourceSet.sources.length, totalSourceBytes: sourceSet.totalSourceBytes,
    archiveMembers: sourceSet.archiveMembers, index, localArtifactWritten: true, suppliedSourceOnly: true, cadFramingValidated: false }, false);
}

/** Enumerate the digest-bound complete roster without a general artifact reader.
 * Every page reconstructs it from the freshly verified original archive. */
export async function listManagedProjectFootprintSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectFootprintSourceListRequestSchema.parse(input); const content = await exactInput(request.file);
  const archive = decodeManagedProjectArchive(request.file.name, content);
  const sourceSet = collectManagedProjectFootprintSources(archive.members, request.file.sha256);
  if (sourceSet.sourceSetSha256 !== request.expectedSourceSetSha256) { throw new Error("Supplied project footprint source-set digest differs."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: sourceSet.sourceSetSha256,
    ...pageManagedProjectFootprintRoster(sourceSet, request.offset, request.length), localArtifactWritten: false,
    suppliedSourceOnly: true, cadFramingValidated: false });
}

/** Reconstruct the complete bounded roster from the original exact input on
 * every read. A caller cannot substitute an index or select an external path. */
export async function readManagedProjectFootprintSource(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectFootprintSourceReadRequestSchema.parse(input); const content = await exactInput(request.file);
  const archive = decodeManagedProjectArchive(request.file.name, content);
  const sourceSet = collectManagedProjectFootprintSources(archive.members, request.file.sha256);
  if (sourceSet.sourceSetSha256 !== request.expectedSourceSetSha256) { throw new Error("Supplied project footprint source-set digest differs."); }
  const source = sourceSet.sources.find((entry) => entry.footprintUuid === request.footprintUuid);
  if (source === undefined) { throw new Error("Requested footprint UUID is absent from the complete supplied source roster."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: sourceSet.sourceSetSha256,
    ...pageManagedProjectFootprintSource(source, request.offset, request.length), localArtifactWritten: false,
    suppliedSourceOnly: true, cadFramingValidated: false }, false);
}

/** Rebuild standalone/project symbol sources from a fresh exact input read.
 * When supplied, the expected digest must match the complete reconstructed roster. */
async function symbolSources(file: ManagedLibraryFile, expectedSourceSetSha256?: string): Promise<ManagedSymbolSourceSet> {
  const content = await exactInput(file);
  if (file.name.endsWith(".esym")) { extractManagedLibraryMetadata(file.name, content); }
  const set = file.name.endsWith(".esym") ? collectManagedStandaloneSymbolSource(file.name, content) :
    collectManagedProjectSymbolSources(decodeManagedProjectArchive(file.name, content).members, file.sha256);
  if (expectedSourceSetSha256 !== undefined && set.sourceSetSha256 !== expectedSourceSetSha256) { throw new Error("Supplied symbol source-set digest differs."); }
  return set;
}
/** Select only an identity in the complete symbol roster; never fall back to another member. */
function selectedSymbol(set: ManagedSymbolSourceSet, symbolId: string): ManagedSymbolSource {
  const item = set.sources.find((entry) => entry.symbolId === symbolId);
  if (item === undefined) { throw new Error("Requested symbol identity is absent from the complete supplied source roster."); }
  return item;
}
/** Publish one complete symbol index and require its artifact hash to equal the roster digest. */
export async function extractManagedSymbolSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedSymbolSourcesRequestSchema.parse(input); const set = await symbolSources(request.file);
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "symbol-source-indexes"));
  const index = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.json`), "Supplied symbol source index",
    encodeManagedSymbolSourceIndex(set), "symbol-source-index");
  if (index.sha256 !== set.sourceSetSha256) { throw new Error("Supplied symbol source index differs from its complete source-set digest."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    symbolCount: set.sources.length, totalSourceBytes: set.totalSourceBytes, inputMembers: set.inputMembers,
    index, localArtifactWritten: true, suppliedSourceOnly: true, cadFramingValidated: false }, false);
}
/** Recheck the entire supplied symbol set before returning a bounded metadata roster page. */
export async function listManagedSymbolSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedSymbolSourceListRequestSchema.parse(input); const set = await symbolSources(request.file, request.expectedSourceSetSha256);
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...pageManagedSymbolRoster(set, request.offset, request.length), localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false });
}
/** Recheck the complete digest and selected symbol identity before a lossless source page. */
export async function readManagedSymbolSource(input: unknown): Promise<Record<string, unknown>> {
  const request = managedSymbolSourceReadRequestSchema.parse(input); const set = await symbolSources(request.file, request.expectedSourceSetSha256);
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...pageManagedSymbolSource(selectedSymbol(set, request.symbolId), request.offset, request.length),
    localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false }, false);
}
/** Inspect supported raw pin records only after exact input and complete-roster checks.
 * The pin reader may refuse framing/history that remains available through raw source pages. */
export async function inspectManagedSymbolSourcePins(input: unknown): Promise<Record<string, unknown>> {
  const request = managedSymbolPinsRequestSchema.parse(input); const set = await symbolSources(request.file, request.expectedSourceSetSha256);
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...inspectManagedSymbolPins(selectedSymbol(set, request.symbolId), request.offset, request.length),
    localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false, symbolPinRecordFramingValidated: true }, false);
}

/** Recreate the complete project document set and optionally require its expected digest. */
async function documentSources(file: ManagedLibraryFile, expectedSourceSetSha256?: string): Promise<ManagedProjectDocumentSourceSet> {
  const content = await exactInput(file);
  const set = collectManagedProjectDocumentSources(decodeManagedProjectArchive(file.name, content).members, file.sha256);
  if (expectedSourceSetSha256 !== undefined && set.sourceSetSha256 !== expectedSourceSetSha256) { throw new Error("Supplied project document source-set digest differs."); }
  return set;
}
/** Require a source ID from the complete document roster without filename or wildcard fallback. */
function selectedDocument(set: ManagedProjectDocumentSourceSet, sourceId: string): ManagedProjectDocumentSource {
  const item = set.sources.find(entry => entry.sourceId === sourceId);
  if (item === undefined) { throw new Error("Requested document source identity is absent from the complete supplied source roster."); }
  return item;
}
/** Publish the complete current/legacy document index while retaining raw bodies in the input. */
export async function extractManagedProjectDocumentSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectDocumentSourcesRequestSchema.parse(input); const set = await documentSources(request.file);
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "project-document-source-indexes"));
  const index = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.json`), "Supplied project document source index",
    encodeManagedProjectDocumentSourceIndex(set), "project-document-source-index");
  if (index.sha256 !== set.sourceSetSha256) { throw new Error("Supplied project document index differs from its complete source-set digest."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    documentCount: set.sources.length, totalSourceBytes: set.totalSourceBytes, inputMembers: set.inputMembers,
    sourceLayout: set.sourceLayout, completeProjectDocumentInventory: false,
    index, localArtifactWritten: true, suppliedSourceOnly: true, cadFramingValidated: false }, false);
}
/** Rebuild and verify all project documents before paging the digest-bound roster. */
export async function listManagedProjectDocumentSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectDocumentSourceListRequestSchema.parse(input); const set = await documentSources(request.file, request.expectedSourceSetSha256);
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...pageManagedProjectDocumentRoster(set, request.offset, request.length), localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false });
}
/** Return one lossless page from a selected source after full archive and roster verification. */
export async function readManagedProjectDocumentSource(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectDocumentSourceReadRequestSchema.parse(input); const set = await documentSources(request.file, request.expectedSourceSetSha256);
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...pageManagedProjectDocumentSource(selectedDocument(set, request.sourceId), request.offset, request.length),
    localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false }, false);
}
/** Delegate a verified selected source to the complete raw schematic-record inspector.
 * This route invokes no compiled connectivity getter or inherited-pin resolver. */
export async function inspectManagedProjectSchematicRecords(input: unknown): Promise<Record<string, unknown>> {
  const request = managedSchematicRecordsRequestSchema.parse(input); const set = await documentSources(request.file, request.expectedSourceSetSha256);
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...inspectManagedSchematicRecords(selectedDocument(set, request.sourceId), request.offset, request.length),
    localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false, schematicRecordFramingValidated: true }, false);
}
/** Require a selected PCB source before reporting persisted stack/rule records and selectors. */
export async function inspectManagedProjectPcbStackRules(input: unknown): Promise<Record<string, unknown>> {
  const request = managedPcbStackRulesRequestSchema.parse(input); const set = await documentSources(request.file, request.expectedSourceSetSha256);
  const item = selectedDocument(set, request.sourceId);
  if (item.documentType !== "PCB") { throw new Error("PCB stack/rule inspection requires a selected PCB document source."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256, sourceId: item.sourceId,
    ...inspectManagedPcbStackRules(item, request.offset, request.length, request.section),
    localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false, pcbStackRuleRecordFramingValidated: true }, false);
}
/** Require a UUID-bound SYMBOL document and inspect its preserved raw pin records.
 * No library lookup, component inheritance or pin-to-pad mapping is performed. */
export async function inspectManagedProjectSymbolPins(input: unknown): Promise<Record<string, unknown>> {
  const request = managedProjectSymbolPinsRequestSchema.parse(input); const set = await documentSources(request.file, request.expectedSourceSetSha256);
  const item = selectedDocument(set, request.sourceId);
  if (item.documentType !== "SYMBOL" || item.documentUuid === null) { throw new Error("Project symbol pin inspection requires a UUID-bound selected SYMBOL source."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256, sourceId: item.sourceId,
    ...inspectManagedSymbolPins({ ...item, symbolId: item.documentUuid, identityKind: "archive-member-uuid" }, request.offset, request.length),
    localArtifactWritten: false, suppliedSourceOnly: true, cadFramingValidated: false, symbolPinRecordFramingValidated: true }, false);
}

/** Revalidate the complete prepared library archive on every operation and bind its full roster.
 * A caller-supplied index cannot replace the original archive or its expected digest. */
async function libraryArchiveSources(file: ManagedLibraryFile, expectedSourceSetSha256?: string): Promise<ManagedLibraryArchiveSourceSet> {
  const content = await exactInput(file);
  const set = collectManagedLibraryArchiveSources(file.name, content, file.sha256);
  if (expectedSourceSetSha256 !== undefined && set.sourceSetSha256 !== expectedSourceSetSha256) { throw new Error("Supplied library archive source-set digest differs."); }
  return set;
}

/** The complete roster binds the supplied archive and both member hashes.
 * Prefix bookkeeping stays separate from each exact original source body. */
export async function extractManagedLibraryArchiveSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedLibraryArchiveSourcesRequestSchema.parse(input); const set = await libraryArchiveSources(request.file);
  const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "library-archive-source-indexes"));
  const index = await publishManagedAttachmentExclusive(join(directory, `${randomUUID()}.json`), "Supplied library archive source index",
    encodeManagedLibraryArchiveSourceIndex(set), "library-archive-source-index");
  if (index.sha256 !== set.sourceSetSha256) { throw new Error("Supplied library archive index differs from its complete source-set digest."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    sourceCount: set.sources.length, totalSourceBytes: set.totalSourceBytes, inputMembers: set.inputMembers,
    sourceLayout: set.sourceLayout, index, localArtifactWritten: true, suppliedSourceOnly: true,
    cadFramingValidated: false, libraryArchiveRecordFramingValidated: true, symbolSubtypeVerified: false }, false);
}
/** Return bounded archive metadata only after both members and every source are revalidated. */
export async function listManagedLibraryArchiveSources(input: unknown): Promise<Record<string, unknown>> {
  const request = managedLibraryArchiveSourceListRequestSchema.parse(input); const set = await libraryArchiveSources(request.file, request.expectedSourceSetSha256);
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...pageManagedLibraryArchiveRoster(set, request.offset, request.length), localArtifactWritten: false,
    suppliedSourceOnly: true, cadFramingValidated: false, libraryArchiveRecordFramingValidated: true, symbolSubtypeVerified: false });
}
/** Select an original body from the complete digest-bound archive roster and page it exactly.
 * The copied header/META prefix remains separately identified, never merged into the body. */
export async function readManagedLibraryArchiveSource(input: unknown): Promise<Record<string, unknown>> {
  const request = managedLibraryArchiveSourceReadRequestSchema.parse(input); const set = await libraryArchiveSources(request.file, request.expectedSourceSetSha256);
  const item = set.sources.find((entry) => entry.sourceId === request.sourceId);
  if (item === undefined) { throw new Error("Requested source identity is absent from the complete supplied library archive roster."); }
  return result({ action: request.action, input: request.file, sourceSetSha256: set.sourceSetSha256,
    ...pageManagedLibraryArchiveSource(item, request.offset, request.length), localArtifactWritten: false,
    suppliedSourceOnly: true, cadFramingValidated: false, libraryArchiveRecordFramingValidated: true, symbolSubtypeVerified: false }, false);
}

/** Fixed local dispatch; accepting this operation never starts the bridge. */
export async function executeManagedLibraryFiles(input: unknown): Promise<Record<string, unknown>> {
  const request = managedLibraryFilesRequestSchema.parse(input);
  const routes = { "prepare-file": prepareManagedLibraryFile, "extract-library-info": extractManagedLibraryFiles,
    "extract-project-info": extractManagedProjectFile, "extract-project-footprint-sources": extractManagedProjectFootprintSources,
    "list-project-footprint-sources": listManagedProjectFootprintSources,
    "read-project-footprint-source": readManagedProjectFootprintSource, "extract-symbol-sources": extractManagedSymbolSources,
    "list-symbol-sources": listManagedSymbolSources, "read-symbol-source": readManagedSymbolSource, "inspect-symbol-pins": inspectManagedSymbolSourcePins,
    "extract-project-document-sources": extractManagedProjectDocumentSources, "list-project-document-sources": listManagedProjectDocumentSources,
    "read-project-document-source": readManagedProjectDocumentSource, "inspect-schematic-records": inspectManagedProjectSchematicRecords,
    "inspect-pcb-stack-rules": inspectManagedProjectPcbStackRules, "inspect-project-symbol-pins": inspectManagedProjectSymbolPins,
    "extract-library-archive-sources": extractManagedLibraryArchiveSources, "list-library-archive-sources": listManagedLibraryArchiveSources,
    "read-library-archive-source": readManagedLibraryArchiveSource };
  const output = await routes[request.action](request);
  return output;
}
