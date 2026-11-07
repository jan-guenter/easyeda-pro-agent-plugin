/** Production journal/artifacts with an explicit original-argument issuer seam.
 * No native owner, mutation, Save, clock or persistence proof is constructed. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { updateOperation } from "../src/artifacts.ts";
import type { GeneratedSchematicRelevanceDisplayDispatch, GeneratedSchematicRelevanceDisplayJournal, GeneratedSchematicRelevanceDisplayModifyEnrollment } from "../src/generated-schematic-relevance-display-journal.ts";
import { assertGeneratedSchematicRelevanceDisplayJournalChain } from "../src/generated-schematic-relevance-display-journal.ts";
import type { GeneratedFixtureJournalPublicationDependencies } from "../src/generated-fixture-journal-publication.ts";
import { assertGeneratedSchematicDisplayJournalChain, consumeGeneratedSchematicDisplayDispatch } from "../src/generated-schematic-display-journal.ts";

async function fixture(dependencies: GeneratedFixtureJournalPublicationDependencies = {}, stage: "modify" | "save" = "modify"): Promise<Readonly<{ journal: GeneratedSchematicRelevanceDisplayJournal;
  enroll: (token: GeneratedSchematicRelevanceDisplayDispatch, owner: object) => GeneratedSchematicRelevanceDisplayModifyEnrollment;
  consume: (token: GeneratedSchematicRelevanceDisplayDispatch, owner: object, copyArguments?: boolean) => Readonly<{ assertPublished: () => Promise<void> }> }>> {
  const operationId = `sch209-relevance-display-${globalThis.crypto.randomUUID()}`;
  const argumentsValue = Object.freeze({ operation: Object.freeze({ operationId }) }), prepared = Object.freeze({ preparationCheckpoint: Object.freeze({ path: "synthetic-managed-checkpoint", sha256: "1".repeat(64), bytes: 512 }) });
  const url = new URL("../src/generated-schematic-relevance-display-journal.ts", import.meta.url); const sourceRequire = createRequire(url);
  const compiled = await transform(await readFile(url, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} }; const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    const actual: unknown = sourceRequire(name);
    if (name !== "./generated-schematic-relevance-display-source.ts") { return actual; } assert.ok(actual !== null && typeof actual === "object");
    return { ...actual, requireOriginalGeneratedSchematicRelevanceDisplayNativeArguments: (value: unknown, checkpoint: unknown): void => { assert.equal(value, argumentsValue); assert.equal(checkpoint, prepared); } };
  }, loaded, loaded.exports]);
  const Constructor = loaded.exports["GeneratedSchematicRelevanceDisplayJournal"], consume = loaded.exports["consumeGeneratedSchematicRelevanceDisplayDispatch"], enroll = loaded.exports[stage === "save" ? "enrollGeneratedSchematicRelevanceDisplaySaveIntent" : "enrollGeneratedSchematicRelevanceDisplayModifyIntent"]; assert.ok(typeof Constructor === "function" && typeof consume === "function" && typeof enroll === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact production private journal class with an explicit inert original-checkpoint seam; all managed publication/verification code is unchanged.
  const journal = Reflect.construct(Constructor, [argumentsValue, prepared, dependencies]) as GeneratedSchematicRelevanceDisplayJournal;
  return { journal, enroll: (token: GeneratedSchematicRelevanceDisplayDispatch, owner: object): GeneratedSchematicRelevanceDisplayModifyEnrollment => {
    const result: unknown = Reflect.apply(enroll, undefined, [token, owner, argumentsValue]);
    assert.ok(result !== null && typeof result === "object" && ["assertCurrent", "assertBeforeAttempt", "assertOriginalAttempted", "assertPublished"].every(name => typeof Reflect.get(result, name) === "function"));
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Checked exact exported production closure shape; only original argument issuance is replaced above.
    return result as GeneratedSchematicRelevanceDisplayModifyEnrollment;
  }, consume: (token: GeneratedSchematicRelevanceDisplayDispatch, owner: object, copyArguments = false): Readonly<{ assertPublished: () => Promise<void> }> => {
    const result: unknown = Reflect.apply(consume, undefined, [token, stage, owner, copyArguments ? structuredClone(argumentsValue) : argumentsValue]);
    assert.ok(result !== null && typeof result === "object" && "assertPublished" in result && typeof result.assertPublished === "function");
    const assertPublished = result.assertPublished;
    return { assertPublished: async (): Promise<void> => { await Reflect.apply(assertPublished, result, []); } };
  } };
}
async function prefix(journal: GeneratedSchematicRelevanceDisplayJournal): Promise<void> {
  for (const stage of ["baseline", "allocation", "launch", "main", "opening", "capture", "preflight"] as const) { await journal.append(`${stage}-intent`, {}); await journal.append(`${stage}-result`, {}); }
}
void test("original durable display intent is exact-owner/arguments bound and consumed before any async admission", async () => {
  const f = await fixture(); await f.journal.reserve(); const owner = Object.freeze({ explicitSyntheticWriter: true }); f.journal.bindWriter(owner); await prefix(f.journal);
  const token = await f.journal.appendIntent("modify", { source: "synthetic-qualified-before" }, owner);
  assert.throws(() => Reflect.apply(consumeGeneratedSchematicDisplayDispatch, undefined, [token, "modify", owner, {}]), /ORIGINAL_DISPATCH/u);
  const records = f.journal.retained()["records"]; assert.doesNotThrow(() => assertGeneratedSchematicRelevanceDisplayJournalChain(records)); assert.throws(() => assertGeneratedSchematicDisplayJournalChain(records));
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

void test("prospective modify enrollment retains one original published marker without consuming or refunding it", async () => {
  const f = await fixture(); await f.journal.reserve(); const owner = Object.freeze({ explicitSyntheticWriter: true }); f.journal.bindWriter(owner); await prefix(f.journal);
  const token = await f.journal.appendIntent("modify", {}, owner);
  assert.throws(() => f.enroll(structuredClone(token), owner), /ORIGINAL_MODIFY_ENROLLMENT/u);
  assert.throws(() => f.enroll(token, { ...owner }), /ORIGINAL_MODIFY_ENROLLMENT/u);
  const original = f.enroll(token, owner); original.assertBeforeAttempt(); await original.assertPublished();
  assert.equal(f.journal.retainedDispatchIntent("modify"), token); assert.throws(() => { original.assertOriginalAttempted(); }, /MODIFY_ORIGINAL_ATTEMPT/u);
  assert.throws(() => f.enroll(token, owner), /ORIGINAL_MODIFY_ENROLLMENT/u);
  await f.consume(token, owner).assertPublished(); original.assertCurrent(); original.assertOriginalAttempted();
  assert.throws(() => { original.assertBeforeAttempt(); }, /MODIFY_BEFORE_ATTEMPT/u);
});

void test("Save enrollment requires its own published stage and is consumed once before asynchronous admission", async () => {
  const f = await fixture({}, "save"); await f.journal.reserve(); const owner = Object.freeze({ explicitSyntheticWriter: true }); f.journal.bindWriter(owner); await prefix(f.journal);
  const modify = await f.journal.appendIntent("modify", {}, owner);
  assert.throws(() => f.enroll(modify, owner), /ORIGINAL_SAVE_ENROLLMENT/u);
  // A coherent inert packet advances only this synthetic journal's sequencing.
  await f.journal.append("modify-result", { schema: "easyeda-pro-control.generated-schematic-relevance-display-stage.v1", stage: "modify", ok: true,
    dispatchAttempted: true, originalPromiseSettled: true, modifyAttempted: true, modifyAcknowledged: true, saveAttempted: false, saveAcknowledged: false,
    savePromiseSettled: false, source: "synthetic", windowTabId: "window", originalContextIntact: true, connectivityVerified: false, sourceVersionAliased: false,
    workerCompletionVerified: false, structureCompletionVerified: false, persistenceVerified: false, inverseAvailable: false });
  for (const stage of ["observe", "effect", "clock"] as const) { await f.journal.append(`${stage}-intent`, {}); await f.journal.append(`${stage}-result`, {}); }
  const token = await f.journal.appendIntent("save", {}, owner);
  assert.throws(() => f.enroll(structuredClone(token), owner), /ORIGINAL_SAVE_ENROLLMENT/u);
  const original = f.enroll(token, owner); await original.assertPublished(); original.assertBeforeAttempt();
  assert.throws(() => f.enroll(token, owner), /ORIGINAL_SAVE_ENROLLMENT/u);
  await f.consume(token, owner).assertPublished(); original.assertOriginalAttempted();
  assert.throws(() => { original.assertBeforeAttempt(); }, /SAVE_BEFORE_ATTEMPT/u);
  assert.throws(() => f.consume(token, owner), /ORIGINAL_DISPATCH/u);
});
