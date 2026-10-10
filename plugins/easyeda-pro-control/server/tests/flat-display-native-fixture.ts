import assert from "node:assert/strict";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { verifySchematicFlatTopology } from "../src/schematic-flat-topology.ts";
import { context, encode, fixture, rehash } from "./flat-display-fixture.ts";

export const nativeFormatOperation = { id: "native-format-display", action: "sch.layout.batch", documentType: 1,
  operations: [{ id: "move-text", action: "sch.text.display", target: { primitiveId: "text" }, patch: { x: 290 } }] };

/** Synthetic identities, real native representation: pinless frame plus TEXT,
 * source-only CANVAS, durable-only META, and unpersisted frame initialization.
 * No retained user/fixture source, IDs or library definitions are copied here.
 */
export function nativeFormatFixture(): ReturnType<typeof fixture> {
  const result = fixture();
  const page = result.evidence.observation.pages[0]; assert.ok(page);
  const component = { id: "frame", type: "COMPONENT", body: { partId: "frame-part", x: 0, y: 0, rotation: 0, isMirror: false, attrs: {}, zIndex: 0 } };
  const attributes = Array.from({ length: 29 }, (_, index) => {
    const visible = index < 13;
    const id = index === 0 ? "company" : `attribute${String(index).padStart(2, "0")}`, key = index === 0 ? "Company" : `Synthetic field ${String(index)}`;
    const value = `Synthetic value ${String(index)}`;
    return { id, key, value, body: { parentId: "frame", key, value, x: visible ? 10 + index : null, y: visible ? 20 : null,
      zIndex: index + 2, ...(visible ? { strikeout: false } : {}) } };
  });
  const rows = [component, ...attributes.map(({ id, body }) => ({ id, type: "ATTR", body })),
    { id: "text", type: "TEXT", body: { x: 280, y: -400, rotation: 0, value: "Synthetic text", zIndex: 1 } },
    { id: "untouched-text", type: "TEXT", body: { x: 50, y: -100, rotation: 0, value: "Unchanged note", zIndex: 2 } },
    { id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }];
  const source = encode(rows);
  result.native = { profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "page", tabId: context.document.tabId }, source,
    components: [{ id: component.id, kind: "sheet", locked: false, body: component.body, pins: [],
      attributes: attributes.map((attribute) => ({ ...attribute, symbolValue: attribute.value, blockValue: null, instanceValue: null })).toSorted((left, right) => left.id.localeCompare(right.id)) }] };
  page.source = source; page.wires = []; page.contacts = [];
  page.symbols = [{ id: component.id, kind: "sheet", body: component.body, partCount: 1, partNumber: 1, attributes, pins: [] }];
  const documents = result.evidence.history.documents.map((document) => document.uuid === "page" ? { ...document,
    records: [...document.records.filter((record) => record.id === "META"), ...rows.filter((row) => row.id !== "CANVAS").map((row, index) => Object.assign(structuredClone(row), {
      body: row.id === "frame" ? { ...row.body, zIndex: null } : Object.fromEntries(Object.entries(row.body).filter(([key]) => key !== "strikeout")
        .map(([key, value]) => [key, row.type === "ATTR" && key === "zIndex" && typeof value === "number" ? value + (value <= 14 ? -1 : 57) : value])),
      ticket: index + 2, client: null }))].toSorted((left, right) => left.id.localeCompare(right.id)) } : document);
  const peer = documents.find((document) => document.uuid === "pcb"); assert.ok(peer);
  for (let index = 0; index < 6; index += 1) {
    const uuid = `peer${String(index)}`;
    documents.push({ ...structuredClone(peer), uuid, docType: "CONFIG", metadata: { uuid, docType: "CONFIG" } });
  }
  result.evidence = { ...result.evidence, history: rehash({ ...result.evidence.history, documents }), proof: verifySchematicFlatTopology(result.evidence.observation) };
  return result;
}

export function nativeFormatAfter(before: ReturnType<typeof fixture>, source: NativeSourceSnapshot, native: SchematicNativeSnapshot,
  persist = true): ReturnType<typeof fixture> {
  const result = structuredClone(before);
  const frame = native.components[0], page = result.evidence.observation.pages[0];
  assert.ok(page && frame);
  result.native = structuredClone(native); page.source = native.source;
  page.symbols = [{ id: frame.id, kind: "sheet", body: frame.body, partCount: 1, partNumber: 1,
    attributes: frame.attributes.map(({ id, key, value, body }) => ({ id, key, value, body })), pins: [] }];
  const documents = before.evidence.history.documents.map((document) => document.uuid === "page" && persist ? { ...document,
    records: [...document.records.filter((record) => record.id === "META"),
      ...source.objects.map((record, index) => ({ ...record, ticket: index + 2, client: null }))].toSorted((left, right) => left.id.localeCompare(right.id)) } : document);
  result.evidence = { ...result.evidence, history: rehash({ ...before.evidence.history, documents }), proof: verifySchematicFlatTopology(result.evidence.observation) };
  assert.equal(parseDocumentSource(native.source).objects.some((record) => record.type === "META"), false);
  return result;
}
