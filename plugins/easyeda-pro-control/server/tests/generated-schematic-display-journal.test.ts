/** Production journal/artifacts with an explicit original-argument issuer seam.
 * No native owner, mutation, Save, clock or persistence proof is constructed. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { updateOperation } from "../src/artifacts.ts";
import type { GeneratedSchematicDisplayDispatch, GeneratedSchematicDisplayJournal } from "../src/generated-schematic-display-journal.ts";
import type { GeneratedFixtureJournalPublicationDependencies } from "../src/generated-fixture-journal-publication.ts";

async function fixture(dependencies: GeneratedFixtureJournalPublicationDependencies = {}): Promise<Readonly<{ journal: GeneratedSchematicDisplayJournal;
  consume: (token: GeneratedSchematicDisplayDispatch, owner: object, copyArguments?: boolean) => Readonly<{ assertPublished: () => Promise<void> }> }>> {
  const operationId = `sch209-display-${randomUUID()}`;
  const argumentsValue = Object.freeze({ operation: Object.freeze({ operationId }) }), prepared = Object.freeze({ preparationCheckpoint: Object.freeze({ path: "synthetic-managed-checkpoint", sha256: "1".repeat(64), bytes: 512 }) });
  const url = new URL("../src/generated-schematic-display-journal.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name !== "./generated-schematic-display-source.ts") { return actual; } assert.ok(actual !== null && typeof actual === "object");
    return { ...actual, requireOriginalGeneratedSchematicDisplayNativeArguments: (value: unknown, checkpoint: unknown): void => { assert.equal(value, argumentsValue); assert.equal(checkpoint, prepared); } };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["GeneratedSchematicDisplayJournal"], consume = loaded.exports["consumeGeneratedSchematicDisplayDispatch"]; assert.ok(typeof Constructor === "function" && typeof consume === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact production private journal class with an explicit inert original-checkpoint seam; all managed publication/verification code is unchanged.
  const journal = Reflect.construct(Constructor, [argumentsValue, prepared, dependencies]) as GeneratedSchematicDisplayJournal;
  return { journal, consume: (token: GeneratedSchematicDisplayDispatch, owner: object, copyArguments = false): Readonly<{ assertPublished: () => Promise<void> }> => {
    const result: unknown = Reflect.apply(consume, undefined, [token, "modify", owner, copyArguments ? structuredClone(argumentsValue) : argumentsValue]);
    assert.ok(result !== null && typeof result === "object" && "assertPublished" in result && typeof result.assertPublished === "function");
    const assertPublished = result.assertPublished;
    return { assertPublished: async (): Promise<void> => { await Reflect.apply(assertPublished, result, []); } };
  } };
}
async function prefix(journal: GeneratedSchematicDisplayJournal): Promise<void> {
  for (const stage of ["baseline", "allocation", "launch", "main", "opening", "capture", "preflight"] as const) { await journal.append(`${stage}-intent`, {}); await journal.append(`${stage}-result`, {}); }
}
void test("original durable display intent is exact-owner/arguments bound and consumed before any async admission", async () => {
  const f = await fixture(); await f.journal.reserve(); const owner = Object.freeze({ explicitSyntheticWriter: true }); f.journal.bindWriter(owner); await prefix(f.journal);
  const token = await f.journal.appendIntent("modify", { source: "synthetic-qualified-before" }, owner);
  assert.throws(() => f.consume(structuredClone(token), owner), /ORIGINAL_DISPATCH/u); assert.throws(() => f.consume(token, { ...owner }), /ORIGINAL_DISPATCH/u);
  assert.throws(() => f.consume(token, owner, true), /ORIGINAL_DISPATCH/u); const original = f.consume(token, owner);
  assert.throws(() => f.consume(token, owner), /ORIGINAL_DISPATCH/u); await original.assertPublished();
  assert.throws(() => f.journal.retainedDispatchIntent("modify"), /ORIGINAL_DISPATCH/u); await assert.rejects(f.journal.appendIntent("modify", {}, owner));
});
void test("lost original modify-intent publication settles the same retained marker without allocating a new native attempt", async () => {
  let lost = false;
  const f = await fixture({ updateJournal: async operation => {
    await updateOperation(operation); const records: unknown = operation["records"];
    const last: unknown = Array.isArray(records) ? records.at(-1) : undefined;
    if (!lost && last !== null && typeof last === "object" && "kind" in last && last.kind === "modify-intent") { lost = true; throw new Error("SYNTHETIC_LOST_INTENT_ACK"); } return String(operation["journalPath"]);
  } });
  await f.journal.reserve(); const owner = Object.freeze({ explicitSyntheticWriter: true }); f.journal.bindWriter(owner); await prefix(f.journal);
  await assert.rejects(f.journal.appendIntent("modify", {}, owner), /LOST_INTENT_ACK/u); assert.equal(f.journal.retained()["publicationPending"], true);
  assert.throws(() => f.journal.retainedDispatchIntent("modify"), /PUBLICATION_PENDING/u); await f.journal.settlePublication();
  const token = f.journal.retainedDispatchIntent("modify"); assert.equal(f.journal.retainedDispatchIntent("modify"), token); await f.consume(token, owner).assertPublished();
  assert.equal(f.journal.retained()["publicationPending"], false);
});
