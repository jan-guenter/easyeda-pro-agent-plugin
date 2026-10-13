import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory } from "./artifacts.ts";
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { assertUnchangedLibraryCheckpoint } from "./library-checkpoint.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { nativeLibraryHeaderEvidence } from "./native-library-header-evidence.ts";

const MAX_ITEMS = 20_000;
const EDIT_VERSION = "3.2.149.88089769";
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
// oxlint-disable-next-line eslint/no-control-regex -- Reject transport control characters in literal native identities.
const identity = z.string().min(1).max(256).regex(/^[^\u0000-\u001F\u007F]+$/u);
const finite = z.number();
const componentSchema = z.object({ partitionId: z.literal(""), groupId: z.literal(0), layerId: z.literal(1), x: finite, y: finite,
  angle: z.literal(0), attrs: z.object({ "Unique ID": z.string(), "Channel ID": z.string(), "Group ID": z.literal(""), "Reuse Block": z.literal("") }).strict(),
  locked: z.literal(false), zIndex: finite }).strict();
const lineSchema = z.object({ groupId: z.literal(0), netName: z.literal(""), layerId: z.literal(3), startX: finite, startY: finite,
  endX: finite, endY: finite, width: finite.positive(), locked: z.literal(false), zIndex: finite }).strict();
const canvasSchema = z.object({ originX: z.literal(0), originY: z.literal(0), unit: z.string(), gridXSize: finite, gridYSize: finite,
  snapXSize: finite, snapYSize: finite, gridType: z.string(), multiGridType: z.string(), highlightValue: finite }).strict();
const observedLineSchema = z.object({ primitiveId: identity, primitiveType: z.literal("Line"), net: z.literal(""), layer: z.literal(3),
  startX: finite, startY: finite, endX: finite, endY: finite, lineWidth: finite.positive(), primitiveLock: z.literal(false) }).strict();
const componentInventorySchema = z.object({ status: z.literal("adapter-enumerated"), count: z.number().int().min(0).max(MAX_ITEMS),
  primitiveIds: z.array(identity).max(MAX_ITEMS) }).strict();
const fileIdentity = z.object({ birthtimeNs: z.string().min(1), ctimeNs: z.string().min(1), dev: z.string().min(1), ino: z.string().min(1) });
const checkpointSchema = z.object({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), createdAt: z.string().min(1),
  source: z.string().min(1), checkpoint: z.string().min(1), sourceIdentity: fileIdentity, checkpointIdentity: fileIdentity,
  sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash,
  receiptSha256: hash, receiptPath: z.string().min(1) }).catchall(z.unknown());
const ordinaryFootprintRecords = new Set(["LAYER", "NET", "LINE", "ACTIVE_LAYER", "CANVAS", "FILL", "POLY", "ATTR", "PAD", "META", "ELE_PLACEHOLDER"]);
const generatedEvidence = new WeakSet<object>();
const services = { readNativeHistoryCheckpoint, nativeLibraryHeaderEvidence };
type Host = Pick<EasyedaControlEngine, "assertBridgeDispatchAllowed" | "assertContext" | "checkpoint">;

export interface PcbInheritedLine {
  readonly primitiveId: string;
  readonly primitiveType: "Line";
  readonly net: "";
  readonly parentComponentPrimitiveId: string;
  readonly sourceRecordId: string;
  readonly sourceType: "FOOTPRINT_LINE";
  readonly sourceDocumentUuid: string;
}
export interface PcbInheritedLineEvidence {
  readonly sourceSha256: string;
  readonly inventorySha256: string;
  readonly members: readonly PcbInheritedLine[];
  readonly proof: {
    readonly profile: "easyeda-pro-control.pcb-inherited-neutral-lines.v1";
    readonly checkpointSha256: string;
    readonly projectUuid: string;
    readonly branchUuid: string;
    readonly pcbDocumentUuid: string;
    readonly footprints: readonly { readonly documentUuid: string; readonly semanticSha256: string }[];
    readonly instances: readonly PcbInheritedLine[];
  };
}
export interface PcbInheritedLineScope {
  readonly reprove: () => Promise<void>;
  readonly derive: (source: NativeSourceSnapshot, inventory: unknown) => PcbInheritedLineEvidence;
  readonly receiptPath: string;
  readonly libraryHeaderEvidenceSha256: string;
}

