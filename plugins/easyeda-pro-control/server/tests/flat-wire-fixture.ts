import assert from "node:assert/strict";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { schematicFlatTopologyObservationSchema, verifySchematicFlatTopology } from "../src/schematic-flat-topology.ts";
import { encode, fixture, rehash } from "./flat-display-fixture.ts";
import { nativeExportSource } from "./flat-display-native-fixture.ts";

export const wireOperation = { id: "reroute", action: "sch.wire.modify", documentType: 1,
  target: { primitiveId: "wire" }, patch: { line: [[0, 0, 15, 0], [15, 0, 15, -10], [15, -10, 20, -10]], color: null, lineWidth: 1, lineType: 0 } };

export function wireAfter(before: ReturnType<typeof fixture>, source: NativeSourceSnapshot, native: SchematicNativeSnapshot,
  persist = true): ReturnType<typeof fixture> {
  const result = structuredClone(before);
  const page = result.evidence.observation.pages[0]; assert.ok(page);
  result.native = { ...structuredClone(native), source: nativeExportSource(source) }; page.source = result.native.source;
  const rows = new Map(source.objects.map((row) => [row.id, row]));
  const target = page.wires.find((wire) => wire.id === "wire"); assert.ok(target);
  target.lines = source.objects.filter((row) => row.type === "LINE" && row.body["lineGroup"] === "wire").map((row) => ({ id: row.id,
    body: {}, points: [[Number(row.body["startX"]), Number(row.body["startY"])], [Number(row.body["endX"]), Number(row.body["endY"])]] }));
  for (const line of target.lines) { Object.assign(line.body, rows.get(line.id)?.body); }
  type Contact = NonNullable<typeof page>["contacts"][number];
  const contacts = new Map<string, Contact>();
  function point(value: [number, number]): Contact {
    const key = JSON.stringify(value);
    const found = contacts.get(key);
    if (found !== undefined) { return found; }
    const contact = { point: value, lineIds: [] as string[], pinIds: [] as string[] }; contacts.set(key, contact); return contact;
  }
  for (const wire of page.wires) { for (const line of wire.lines) { for (const end of line.points) { point(end).lineIds.push(line.id); } } }
  for (const symbol of page.symbols) { for (const pin of symbol.pins) { point(pin.origin).pinIds.push(pin.id); } }
  page.contacts = [...contacts.values()];
  const observation = schematicFlatTopologyObservationSchema.parse(result.evidence.observation);
  result.evidence = { ...result.evidence, observation, proof: verifySchematicFlatTopology(observation),
    history: rehash({ ...result.evidence.history, documents: result.evidence.history.documents.map((document) => document.uuid === "page" && persist ?
      { ...document, records: source.objects.map((row, index) => ({ ...row, ticket: index + 1, client: null })) } : document) }) };
  return result;
}

export function flatWireFixture(): ReturnType<typeof fixture> {
  const original = fixture(), source = parseDocumentSource(original.native.source);
  const page = original.evidence.observation.pages[0]; assert.ok(page);
  const paths = [[0, 0, 10, 0], [10, 0, 10, 10], [10, 10, 20, 10]];
  const lines = paths.map((path, index) => ({ id: `line${String(index)}`, type: "LINE", body: {
    fillColor: null, fillStyle: null, strokeColor: null, strokeWidth: 1, strokeStyle: "SOLID", lineGroup: "wire",
    startX: path[0], startY: path[1], endX: path[2], endY: path[3] } }));
  const rows = source.objects.filter((row) => row.type !== "LINE" && row.id !== "net-name");
  rows.push(...lines, { id: "net-name", type: "ATTR", body: { parentId: "wire", key: "NET", value: "SIGNAL", x: 0, y: -4,
    keyVisible: false, valueVisible: true, zIndex: 5 } }, { id: "relevance", type: "ATTR", body: { parentId: "wire", key: "Relevance", value: "[]",
    x: null, y: null, keyVisible: false, valueVisible: false, zIndex: 4 } });
  const nextSource = parseDocumentSource(encode(rows));
  const target = page.wires[0]; assert.ok(target); const name = target.names[0]; assert.ok(name);
  Object.assign(name.body, rows.find((row) => row.id === "net-name")?.body);
  return wireAfter(original, nextSource, { ...original.native, source: encode(rows) });
}

export const branchWireOperation = { ...wireOperation, patch: { ...wireOperation.patch,
  line: [[0, 0, 15, 0], [15, 0, 15, -10], [15, 0, 20, 0]] } };
export function flatWireBranchFixture(): ReturnType<typeof fixture> {
  const before = flatWireFixture(), source = parseDocumentSource(before.native.source);
  const paths = [[0, 0, 10, 0], [10, 0, 10, 10], [10, 0, 20, 0]];
  const rows = structuredClone(source.objects);
  for (const row of rows) {
    if (row.type === "LINE") {
      const path = paths[Number(row.id.slice(-1))]; assert.ok(path);
      Object.assign(row.body, { startX: path[0], startY: path[1], endX: path[2], endY: path[3] });
    }
    if (row.id === "relevance" || row.id === "net-name") { row.body["zIndex"] = row.id === "relevance" ? 6 : 7; }
  }
  const name = before.evidence.observation.pages[0]?.wires[0]?.names[0]; assert.ok(name); name.body["zIndex"] = 7;
  return wireAfter(before, parseDocumentSource(encode(rows)), { ...before.native, source: encode(rows) });
}
