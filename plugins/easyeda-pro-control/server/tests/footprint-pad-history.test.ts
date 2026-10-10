import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { buildFootprintPadHistoryExpression, buildFootprintPadPropertySteps } from "../src/footprint-pad-history.ts";

const scope = { libraryUuid: "project", metadataOwnerUuid: "owner", footprintUuid: "footprint", footprintName: "Test" };
const padId = "a".repeat(16);
function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "footprint", docType: "PCB", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...base, sha256: sha256Json(base) };
}
const before = snapshot([
  { id: "CANVAS", type: "CANVAS", body: { unit: "mm", originX: 20, originY: -30 } },
  { id: "name", type: "ATTR", body: { key: "Footprint", value: "Test", parentId: "", locked: false } },
  { id: "opaque", type: "FUTURE", body: { retain: true } },
  { id: padId, type: "PAD", body: { groupId: "", netName: "", layerId: 12, num: "1", centerX: 40, centerY: 60, padAngle: 90,
    hole: { holeType: "SLOT", width: 30, height: 10 }, defaultPad: { padType: "RECT", width: 60, height: 40, radius: 0 }, specialPad: [],
    padOffsetX: 5, padOffsetY: 6, relativeAngle: 90, plated: true, padType: "NORMAL", topSolderExpansion: 2, bottomSolderExpansion: 3,
    topPasteExpansion: -1, bottomPasteExpansion: -1, locked: false, zIndex: -1, connectMode: null, spokeSpace: null, spokeWidth: null, spokeAngle: null, unusedInnerLayers: [], padLen: 0 } },
]);
const target = { primitiveId: padId };
const zero = { id: "zero", action: "footprint.pad.modify", target, patch: { x: 0, holeOffsetX: 0, holeOffsetY: 0, holeRotation: 0, solderMaskAndPasteMaskExpansion: { topSolderMask: 0, bottomSolderMask: 0, topPasteMask: 0, bottomPasteMask: 0 } } };
function source(state: NativeSourceSnapshot): string {
  const head = { ...state.document, client: "b".repeat(16), updateTime: 1, version: "1" };
  return `{"type":"DOCHEAD"}||${JSON.stringify(head)}|\n${state.objects.map((object) => `${JSON.stringify({ type: object.type, id: object.id })}||${JSON.stringify(object.body)}|\n`).join("")}`;
}

void test("pad steps retain zeros, source-origin/mm conversion and slot angle ordering", () => {
  const plan = buildFootprintPadPropertySteps(zero, before);
  assert.equal(plan.steps.find((step) => step.key === "centerX")?.value, -0.508);
  for (const key of ["attr-pad-offset-x", "attr-pad-offset-y", "attr-pad-hole-rotation", "attr-soldermask-toplayer", "attr-soldermask-bottomlayer", "attr-pastemask"]) {
    assert.equal(plan.steps.find((step) => step.key === key)?.value, 0);
  }
  const slot = buildFootprintPadPropertySteps({ ...zero, patch: { hole: ["SLOT", 20, 50] } }, before);
  assert.deepEqual(slot.steps.map((step) => [step.key, step.value]), [["attr-pad-hole-shape", "SLOT"], ["attr-pad-hole-width", 0.508], ["attr-pad-hole-length", 1.27], ["attr-pad-hole-rotation", 90]]);
  assert.throws(() => buildFootprintPadPropertySteps({ ...zero, patch: { layer: 1, hole: null } }, before), /layer conversion/u);
  assert.throws(() => buildFootprintPadPropertySteps({ ...zero, patch: { solderMaskAndPasteMaskExpansion: { topSolderMask: 0, bottomSolderMask: 0, topPasteMask: 1, bottomPasteMask: 2 } } }, before), /shared/u);
  const locked = snapshot(before.objects.map((object) => object.id === padId ? { ...object, body: { ...object.body, locked: true } } : object));
  assert.throws(() => buildFootprintPadPropertySteps(zero, locked), /unlock/u);
  assert.deepEqual(buildFootprintPadPropertySteps({ ...zero, patch: { primitiveLock: false } }, locked).steps, [{ route: "attribute", key: "attr-locked", value: "no" }]);
});

