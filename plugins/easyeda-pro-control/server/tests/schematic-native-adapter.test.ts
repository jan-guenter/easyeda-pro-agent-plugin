import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";
import { buildSchematicNativeComponentWriteExpression, buildSchematicNativeReadExpression, nativeSchematicAttributePatch, normalizeSchematicNativeSnapshot, schematicNativeSnapshotSchema, schematicPreservedProperties } from "../src/schematic-native-adapter.ts";
import { schematicOperationSchema } from "../src/schematic-operations.ts";

function execute(expression: string, runtime: object): unknown {
  // oxlint-disable-next-line no-new-func, typescript/no-implied-eval -- Execute only this module's fixed generated program against an isolated fake native manager; production accepts no caller JavaScript.
  const run = new Function("globalThis", `return ${expression};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- Deliberately return unknown so the strict snapshot schema validates every field.
  return run(runtime);
}

function makeAttr(id: string, key: string, inherited: string, override: string | null = null): {
    id: string; key: string; symbolValue: string; blockValue: string | null;
    getValue: () => string; getInstanceValue: () => null; getConsistencyData: () => object; setValue: (value: string | null) => boolean;
  } {
    return {
      id, key, symbolValue: inherited, blockValue: override,
      getValue() { return this.blockValue ?? this.symbolValue; },
      getInstanceValue() { return null; },
      getConsistencyData() { return { parentId: "part", key: this.key, value: this.blockValue, x: null, y: null }; },
      setValue(value) { this.blockValue = value; return true; },
    };
}
function fixture(): {
  runtime: object;
  state: { documentUuid: string; tabId: string; runs: number; sourceSuffix: string; exports: number; invalidTime: boolean };
  capture: () => ReturnType<typeof schematicNativeSnapshotSchema.parse>;
} {
  const state = { documentUuid: "page", tabId: "page@project", runs: 0, sourceSuffix: "", exports: 0, invalidTime: false };
  const attributes = [makeAttr("a", "3D Model", "model-id"), makeAttr("b", "Channel ID", "channel"), makeAttr("c", "Manufacturer", "Maker"), makeAttr("d", "Supplier Part", "C123"), makeAttr("e", "Count", "5"), makeAttr("f", "Enabled", "true")];
  const model = {
    id: "part", cmdKey: "part", locked: false,
    origin: { x: 10, y: -20, add1(x: number, y: number): { x: number; y: number } { return { x: this.x + x, y: this.y + y }; } }, rotation: 0, isMirror: false,
    getConsistencyData(): object { return { partId: "p1", x: this.origin.x, y: this.origin.y, rotation: this.rotation, isMirror: this.isMirror, attrs: {}, zIndex: 1 }; },
    getAttr(): typeof attributes { return attributes; },
    getOrCreateAttr(key: string): ReturnType<typeof makeAttr> { const attr = attributes.find((entry) => entry.key === key); if (!attr) { throw new Error("Test requires preexisting attribute."); } return attr; },
    traversePins(_callback: (pin: unknown) => void): void {
      // This fixture has no pins.
    },
    transformToCore(pose: { origin: { x: number; y: number }; rotation: number; isMirror: boolean }): void { this.origin.x = pose.origin.x; this.origin.y = pose.origin.y; this.rotation = pose.rotation; this.isMirror = pose.isMirror; },
  };
  const doc = {
    get uuid(): string { return state.documentUuid; }, get tabId(): string { return state.tabId; }, isSchSheetDoc(): boolean { return true; },
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Match the reviewed native actionRunner.run callback contract in the fake.
    shapeManager: { getModels(): (typeof model)[] { return [model]; }, idManager: { get(): typeof model { return model; } }, actionRunner: { run(callback: () => void): void { state.runs += 1; callback(); } } },
    consistencyImpl: { getSourceCode(): string {
      state.exports += 1;
      const time = state.exports + 1000;
      return `{"type":"DOCHEAD"}||${JSON.stringify({ docType: "SCH_PAGE", uuid: state.documentUuid, client: state.exports.toString(16).padStart(16, "0"), updateTime: time, version: state.invalidTime ? "wrong" : String(time) })}|\n{"id":"part","type":"COMPONENT","ticket":1}||${JSON.stringify(model.getConsistencyData())}|\n${attributes.map((entry, index) => `${JSON.stringify({ id: entry.id, type: "ATTR", ticket: index + 2 })}||${JSON.stringify(entry.getConsistencyData())}`).join("|\n")}${state.sourceSuffix}`;
    } },
  };
  const runtime = { SCH: { docMemoryManager: { getActiveDoc(): typeof doc { return doc; } } } };
  return { runtime, state, capture: () => schematicNativeSnapshotSchema.parse(execute(buildSchematicNativeReadExpression({ documentUuid: "page", tabId: "page@project" }), runtime)) };
}

void describe("fixed native schematic adapter", () => {
  void it("reads inherited properties omitted by public mapping without inventing source metadata", () => {
    const test = fixture();
    const snapshot = test.capture();
    const properties = schematicPreservedProperties(snapshot, "part");
    assert.equal(properties.otherProperty["3D Model"], "model-id");
    assert.equal(properties.otherProperty["Channel ID"], "channel");
    assert.equal(properties.manufacturer, "Maker");
    assert.equal(properties.supplierId, "C123");
    assert.equal(snapshot.components[0]?.attributes[0]?.body["value"], null);
    assert.equal(snapshot.source.startsWith('{"type":"DOCHEAD"}||'), true);
    assert.equal(snapshot.source.includes('"client"'), false);
    assert.deepEqual(test.capture(), snapshot);
    test.state.invalidTime = true;
    assert.throws(test.capture, /metadata shape changed/u);
    test.state.invalidTime = false;
    assert.equal(z.toJSONSchema(schematicNativeSnapshotSchema).type, "object");
    test.state.tabId = "another@project";
    assert.throws(test.capture, /SCH_NATIVE_CONTEXT_MISMATCH/u);
  });

  void it("preserves hidden properties and writes zero/false as native string values through one action", async () => {
    const test = fixture();
    const before = test.capture();
    const code = buildSchematicNativeComponentWriteExpression({ id: "edit", action: "sch.component.modify", target: { primitiveId: "part" }, patch: { x: 15, otherProperty: { Count: 0, Enabled: false } } }, before, "part");
    await execute(code, test.runtime);
    const after = test.capture();
    assert.equal(after.components[0]?.body["x"], 15);
    const properties = schematicPreservedProperties(after, "part");
    assert.equal(properties.otherProperty["Count"], "0");
    assert.equal(properties.otherProperty["Enabled"], "false");
    assert.equal(properties.otherProperty["3D Model"], "model-id");
    assert.equal(properties.manufacturer, "Maker");
    assert.equal(properties.supplierId, "C123");
    assert.equal(test.state.runs, 1);
  });

  void it("refuses binding patches before native dispatch and still edits Manufacturer", async () => {
    const test = fixture();
    const before = test.capture();
    const input = { id: "edit", action: "sch.component.modify", target: { primitiveId: "part" }, patch: { otherProperty: { Manufacturer: "Other Maker" } } };
    const operation = schematicOperationSchema.parse(input);
    assert.equal(operation.action, "sch.component.modify");
    if (operation.action !== "sch.component.modify" || operation.patch.otherProperty === undefined) { throw new Error("Test component patch is missing."); }
    for (const key of ["Device", "Symbol", "Footprint", "OBJ", "3D Model", "3D Model Title", "Origin 3D Model Title", "3D Model Transform", "Origin Footprint"]) {
      assert.throws(() => buildSchematicNativeComponentWriteExpression({ ...input, patch: { otherProperty: { [key]: "replacement" } } }, before, "part"), /Library-binding/u);
      operation.patch.otherProperty = { [key]: "replacement" };
      assert.throws(() => nativeSchematicAttributePatch(operation), /Library-binding/u);
    }
    assert.equal(test.state.runs, 0);
    await execute(buildSchematicNativeComponentWriteExpression(input, before, "part"), test.runtime);
    const properties = schematicPreservedProperties(test.capture(), "part");
    assert.equal(properties.manufacturer, "Other Maker");
    assert.equal(properties.otherProperty["3D Model"], "model-id");
    assert.equal(properties.otherProperty["Channel ID"], "channel");
    assert.equal(test.state.runs, 1);
  });

  void it("rejects stale complete native state and untyped edits before dispatch", async () => {
    const test = fixture();
    const before = test.capture();
    const operation = { id: "edit", action: "sch.component.modify", target: { primitiveId: "part" }, patch: { x: 15 } };
    const code = buildSchematicNativeComponentWriteExpression(operation, before, "part");
    test.state.sourceSuffix = "drift";
    await assert.rejects(async () => { await execute(code, test.runtime); }, /SCH_NATIVE_BASELINE_CHANGED/u);
    assert.equal(test.state.runs, 0);
    assert.throws(() => buildSchematicNativeComponentWriteExpression({ ...operation, code: "caller source" }, before, "part"));
    assert.throws(() => buildSchematicNativeComponentWriteExpression(operation, before, "different"));
    assert.throws(() => buildSchematicNativeComponentWriteExpression({ ...operation, patch: { rotation: 13 } }, before, "part"), /cardinal/u);
  });

  void it("normalizes only the frame's computed update timestamp while preserving stored overrides", () => {
    const old = fixture().capture();
    const sheet = old.components[0]; assert.ok(sheet); sheet.kind = "sheet";
    sheet.attributes.push({ id: "time", key: "@Update Time", value: "19:41:57", symbolValue: "", blockValue: "19:35:23", instanceValue: null, body: { parentId: sheet.id, key: "@Update Time", value: "19:35:23" } });
    const later = structuredClone(old);
    const timestamp = later.components[0]?.attributes.find((attr) => attr.id === "time"); assert.ok(timestamp); timestamp.value = "23:10:30";
    assert.deepEqual(normalizeSchematicNativeSnapshot(old), normalizeSchematicNativeSnapshot(later));
    timestamp.body["value"] = "modified";
    assert.notDeepEqual(normalizeSchematicNativeSnapshot(old), normalizeSchematicNativeSnapshot(later));
    timestamp.value = "unreviewed";
    assert.throws(() => normalizeSchematicNativeSnapshot(later), /timestamp format/u);
    const ordinary = structuredClone(old); const part = ordinary.components[0]; assert.ok(part); part.kind = "part";
    assert.equal(normalizeSchematicNativeSnapshot(ordinary).components[0]?.attributes.find((attr) => attr.id === "time")?.value, "19:41:57");
  });
});
