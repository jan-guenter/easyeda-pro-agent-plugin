/** Actual local Inspector execution of fixed programs on inert VM fixtures.
 * Context names and receiver/argument expressions refer only to those owned
 * test fixtures. This creates no EasyEDA/native owner or facade provenance. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import type { Runtime } from "node:inspector";
import type { Context } from "node:vm";

/** The bundled CDP type omits this supported field. Require its exact true
 * value rather than falling through the generic untyped post overload. */
function readonlyCall(session: Session, params: Runtime.CallFunctionOnParameterType & Readonly<{ throwOnSideEffect: true }>): Promise<Runtime.CallFunctionOnReturnType> { return session.post("Runtime.callFunctionOn", params); }
/** Re-run selected fixed consumers in their original inert VM realm, retain
 * actual reference arguments, then verify no fixture API/getter was invoked. */
export async function verifyViaBookkeepingInspector(context: Context, roles: readonly string[]): Promise<void> {
  const name: unknown = context["inspectorName"]; const cases: unknown = context["inspectorCases"]; assert.ok(typeof name === "string" && Array.isArray(cases));
  const session = new Session(); const contexts = new Map<string, number>(); const observed = new Set<string>(); const group = "inert-via-bookkeeping-inspector";
  session.on("Runtime.executionContextCreated", event => { contexts.set(event.params.context.name, event.params.context.id); }); session.connect();
  try {
    await session.post("Runtime.enable"); const contextId = contexts.get(name); assert.ok(contextId !== undefined);
    const reference = async (expression: string): Promise<string> => { const reply = await session.post("Runtime.evaluate", { expression, contextId, objectGroup: group }); assert.equal(reply.exceptionDetails, undefined); assert.ok(reply.result.objectId !== undefined); return reply.result.objectId; };
    for (const [index, item] of cases.entries()) {
      assert.ok(item !== null && typeof item === "object"); const role: unknown = Reflect.get(item, "role"); const program: unknown = Reflect.get(item, "program"); const args: unknown = Reflect.get(item, "args");
      assert.ok(typeof role === "string" && typeof program === "string" && Array.isArray(args)); if (roles.includes(role)) {
      assert.equal(observed.has(role), false); observed.add(role);
      const objectId = await reference(`globalThis.inspectorCases[${String(index)}].receiver`); const argumentsList: Runtime.CallArgument[] = [];
      for (let argument = 0; argument < args.length; argument += 1) { argumentsList.push({ objectId: await reference(`globalThis.inspectorCases[${String(index)}].args[${String(argument)}]`) }); }
      const reply = await readonlyCall(session, { objectId, functionDeclaration: program, arguments: argumentsList, objectGroup: group, silent: true, generatePreview: false, throwOnSideEffect: true, awaitPromise: false, userGesture: false, returnByValue: false });
      assert.equal(reply.exceptionDetails, undefined, `${role}: ${reply.exceptionDetails?.exception?.description ?? ""}`); assert.notEqual(reply.result.type, "undefined");
      }
    }
    assert.deepEqual([...observed].toSorted(), [...roles].toSorted()); const effects = await session.post("Runtime.evaluate", { expression: "({calls,getters})", contextId, returnByValue: true }); const value: unknown = effects.result.value; assert.deepEqual(value, { calls: 0, getters: 0 });
  } finally { await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); session.disconnect(); }
}
