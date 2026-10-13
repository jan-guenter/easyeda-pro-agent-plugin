import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { extractToolPayload } from "../src/core.ts";
import { nativeFailureCategory } from "../src/native-diagnostics.ts";
import { buildSchematicNativeReadExpression, schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import { buildSchematicFlatTopologyExpression } from "../src/schematic-flat-topology.ts";
import { SCHEMATIC_FLAT_READ_GUARD_CODES, SCHEMATIC_FLAT_TOPOLOGY_GUARD_CODES } from "../src/schematic-read-diagnostics.ts";

const binding = { documentUuid: "page", tabId: "page@project" };
function execute(runtime: object): unknown {
  // oxlint-disable-next-line no-new-func, typescript/no-implied-eval -- Run only the maintained fixed reader against synthetic native objects, never live caller code.
  const run = new Function("globalThis", `return ${buildSchematicNativeReadExpression(binding)};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- Validate successful synthetic results with the maintained strict snapshot schema.
  return run(runtime);
}
function pinScene(net: () => unknown): { runtime: object; calls: string[]; helper: { getSchPinNet?: (pin: unknown) => unknown }; } {
  const calls: string[] = [];
  const pin = { id: "preview-pin", getConsistencyData: (): object => ({ x: 1, y: 2 }), getAttr: (): object[] => [] };
  const helper = { getSchPinNet(item: unknown): unknown { assert.equal(this, helper); assert.equal(item, pin); calls.push("pin-net"); return net(); } };
  const model = { id: "preview", cmdKey: "part", getConsistencyData: (): object => ({}), getAttr: (): object[] => [],
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Match native synchronous pin traversal, not a promise callback.
    traversePins(callback: (item: typeof pin) => void): void { calls.push("pins"); callback(pin); } };
  const doc = { uuid: binding.documentUuid, tabId: binding.tabId, isSchSheetDoc: (): boolean => true,
    shapeManager: { getModels: (): object[] => [model], modelHelpers: { pin: helper } },
    consistencyImpl: { getSourceCode: (): string => { calls.push("source"); return '{"type":"DOCHEAD"}||{"uuid":"page","docType":"SCH_PAGE","client":"0123456789abcdef","updateTime":100,"version":"100"}|\n'; } } };
  return { runtime: { SCH: { docMemoryManager: { getActiveDoc: (): object => doc } } }, calls, helper };
}

void test("native pin-cache exceptions retain one fixed stage and never return a partial snapshot", () => {
  for (const failure of [new Error("private-pin-cache-path"), "private-pin-cache-string", Object.freeze({ secret: "private-pin-cache-object" })]) {
    const scene = pinScene(() => {
      // oxlint-disable-next-line typescript/only-throw-error -- Native JavaScript may throw arbitrary values; none may leak into the retained fixed diagnostic.
      throw failure;
    });
    let caught: unknown;
    try { execute(scene.runtime); } catch (error) { caught = error; }
    assert.ok(caught instanceof Error); assert.equal(caught.message, "SCH_NATIVE_PIN_NET_EXCEPTION");
    assert.equal(caught.cause, undefined); assert.doesNotMatch(caught.stack ?? "", /private-pin-cache/u);
    assert.deepEqual(scene.calls, ["pins", "pin-net"], "No retry, source serialization, compilation, Save or partial result after the failed pin.");
  }
});

void test("native pin stage preserves empty successful nets, receiver, missing getter and invalid result guards", () => {
  const successful = pinScene(() => "");
  const snapshot = schematicNativeSnapshotSchema.parse(execute(successful.runtime));
  assert.equal(snapshot.components[0]?.pins[0]?.net, ""); assert.deepEqual(successful.calls, ["pins", "pin-net", "source"]);
  const invalid = pinScene(() => null); assert.throws(() => execute(invalid.runtime), /SCH_NATIVE_PIN_NET_INVALID/u);
  const missing = pinScene(() => ""); Reflect.deleteProperty(missing.helper, "getSchPinNet");
  assert.throws(() => execute(missing.runtime), /SCH_NATIVE_PIN_NET_MISSING/u); assert.deepEqual(missing.calls, ["pins"]);
});

void test("every flat native guard remains classifiable without admitting foreign labels or private suffixes", async () => {
  const scope = { projectUuid: "project", schematicUuid: "schematic", activePageUuid: "page", activeTabId: "page@project", pageIds: ["page"] };
  for (const mode of [undefined, "flat-display-owned-action"] as const) {
    const code = buildSchematicFlatTopologyExpression(scope, mode);
    const emitted = [...new Set([...code.matchAll(/fail\('([A-Z_]+)'\)/gu)].map((match) => match[1] ?? ""))].toSorted();
    assert.deepEqual(emitted, SCHEMATIC_FLAT_TOPOLOGY_GUARD_CODES.toSorted());
  }
  const reader = await readFile(new URL("../src/schematic-flat-read.ts", import.meta.url), "utf8");
  const envelopeCodes = [...new Set([...reader.matchAll(/new Error\('(SCH_FLAT_[A-Z_]+)'\)/gu)].map((match) => match[1] ?? ""))].toSorted();
  assert.deepEqual(envelopeCodes, SCHEMATIC_FLAT_READ_GUARD_CODES.toSorted());
  const messages = ["SCH_NATIVE_PIN_NET_EXCEPTION", ...SCHEMATIC_FLAT_READ_GUARD_CODES,
    ...SCHEMATIC_FLAT_TOPOLOGY_GUARD_CODES.map((code) => `SCH_FLAT_TOPOLOGY_${code}`)];
  assert.equal(new Set(messages).size, messages.length);
  for (const message of messages) {
    assert.equal(nativeFailureCategory(message), `native-preflight:${message}`);
    const failure = { ok: false, error: { message } };
    for (const envelope of [
      { isError: true, structuredContent: failure },
      { content: [{ type: "text", text: JSON.stringify(failure) }] },
      { structuredContent: { result: failure } },
    ]) { assert.throws(() => extractToolPayload(envelope), new RegExp(`\\[native-preflight:${message}\\]`, "u")); }
    for (const invalid of [`${message}:private-path`, `${message}\nprivate-stack`, ` ${message}`, `${message} `, message.toLowerCase()]) {
      assert.equal(nativeFailureCategory(invalid), null);
    }
  }
  for (const unknown of ["SCH_FLAT_TOPOLOGY_UNKNOWN", "SCH_FLAT_UNKNOWN", "SCH_NATIVE_PIN_NET_PRIVATE", {}, null]) {
    assert.equal(nativeFailureCategory(unknown), null);
  }
});
