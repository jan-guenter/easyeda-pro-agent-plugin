import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { parseClosedSymbolTerminalEnvelope, reconstructClosedSymbolTerminalPredecessor } from "../src/closed-symbol-terminal-shape.ts";
import { parseClosedSymbolAgedTerminalEnvelope, reconstructClosedSymbolAgedTerminalPredecessor } from "../src/closed-symbol-aged-terminal-shape.ts";
import { lockedFixture, terminalFixture } from "./helpers/closed-symbol-aged-terminal-shape-fixture.ts";

function object(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }
function field(value: unknown, path: readonly string[]): unknown {
  let current = value;
  for (const key of path) { assert.ok(current !== null && typeof current === "object"); current = Reflect.get(current, key) as unknown; }
  return current;
}
function set(value: unknown, path: readonly string[], replacement: unknown): void {
  const key = path.at(-1), target = field(value, path.slice(0, -1));
  assert.ok(target !== null && typeof target === "object" && key !== undefined);
  Object.defineProperty(target, key, { value: replacement, enumerable: true, writable: true, configurable: true });
}
function remove(value: unknown, path: readonly string[]): void {
  const key = path.at(-1), target = object(field(value, path.slice(0, -1))); assert.ok(key !== undefined);
  assert.equal(Reflect.deleteProperty(target, key), true);
}
function rehash(value: unknown): void { const envelope = object(value); envelope["bodySha256"] = sha256Json(envelope["body"]); }

