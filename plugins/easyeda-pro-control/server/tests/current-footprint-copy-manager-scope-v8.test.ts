/** Real Node24 inspector Scope wrappers, with inert lexical functions. This is
 * representation coverage, not admission of EasyEDA's embedded runtime. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MANAGER_ROUTE_CALLS as CALLS } from "../src/current-footprint-copy-manager-route-bindings.ts";

const group = "footprint-manager-scope-wrapper-test";
const resultSchema = z.looseObject({ result: z.looseObject({ objectId: z.string().optional(), value: z.unknown().optional() }), exceptionDetails: z.unknown().optional() });
async function call(session: Session, objectId: string, program: string, ids: readonly string[] = [], returnByValue = false): Promise<z.infer<typeof resultSchema>> {
  const work: Promise<unknown> = session.post("Runtime.callFunctionOn", { objectId, functionDeclaration: program,
    arguments: ids.map(id => ({ objectId: id })), objectGroup: group, throwOnSideEffect: true, returnByValue });
  return resultSchema.parse(await work);
}
void test("manager callback selectors unwrap actual Scope.object and refuse ordinary object substitutes", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const created = await session.post("Runtime.evaluate", { expression: "(()=>{const e=()=>{},t=()=>{};return [()=>[e,t],e,t]})()", objectGroup: group });
    assert.equal(created.exceptionDetails, undefined); const arrayId = created.result.objectId; assert.ok(arrayId !== undefined);
    const array = await session.post("Runtime.getProperties", { objectId: arrayId, ownProperties: true });
    const closure = array.result.find(item => item.name === "0")?.value?.objectId; assert.ok(closure !== undefined);
    const functionMetadata = await session.post("Runtime.getProperties", { objectId: closure, ownProperties: true });
    const scopeList = functionMetadata.internalProperties?.find(item => item.name === "[[Scopes]]")?.value?.objectId; assert.ok(scopeList !== undefined);
    const scopes = await session.post("Runtime.getProperties", { objectId: scopeList, ownProperties: true });
    const scope = scopes.result[0]?.value?.objectId; assert.ok(scope !== undefined);
    for (const role of ["serviceUi", "serviceManager", "handler"] as const) {
      const selected = await call(session, scope, CALLS[role].program);
      assert.equal(selected.exceptionDetails, undefined); const selectedId = selected.result.objectId; assert.ok(selectedId !== undefined);
      const expected = array.result.find(item => item.name === (role === "serviceUi" ? "1" : "2"))?.value?.objectId; assert.ok(expected !== undefined);
      const same = await call(session, selectedId, "function(other){return this===other}", [expected], true);
      assert.equal(same.result.value, true);
      const substituted = await call(session, arrayId, CALLS[role].program);
      assert.ok(substituted.exceptionDetails !== undefined);
    }
  } finally {
    try { await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); } finally { session.disconnect(); }
  }
});