function bindings(rows: readonly { readonly id: string; readonly type: string; readonly body: Record<string, unknown> }[]): unknown[] {
  return rows.filter((row) => row.type === "COMPONENT" || row.type === "ATTR" && row.body["key"] === "Footprint")
    .map(({ id, type, body }) => ({ id, type, body })).toSorted((left, right) => left.id.localeCompare(right.id));
}
function documentIdentity(document: NativeDocumentSnapshot): void {
  if (isNativeDocumentDeleted(document) || document.records.length > MAX_ITEMS || new Set(document.records.map((row) => row.id)).size !== document.records.length ||
      document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType || document.metadata["editVersion"] !== EDIT_VERSION ||
      document.semanticSha256 !== sha256Json({ uuid: document.uuid, docType: document.docType, metadata: document.metadata,
        records: document.records.map(({ id, type, body }) => ({ id, type, body })) })) {
    throw new Error("PCB inherited Line checkpoint document identity or commitment is invalid.");
  }
}
function inventoryFamilies(inventory: unknown): Record<string, unknown> {
  if (!isRecord(inventory) || !isRecord(inventory["families"])) { throw new Error("PCB inherited Line inventory is malformed."); }
  return inventory["families"];
}

/** Detection is not admission: no owner is inferred from observed IDs. Explicit
 * Footprint associations also require proof when ALL inherited rows are absent;
 * otherwise an incomplete inventory could silently bypass this verifier.
 */
export function pcbNeedsInheritedLineEvidence(source: NativeSourceSnapshot, inventory: unknown): boolean {
  if (source.objects.some((row) => row.type === "ATTR" && row.body["key"] === "Footprint")) { return true; }
  const lines = inventoryFamilies(inventory)["lines"];
  if (!isRecord(lines) || !Array.isArray(lines["primitiveIds"])) { throw new Error("PCB inherited Line family is malformed."); }
  const standalone = new Set(source.objects.filter((row) => row.type === "LINE").map((row) => row.id));
  return lines["primitiveIds"].some((id: unknown) => typeof id === "string" && !standalone.has(id));
}

/** Internal pure projection; the public coordinators obtain history only from
 * capturePcbInheritedLineScope, never from MCP arguments. Pinned PCB 65401cdc:
 * component decoder 4161703 resolves the explicit Footprint ATTR; qI's
 * formatParseBuild prefixes cloned template globalIndex, Ri.addCompositionItem
 * 4292218 sets the actual model parent. Ri.position 4283072 translates children.
 * track-getAll 10290781 converts internal coordinates back by *10. This narrow
 * profile reproduces that arithmetic, not a tolerance or an observed ID prefix.
 * POLY/FILL are drawing families, not the _r Track controllers enumerated here.
 * Custom FOOTPRINT chains, rotations, bottom flips and origin offsets refuse.
 */
