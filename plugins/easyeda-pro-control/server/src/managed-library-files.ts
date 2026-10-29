import { createHash } from "node:crypto";
import { z } from "zod";
import { decodeCurrentPcbDiagnosticJson } from "./current-pcb-diagnostic-json.ts";
import { MANAGED_LIBRARY_ARCHIVE_MAX_BYTES, MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES, MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS,
  readManagedLibraryZip } from "./managed-library-files-zip.ts";
import { MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES, MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES, MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS,
  MANAGED_PROJECT_FOOTPRINT_UUID_PATTERN } from "./managed-project-footprint-sources.ts";
import { MANAGED_SYMBOL_SOURCE_ID_PATTERN } from "./managed-project-symbol-sources.ts";
import { MANAGED_SYMBOL_PIN_PAGE_ENTRIES } from "./managed-symbol-pins.ts";

export const MANAGED_LIBRARY_FILES_MAX_TEXT_BYTES = 256 * 1024;
export const MANAGED_LIBRARY_FILES_MAX_RESULT_BYTES = 65_536;
export const MANAGED_LIBRARY_FILES_METHODS = ["eda.sys_FileManager.extractLibInfo", "eda.sys_FileManager.extractProjectInfo",
  "eda.sys_FileManager.getDocumentFootprintSources"] as const;
const fileName = z.string().max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_ -]*\.(?:efoo|esym|epanl|epro|epro2)$/u);
const sha256 = z.string().regex(/^[a-f0-9]{64}$/u);
export const managedLibraryFileSchema = z.object({ schema: z.literal("easyeda-pro-control.library-file.v1"), name: fileName,
  path: z.string().min(1).max(4096), bytes: z.number().int().min(1).max(MANAGED_LIBRARY_ARCHIVE_MAX_BYTES), sha256 }).strict();
export type ManagedLibraryFile = z.infer<typeof managedLibraryFileSchema>;
export const managedLibraryPrepareRequestSchema = z.object({ action: z.literal("prepare-file"), name: fileName,
  base64: z.string().min(4).max(Math.ceil(MANAGED_LIBRARY_ARCHIVE_MAX_BYTES / 3) * 4), confirmLocalArtifact: z.literal(true) }).strict();
const standaloneFileSchema = managedLibraryFileSchema.extend({
  name: z.string().max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_ -]*\.(?:efoo|esym|epanl)$/u),
  bytes: z.number().int().min(1).max(MANAGED_LIBRARY_FILES_MAX_TEXT_BYTES),
});
const symbolSourceFileSchema = managedLibraryFileSchema.extend({ name: z.string().max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_ -]*\.(?:esym|epro|epro2)$/u) });
const projectFileSchema = managedLibraryFileSchema.extend({ name: z.string().max(128).regex(/^[A-Za-z0-9][A-Za-z0-9_ -]*\.epro2?$/u) });
export const managedLibraryExtractRequestSchema = z.object({ action: z.literal("extract-library-info"),
  files: z.array(standaloneFileSchema).min(1).max(16)
    .refine((files) => new Set(files.map((file) => file.name.toLowerCase())).size === files.length,
      { message: "Library metadata requires distinct standalone library filenames." }) }).strict();
export const managedProjectExtractRequestSchema = z.object({ action: z.literal("extract-project-info"), file: projectFileSchema }).strict();
export const managedProjectFootprintSourcesRequestSchema = z.object({ action: z.literal("extract-project-footprint-sources"), file: projectFileSchema }).strict();
export const managedProjectFootprintSourceListRequestSchema = z.object({ action: z.literal("list-project-footprint-sources"), file: projectFileSchema,
  expectedSourceSetSha256: sha256, offset: z.number().int().min(0).max(MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS).default(0),
  length: z.number().int().min(1).max(MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES).default(MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES) }).strict();
export const managedProjectFootprintSourceReadRequestSchema = z.object({ action: z.literal("read-project-footprint-source"), file: projectFileSchema,
  expectedSourceSetSha256: sha256, footprintUuid: z.string().regex(MANAGED_PROJECT_FOOTPRINT_UUID_PATTERN),
  offset: z.number().int().min(0).max(MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES).default(0),
  length: z.number().int().min(1).max(MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS).default(MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS) }).strict();
