/** Execute the actual Core request and invalidation bodies over real cache data.
 * Only their original-owner/pipe seams are inert; no native origin is issued. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { types } from "node:util";
import { runInNewContext } from "node:vm";
import { parse } from "acorn";
import { completeSyntheticSavedCacheFixture } from "./helpers/current-pcb-via-saved-cache-fixture.ts";

async function originalBodies(): Promise<Readonly<{ request: string; invalidation: string; initial: string }>> {
  const source = stripTypeScriptTypes(await readFile(new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url), "utf8"));
  const owner = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body.find(node => node.type === "ClassDeclaration" && node.id?.name === "CurrentPcbRetainedOwnerCore");
  assert.ok(owner?.type === "ClassDeclaration");
  const read = owner.body.body.find(node => node.type === "MethodDefinition" && node.key.type === "Identifier" && node.key.name === "createFootprintInverseCacheOrigin");
  const invalidate = owner.body.body.find(node => node.type === "MethodDefinition" && node.key.type === "Identifier" && node.key.name === "invalidateFootprintInverseCaches");
  const initial = owner.body.body.find(node => node.type === "PropertyDefinition" && node.key.type === "PrivateIdentifier" && node.key.name === "inverseCacheReadUntracked");
  assert.ok(read?.type === "MethodDefinition" && invalidate?.type === "MethodDefinition" && initial?.type === "PropertyDefinition");
  assert.ok(initial.value?.type === "Literal" && initial.value.value === false);
  const block = read.value.body.body.find(node => node.type === "TryStatement"); assert.ok(block?.type === "TryStatement");
  const binding = block.block.body.flatMap(node => node.type === "VariableDeclaration" ? node.declarations : []).find(node => node.id.type === "Identifier" && node.id.name === "bindings");
  assert.ok(binding?.init?.type === "CallExpression"); const fields = binding.init.arguments[0]; assert.ok(fields?.type === "ObjectExpression");
  const request = fields.properties.find(node => node.type === "Property" && node.key.type === "Identifier" && node.key.name === "request");
  assert.ok(request?.type === "Property" && request.value.type === "ArrowFunctionExpression");
  return { request: source.slice(request.value.start, request.value.end), invalidation: source.slice(invalidate.start, invalidate.end), initial: source.slice(initial.start, initial.end) };
}
function call(receiver: object, name: string, args: readonly unknown[] = []): unknown {
  const method: unknown = Reflect.get(receiver, name); assert.ok(typeof method === "function"); return Reflect.apply(method, receiver, args);
}
void test("backup followed by read-path untrack refuses invalidation before delete or notification wait", async () => {
  const bodies = await originalBodies();
  for (const lost of [false, true]) {
    const f = completeSyntheticSavedCacheFixture(true), snapshot = f.ledger.snapshot();
    const backup = { cache: { ledger: f.ledger }, cdp: snapshot }, held = Object.freeze({ inertOriginalHeld: true });
    const state = { enters: 0, nativeReads: 0, backupChecks: 0, unexpected: 0 }; const reply = Promise.withResolvers<object>();
    const defined = new Set(["inverseCacheReadUntracked", "inverseCacheInvalidation", "inverseCacheInvalidationPromise", "inverseCacheBackup", "inverseCachePlan", "busy", "input", "enter", "transfer", "footprintInverseCacheCurrent", "footprintInverseCacheBackupCurrent"]);
    const others = [...new Set(`${bodies.request}\n${bodies.invalidation}`.matchAll(/#([A-Za-z][A-Za-z0-9]*)/gu).map(match => match[1]))].filter(name => name !== undefined && !defined.has(name));
    const receiver: unknown = runInNewContext(`class InertCache {
      ${bodies.initial}
      #inverseCacheInvalidation=null;#inverseCacheInvalidationPromise=null;#inverseCacheBackup=backup;#inverseCachePlan=null;#busy=false;#input={emit(){}};
      ${others.map(name => `#${name}=unexpected;`).join("\n")}
      #enter(){state.enters+=1;} #transfer(fn){return fn();}
      #footprintInverseCacheCurrent(actual){if(actual!==held)throw Error('foreign-held');}
      #footprintInverseCacheBackupCurrent(actual){state.backupChecks+=1;if(actual!==backup)throw Error('foreign-backup');}
      request=${bodies.request};
      ${bodies.invalidation}
    };new InertCache`, { backup, held, state, ledger: f.ledger, heldOriginal: (): object => held,
      ready: { pipe: { observeInverseCache: (): Promise<object> => { state.nativeReads += 1; return reply.promise; } } },
      unexpected: (): never => { state.unexpected += 1; throw new Error("unexpected invalidation/delete/wait"); },
      error: (code: string): Error => new Error(code), assertOriginalCurrentFootprintInverseNativeOwner: (value: unknown): void => { assert.ok(value !== null && typeof value === "object"); } });
    assert.ok(receiver !== null && typeof receiver === "object");
    const pending = call(receiver, "request", [{ phase: "saved-cache-untrack" }]); assert.ok(types.isPromise(pending));
    assert.equal(state.nativeReads, 1); assert.equal(f.ledger.status().pending, true);
    assert.throws(() => call(receiver, "invalidateFootprintInverseCaches"), { message: "FOOTPRINT_INVERSE_CACHE_UNTRACKED" });
    if (lost) { reply.reject(new Error("original ACK lost")); await assert.rejects(pending, /original ACK lost/u); }
    else { reply.resolve({}); await pending; assert.equal(f.ledger.status().tracked, false); }
    // The earlier backup stays a genuine historical snapshot after untracking.
    f.ledger.requireOriginalSnapshot(snapshot);
    assert.throws(() => call(receiver, "invalidateFootprintInverseCaches"), { message: "FOOTPRINT_INVERSE_CACHE_UNTRACKED" });
    assert.equal(state.enters, 1); assert.equal(state.backupChecks, 0); assert.equal(state.unexpected, 0);
    await assert.rejects(async () => { await call(receiver, "request", [{ phase: "saved-cache-untrack" }]); }, /FOOTPRINT_INVERSE_CACHE_READ_PHASE_CONSUMED/u);
    assert.equal(state.nativeReads, 1);
  }
});