export function derivePcbInheritedLines(source: NativeSourceSnapshot, inventory: unknown, history: NativeHistorySnapshot): PcbInheritedLineEvidence {
  const pcbUuid = identity.parse(source.document["uuid"]);
  if (source.document["docType"] !== "PCB" || source.document["editVersion"] !== EDIT_VERSION ||
      source.sha256 !== sha256Json({ schema: source.schema, document: source.document, objects: source.objects }) ||
      source.objects.length > MAX_ITEMS || Buffer.byteLength(JSON.stringify(history)) > 32 * 1024 * 1024 ||
      new Set(history.documents.map((row) => row.uuid)).size !== history.documents.length) {
    throw new Error("PCB inherited Line source or checkpoint bound is invalid.");
  }
  const documents = new Map(history.documents.map((document) => [document.uuid, document]));
  const pcb = documents.get(pcbUuid);
  if (pcb?.docType !== "PCB") { throw new Error("PCB inherited Line checkpoint lacks the active PCB."); }
  documentIdentity(pcb);
  if (canonicalJson(bindings(pcb.records)) !== canonicalJson(bindings(source.objects))) {
    throw new Error("PCB inherited Line live component/Footprint bindings differ from the fresh checkpoint.");
  }
  const components = source.objects.filter((row) => row.type === "COMPONENT");
  const componentIds = new Set(components.map((row) => row.id));
  const families = inventoryFamilies(inventory);
  const observedComponents = componentInventorySchema.parse(families["components"]);
  if (componentIds.size !== components.length || observedComponents.count !== components.length ||
      canonicalJson(observedComponents.primitiveIds.toSorted()) !== canonicalJson([...componentIds].toSorted())) {
    throw new Error("PCB inherited Line component inventory is incomplete or ambiguous.");
  }
  const attrs = source.objects.filter((row) => row.type === "ATTR" && row.body["key"] === "Footprint");
  if (attrs.length !== components.length || attrs.some((row) => !componentIds.has(String(row.body["parentId"])))) {
    throw new Error("PCB inherited Line Footprint associations are incomplete or ambiguous.");
  }
  const links = new Map<string, string>();
  for (const attr of attrs) {
    const owner = identity.parse(attr.body["parentId"]);
    if (links.has(owner)) { throw new Error("PCB inherited Line requires one explicit Footprint association per component."); }
    links.set(owner, identity.parse(attr.body["value"]));
  }
  const lines = families["lines"];
  if (!isRecord(lines) || !isRecord(lines["byPrimitiveId"])) { throw new Error("PCB inherited Line state rows are absent."); }
  const generatedIds = new Set<string>(), sourceIds = new Set(source.objects.map((row) => row.id));
  const members: PcbInheritedLine[] = [], usedFootprints = new Map<string, string>();
  const validatedFootprints = new Map<string, NativeDocumentSnapshot["records"]>();
  for (const component of components) {
    const pose = componentSchema.parse(component.body);
    const footprintUuid = identity.parse(links.get(component.id));
    const footprint = documents.get(footprintUuid);
    if (footprint?.docType !== "FOOTPRINT") { throw new Error("PCB inherited Line ordinary footprint is absent from the checkpoint."); }
    let templates = validatedFootprints.get(footprintUuid);
    if (templates === undefined) {
      documentIdentity(footprint);
      const canvas = footprint.records.filter((row) => row.type === "CANVAS"), meta = footprint.records.filter((row) => row.type === "META");
      if (canvas.length !== 1 || canvas[0]?.id !== "CANVAS" || meta.length !== 1 || meta[0]?.id !== "META" ||
          footprint.records.some((row) => !ordinaryFootprintRecords.has(row.type) ||
            row.body["partitionId"] !== undefined && row.body["partitionId"] !== "" ||
            row.body["groupId"] !== undefined && row.body["groupId"] !== 0)) {
        throw new Error("PCB inherited Line requires an ordinary nonpartitioned footprint without custom chains.");
      }
      canvasSchema.parse(canvas[0].body);
      templates = footprint.records.filter((row) => row.type === "LINE");
      validatedFootprints.set(footprintUuid, templates);
    }
    usedFootprints.set(footprintUuid, footprint.semanticSha256);
    for (const record of templates) {
      const primitiveId = identity.parse(component.id + identity.parse(record.id)), template = lineSchema.parse(record.body);
      if (sourceIds.has(primitiveId) || generatedIds.has(primitiveId) || members.length >= MAX_ITEMS) {
        throw new Error("PCB inherited Line generated identities collide or exceed their bound.");
      }
      generatedIds.add(primitiveId);
      const actual = observedLineSchema.parse(lines["byPrimitiveId"][primitiveId]);
      const expected = { primitiveId, primitiveType: "Line", net: "", layer: 3,
        startX: (template.startX / 10 + pose.x / 10) * 10, startY: (template.startY / 10 + pose.y / 10) * 10,
        endX: (template.endX / 10 + pose.x / 10) * 10, endY: (template.endY / 10 + pose.y / 10) * 10,
        lineWidth: template.width / 10 * 10, primitiveLock: false };
      if (canonicalJson(actual) !== canonicalJson(expected)) { throw new Error("PCB inherited Line geometry, layer, lock, net or identity disagrees with its explicit source owner."); }
      members.push(Object.freeze({ primitiveId, primitiveType: "Line", net: "", parentComponentPrimitiveId: component.id,
        sourceRecordId: record.id, sourceType: "FOOTPRINT_LINE", sourceDocumentUuid: footprintUuid }));
    }
  }
  members.sort((left, right) => left.primitiveId.localeCompare(right.primitiveId));
  const proof = Object.freeze({ profile: "easyeda-pro-control.pcb-inherited-neutral-lines.v1" as const,
    checkpointSha256: hash.parse(history.checkpointSha256), projectUuid: history.projectUuid, branchUuid: history.branchUuid, pcbDocumentUuid: pcbUuid,
    footprints: Object.freeze([...usedFootprints].toSorted(([left], [right]) => left.localeCompare(right)).map(([documentUuid, semanticSha256]) =>
      Object.freeze({ documentUuid, semanticSha256 }))), instances: Object.freeze(members) });
  const evidence = Object.freeze({ sourceSha256: source.sha256, inventorySha256: sha256Json(inventory), members: proof.instances, proof });
  generatedEvidence.add(evidence);
  return evidence;
}

