import assert from "node:assert/strict";
import { before, test } from "node:test";
import { isRecord, sha256Json } from "../src/core.ts";
import { parseClosedSymbolTerminalArtifact, parseClosedSymbolTerminalEnvelope, reconstructClosedSymbolTerminalPredecessor } from "../src/closed-symbol-terminal-shape.ts";
import { terminalFixture } from "./helpers/closed-symbol-terminal-fixture.ts";

let retained: Awaited<ReturnType<typeof terminalFixture>> | undefined;
before(async (): Promise<void> => { retained = await terminalFixture(); });
function fixture(): Awaited<ReturnType<typeof terminalFixture>> { assert.ok(retained !== undefined); return retained; }
function object(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }
function field(value: unknown, path: readonly string[]): unknown {
  let current = value;
  for (const key of path) { assert.ok(current !== null && typeof current === "object"); current = Reflect.get(current, key) as unknown; }
  return current;
}
function set(value: unknown, path: readonly string[], replacement: unknown): void {
  const target = field(value, path.slice(0, -1));
  const last = path.at(-1);
  assert.ok(target !== null && typeof target === "object" && last !== undefined);
  Object.defineProperty(target, last, { value: replacement, enumerable: true, writable: true, configurable: true });
}
function rehash(value: unknown): void { const root = object(value); root["bodySha256"] = sha256Json(root["body"]); }
function reseal(value: Record<string, unknown>): void { delete value["journalSha256"]; value["journalSha256"] = sha256Json(value); }