export const managedSymbolSourcesRequestSchema = z.object({ action: z.literal("extract-symbol-sources"), file: symbolSourceFileSchema }).strict();
export const managedSymbolSourceListRequestSchema = z.object({ action: z.literal("list-symbol-sources"), file: symbolSourceFileSchema,
  expectedSourceSetSha256: sha256, offset: z.number().int().min(0).max(MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS).default(0),
  length: z.number().int().min(1).max(MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES).default(MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES) }).strict();
export const managedSymbolSourceReadRequestSchema = z.object({ action: z.literal("read-symbol-source"), file: symbolSourceFileSchema,
  expectedSourceSetSha256: sha256, symbolId: z.string().regex(MANAGED_SYMBOL_SOURCE_ID_PATTERN),
  offset: z.number().int().min(0).max(MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES).default(0),
  length: z.number().int().min(1).max(MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS).default(MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS) }).strict();
export const managedSymbolPinsRequestSchema = z.object({ action: z.literal("inspect-symbol-pins"), file: symbolSourceFileSchema,
  expectedSourceSetSha256: sha256, symbolId: z.string().regex(MANAGED_SYMBOL_SOURCE_ID_PATTERN),
  offset: z.number().int().min(0).max(8192).default(0),
  length: z.number().int().min(1).max(MANAGED_SYMBOL_PIN_PAGE_ENTRIES).default(MANAGED_SYMBOL_PIN_PAGE_ENTRIES) }).strict();
export const managedLibraryFilesRequestSchema = z.discriminatedUnion("action", [managedLibraryPrepareRequestSchema,
  managedLibraryExtractRequestSchema, managedProjectExtractRequestSchema, managedProjectFootprintSourcesRequestSchema,
  managedProjectFootprintSourceListRequestSchema, managedProjectFootprintSourceReadRequestSchema, managedSymbolSourcesRequestSchema,
  managedSymbolSourceListRequestSchema, managedSymbolSourceReadRequestSchema, managedSymbolPinsRequestSchema]);
const text = (maximum: number): z.ZodString => z.string().max(maximum).refine((value) => value.isWellFormed() && !value.includes("\u0000"));
const projectMetadataSchema = z.object({ title: text(512), cbbProject: z.boolean().optional(), editorVersion: text(128).optional() });
const project2MetadataSchema = z.object({ title: text(512), cbb_project: z.boolean().optional(), editorVersion: text(128).optional() });
const libraryItemSchema = z.object({ uuid: sha256, title: text(128), description: z.literal(""), tags: z.array(z.never()).length(0),
  docType: z.union([z.literal(2), z.literal(4), z.literal(29)]) }).strict();
export const managedLibraryMetadataSchema = z.object({ devices: z.array(z.never()).length(0),
  symbols: z.array(libraryItemSchema).max(16), footprints: z.array(libraryItemSchema).max(16), panelLibs: z.array(libraryItemSchema).max(16) }).strict();
export const managedProjectMetadataSchema = z.object({ title: text(512), cbbProject: z.boolean(), editorVersion: text(128).optional() }).strict();
export type ManagedLibraryMetadata = z.infer<typeof managedLibraryMetadataSchema>;
export type ManagedProjectMetadata = z.infer<typeof managedProjectMetadataSchema>;

function refuse(reason: string): never { throw new Error(`Managed library file refused: ${reason}.`); }

export function decodeManagedLibraryBase64(value: string): Buffer {
  if (value.length > Math.ceil(MANAGED_LIBRARY_ARCHIVE_MAX_BYTES / 3) * 4 || value.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/u.test(value)) {
    refuse("canonical base64 required");
  }
  const bytes = Buffer.from(value, "base64");
  if (bytes.length === 0 || bytes.length > MANAGED_LIBRARY_ARCHIVE_MAX_BYTES || bytes.toString("base64") !== value) { refuse("base64 bytes or padding"); }
  return bytes;
}

