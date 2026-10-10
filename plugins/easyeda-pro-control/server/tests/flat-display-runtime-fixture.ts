import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { parseDocumentSource } from "../src/document-source.ts";
import { branchUuid, context, fixture, ownerUuid, projectUuid } from "./flat-display-fixture.ts";

interface Action { status: string; __easyedaFlatDisplayToken?: unknown }
// oxlint-disable-next-line typescript/explicit-module-boundary-types, typescript/explicit-function-return-type -- Infer the complete mutable synthetic scene so adversarial tests can replace the exact native receivers without a duplicate model interface.
export function runtimeFixture(value = fixture()) {
  const component = value.native.components[0], page = value.evidence.observation.pages[0];
  const partData = page?.symbols[0], wireData = page?.wires[0];
  const lineData = wireData?.lines[0], pinData = partData?.pins[0];
  assert.ok(page && component && partData && pinData && wireData && lineData);
  const calls: string[] = [];
  const hooks = { start: (): void => undefined, digest: (_count: number): void => undefined, context: (): void => undefined };
  const runner = { currentAction: undefined as Action | undefined, get running(): boolean { return this.currentAction !== undefined; },
    run: async (perform: () => Promise<unknown>, options: { __easyedaFlatDisplayToken?: unknown } = {}): Promise<boolean> => {
      if (runner.running) { return false; }
      calls.push("action"); runner.currentAction = { ...options, status: "running" }; hooks.start();
      try { await perform(); return true; } finally { runner.currentAction = undefined; }
    } };
  const ids = new Map<string, object>(), pins: object[] = [], symbols: object[] = [], wires: object[] = [];
  const contacts = new Map<string, object>();
  const shapes = { actionRunner: runner, idManager: { idMap: ids, get: (id: string): object | undefined => ids.get(id) },
    modelHelpers: { pin: { getSchPinNet: (): string => "SIGNAL" } },
    getModels: (kind: string): object[] => { if (kind === "Symbol") { return symbols; } return kind === "NetGroup" ? wires : []; },
    netPointManager: { getNetPoint: (point: { x: number; y: number }): object | undefined => contacts.get(JSON.stringify([point.x, point.y])) } };
  const attributes = (items: typeof partData.attributes): object[] => items.map((item) => ({ ...item, symbolValue: item.value, blockValue: item.value,
    getValue: (): unknown => item.value, getInstanceValue: (): null => null, getConsistencyData: (): object => item.body }));
  const part = { id: partData.id, modelType: "Symbol", cmdKey: "part", locked: false, symbolUuid: "symbol", partId: "A", shapeManager: shapes,
    getShapes: (): object[] => pins, traversePins: (visit: (pin: object) => void): void => { for (const pin of pins) { visit(pin); } },
    getAttr: (): object[] => attributes(partData.attributes), getConsistencyData: (): object => partData.body };
  const pin = { id: pinData.id, parent: part, shapeManager: shapes, isNoConnectShow: false, origin: { x: 0, y: 0 },
    getAttr: (): object[] => attributes(pinData.attributes), getConsistencyData: (): object => pinData.body };
  pins.push(pin); symbols.push(part); ids.set(part.id, part); ids.set(pin.id, pin);
  const lines: object[] = [];
  const wire = { id: wireData.id, modelType: "NetGroup", type: "wire", combination: null, lines, netNames: attributes(wireData.names),
    getConsistencyData: (): object => wireData.body };
  const line = { id: lineData.id, modelType: "Wire", parent: wire, shapeManager: shapes, points: [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    getConsistencyData: (): object => lineData.body };
  lines.push(line); wires.push(wire); ids.set(wire.id, wire); ids.set(line.id, line);
  const sourceIds = new Map(parseDocumentSource(page.source).objects.filter((row) => row.type !== "META").map((row) => [row.id, 1]));
  for (const record of parseDocumentSource(page.source).objects) {
    if (record.type === "ATTR" || record.type === "TEXT") { ids.set(record.id, { id: record.id, modelType: record.type === "ATTR" ? "Attr" : "Text" }); }
  }
  contacts.set("[0,0]", { x: 0, y: 0, Wire: new Set([line]), Pin: new Set([pin]), Bus: new Set(), BusEntry: new Set() });
  contacts.set("[10,0]", { x: 10, y: 0, Wire: new Set([line]), Pin: new Set(), Bus: new Set(), BusEntry: new Set() });
  const templatePart = { partId: "A" };
  const project = { projectId: projectUuid, branchUuid, isV2Format: false, setting: { universal: { defaultNetName: true } }, netLabelInterPageConnection: true,
    componentCache: { symbolTemplate: { symbol: { consistencyImpl: { state: "initialized" }, shapeManager: {
      getModels: (): object[] => [templatePart], getPart: (): object => templatePart } } } } };
  const source = { raw: page.source.replace('"uuid":"page"', '"uuid":"page","client":"0123456789abcdef","updateTime":100,"version":"100"'), written: "" };
  const consistency = { state: "initialized", decodeAndRealTimeSyncHandler: { getSourceCodeIdMap: (): Map<string, number> => sourceIds },
    getSourceCode: (): string => source.raw, setSourceCode: (raw: string): Promise<boolean> => { calls.push("source"); source.written = raw; return Promise.resolve(true); } };
  const document = { uuid: "page", tabId: context.document.tabId, project_uuid: projectUuid, schematicUuid: "schematic", projectMgr: project,
    shapeManager: shapes, idManager: shapes.idManager, consistencyImpl: consistency, isBlockSymbolInstancePage: false, isSchSheetDoc: (): true => true };
  const manager = { getActiveDoc: (): typeof document => document, getSchDocs: (): (typeof document)[] => [document] };
  const host = { currentProject: project, isHistoryMode: false, messageBus: { rpcCall: (topic: string, args: unknown): Promise<{ message: object }> => {
    assert.equal(topic, "/PrjDB/project/getData"); assert.deepEqual(structuredClone(args), [projectUuid]);
    return Promise.resolve({ message: { uuid: projectUuid, owner: { uuid: ownerUuid }, currentBranch: branchUuid, isV2Format: false } });
  } } };
  let digests = 0;
  const runtime = { SCH: { docMemoryManager: manager }, gVars: host, Blob, DecompressionStream, Uint8Array, DataView, TextDecoder, TextEncoder, Map, Set, atob, btoa,
    crypto: { subtle: { digest: async (algorithm: string, bytes: Uint8Array<ArrayBuffer>): Promise<ArrayBuffer> => {
      const result = await webcrypto.subtle.digest(algorithm, bytes); digests += 1; hooks.digest(digests); return result;
    } } },
    eda: { dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<object> => { hooks.context(); return Promise.resolve(context.document); } },
      sys_FileManager: { getDocumentSource: (): Promise<string> => Promise.resolve(source.raw) },
      dmt_EditorControl: { closeDocument: (): never => { throw new Error("No close in pre-Save tests"); }, openDocument: (): never => { throw new Error("No open in pre-Save tests"); }, activateDocument: (): never => { throw new Error("No activation in pre-Save tests"); } },
      sch_Document: { save: (): never => { calls.push("save"); throw new Error("TEST_SAVE_BOUNDARY"); } } },
  };
  return { runtime, document, shapes, runner, hooks, calls, project, source, pin, part, component };
}
