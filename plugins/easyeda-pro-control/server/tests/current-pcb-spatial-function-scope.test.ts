import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import test from "node:test";
import { CURRENT_PCB_SPATIAL_FUNCTION_LOCATIONS, decodeCurrentPcbSpatialFunction,
  decodeCurrentPcbSpatialFunctionScope, decodeCurrentPcbSpatialFunctionScopeList } from "../src/current-pcb-spatial-function-scope.ts";

/** A same-engine synthetic registration pattern, never the installed asset.
 * The sibling closure deliberately retains rZe, matching its real source shape.
 */
function fixture(): string {
  const point = CURRENT_PCB_SPATIAL_FUNCTION_LOCATIONS["point-handler"];
  const prefix = '(()=>{const Hr={},qt={};class Oet{rpcService(o,t){this.handler=t}}function rZe(o,t){o.rpcService("region",async e=>t(e));o.rpcService("point",';
  return `${prefix}${"\n".repeat(point.lineNumber)}${" ".repeat(point.columnNumber)}async e=>({Hr,qt,e}));return o.handler}globalThis.__easyedaSpatialScopeFixture=rZe(new Oet(),()=>null)})()`;
}

void test("real inspector retains the synthetic point handler's outer closure and exact function metadata", async () => {
  const session = new Session(); session.connect();
  try {
    const reply = await session.post("Runtime.evaluate", { expression: fixture(), objectGroup: "spatial-scope-fixture" });
    assert.equal(reply.exceptionDetails, undefined);
    const remote = await session.post("Runtime.evaluate", {
      expression: "globalThis.__easyedaSpatialScopeFixture", objectGroup: "spatial-scope-fixture",
    });
    const functionId = decodeCurrentPcbSpatialFunction(remote, "point-handler");
    const properties = await session.post("Runtime.getProperties", { objectId: functionId, ownProperties: true,
      accessorPropertiesOnly: false, generatePreview: false });
    const point = properties.internalProperties?.find(item => item.name === "[[FunctionLocation]]")?.value?.value as unknown;
    assert.ok(point !== null && typeof point === "object" && "scriptId" in point && typeof point.scriptId === "string");
    const scriptId = point.scriptId;
    const scopeListId = decodeCurrentPcbSpatialFunctionScopeList(properties, scriptId, "point-handler");
    const scopes = await session.post("Runtime.getProperties", { objectId: scopeListId, ownProperties: true,
      accessorPropertiesOnly: false, generatePreview: false });
    assert.deepEqual(scopes.result.map(item => item.value?.description), ["Closure (rZe)", "Closure", "Global"]);
    assert.equal(decodeCurrentPcbSpatialFunctionScope(scopes, "point-handler"), scopes.result[1]?.value?.objectId);
    assert.throws(() => decodeCurrentPcbSpatialFunctionScopeList(properties, `${scriptId}-other`, "point-handler"), /PCB_SPATIAL_FUNCTION_SCOPE/u);
    const changed = structuredClone(properties);
    if (changed.result[0] !== undefined) { changed.result[0].writable = true; }
    assert.throws(() => decodeCurrentPcbSpatialFunctionScopeList(changed, scriptId, "point-handler"), /PCB_SPATIAL_FUNCTION_SCOPE/u);
    assert.throws(() => decodeCurrentPcbSpatialFunctionScopeList(properties, scriptId, "rpc-wrapper"), /PCB_SPATIAL_FUNCTION_SCOPE/u);
  } finally {
    // Release remote references before disconnecting the original local session.
    await session.post("Runtime.evaluate", { expression: "delete globalThis.__easyedaSpatialScopeFixture" });
    await session.post("Runtime.releaseObjectGroup", { objectGroup: "spatial-scope-fixture" });
    session.disconnect();
  }
});

const scope = (index: number, label: string, objectId = `scope-${index}`): Record<string, unknown> => ({
  name: String(index), value: { type: "object", subtype: "internal#scope", className: "Object", description: label, objectId },
  writable: true, configurable: true, enumerable: true, isOwn: true,
});
void test("fixed scope selectors reject extra/private scopes, aliases and descriptor drift", () => {
  const wrapper = { result: [scope(0, "Closure (rpcService)"), scope(1, "Closure"), scope(2, "Global")] };
  assert.equal(decodeCurrentPcbSpatialFunctionScope(wrapper, "rpc-wrapper"), "scope-0");
  assert.equal(decodeCurrentPcbSpatialFunctionScope({ result: [scope(0, "Closure"), scope(1, "Global")] }, "point-handler"), "scope-0");
  for (const result of [
    [scope(0, "Closure (other)"), scope(1, "Closure"), scope(2, "Global")],
    [scope(0, "Closure (rZe)"), scope(1, "Closure"), scope(2, "Script"), scope(3, "Global")],
    [scope(0, "Closure"), scope(1, "Global", "scope-0")],
    [scope(1, "Closure"), scope(0, "Global")],
    [scope(0, "Closure"), { ...scope(1, "Global"), enumerable: false }],
  ]) { assert.throws(() => decodeCurrentPcbSpatialFunctionScope({ result }, "point-handler"), /PCB_SPATIAL_FUNCTION_SCOPE/u); }
});

void test("scope decoders refuse accessors, proxies and oversized data without invoking submitted behavior", () => {
  let calls = 0;
  const accessor = Object.defineProperty({}, "result", { enumerable: true, get() { calls += 1; return []; } });
  const proxy = new Proxy({}, { ownKeys(): string[] { calls += 1; return []; } });
  for (const input of [accessor, proxy, { result: Array.from({ length: 64 }, () => null) }, { result: "x".repeat(262_145) }]) {
    assert.throws(() => decodeCurrentPcbSpatialFunctionScope(input, "point-handler"), /PCB_SPATIAL_FUNCTION_SCOPE/u);
  }
  assert.equal(calls, 0);
});