export function assertPcbInheritedLineEvidence(evidence: PcbInheritedLineEvidence, source: NativeSourceSnapshot, inventory: unknown): void {
  if (!generatedEvidence.has(evidence) || evidence.sourceSha256 !== source.sha256 || evidence.inventorySha256 !== sha256Json(inventory)) {
    throw new Error("PCB inherited Line proof is not generated for these exact observations.");
  }
}

/** Creates only a managed backup/read-only history observation. No Save,
 * getDocumentFile, library navigation, native decoder or caller proof is used.
 * Verification rechecks the complete current database against this receipt,
 * not only the selected library record. A changed peer therefore refuses.
 */
export async function capturePcbInheritedLineScope(engine: Host, expectedContext: ExpectedContext,
  overrides: Partial<typeof services> = {}): Promise<PcbInheritedLineScope> {
  const context = structuredClone(expectedContext), dependencies = { ...services, ...overrides };
  const projectUuid = identity.parse(context.project.uuid ?? context.project.projectUuid);
  const documentUuid = identity.parse(context.document.uuid ?? context.document.documentUuid);
  if (context.document.documentType !== 3 || context.document["parentProjectUuid"] !== projectUuid ||
      context.document["parentLibraryUuid"] !== undefined || context.document.tabId !== documentUuid && context.document.tabId !== `${documentUuid}@${projectUuid}` ||
      typeof context.project.path !== "string" || context.project.path.length === 0) {
    throw new Error("PCB inherited Line requires a project-owned active PCB and an explicit checkpoint source path.");
  }
  const unchangedContext = async (): Promise<void> => {
    await engine.assertBridgeDispatchAllowed();
    const observed = await engine.assertContext(context);
    if (canonicalJson(observed) !== canonicalJson(context)) { throw new Error("PCB inherited Line checkpoint context changed."); }
  };
  await unchangedContext();
  const outputDir = join(controlDataDirectory(), "checkpoints");
  const checkpoint = checkpointSchema.parse(await engine.checkpoint({ source: context.project.path,
    outputDir, label: "pcb-inherited-line-membership" }));
  const reprove = async (): Promise<void> => {
    await unchangedContext();
    const result = await engine.checkpoint({ receiptPath: checkpoint.receiptPath });
    assertUnchangedLibraryCheckpoint(result, checkpoint, "PCB inherited Line requires an unchanged complete checkpoint throughout both observation cycles.");
    await unchangedContext();
  };
  await reprove();
  const history = await dependencies.readNativeHistoryCheckpoint({ checkpointPath: checkpoint.checkpoint,
    expectedSha256: checkpoint.checkpointSha256, projectUuid, libraryAtomHeaders: "preserve" });
  const headers = await dependencies.nativeLibraryHeaderEvidence(history, { checkpointSha256: checkpoint.checkpointSha256, projectUuid });
  await reprove();
  return Object.freeze({ reprove, derive: (source: NativeSourceSnapshot, inventory: unknown): PcbInheritedLineEvidence =>
    derivePcbInheritedLines(source, inventory, history), receiptPath: checkpoint.receiptPath, libraryHeaderEvidenceSha256: headers.sha256 });
}