/** The installed standalone-library extractor derives this metadata from the
 * filename. We additionally require complete JSON-line framing and an agreeing
 * header; drawing records are retained as input, never interpreted as geometry. */
export function extractManagedLibraryMetadata(nameInput: string, bytes: Buffer): ManagedLibraryMetadata {
  const name = fileName.parse(nameInput); const extension = name.slice(name.lastIndexOf("."));
  const expectedType = new Map([[".esym", "SYMBOL"], [".efoo", "FOOTPRINT"], [".epanl", "PANEL_LIB"]]).get(extension);
  if (expectedType === undefined || bytes.length === 0 || bytes.length > MANAGED_LIBRARY_FILES_MAX_TEXT_BYTES) { refuse("standalone library type or byte bound"); }
  const source = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
  if (source.includes("\u0000") || /\r(?!\n)/u.test(source)) { refuse("library text encoding"); }
  const lines = source.replace(/\r?\n$/u, "").split(/\r?\n/u);
  if (lines.length < 2 || lines.length > 8192 || lines[0] !== JSON.stringify(["DOCTYPE", expectedType, "1.0"])) { refuse("library header or record bound"); }
  let symbolType: number | undefined;
  for (const [index, line] of lines.entries()) {
    const row = z.array(z.unknown()).min(2).max(128).parse(decodeCurrentPcbDiagnosticJson(Buffer.from(line, "utf8")));
    const kind = z.string().min(1).max(64).parse(row[0]);
    if (index === 1) {
      if (kind !== "HEAD" || row.length !== 2) { refuse("missing exact HEAD record"); }
      const header = z.record(z.string(), z.unknown()).parse(row[1]);
      if (extension === ".esym") { symbolType = z.literal(2).parse(header["symbolType"]); }
    } else if (index > 1 && ["HEAD", "DOCTYPE", "DOCHEAD"].includes(kind)) { refuse("multiple library documents or headers"); }
  }
  if (extension === ".esym") {
    // The native extractor uses the first exact textual match, not parsed HEAD.
    // Reject whitespace and conflicting textual matches rather than diverging.
    const matches = [...source.matchAll(/"symbolType":([0-9]+)/gu)];
    if (matches.length !== 1 || matches[0]?.[1] !== "2" || symbolType !== 2) { refuse("native symbol type agreement"); }
  }
  const docType = new Map([[".esym", 2], [".efoo", 4], [".epanl", 29]]).get(extension);
  const item = { uuid: createHash("sha256").update(name, "utf8").digest("hex"), title: name.slice(0, -extension.length),
    description: "" as const, tags: [], docType };
  return managedLibraryMetadataSchema.parse({ devices: [], symbols: extension === ".esym" ? [item] : [],
    footprints: extension === ".efoo" ? [item] : [], panelLibs: extension === ".epanl" ? [item] : [] });
}

/** Mirrors Si.extract's supplied archive metadata projection only. The entire
 * archive is CRC/extent checked; no member is extracted to disk or imported. */
export function decodeManagedProjectArchive(nameInput: string, bytes: Buffer): Readonly<{ members: ReadonlyMap<string, Buffer>; metadata: ManagedProjectMetadata }> {
  const name = fileName.parse(nameInput); const current = name.endsWith(".epro2");
  if (!current && !name.endsWith(".epro")) { refuse("project archive extension"); }
  const members = readManagedLibraryZip(bytes); const manifest = members.get(current ? "project2.json" : "project.json");
  if (manifest === undefined || members.has(current ? "project.json" : "project2.json") || manifest.length > MANAGED_LIBRARY_FILES_MAX_TEXT_BYTES) {
    refuse("missing, conflicting or excessive project manifest");
  }
  const parsed = decodeCurrentPcbDiagnosticJson(manifest);
  if (current) {
    const metadata = project2MetadataSchema.parse(parsed);
    return { members, metadata: managedProjectMetadataSchema.parse({ title: metadata.title, cbbProject: metadata.cbb_project ?? false,
      ...(metadata.editorVersion === undefined ? {} : { editorVersion: metadata.editorVersion }) }) };
  }
  const metadata = z.object({ config: projectMetadataSchema }).parse(parsed).config;
  return { members, metadata: managedProjectMetadataSchema.parse({ title: metadata.title, cbbProject: metadata.cbbProject ?? false,
    ...(metadata.editorVersion === undefined ? {} : { editorVersion: metadata.editorVersion }) }) };
}