void test("native surface pads preserve the absent-hole null angle during land and zero-mask edits", () => {
  const surface = snapshot(before.objects.map((object) => object.id === padId ? { ...object, body: { ...object.body, layerId: 1, hole: null, padOffsetX: 0, padOffsetY: 0, relativeAngle: null, attrsMap: {} } } : object));
  const operation = { ...zero, patch: { pad: ["RECT", 40, 34.016, 0], solderMaskAndPasteMaskExpansion: { topSolderMask: 0, bottomSolderMask: 0, topPasteMask: 0, bottomPasteMask: 0 } } };
  const plan = buildFootprintPadPropertySteps(operation, surface);
  assert.equal(plan.expected.objects.find((object) => object.id === padId)?.body["relativeAngle"], null);
  assert.deepEqual(plan.expected.objects.find((object) => object.id === padId)?.body["attrsMap"], {});
  assert.equal(plan.steps.some((step) => step.key === "attr-pad-hole-rotation"), false);
  assert.throws(() => buildFootprintPadPropertySteps({ ...operation, patch: { holeRotation: 0 } }, surface), /absent-hole angle cannot be changed/u);
});

void test("pad history awaits exact native property completion and rejects collateral before another step", async () => {
  const operation = { ...zero, patch: { holeOffsetX: 0, holeOffsetY: 0 } };
  const code = buildFootprintPadHistoryExpression(operation, before, scope);
  const execute = async (wrongOwner: boolean, collateral: boolean): Promise<{ calls: string[]; cancelled: number }> => {
    let cancelled = 0, state = before, subscriber: ((event: unknown) => void) | undefined;
    const calls: string[] = [];
    const complete = async (): Promise<void> => { await Promise.resolve(); assert.ok(subscriber); subscriber({ triggerFrom: "ATTR_PLANE_UPDATE" }); };
    const bus = { subscribed: { attrUpdate: [{}], panelModifyPad: [{}] },
      rpcCall: (method: string): Promise<unknown> => Promise.resolve({ message: method === "FileSource" ? source(state) : { docType: 4, tabId: "footprint@project" } }),
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Match the pinned native event-bus subscription interface in this completion regression.
      subscribe: (name: string, callback: (event: unknown) => void): { cancel: () => void } => { assert.equal(name, "flushSelectingInfo"); subscriber = callback; return { cancel: (): void => { cancelled += 1; subscriber = undefined; } }; },
      publish: (name: string, payload: { body: { PAD: Record<string, unknown>[] } }): void => {
        assert.equal(name, "attrUpdate"); const fields = payload.body.PAD[0]; assert.ok(fields); assert.equal(fields["attr-id"], padId);
        const key = Object.keys(fields).find((field) => field.startsWith("attr-pad-offset")); assert.ok(key !== undefined); assert.equal(fields[key], 0); calls.push(key);
        state = snapshot(state.objects.map((object) => {
          if (object.id === padId) { return { ...object, body: { ...object.body, [key === "attr-pad-offset-x" ? "padOffsetX" : "padOffsetY"]: 0 } }; }
          return collateral && object.id === "opaque" ? { ...object, body: { retain: false } } : object;
        }));
        void complete();
      } };
    const eda = {
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: "project" }) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: "footprint", documentType: 4, tabId: "footprint@project", parentLibraryUuid: wrongOwner ? "other" : "owner" }) },
      lib_Footprint: { get: (): Promise<unknown> => Promise.resolve({ uuid: "footprint", libraryUuid: "owner", name: "Test", libraryType: "4" }) },
      sys_FileManager: { getDocumentSource: (): Promise<string> => Promise.resolve(source(state)), setDocumentSource: (): never => assert.fail("No source replacement") },
      pcb_PrimitivePad: { get: (id: string): Promise<unknown> => { assert.equal(id, padId); calls.push("result"); return Promise.resolve({ getState_PrimitiveId: (): string => id, done: (): never => assert.fail("No lossy SDK done") }); } },
    };
    const result: unknown = runInNewContext(code, { eda, window: { top: { frames: [], MSG_BUS_PCB: { messageBus: bus } } } });
    await (wrongOwner || collateral ? assert.rejects(Promise.resolve(result), wrongOwner ? /scope drift/u : /unrelated/u) : result);
    return { calls, cancelled };
  };
  assert.deepEqual(await execute(false, false), { calls: ["attr-pad-offset-x", "attr-pad-offset-y", "result"], cancelled: 2 });
  assert.deepEqual(await execute(true, false), { calls: [], cancelled: 0 });
  assert.deepEqual(await execute(false, true), { calls: ["attr-pad-offset-x"], cancelled: 1 });
  const deletion = buildFootprintPadHistoryExpression({ id: "delete", action: "footprint.pad.delete", target: { resultOf: "prior" } }, before, scope, { targetId: padId });
  assert.match(deletion, new RegExp(`pcb_PrimitivePad.*delete.*${padId}`, "u"));
  assert.doesNotMatch(deletion, /resultOf/u);
});
