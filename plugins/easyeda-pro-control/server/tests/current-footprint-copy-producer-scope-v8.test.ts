/** Real Node24 inspector Scope objects with inert dependency values. This
 * establishes the wrapper representation, not embedded-V8 source admission. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_CALLS as DEPENDENCY } from "../src/current-footprint-copy-dependency-bindings.ts";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES } from "../src/current-footprint-copy-dependency-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_LEXICAL_CALLS as LEXICAL, decodeCurrentFootprintCopyProducerScope } from "../src/current-footprint-copy-producer-scope.ts";
import { footprintDependencyWorldSource } from "./helpers/current-footprint-copy-dependency-world.ts";

const group = "footprint-producer-scope-v8-test";
const resultSchema = z.looseObject({ result: z.looseObject({ objectId: z.string().optional(), value: z.unknown().optional() }), exceptionDetails: z.unknown().optional() });
async function call(session: Session, objectId: string, program: string, ids: readonly string[], returnByValue = false): Promise<z.infer<typeof resultSchema>> {
  const work: Promise<unknown> = session.post("Runtime.callFunctionOn", { objectId, functionDeclaration: program,
    arguments: ids.map(id => ({ objectId: id })), objectGroup: group, throwOnSideEffect: true, returnByValue });
  return resultSchema.parse(await work);
}
async function handle(session: Session, expression: string): Promise<string> {
  const reply = await session.post("Runtime.evaluate", { expression, objectGroup: group });
  assert.equal(reply.exceptionDetails, undefined); assert.ok(reply.result.objectId !== undefined); return reply.result.objectId;
}
async function scope(session: Session, functionId: string): Promise<string> {
  const metadata = await session.post("Runtime.getProperties", { objectId: functionId, ownProperties: true });
  const scopesId = metadata.internalProperties?.find(item => item.name === "[[Scopes]]")?.value?.objectId; assert.ok(scopesId !== undefined);
  return decodeCurrentFootprintCopyProducerScope(await session.post("Runtime.getProperties", { objectId: scopesId, ownProperties: true }));
}

void test("producer selectors consume actual V8 Scope.object and reject direct global or substituted lexical bindings", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const closure = await handle(session, `(()=>{const ai=function Jo(){};ai.getProLibSource=async()=>{};
      let qe=async()=>{};const Qe=()=>{},Ke=class{},Ni=()=>{},cg=()=>{},ve={FOOTPRINT:'FOOTPRINT',FONT:'FONT',BLOB:'BLOB'},Oe={FOOTPRINT:4},Ie='|\\n';
      globalThis.SCOPE_TEST_CHANGE=()=>{qe=async()=>{}};return()=>[ai,qe,Qe,Ke,Ni,cg,ve,Oe,Ie]})()`);
    const lexicalScope = await scope(session, closure);
    const captured = await call(session, lexicalScope, LEXICAL.capture.program, []);
    assert.equal(captured.exceptionDetails, undefined); const original = captured.result.objectId; assert.ok(original !== undefined);
    const checked = await call(session, lexicalScope, LEXICAL.recheck.program, [original], true); assert.equal(checked.result.value, true);
    const globalId = await handle(session, "globalThis");
    const invalid = await call(session, globalId, LEXICAL.capture.program, []); assert.ok(invalid.exceptionDetails !== undefined);
    await session.post("Runtime.evaluate", { expression: "SCOPE_TEST_CHANGE()" });
    const fresh = await scope(session, closure);
    const replaced = await call(session, fresh, LEXICAL.recheck.program, [original], true); assert.ok(replaced.exceptionDetails !== undefined);
  } finally {
    try { await session.post("Runtime.evaluate", { expression: "delete globalThis.SCOPE_TEST_CHANGE" }); await session.post("Runtime.releaseObjectGroup", { objectGroup: group }); }
    finally { session.disconnect(); }
  }
});

void test("full dependency selector runs on actual V8 Scope.object while preserving original owner and method checks", async () => {
  const session = new Session(); session.connect();
  try {
    await session.post("Runtime.enable");
    const names = [...new Set([...CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.map(item => item.key.split(".")[0]),
      "Lg", "Gd", "Tg", "ar", "Pi", "ja", "Vc", "zy", "JP", "KP", "Mb", "qe", "Qe", "Ke", "Ni", "cg"])];
    const closure = await handle(session, `(()=>{${footprintDependencyWorldSource()}
      const {${names.join(",")}}=scope;globalThis.SCOPE_TEST_WORLD=[project,bus,manager,consistency,constructors,lexicals];
      globalThis.SCOPE_TEST_CALLS=()=>calls;return()=>[${names.join(",")}];})()`);
    const handles: string[] = [], lexicalScope = await scope(session, closure);
    for (let index = 0; index < 6; index += 1) { handles.push(await handle(session, `SCOPE_TEST_WORLD[${String(index)}]`)); }
    const captured = await call(session, lexicalScope, DEPENDENCY.capture.program, handles);
    assert.equal(captured.exceptionDetails, undefined); const original = captured.result.objectId; assert.ok(original !== undefined);
    const checked = await call(session, lexicalScope, DEPENDENCY.recheck.program, [...handles, original], true); assert.equal(checked.result.value, true);
    await session.post("Runtime.evaluate", { expression: "SCOPE_TEST_WORLD[0].cache={}" });
    const replaced = await call(session, lexicalScope, DEPENDENCY.recheck.program, [...handles, original], true); assert.ok(replaced.exceptionDetails !== undefined);
    const calls = await session.post("Runtime.evaluate", { expression: "SCOPE_TEST_CALLS()", returnByValue: true }); assert.equal(calls.result.value, 0);
  } finally {
    try {
      await session.post("Runtime.evaluate", { expression: "delete globalThis.SCOPE_TEST_WORLD;delete globalThis.SCOPE_TEST_CALLS;delete globalThis.PROJECT;delete globalThis._TAB_ID_;delete globalThis['/tab/notify'];" });
      await session.post("Runtime.releaseObjectGroup", { objectGroup: group });
    } finally { session.disconnect(); }
  }
});