export function extractManagedProjectMetadata(nameInput: string, bytes: Buffer): ManagedProjectMetadata {
  return decodeManagedProjectArchive(nameInput, bytes).metadata;
}

export function validateManagedLibraryFileContents(fileInput: unknown, bytes: Buffer): ManagedLibraryMetadata | ManagedProjectMetadata {
  const file = managedLibraryFileSchema.parse(fileInput);
  if (file.bytes !== bytes.length || file.sha256 !== createHash("sha256").update(bytes).digest("hex")) { refuse("managed byte descriptor differs"); }
  return file.name.endsWith(".epro") || file.name.endsWith(".epro2") ? extractManagedProjectMetadata(file.name, bytes) : extractManagedLibraryMetadata(file.name, bytes);
}

const limitations = [
  "Offline native-task-equivalent metadata readers. No public SDK call, EasyEDA process, runtime admission, bridge, project open, network, import, conversion, Save or archive extraction to disk.",
  "prepare-file accepts canonical base64 and a bounded filename, validates the complete admitted container, then writes one exclusive managed input. Later reads require its exact managed directory, filename, SHA-256 and byte length; callers cannot select an external path or output destination.",
  "Project inputs support unencrypted ZIP32 .epro/project.json.config and .epro2/project2.json metadata: title, Boolean cbbProject and optional string editorVersion. Filenames and member paths use the declared ASCII subset; metadata text may be Unicode. Every ZIP member is bounded, inflated and CRC-checked. No ZIP64, data descriptors, extras, multipart archives, links, unsafe paths, duplicate/case aliases, conflicting manifests or trailing compressed bytes.",
  "Library inputs support standalone .efoo FOOTPRINT, .epanl PANEL_LIB and ordinary .esym SYMBOL type2 with complete UTF-8 JSON-line framing, DOCTYPE1.0 and one HEAD. Filename SHA-256 supplies the native UUID; filename stem supplies title; description/tags are empty. No archive/device extraction, vendor storage-ID string overloads, net flags, ports or multi-document bodies.",
  "Metadata has supplied-file scope. Record framing and ZIP integrity are checked; CAD geometry, member reference completeness, pins, dependencies, library ownership, renderability, electrical correctness and import suitability remain unverified. Unknown drawing/manifest fields stay in the exact input artifact and are not projected or executed. No external references are followed.",
  "extract-project-footprint-sources reads only the supplied prepared archive, independently of the SDK getter's current-document export dependency. It requires every .efoo member to have a distinct lowercase 16- or 32-hex UUID.efoo basename. The complete archive-order roster, raw byte hashes and UTF-16 lengths become an exclusive managed JSON index; opaque UTF-8 sources retain BOM, line endings and unknown records. CAD framing and references are not interpreted. list-project-footprint-sources rechecks that whole archive and digest before at most32 metadata entries, so UUID discovery needs no general artifact reader. read-project-footprint-source rechecks the exact whole archive and source-set digest before one lossless text/base64 page, without splitting Unicode surrogate pairs. No live document source or implicit export is obtained.",
  "extract-symbol-sources, list-symbol-sources and read-symbol-source provide the same lossless hash-bound source workflow for prepared ordinary standalone .esym files and canonical SYMBOL/UUID.esym project members. The pinned exporter combines symbols and block symbols, so an archive member does not imply ordinary symbol subtype. inspect-symbol-pins separately recognizes complete ordinary type2 SYMBOL1.0 JSON lines or unique-record native DOCHEAD SYMBOL source. It reports raw-file coordinates/orientation, exact pin attribute values and visibility, with record-index/hash references to the preserved full source. Unknown records remain in that source; no ERC, live membership, pin-to-pad mapping or connectivity proof. Mutable histories/tombstones or ambiguous pin attributes refuse pin inspection without disabling raw source reads.",
  "The installed .epro2 wrapper names introduction, description and tags, but its manager extractor does not return them; these fields remain absent. Library batch inputs reject repeated filename UUIDs instead of the native last-wins deduplication. Names differing only in case are refused as ambiguous.",
  "4 MiB archive input, 8 MiB total inflated content, 256 members, 256 KiB library text or manifest, 8192 library records, 16 library files and 64 KiB response. The ZIP parser has a bounded synchronous inflation step; no unbounded backend RPC is launched.",
] as const;

