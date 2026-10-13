import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalJson, sha256Json } from "../src/core.ts";
import { TERMINAL_NEXT_ACTION, TERMINAL_STATE } from "../src/closed-symbol-terminal-shape.ts";
import { lockedFixture, terminalFixture } from "./helpers/closed-symbol-aged-terminal-shape-fixture.ts";
import { reconstructProfiledClosedSymbolTerminalPredecessor } from "../src/closed-symbol-terminal-profiles.ts";

void test("fixed routing preserves an unchanged v1 predecessor with no aged field projection", () => {
  const f = lockedFixture();
  const { journalSha256: _oldSeal, ...prior } = f.predecessor;
  const stored = { ...prior, state: TERMINAL_STATE, updatedAt: f.envelope.body.recordedAt, nextSafeAction: TERMINAL_NEXT_ACTION,
    terminalArtifact: { path: `${f.predecessor.artifacts[0]?.path.slice(0, f.predecessor.artifacts[0]?.path.lastIndexOf("/"))}/45-closed-symbol-terminal.json`,
      bytes: 1, sha256: "a".repeat(64) } };
  const sealed = { ...stored, journalSha256: sha256Json(stored) };
  const before = canonicalJson({ sealed, envelope: f.envelope });
  assert.deepEqual(reconstructProfiledClosedSymbolTerminalPredecessor(sealed, f.envelope), f.predecessor);
  assert.equal(canonicalJson({ sealed, envelope: f.envelope }), before);
});

void test("fixed routing uses the actual v2 predecessor and retains its whole hash", () => {
  const f = terminalFixture();
  const before = canonicalJson(f);
  assert.deepEqual(reconstructProfiledClosedSymbolTerminalPredecessor(f.stored, f.envelope), f.predecessor);
  assert.equal(canonicalJson(f), before);
});

for (const profile of [null, undefined, false, 1, {}, [], "", "v1", "easyeda-pro-control.closed-symbol-terminal.v3"]) {
  void test(`routing refuses unsupported profile ${JSON.stringify(profile)} without fallback`, () => {
    const f = terminalFixture();
    assert.throws(() => reconstructProfiledClosedSymbolTerminalPredecessor(f.stored, { ...f.envelope, profile }), /profile/u);
  });
}
void test("profile routing refuses an accessor without reading it", () => {
  const f = terminalFixture(); let reads = 0;
  const input = { ...f.envelope };
  Object.defineProperty(input, "profile", { get(): never { reads += 1; throw new Error("Never read profile"); } });
  assert.throws(() => reconstructProfiledClosedSymbolTerminalPredecessor(f.stored, input), /own data/u);
  assert.equal(reads, 0);
});
void test("profile routing does not accept inherited profile data", () => {
  const f = terminalFixture();
  const input: unknown = Object.create({ profile: f.envelope.profile });
  assert.throws(() => reconstructProfiledClosedSymbolTerminalPredecessor(f.stored, input), /own data/u);
});
for (const variant of ["v1-as-v2", "v2-as-v1", "extra-field", "invalid-seal", "stored-drift"]) {
  void test(`selected parser refuses ${variant} without trying another parser`, () => {
    const f = terminalFixture();
    const input: Record<string, unknown> = { ...structuredClone(variant === "v1-as-v2" ? lockedFixture().envelope : f.envelope) };
    const stored: Record<string, unknown> = structuredClone(f.stored);
    if (variant === "v1-as-v2") { input["profile"] = "easyeda-pro-control.closed-symbol-terminal.v2"; }
    else if (variant === "v2-as-v1") { input["profile"] = "easyeda-pro-control.closed-symbol-terminal.v1"; }
    else if (variant === "extra-field") { input["executionAuthorized"] = true; }
    else if (variant === "invalid-seal") { input["bodySha256"] = "b".repeat(64); }
    else { stored["journalSha256"] = "b".repeat(64); }
    assert.throws(() => reconstructProfiledClosedSymbolTerminalPredecessor(stored, input), /Terminal/u);
  });
}
