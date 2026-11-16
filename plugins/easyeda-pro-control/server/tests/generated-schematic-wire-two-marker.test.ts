import assert from "node:assert/strict";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { GENERATED_SCHEMATIC_WIRE_EDIT_FUNCTION as OLD } from "../src/generated-schematic-wire-edit-program.ts";
import { GENERATED_SCHEMATIC_WIRE_TWO_MARKER_EDIT_FUNCTION as NEXT } from "../src/generated-schematic-wire-two-marker-program.ts";

void test("Wire two-marker successor refuses the merged branch before constructors or dispatch", async () => {
  assert.equal(OLD.includes("TWO_MARKER_BRANCH"), false); const index = NEXT.indexOf('bad("TWO_MARKER_BRANCH")'); assert.ok(index !== -1 && index < NEXT.indexOf("Reflect.construct(") && index < NEXT.indexOf("dispatchAttempted=true"));
  const fn: unknown = runInThisContext(`(${  NEXT  })`); assert.ok(typeof fn === "function");
  const target = { rawWindowsPath: "C:\\inert.epro", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), schematicUuid: "c".repeat(32), pageUuid: "d".repeat(32), expectedSourceSha256: "e".repeat(64) }; const lineId = "0222222222222222"; const wireId = "0111111111111111";
  const beforeBody = { fillColor: null, fillStyle: null, strokeColor: "#008800", strokeStyle: "SOLID", strokeWidth: 2, startX: 0, startY: 0, endX: 100, endY: 0, lineGroup: wireId };
  for (const distance of [.01, .25, .2501, 100]) {
    const operation = { operationId: "sch209-wire-edit-two-marker-branch", wireId, lineId, beforeBody, afterBody: { ...beforeBody, startX: 20, startY: 30, endX: 20 + distance, endY: 30 }, peers: Array.from({ length: 6 }, () => ({ id: "invalid", type: "invalid", body: {} })), rootIds: [] };
    const promise: unknown = Reflect.apply(fn, globalThis, [target, "modify", operation]); assert.ok(promise instanceof Promise);
    await assert.rejects(promise, distance <= .25 ? /TWO_MARKER_BRANCH/u : /PEER/u);
  }
});
