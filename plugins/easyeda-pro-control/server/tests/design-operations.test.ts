import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { z } from "zod";

import {
  DESIGN_OPERATION_UNIMPLEMENTED,
  buildDesignOperationCallExpression,
  compileDesignOperation,
  compileDesignOperationBatch,
  designOperationBatchSchema,
  designOperationSchema,
  polygonSourceSchema,
} from "../src/design-operations.ts";

const rectangle = ["R", 0, 0, 100, 80, 0, 0];
const line = { net: "GND", layer: 1, startX: 1, startY: 2, endX: 3, endY: 4, lineWidth: 6, primitiveLock: false };
const createFixtures = [
  { family: "line", api: "pcb_PrimitiveLine", properties: line, fields: ["net", "layer", "startX", "startY", "endX", "endY", "lineWidth", "primitiveLock"] },
  { family: "arc", api: "pcb_PrimitiveArc", properties: { ...line, arcAngle: 90, interactiveMode: 1 }, fields: ["net", "layer", "startX", "startY", "endX", "endY", "arcAngle", "lineWidth", "interactiveMode", "primitiveLock"] },
  { family: "via", api: "pcb_PrimitiveVia", properties: { net: "GND", x: 10, y: 20, holeDiameter: 12, diameter: 24, viaType: 0, designRuleBlindViaName: null, solderMaskExpansion: null, primitiveLock: false }, fields: ["net", "x", "y", "holeDiameter", "diameter", "viaType", "designRuleBlindViaName", "solderMaskExpansion", "primitiveLock"] },
  { family: "pad", api: "pcb_PrimitivePad", properties: { layer: 12, padNumber: "1", x: 10, y: 20, rotation: 0, pad: ["ELLIPSE", 40, 40], net: "GND", hole: ["ROUND", 20], holeOffsetX: 0, holeOffsetY: 0, holeRotation: 0, metallization: true, padType: 0, solderMaskAndPasteMaskExpansion: null, heatWelding: null, primitiveLock: false }, fields: ["layer", "padNumber", "x", "y", "rotation", "pad", "net", "hole", "holeOffsetX", "holeOffsetY", "holeRotation", "metallization", "padType", "specialPad", "solderMaskAndPasteMaskExpansion", "heatWelding", "primitiveLock"] },
  { family: "polyline", api: "pcb_PrimitivePolyline", properties: { net: "", layer: 11, polygon: rectangle, lineWidth: 1, primitiveLock: false }, fields: ["net", "layer", "polygon", "lineWidth", "primitiveLock"] },
  { family: "region", api: "pcb_PrimitiveRegion", properties: { layer: 12, complexPolygon: rectangle, ruleType: [3, 5, 7], regionName: "RF", lineWidth: 1, primitiveLock: false }, fields: ["layer", "complexPolygon", "ruleType", "regionName", "lineWidth", "primitiveLock"] },
  { family: "pour", api: "pcb_PrimitivePour", properties: { net: "GND", layer: 1, complexPolygon: rectangle, pourFillMethod: "solid", preserveSilos: false, pourName: "Ground", pourPriority: 1, lineWidth: 1, primitiveLock: false }, fields: ["net", "layer", "complexPolygon", "pourFillMethod", "preserveSilos", "pourName", "pourPriority", "lineWidth", "primitiveLock"] },
  { family: "fill", api: "pcb_PrimitiveFill", properties: { layer: 1, complexPolygon: rectangle, net: "GND", fillMode: 0, lineWidth: 1, primitiveLock: false }, fields: ["layer", "complexPolygon", "net", "fillMode", "lineWidth", "primitiveLock"] },
  { family: "component", api: "pcb_PrimitiveComponent", properties: { component: { libraryUuid: "library", uuid: "device" }, layer: 1, x: 10, y: 20, rotation: 90, primitiveLock: false }, fields: ["component", "layer", "x", "y", "rotation", "primitiveLock"] },
];

