import assert from "node:assert/strict";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { SCHEMATIC_FLAT_TOPOLOGY_PROFILE, schematicFlatTopologyObservationSchema, verifySchematicFlatTopology } from "../src/schematic-flat-topology.ts";
import type { FlatDisplayObservationEvidence } from "../src/schematic-flat-read.ts";

export const branchUuid = "c".repeat(32), hash = "d".repeat(64), ownerUuid = "b".repeat(32), projectUuid = "a".repeat(64);
export const context = { project: { uuid: projectUuid, path: "/tmp/disposable-flat.eprj2" },
  document: { uuid: "page", documentType: 1, tabId: `page@${projectUuid}`, parentProjectUuid: projectUuid }, schematic: { uuid: "schematic" } };
export const operation = { id: "display", action: "sch.layout.batch", documentType: 1,
  operations: [{ id: "caption", action: "sch.attribute.display", target: { primitiveId: "attr1" }, patch: { x: 30 } },
    { id: "heading", action: "sch.text.display", target: { primitiveId: "text" }, patch: { y: 50 } }] };
export function encode(records: readonly NativeSourceObject[]): string {
  const rows = records.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}|\n`).join("");
  return `{"type":"DOCHEAD"}||${JSON.stringify({ docType: "SCH_PAGE", uuid: "page", editVersion: "3.2.149.88089769" })}|\n${rows}`;
}
export function rehash(history: NativeHistorySnapshot): NativeHistorySnapshot {
  const documents = history.documents.map((document) => ({ ...document, semanticSha256: sha256Json({ uuid: document.uuid, docType: document.docType,
    metadata: document.metadata, records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) }));
  return { ...history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
export function fixture(): { evidence: FlatDisplayObservationEvidence; native: SchematicNativeSnapshot } {
  const attributes = ["Unique ID", "Designator", "Convert to PCB"].map((key, index) => {
    const value = ["unique-part", "R1", "yes"][index] ?? "";
    return { id: `attr${String(index)}`, key, value, body: { parentId: "part", key, value, x: 0, y: 0, rotation: 0,
      fontFamily: null, fontSize: 10, fontWeight: null, italic: null, underline: null, align: "LEFT_BOTTOM", keyVisible: false, valueVisible: true, zIndex: index } };
  });
  const pinAttributes = [{ id: "pin-number", key: "Pin Number", value: "1", body: { parentId: "pin", key: "Pin Number", value: "1", zIndex: 0 } }];
  const partBody = { x: 0, y: 0, partId: "A", attrs: {}, zIndex: 1, locked: false, groupId: "" };
  const lineBody = { startX: 0, startY: 0, endX: 10, endY: 0, lineGroup: "wire" }, wireBody = { zIndex: 2, locked: false };
  const nameBody = { key: "NET", value: "SIGNAL", parentId: "wire", zIndex: 3 };
  const records: NativeSourceObject[] = [{ id: "META", type: "META", body: { title: "P1", schematic: "schematic", source: "", zIndex: 1 } },
    { id: "part", type: "COMPONENT", body: partBody }, ...attributes.map(({ id, body }) => ({ id, type: "ATTR", body })),
    ...pinAttributes.map(({ id, body }) => ({ id, type: "ATTR", body })), { id: "wire", type: "WIRE", body: wireBody },
    { id: "line", type: "LINE", body: lineBody }, { id: "net-name", type: "ATTR", body: nameBody },
    { id: "text", type: "TEXT", body: { x: 0, y: 0, value: "Heading", rotation: 0, zIndex: 4 } }];
  const source = encode(records);
  const observation = schematicFlatTopologyObservationSchema.parse({ profile: SCHEMATIC_FLAT_TOPOLOGY_PROFILE,
    scope: { projectUuid, schematicUuid: "schematic", activePageUuid: "page", activeTabId: context.document.tabId, pageIds: ["page"] },
    settings: { defaultNetName: true, netLabelInterPageConnection: true }, pages: [{ uuid: "page", tabId: context.document.tabId, source,
      symbols: [{ id: "part", kind: "part", body: partBody, partCount: 1, partNumber: 1, attributes,
        pins: [{ id: "pin", number: "1", origin: [0, 0], noConnect: false, noConnectAttribute: null, body: { x: 0, y: 0 }, attributes: pinAttributes }] }],
      wires: [{ id: "wire", body: wireBody, names: [{ id: "net-name", key: "Name", value: "SIGNAL", body: nameBody }],
        lines: [{ id: "line", body: lineBody, points: [[0, 0], [10, 0]] }] }],
      contacts: [{ point: [0, 0], lineIds: ["line"], pinIds: ["pin"] }, { point: [10, 0], lineIds: ["line"], pinIds: [] }] }] });
  const nativeAttribute = (value: (typeof attributes)[number] | (typeof pinAttributes)[number]): SchematicNativeSnapshot["components"][number]["attributes"][number] =>
    ({ ...value, symbolValue: value.value, blockValue: value.value, instanceValue: null });
  const native: SchematicNativeSnapshot = { profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "page", tabId: context.document.tabId }, source,
    components: [{ id: "part", kind: "part", body: partBody, locked: false, attributes: attributes.map((item) => nativeAttribute(item)),
      pins: [{ id: "pin", body: { x: 0, y: 0 }, attributes: pinAttributes.map((item) => nativeAttribute(item)), net: "SIGNAL", noConnect: null }] }] };
  const documents = [{ uuid: "page", docType: "SCH_PAGE", metadata: parseDocumentSource(source).document, records },
    { uuid: "schematic", docType: "SCH", metadata: { uuid: "schematic", docType: "SCH" }, records: [{ id: "META", type: "META", body: { title: "Flat", source: "" } }] },
    { uuid: "pcb", docType: "PCB", metadata: { uuid: "pcb", docType: "PCB" }, records: [{ id: "META", type: "META", body: { title: "Peer" } }] }]
    .map(({ uuid, docType, metadata, records: rows }) => ({ uuid, docType, metadata,
      records: rows.map((record, index) => ({ ...record, ticket: index + 1, client: null })), semanticSha256: hash }));
  const history = rehash({ profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid, projectOwnerUuid: ownerUuid, branchUuid,
    headHistoryUuid: "e".repeat(32), checkpointSha256: hash, historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents, semanticSha256: hash });
  const fileIdentity = { birthtimeNs: "1", ctimeNs: "1", dev: "1", ino: "1" };
  const checkpoint = { schema: "easyeda-pro-control.checkpoint.v2" as const, createdAt: "fixture", source: context.project.path,
    checkpoint: "/tmp/disposable-flat-copy.eprj2", sourceIdentity: fileIdentity, checkpointIdentity: fileIdentity,
    sourceSha256: hash, checkpointSha256: hash, sourceDumpSha256: hash, checkpointDumpSha256: hash,
    receiptSha256: hash, receiptPath: "/tmp/disposable-flat.checkpoint.json" };
  return { evidence: { observation, proof: verifySchematicFlatTopology(observation), checkpoint, history,
    projectBinding: { projectUuid, ownerUuid, branchUuid } }, native };
}
export function replaceSource(value: ReturnType<typeof fixture>, source: NativeSourceSnapshot, native: SchematicNativeSnapshot): ReturnType<typeof fixture> {
  const result = structuredClone(value);
  const page = result.evidence.observation.pages[0]; assert.ok(page);
  result.native = structuredClone(native); page.source = native.source;
  for (const model of page.symbols) {
    const current = native.components.find((entry) => entry.id === model.id); assert.ok(current);
    model.body = structuredClone(current.body);
    for (const attribute of model.attributes) {
      const currentAttribute = current.attributes.find((entry) => entry.id === attribute.id); assert.ok(currentAttribute);
      attribute.body = structuredClone(currentAttribute.body); attribute.value = currentAttribute.value;
    }
  }
  result.evidence = { ...result.evidence, proof: verifySchematicFlatTopology(result.evidence.observation),
    history: rehash({ ...result.evidence.history, documents: result.evidence.history.documents.map((document) => document.uuid === "page" ?
      { ...document, records: source.objects.map((record, index) => ({ ...record, ticket: index + 1, client: null })) } : document) }) };
  return result;
}
