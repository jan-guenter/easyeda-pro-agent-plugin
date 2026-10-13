import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { bindClosedSqlCopy } from "../src/closed-sql-bindings.ts";
import { copyFixture } from "./helpers/closed-symbol-copy-fixture.ts";
import type { Fixture } from "./helpers/closed-symbol-copy-fixture.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { isRecord } from "../src/core.ts";

type Input = Parameters<typeof bindClosedSqlCopy>[0];
let fixture: Fixture | undefined;
let original: Input | undefined;
before(async () => {
  fixture = await copyFixture();
  const copied = await fixture.copyStage.copy(fixture.journal, "baseline-copy", fixture.generation, fixture.proof);
  const loaded = await loadClosedSymbolJournal(fixture.operationId);
  original = { ...loaded, phase: "baseline-copy", copy: copied.copy, inventory: copied.inventory, proof: fixture.proof };
});
after(async () => { await fixture?.dispose(); });
function input(): Input {
  assert.ok(original !== undefined);
  return { ...original, journal: structuredClone(original.journal), events: structuredClone(original.events) };
}
function record(value: unknown): Record<string, unknown> {
  assert.ok(isRecord(value));
  return value;
}
function event(value: Input, kind: "intent" | "result"): Record<string, unknown> {
  return record(value.events.find((item) => item.step === "baseline-copy" && item.kind === kind));
}
void test("actual issued copy, completed reader and recorded generation bind exactly", () => {
  const value = input();
  const result = bindClosedSqlCopy(value);
  assert.deepEqual(result.generation, fixture?.generation);
  assert.equal(result.resultArtifactSha256, value.journal.artifacts.at(-1)?.sha256);
  assert.equal(Object.isFrozen(result), true);
});
void test("historical copy binding does not pretend to grant current closure authority", () => {
  const value = input();
  const { proof: _unused, ...historical } = value;
  assert.deepEqual(bindClosedSqlCopy(historical), bindClosedSqlCopy(value));
});
const changes: Readonly<Record<string, (value: Input) => void>> = {
  "cloned copy": (value) => { Reflect.set(value, "copy", structuredClone(value.copy)); },
  "cloned inventory": (value) => { Reflect.set(value, "inventory", structuredClone(value.inventory)); },
  "wrong phase": (value) => { Reflect.set(value, "phase", "edit-copy"); },
  "unknown phase": (value) => { Reflect.set(value, "phase", "missing"); },
  "wrong project path": (value) => { Reflect.set(value.journal.plan, "projectPath", `${value.journal.plan.projectPath}.peer`); },
  "wrong operation directory": (value) => { value.journal.operationId = value.journal.operationId.replace(/.$/u, "0"); },
  "missing result": (value) => { Reflect.set(value, "events", value.events.filter((item) => item.kind !== "result" || item.step !== "baseline-copy")); },
  "missing intent": (value) => { Reflect.set(value, "events", value.events.filter((item) => item.kind !== "intent" || item.step !== "baseline-copy")); },
  "wrong generation ordinal": (value) => { record(event(value, "result")["generation"])["ordinal"] = 1; },
  "uncaptured generation": (value) => { Reflect.deleteProperty(record(event(value, "result")["generation"]), "captureSha256"); },
  "null generation": (value) => { event(value, "result")["generation"] = null; },
  "different intent generation": (value) => { record(event(value, "intent")["generation"])["jobId"] = "0".repeat(32); },
  "different result copy": (value) => { record(record(event(value, "result")["data"])["copyReceipt"])["sha256"] = "0".repeat(64); },
  "different SQL digest": (value) => { record(record(event(value, "result")["data"])["sqlDigests"])["logicalSha256"] = "0".repeat(64); },
  "extra result field": (value) => { record(event(value, "result")["data"])["extra"] = false; },
  "wrong intent source": (value) => { record(event(value, "intent")["data"])["source"] = "unrelated.eprj2"; },
  "wrong intent generation copy": (value) => { record(record(event(value, "intent")["data"])["generation"])["ordinal"] = 2; },
  "missing artifact": (value) => { value.journal.artifacts.pop(); },
  "wrong proof argument": (value) => { Reflect.set(value, "proof", { ...value.proof, proofSha256: "0".repeat(64) }); },
};
for (const [name, change] of Object.entries(changes)) {
  void test(`${name} refuses recorded copy binding`, () => { const value = input(); change(value); assert.throws(() => bindClosedSqlCopy(value)); });
}
for (const field of ["proofSha256", "operationId", "phase", "challengeAttempt", "jobId", "helperInstance", "bridgeSessionSha256", "runtimeIdentitySha256"] as const) {
  void test(`recorded proof ${field} mismatch refuses`, () => {
    const value = input();
    record(record(event(value, "intent")["data"])["proof"])[field] = field === "challengeAttempt" ? 2 : "different";
    assert.throws(() => bindClosedSqlCopy(value));
  });
}