void describe("typed PCB operation compiler", () => {
  void it("publishes the entire typed operation union as an MCP-compatible JSON schema", () => {
    const apply = z.object({ action: z.literal("apply"), operation: designOperationSchema, confirmWrite: z.literal(true) }).strict();
    const inspect = z.object({ action: z.literal("inspect"), operationId: z.string() }).strict();
    const request = z.discriminatedUnion("action", [apply, inspect]);
    const requestSchema = z.object({ request }).strict();
    const schema = z.toJSONSchema(requestSchema, { io: "input" });
    assert.equal(schema.type, "object");
    const serialized = JSON.stringify(schema);
    assert.ok(serialized.includes("pcb.rules.configuration.replace"));
    assert.ok(serialized.includes("pcb.component.modify"));
    assert.ok(serialized.includes("pcb.line.create"));
  });

  void it("maps all nine create families to the reviewed positional arguments", () => {
    for (const fixture of createFixtures) {
      const operation = { id: fixture.family, action: `pcb.${fixture.family}.create`, properties: fixture.properties };
      const compiled = compileDesignOperation(operation);
      assert.equal(compiled.call.api, fixture.api);
      assert.equal(compiled.call.method, "create");
      assert.equal(compiled.resultKind, "created-primitive");
      assert.deepEqual(compiled.inverse, { kind: "delete-created", api: fixture.api, resultOf: fixture.family });
      assert.equal(compiled.call.args.length, fixture.fields.length);
      for (const [index, field] of fixture.fields.entries()) {
        const argument = compiled.call.args[index];
        const expected: unknown = Reflect.get(fixture.properties, field);
        if (field === "polygon" || field === "complexPolygon") {
          assert.deepEqual(argument, { kind: "polygon", complex: field === "complexPolygon", source: expected });
        } else if (expected === undefined) { assert.deepEqual(argument, { kind: "undefined" }); }
        else { assert.deepEqual(argument, { kind: "literal", value: expected }); }
      }
      assert.ok(compiled.beforeReads.some((read) => read.purpose === "complete-document-source"));
      assert.ok(compiled.afterReads.some((read) => read.purpose === "target"));
    }
  });

  void it("models modify inverses and refuses to disguise delete/recreate as identity restoration", () => {
    for (const fixture of createFixtures) {
      const modified = compileDesignOperation({ id: "change", action: `pcb.${fixture.family}.modify`, target: { primitiveId: "existing" }, patch: { primitiveLock: true } });
      assert.equal(modified.resultKind, "modified-primitive");
      assert.deepEqual(modified.inverse, { kind: "restore-patch-from-before", api: fixture.api, target: { primitiveId: "existing" }, fields: ["primitiveLock"] });
      assert.deepEqual(modified.expectedFields[0], { field: "primitiveLock", getter: "getState_PrimitiveLock", value: true, authority: "public-getter", comparison: "equals" });
      const deleted = compileDesignOperation({ id: "remove", action: `pcb.${fixture.family}.delete`, target: { primitiveId: "existing" } });
      assert.deepEqual(deleted.inverse, { kind: "restore-from-checkpoint", reason: "deleted-identity" });
      assert.equal(deleted.effect.identity, "delete");
    }
  });

  void it("allows sequential created-ID references but rejects forward, duplicate and wrong-family references", () => {
    const create = { id: "route", action: "pcb.line.create", properties: line };
    const modify = { id: "widen", action: "pcb.line.modify", target: { resultOf: "route" }, patch: { lineWidth: 8 } };
    const operations = [create, modify, { id: "erase", action: "pcb.line.delete", target: { resultOf: "route" } }];
    assert.equal(compileDesignOperationBatch({ operations }).length, 3);
    assert.equal(designOperationBatchSchema.safeParse({ operations: [modify, create] }).success, false);
    assert.equal(designOperationBatchSchema.safeParse({ operations: [create, create] }).success, false);
    assert.equal(designOperationBatchSchema.safeParse({ operations: [create, { ...modify, action: "pcb.via.modify", patch: { diameter: 30 } }] }).success, false);
    assert.throws(() => buildDesignOperationCallExpression(modify), /string/u);
    assert.equal(buildDesignOperationCallExpression(modify, { route: "native-id" }), 'eda.pcb_PrimitiveLine.modify("native-id",{"lineWidth":8})');
  });

  void it("serializes data instead of interpreting caller strings, methods or expression fragments", () => {
    const hostile = '"); globalThis.compromised = true; //';
    const operation = { id: "route", action: "pcb.line.create", properties: { ...line, net: hostile } };
    assert.equal(buildDesignOperationCallExpression(operation), `eda.pcb_PrimitiveLine.create(${JSON.stringify(hostile)},1,1,2,3,4,6,false)`);
    assert.equal(designOperationSchema.safeParse({ ...operation, code: "evil()" }).success, false);
    assert.equal(designOperationSchema.safeParse({ ...operation, action: "pcb.line.constructor" }).success, false);
    assert.equal(designOperationSchema.safeParse({ ...operation, properties: { ...line, callback: "evil()" } }).success, false);
    assert.throws(() => buildDesignOperationCallExpression({ call: { api: "sys_FileManager", method: "deleteFile", args: [] } }));
  });

  void it("validates geometry grammar, finite values, layer families and unimplemented pad fields", () => {
    assert.equal(polygonSourceSchema.safeParse(rectangle).success, true);
    assert.equal(polygonSourceSchema.safeParse([0, 0, "L", 10, 0, 10, 10, "ARC", 90, 0, 0]).success, true);
    assert.equal(polygonSourceSchema.safeParse([0, 0, "L", 10]).success, false);
    assert.equal(polygonSourceSchema.safeParse(["R", 0, 0, 10, 10]).success, false);
    assert.equal(polygonSourceSchema.safeParse([0, 0, "eval", 1, 2]).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.line.create", properties: { ...line, startX: Number.NaN } }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.line.create", properties: { ...line, layer: 12 } }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.component.modify", target: { primitiveId: "a" }, patch: { layer: 15 } }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.pad.modify", target: { primitiveId: "a" }, patch: { padType: 1 } }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.pad.modify", target: { primitiveId: "a" }, patch: { specialPad: [] } }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.line.modify", target: { primitiveId: "a" }, patch: {} }).success, false);
  });

  void it("requires native source for known omitted or rounded public fields", () => {
    const region = compileDesignOperation({ id: "rf", action: "pcb.region.modify", target: { primitiveId: "r" }, patch: { ruleType: [3] } });
    assert.deepEqual(region.expectedFields[0], { field: "ruleType", getter: null, value: [3], authority: "document-source-required", comparison: "equals" });
    const fill = compileDesignOperation({ id: "f", action: "pcb.fill.modify", target: { primitiveId: "f" }, patch: { fillMode: 1 } });
    assert.equal(fill.expectedFields[0]?.authority, "document-source-required");
    const arc = compileDesignOperation({ id: "a", action: "pcb.arc.modify", target: { primitiveId: "a" }, patch: { startX: 1.2345 } });
    assert.equal(arc.expectedFields[0]?.authority, "document-source-required");
    const via = compileDesignOperation({ id: "v", action: "pcb.via.modify", target: { primitiveId: "v" }, patch: { diameter: 24.123 } });
    assert.equal(via.expectedFields[0]?.authority, "document-source-required");
  });

  void it("uses only reviewed polygon factories and preserves the pad's undefined specialPad slot", () => {
    const region = { id: "rf", action: "pcb.region.modify", target: { primitiveId: "r" }, patch: { complexPolygon: rectangle } };
    assert.match(buildDesignOperationCallExpression(region), /eda\.pcb_MathPolygon\.createComplexPolygon\(\["R",0,0,100,80,0,0\]\)/u);
    const fixture = createFixtures.find((entry) => entry.family === "pad");
    assert.ok(fixture);
    assert.equal(buildDesignOperationCallExpression({ id: "pad", action: "pcb.pad.create", properties: fixture.properties }), 'eda.pcb_PrimitivePad.create(12,"1",10,20,0,["ELLIPSE",40,40],"GND",["ROUND",20],0,0,0,true,0,undefined,null,null,false)');
  });

  void it("compiles complete rule collections with a captured-before inverse and rejects unsafe JSON", () => {
    const methods = [
      ["configuration", "getCurrentRuleConfiguration", "overwriteCurrentRuleConfiguration", { name: "Fixture", config: { track: { width: 6 } } }],
      ["net", "getNetRules", "overwriteNetRules", [{ net: "GND", rule: "power" }]],
      ["net-to-net", "getNetByNetRules", "overwriteNetByNetRules", { GND: { VCC: 12 } }],
      ["region", "getRegionRules", "overwriteRegionRules", [{ name: "RF", clearance: 20 }]],
    ] as const;
    for (const [collection, readMethod, writeMethod, value] of methods) {
      const compiled = compileDesignOperation({ id: "rules", action: `pcb.rules.${collection}.replace`, value });
      assert.deepEqual(compiled.call, { api: "pcb_Drc", method: writeMethod, args: [{ kind: "literal", value }] });
      assert.deepEqual(compiled.inverse, { kind: "restore-collection-from-before", api: "pcb_Drc", readMethod, writeMethod });
      assert.deepEqual(compiled.expectedFields[0]?.value, value);
    }
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.rules.configuration.replace", value: { bad: "[MaxDepth]" } }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.rules.configuration.replace", value: { bad: Number.POSITIVE_INFINITY } }).success, false);
    const polluted: unknown = JSON.parse('{"__proto__":{"bad":true}}');
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.rules.configuration.replace", value: polluted }).success, false);
  });

  void it("compiles group names, membership and pair edits with explicit readback comparisons", () => {
    assert.equal(buildDesignOperationCallExpression({ id: "class", action: "pcb.netclass.create", name: "USB", nets: ["D+", "D-"], color: null }), 'eda.pcb_Drc.createNetClass("USB",["D+","D-"],null)');
    const renamed = compileDesignOperation({ id: "rename", action: "pcb.netclass.rename", name: "old", newName: "new" });
    assert.equal(renamed.call.method, "modifyNetClassName");
    assert.equal(renamed.afterReads[2]?.method, "getAllNetClasses");
    assert.equal(renamed.expectedFields[0]?.value, "new");
    assert.equal(renamed.expectedFields[1]?.comparison, "absent");
    const add = compileDesignOperation({ id: "add", action: "pcb.equal-length.add-nets", name: "group", nets: ["clock"] });
    assert.equal(add.call.method, "addNetToEqualLengthNetGroup");
    assert.equal(add.expectedFields[1]?.comparison, "contains-all");
    const remove = compileDesignOperation({ id: "remove", action: "pcb.netclass.remove-nets", name: "group", nets: ["clock"] });
    assert.equal(remove.expectedFields[1]?.comparison, "excludes-all");
    const pair = compileDesignOperation({ id: "pair", action: "pcb.differential-pair.set-positive", name: "USB", net: "DP" });
    assert.equal(pair.call.method, "modifyDifferentialPairPositiveNet");
    assert.equal(pair.expectedFields[1]?.field, "positiveNet");
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.differential-pair.create", name: "USB", positiveNet: "DP", negativeNet: "DP" }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.netclass.create", name: "group", nets: ["DP", "DP"], color: null }).success, false);
  });

  void it("does not invent stack setters or derived copper compute from no-op primitive methods", () => {
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.physical-stack.replace", value: {} }).success, false);
    assert.equal(designOperationSchema.safeParse({ id: "bad", action: "pcb.copper.compute" }).success, false);
    assert.equal(DESIGN_OPERATION_UNIMPLEMENTED.length, 2);
  });
});