void test("v2 is a distinct immutable data format with exactly two additional descriptors and one result digest", () => {
  const f = terminalFixture();
  const before = JSON.stringify(f.envelope), parsed = parseClosedSymbolAgedTerminalEnvelope(f.envelope);
  assert.equal(parsed.profile, "easyeda-pro-control.closed-symbol-terminal.v2"); assert.equal(parsed.body.headEligibility, "aged-unlocked");
  assert.equal(parsed.body.phaseArtifacts.length, 44); assert.equal(parsed.body.generations.length, 3);
  assert.equal(Object.keys(parsed.body.evidence).length, 10); assert.equal(Object.keys(parsed.body.results).length, 9);
  assert.ok(Object.isFrozen(parsed.body.evidence.mainReferenceIntent)); assert.ok(Object.isFrozen(parsed.body.evidence.mainReferenceResult));
  assert.equal(JSON.stringify(f.envelope), before);
  assert.throws(() => parseClosedSymbolTerminalEnvelope(parsed), /profile/u);
  assert.throws(() => reconstructClosedSymbolTerminalPredecessor(f.stored, parsed), /profile/u);
  assert.deepEqual(reconstructClosedSymbolAgedTerminalPredecessor(f.stored, parsed), f.predecessor);
});
void test("locked v1 remains accepted only by its unchanged parser and does not acquire aged fields", () => {
  const f = lockedFixture();
  const before = JSON.stringify(f.envelope);
  assert.equal(JSON.stringify(parseClosedSymbolTerminalEnvelope(f.envelope)), before);
  assert.equal(Object.keys(f.envelope.body.evidence).length, 8); assert.equal(Object.keys(f.envelope.body.results).length, 8);
  assert.equal(Object.hasOwn(f.envelope.body, "headEligibility"), false);
  assert.throws(() => parseClosedSymbolAgedTerminalEnvelope(f.envelope), /profile/u);
});
for (const path of [["body", "headEligibility"], ["body", "evidence", "mainReferenceIntent"], ["body", "evidence", "mainReferenceResult"], ["body", "results", "mainReferenceResultSha256"]] as const) {
  void test(`aged required field rejects omission: ${path.join("/")}`, () => {
    const input: unknown = structuredClone(terminalFixture().envelope); remove(input, path); rehash(input);
    assert.throws(() => parseClosedSymbolAgedTerminalEnvelope(input), /exact object|own data/u);
  });
  void test(`aged required field rejects accessor without invocation: ${path.join("/")}`, () => {
    const input: unknown = structuredClone(terminalFixture().envelope), key = path.at(-1), target = object(field(input, path.slice(0, -1)));
    assert.ok(key !== undefined); let reads = 0;
    Object.defineProperty(target, key, { enumerable: true, get(): never { reads += 1; throw new Error("Never invoke"); } });
    assert.throws(() => parseClosedSymbolAgedTerminalEnvelope(input), /own data/u); assert.equal(reads, 0);
  });
}
for (const value of ["locked", "aged", "unlocked", "AGED-UNLOCKED", true, null, 0, {}]) {
  void test(`aged discriminator refuses ${JSON.stringify(value)}`, () => {
    const input: unknown = structuredClone(terminalFixture().envelope); set(input, ["body", "headEligibility"], value); rehash(input);
    assert.throws(() => parseClosedSymbolAgedTerminalEnvelope(input), /aged head/u);
  });
}
for (const [key, maximum] of [["mainReferenceIntent", 60_000], ["mainReferenceResult", 196_608]] as const) {
  for (const changed of ["missing-path", "extra", "foreign-directory", "wrong-filename", "alias", "zero", "negative-zero", "fraction", "over-bound", "hash", "prototype", "array", "getter"] as const) {
    void test(`${key} rejects ${changed}`, () => {
      const input: unknown = structuredClone(terminalFixture().envelope);
      const descriptor = object(field(input, ["body", "evidence", key])); let reads = 0;
      if (changed === "missing-path") { delete descriptor["path"]; }
      else if (changed === "extra") { descriptor["extra"] = false; }
      else if (changed === "foreign-directory") { descriptor["path"] = `/tmp/${key}.json`; }
      else if (changed === "wrong-filename") { descriptor["path"] = String(descriptor["path"]).replace("10-baseline", "11-baseline"); }
      else if (changed === "alias") { descriptor["path"] = String(descriptor["path"]).replace("/10-baseline", "/./10-baseline"); }
      else if (changed === "zero") { descriptor["bytes"] = 0; }
      else if (changed === "negative-zero") { descriptor["bytes"] = -0; }
      else if (changed === "fraction") { descriptor["bytes"] = 1.5; }
      else if (changed === "over-bound") { descriptor["bytes"] = maximum + 1; }
      else if (changed === "hash") { descriptor["sha256"] = "A".repeat(64); }
      else if (changed === "prototype") { Object.setPrototypeOf(descriptor, { inherited: true }); }
      else if (changed === "array") { set(input, ["body", "evidence", key], []); }
      else { Object.defineProperty(descriptor, "bytes", { enumerable: true, get(): never { reads += 1; throw new Error("Never invoke"); } }); }
      if (changed !== "getter") { rehash(input); }
      assert.throws(() => parseClosedSymbolAgedTerminalEnvelope(input), /Terminal/u); assert.equal(reads, 0);
    });
  }
  void test(`${key} admits its exact existing producer cap as data, not verified bytes`, () => {
    const input: unknown = structuredClone(terminalFixture().envelope); set(input, ["body", "evidence", key, "bytes"], maximum); rehash(input);
    assert.equal(parseClosedSymbolAgedTerminalEnvelope(input).body.evidence[key].bytes, maximum);
  });
}
for (const variant of ["profile-only", "extra-aged-fields", "v2-without-aged", "result-under-evidence", "descriptor-under-results", "swapped-roles", "duplicate-role", "unsealed-reference"] as const) {
  void test(`cross-profile and reference role substitution refuses ${variant}`, () => {
    const input: unknown = structuredClone(variant === "profile-only" || variant === "v2-without-aged" ? lockedFixture().envelope : terminalFixture().envelope);
    if (variant === "profile-only" || variant === "v2-without-aged") { set(input, ["profile"], "easyeda-pro-control.closed-symbol-terminal.v2"); }
    else if (variant === "extra-aged-fields") { set(input, ["profile"], "easyeda-pro-control.closed-symbol-terminal.v1"); }
    else if (variant === "result-under-evidence") { set(input, ["body", "evidence", "mainReferenceResultSha256"], "a".repeat(64)); }
    else if (variant === "descriptor-under-results") { set(input, ["body", "results", "mainReferenceResult"], field(input, ["body", "evidence", "mainReferenceResult"])); }
    else if (variant === "swapped-roles") {
      const first = field(input, ["body", "evidence", "mainReferenceIntent"]), second = field(input, ["body", "evidence", "mainReferenceResult"]);
      set(input, ["body", "evidence", "mainReferenceIntent"], second); set(input, ["body", "evidence", "mainReferenceResult"], first);
    } else if (variant === "duplicate-role") { set(input, ["body", "evidence", "mainReferenceResult"], field(input, ["body", "evidence", "mainReferenceIntent"])); }
    else { set(input, ["body", "results", "mainReferenceResultSha256"], "b".repeat(64)); }
    if (variant !== "unsealed-reference") { rehash(input); }
    assert.throws(() => parseClosedSymbolAgedTerminalEnvelope(input), /Terminal/u);
    if (variant === "extra-aged-fields") { assert.throws(() => parseClosedSymbolTerminalEnvelope(input), /exact object/u); }
  });
}
void test("reference digest and descriptors are shape claims only; full replay must still compare the original records", () => {
  const input: unknown = structuredClone(terminalFixture().envelope);
  set(input, ["body", "results", "mainReferenceResultSha256"], "b".repeat(64)); rehash(input);
  assert.equal(parseClosedSymbolAgedTerminalEnvelope(input).body.results.mainReferenceResultSha256, "b".repeat(64));
});
function normalize(text: string): string { return text.replaceAll("AgedTerminal", "Terminal").replaceAll("ClosedSymbolAged", "ClosedSymbol").replaceAll("AGED_TERMINAL_", "TERMINAL_"); }
function helpers(text: string): string { return text.slice(text.indexOf("function need("), text.indexOf("/** Fixed45")); }
function predecessor(text: string): string { return text.slice(text.indexOf("/** Validate JSON data")); }
void test("locked source is byte-identical and the aged parser retains helper and predecessor bodies without projection", async () => {
  const original = await readFile(new URL("../src/closed-symbol-terminal-shape.ts", import.meta.url), "utf8");
  const aged = await readFile(new URL("../src/closed-symbol-aged-terminal-shape.ts", import.meta.url), "utf8");
  assert.equal(sha256Text(original), "c6e1d08ab833acb4b7aad64c199f100f11a02b1dc4dec927b311017c645e60c8");
  assert.equal(normalize(helpers(aged)), helpers(original)); assert.equal(normalize(predecessor(aged)), predecessor(original));
  assert.equal(aged.includes('from "./closed-symbol-terminal-shape.ts"'), false);
  assert.equal(aged.includes("parseClosedSymbolTerminalEnvelope("), false);
});