void test("strict terminal shape returns only frozen data and preserves the exact resealed predecessor", () => {
  const f = fixture(), parsed = parseClosedSymbolTerminalEnvelope(f.envelope);
  assert.deepEqual(parsed, f.envelope); assert.ok(Object.isFrozen(parsed.body.results));
  assert.deepEqual(reconstructClosedSymbolTerminalPredecessor(f.stored, parsed), f.predecessor);
  assert.notEqual(f.stored["journalSha256"], f.predecessor["journalSha256"]);
  assert.equal(parsed.body.predecessor.entireJournalSha256, sha256Json(f.predecessor));
  assert.deepEqual(parseClosedSymbolTerminalArtifact(f.terminalArtifact, f.predecessor.operationId), f.terminalArtifact);
});
for (const [name, path, replacement] of [
  ["profile", ["profile"], "other"], ["family", ["body", "family"], "other"],
  ["operation", ["body", "operationId"], "../foreign"], ["digest", ["bodySha256"], "0".repeat(64)],
  ["predecessor state", ["body", "predecessor", "state"], "closed-session-completed"],
  ["timestamp normalization", ["body", "recordedAt"], "2026-02-30T01:00:00.000Z"],
  ["timestamp timezone", ["body", "recordedAt"], "2026-10-12T01:00:00+00:00"],
  ["unknown outcome", ["body", "outcome", "completionProved"], true],
  ["save flag", ["body", "outcome", "saved"], true], ["execution flag", ["body", "executionAuthorized"], true],
  ["negative zero ordinal", ["body", "generations", "0", "ordinal"], -0],
  ["wrong ordinal", ["body", "generations", "1", "ordinal"], 2],
  ["foreign copy name", ["body", "generations", "0", "copyArtifact", "path"], "/foreign.eprj2"],
  ["phase nan", ["body", "phaseArtifacts", "0", "bytes"], Number.NaN],
  ["phase negative zero", ["body", "phaseArtifacts", "0", "bytes"], -0],
  ["phase zero", ["body", "phaseArtifacts", "0", "bytes"], 0],
  ["phase oversized", ["body", "phaseArtifacts", "0", "bytes"], 60_001],
  ["fingerprint oversized", ["body", "evidence", "fingerprint", "bytes"], 262_145],
  ["window oversized", ["body", "evidence", "editWindow", "bytes"], 262_145],
  ["qualification oversized", ["body", "evidence", "witnessQualification", "bytes"], 60_001],
  ["raw saved oversized", ["body", "evidence", "savedReadRaw", "bytes"], 245_761],
  ["copy oversized", ["body", "generations", "0", "copyArtifact", "bytes"], 268_435_457],
  ["uppercase hash", ["body", "results", "savedSourceSha256"], "A".repeat(64)],
  ["old navigation key", ["body", "results", "verificationNavigationSha256"], "a".repeat(64)],
  ["old predecessor key", ["body", "predecessor", "journalSha256"], "a".repeat(64)],
  ["relative source", ["body", "finalSource", "source"], "source.eprj2"],
  ["wrong method", ["body", "finalSource", "method"], "checkpoint-only"],
  ["long action", ["body", "predecessor", "nextSafeAction"], "Ω".repeat(1025)],
] as const) {
  void test(`terminal shape refuses ${name}`, () => {
    const value: unknown = structuredClone(fixture().envelope); set(value, path, replacement);
    if (name !== "digest") { rehash(value); }
    assert.throws(() => parseClosedSymbolTerminalEnvelope(value), /Terminal/u);
  });
}
for (const path of [[], ["body"], ["body", "predecessor"], ["body", "evidence"], ["body", "results"],
  ["body", "finalSource"], ["body", "finalSource", "sqlDigests"], ["body", "outcome"], ["body", "phaseArtifacts", "0"],
  ["body", "generations", "0"], ["body", "generations", "0", "sqlDigests"], ["body", "generations", "0", "copyArtifact"]] as const) {
  void test(`terminal shape refuses extra nested field at ${path.join("/") || "root"}`, () => {
    const value: unknown = structuredClone(fixture().envelope); set(value, [...path, "extra"], true); rehash(value);
    assert.throws(() => parseClosedSymbolTerminalEnvelope(value), /exact object/u);
  });
}
for (const path of [["body"], ["body", "evidence", "fingerprint", "bytes"], ["body", "generations", "0"], ["body", "results", "savedSourceSha256"]] as const) {
  void test(`terminal shape never invokes an accessor at ${path.join("/")}`, () => {
    const value: unknown = structuredClone(fixture().envelope);
    const target = field(value, path.slice(0, -1));
    const last = path.at(-1);
    assert.ok(target !== null && typeof target === "object" && last !== undefined); let getters = 0;
    Object.defineProperty(target, last, { enumerable: true, get(): never { getters += 1; throw new Error("Getter must not run"); } });
    assert.throws(() => parseClosedSymbolTerminalEnvelope(value), /data field/u); assert.equal(getters, 0);
  });
}
for (const changed of ["sparse", "short", "long", "extra", "prototype"] as const) {
  void test(`terminal phase array refuses ${changed}`, () => {
    const value: unknown = structuredClone(fixture().envelope);
    const phases = field(value, ["body", "phaseArtifacts"]); assert.ok(Array.isArray(phases));
    if (changed === "sparse") { Reflect.deleteProperty(phases, "3"); }
    else if (changed === "short") { phases.pop(); }
    else if (changed === "long") { phases.push(phases[0]); }
    else if (changed === "extra") { Object.defineProperty(phases, "extra", { value: true }); }
    else { Object.setPrototypeOf(phases, null); }
    assert.throws(() => parseClosedSymbolTerminalEnvelope(value), /array/u);
  });
}
for (const changed of ["self-seal", "unknown-field", "integrity-model", "retained-terminal", "hard-stop", "orphan", "time", "wrong-phase-array"] as const) {
  void test(`terminal predecessor refuses ${changed}`, () => {
    const f = fixture(), value = structuredClone(f.stored);
    if (changed === "self-seal") { value["journalSha256"] = "1".repeat(64); }
    else {
      if (changed === "unknown-field") { value["syntheticUnknown"] = { changed: true }; }
      else if (changed === "integrity-model") { value["integrityModel"] = "changed"; }
      else if (changed === "retained-terminal") { value["state"] = "closed-session-evidence-recorded"; }
      else if (changed === "hard-stop") { value["hardStop"] = true; }
      else if (changed === "orphan") { value["orphanedCallPossible"] = true; }
      else if (changed === "time") { value["updatedAt"] = f.predecessor.updatedAt; }
      else { value.artifacts = []; }
      reseal(value);
    }
    assert.throws(() => reconstructClosedSymbolTerminalPredecessor(value, f.envelope), /Terminal/u);
  });
}
void test("predecessor preserves nested unknown data and refuses an unknown-field accessor without invoking it", () => {
  const f = fixture(), value = structuredClone(f.stored); let getters = 0;
  Object.defineProperty(value, "unknownAccessor", { enumerable: true, get(): never { getters += 1; throw new Error("Never invoke"); } });
  assert.throws(() => reconstructClosedSymbolTerminalPredecessor(value, f.envelope), /own data/u); assert.equal(getters, 0);
  assert.deepEqual(reconstructClosedSymbolTerminalPredecessor(f.stored, f.envelope)["syntheticUnknown"], f.predecessor["syntheticUnknown"]);
});
for (const [name, path, maximum] of [
  ["phase", ["body", "phaseArtifacts", "0", "bytes"], 60_000],
  ["fingerprint", ["body", "evidence", "fingerprint", "bytes"], 262_144],
  ["window", ["body", "evidence", "baselineWindow", "bytes"], 262_144],
  ["qualification", ["body", "evidence", "witnessQualification", "bytes"], 60_000],
  ["witness", ["body", "evidence", "witnessRaw", "bytes"], 60_000],
  ["write", ["body", "evidence", "writeRaw", "bytes"], 60_000],
  ["saved raw", ["body", "evidence", "savedReadRaw", "bytes"], 245_760],
  ["copy", ["body", "generations", "0", "copyArtifact", "bytes"], 268_435_456],
] as const) {
  void test(`terminal descriptor admits exact ${name} cap as data only`, () => {
    const value: unknown = structuredClone(fixture().envelope); set(value, path, maximum); rehash(value);
    assert.equal(field(parseClosedSymbolTerminalEnvelope(value), path), maximum);
  });
}
void test("complete terminal JSON refuses64KiB overflow even when individual path lengths pass", () => {
  const f = fixture(), value: unknown = structuredClone(f.envelope);
  const directory = f.terminalArtifact.path.slice(0, f.terminalArtifact.path.lastIndexOf("/"));
  for (let index = 0; index < 44; index += 1) { set(value, ["body", "phaseArtifacts", String(index), "path"], `${directory}/${"x".repeat(1700)}-${String(index)}.json`); }
  rehash(value); assert.throws(() => parseClosedSymbolTerminalEnvelope(value), /complete envelope byte bound/u);
});
for (const changed of ["foreign", "noncanonical", "wrong-name", "over-bound", "accessor", "symbol"] as const) {
  void test(`fixed45 descriptor refuses ${changed}`, () => {
    const f = fixture(), value: Record<string, unknown> = { ...f.terminalArtifact }; let getters = 0;
    if (changed === "foreign") { value["path"] = "/foreign/45-closed-symbol-terminal.json"; }
    else if (changed === "noncanonical") { value["path"] = f.terminalArtifact.path.replace("/45-", "/./45-"); }
    else if (changed === "wrong-name") { value["path"] = f.terminalArtifact.path.replace("45-", "46-"); }
    else if (changed === "over-bound") { value["bytes"] = 65_537; }
    else if (changed === "accessor") { Object.defineProperty(value, "bytes", { enumerable: true, get(): never { getters += 1; throw new Error("Never invoke"); } }); }
    else { Object.defineProperty(value, Symbol("extra"), { value: true }); }
    assert.throws(() => parseClosedSymbolTerminalArtifact(value, f.predecessor.operationId), /Terminal/u); assert.equal(getters, 0);
  });
}
