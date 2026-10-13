import assert from "node:assert/strict";
import { test } from "node:test";
import { operationPath } from "../src/artifacts.ts";
import { matchesHistoricalAdmission, selectTerminalProfile } from "../src/closed-symbol-terminal-admission-shape.ts";

const operationId = "easyeda-admission-shape-only";
const expected = { operationId, storedJournalSha256: "a".repeat(64), entireStoredJournalSha256: "c".repeat(64),
  terminalArtifact: { path: `${operationPath(operationId).slice(0, -5)}/45-closed-symbol-terminal.json`, bytes: 100, sha256: "d".repeat(64) } };
function fixture(version: 1 | 2): { envelope: Record<string, unknown>; result: Record<string, unknown> } {
  return { envelope: { profile: `easyeda-pro-control.closed-symbol-terminal.v${version}`, body: {}, bodySha256: "b".repeat(64) },
    result: { profile: `private.closed-symbol-historical-terminal.v${version}`, operationId, classification: "historical-completion-verified",
      historicalCompletionRecorded: true, terminalOutcomeVerified: true, liveOriginalCompletionProved: false, currentSourceChecked: false,
      currentOwnershipChecked: false, authorityRestored: false, executionAuthorized: false, replayAllowed: false,
      terminalArtifact: expected.terminalArtifact, bodySha256: "b".repeat(64), storedJournalSha256: expected.storedJournalSha256,
      entireStoredJournalSha256: expected.entireStoredJournalSha256 } };
}
for (const version of [1, 2] as const) {
  void test(`v${version} strict historical relation accepts exactly its fixed data result`, () => {
    const f = fixture(version), selection = selectTerminalProfile(f.envelope);
    assert.equal(Object.isFrozen(selection), true);
    assert.equal(matchesHistoricalAdmission(f.result, expected, selection), true);
    assert.equal(matchesHistoricalAdmission(fixture(version === 1 ? 2 : 1).result, expected, selection), false);
  });
  for (const key of Object.keys(fixture(version).result)) {
    void test(`v${version} requires own data ${key} without executing getters`, () => {
      const f = fixture(version), selection = selectTerminalProfile(f.envelope);
      const absent = Object.fromEntries(Object.entries(f.result).filter(([name]) => name !== key));
      assert.equal(matchesHistoricalAdmission(absent, expected, selection), false);
      let getters = 0;
      Object.defineProperty(f.result, key, { enumerable: true, get() { getters += 1; throw new Error("Getter must not run"); } });
      assert.equal(matchesHistoricalAdmission(f.result, expected, selection), false); assert.equal(getters, 0);
    });
    void test(`v${version} refuses a contradictory ${key}`, () => {
      const f = fixture(version), selection = selectTerminalProfile(f.envelope);
      f.result[key] = typeof f.result[key] === "boolean" ? !f.result[key] : "wrong";
      assert.equal(matchesHistoricalAdmission(f.result, expected, selection), false);
    });
  }
  for (const kind of ["extra", "symbol", "inherited", "array", "hidden", "null", "descriptor-accessor"] as const) {
    void test(`v${version} refuses ${kind} historical shape`, () => {
      const f = fixture(version), selection = selectTerminalProfile(f.envelope);
      let value: unknown = f.result;
      if (kind === "extra") { f.result["extra"] = false; }
      else if (kind === "symbol") { Object.defineProperty(f.result, Symbol("hidden"), { value: false }); }
      else if (kind === "inherited") { value = Object.create(f.result); }
      else if (kind === "array") { value = Object.values(f.result); }
      else if (kind === "hidden") { Object.defineProperty(f.result, "profile", { enumerable: false }); }
      else if (kind === "null") { value = null; }
      else {
        let getters = 0;
        f.result["terminalArtifact"] = { ...expected.terminalArtifact, get path(): never { getters += 1; throw new Error("Descriptor getter must not run"); } };
        assert.equal(matchesHistoricalAdmission(f.result, expected, selection), false); assert.equal(getters, 0); return;
      }
      assert.equal(matchesHistoricalAdmission(value, expected, selection), false);
    });
  }
}
for (const key of ["profile", "body", "bodySha256"] as const) {
  void test(`routing requires own data ${key} without executing getters`, () => {
    const f = fixture(2); let getters = 0;
    Object.defineProperty(f.envelope, key, { enumerable: true, get() { getters += 1; throw new Error("Envelope getter must not run"); } });
    assert.throws(() => selectTerminalProfile(f.envelope), /own data/u); assert.equal(getters, 0);
  });
}
for (const [key, value] of [["profile", "unknown"], ["body", null], ["bodySha256", "b".repeat(63)], ["bodySha256", "B".repeat(64)]] as const) {
  void test(`routing refuses ${key}=${String(value)}`, () => {
    const f = fixture(1); f.envelope[key] = value; assert.throws(() => selectTerminalProfile(f.envelope));
  });
}
for (const kind of ["inherited", "symbol", "extra", "hidden", "array", "null"] as const) {
  void test(`routing refuses ${kind} envelope`, () => {
    const f = fixture(1); let value: unknown = f.envelope;
    if (kind === "inherited") { value = Object.create(f.envelope); }
    else if (kind === "symbol") { Object.defineProperty(f.envelope, Symbol("extra"), { value: false }); }
    else if (kind === "extra") { f.envelope["extra"] = false; }
    else if (kind === "hidden") { Object.defineProperty(f.envelope, "profile", { enumerable: false }); }
    else if (kind === "array") { value = []; }
    else { value = null; }
    assert.throws(() => selectTerminalProfile(value));
  });
}