export const managedLibraryFilesCatalogQuerySchema = z.object({ includeSchemas: z.boolean().default(false) }).strict();
export function queryManagedLibraryFiles(input: unknown = {}): Record<string, unknown> {
  const query = managedLibraryFilesCatalogQuerySchema.parse(input);
  return { offline: true, invocationEnabledByDiscovery: false, executionAuthorized: false, implementationKind: "native-task-equivalent",
    publicSdkMethodExecuted: false, installedRuntimeAdmission: false, methods: [...MANAGED_LIBRARY_FILES_METHODS],
    ...(query.includeSchemas ? { inputSchema: z.toJSONSchema(managedLibraryFilesRequestSchema) } : {}), limitations: [...limitations],
    limits: { archiveBytes: MANAGED_LIBRARY_ARCHIVE_MAX_BYTES, expandedBytes: MANAGED_LIBRARY_ARCHIVE_MAX_EXPANDED_BYTES,
      archiveMembers: MANAGED_LIBRARY_ARCHIVE_MAX_MEMBERS, textBytes: MANAGED_LIBRARY_FILES_MAX_TEXT_BYTES, responseBytes: MANAGED_LIBRARY_FILES_MAX_RESULT_BYTES,
      footprintSourceIndexBytes: MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES, footprintRosterPageEntries: MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES,
      footprintSourcePageUtf16Units: MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS,
      symbolSourceIndexBytes: MANAGED_PROJECT_FOOTPRINT_INDEX_MAX_BYTES, symbolRosterPageEntries: MANAGED_PROJECT_FOOTPRINT_ROSTER_PAGE_ENTRIES,
      symbolSourcePageUtf16Units: MANAGED_PROJECT_FOOTPRINT_SOURCE_PAGE_UNITS, symbolPinPageEntries: MANAGED_SYMBOL_PIN_PAGE_ENTRIES },
    provenance: { apiSha256: "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1",
      uiSha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
      symbolParserSha256: "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd",
      managerSha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d",
      sourceReview: "EasyEDA3.2.209 API0.3.59.1ca9efb5 UI3.2.198.2800f583 manager3.2.185.bf63a159",
      connectedSdkValidation: "not-performed" } };
}

export function validateManagedLibraryFilesArguments(input: unknown): Record<string, unknown> {
  const result = managedLibraryFilesRequestSchema.safeParse(input);
  if (!result.success) { return { valid: false, executionAuthorized: false,
    issues: result.error.issues.slice(0, 16).map((issue) => ({ path: issue.path.map(String), message: issue.message.slice(0, 512) })) }; }
  try {
    if (result.data.action === "prepare-file") {
      const bytes = decodeManagedLibraryBase64(result.data.base64);
      const digest = createHash("sha256").update(bytes).digest("hex");
      validateManagedLibraryFileContents({ schema: "easyeda-pro-control.library-file.v1", name: result.data.name, path: "/not-opened",
        bytes: bytes.length, sha256: digest }, bytes);
      return { valid: true, executionAuthorized: false, requestSummary: { action: result.data.action, name: result.data.name,
        confirmLocalArtifact: true, bytes: bytes.length, sha256: digest, base64Echoed: false } };
    }
    return { valid: true, request: result.data, executionAuthorized: false };
  } catch { return { valid: false, executionAuthorized: false, issues: [{ path: ["base64"], message: "The complete supported file container was not recognized." }] }; }
}
