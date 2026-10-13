import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord } from "../src/core.ts";
import { fixture } from "./helpers/closed-symbol-target-claim-fixture.ts";
import { parseClosedSymbolValidationRequest } from "../src/closed-symbol-validation-request.ts";

void test("strict request snapshots only exact user scope and returns deeply immutable data", () => {
  const value = structuredClone(fixture().request);
  const parsed = parseClosedSymbolValidationRequest(value);
  assert.deepEqual(parsed, value); assert.notStrictEqual(parsed, value);
  assert.ok(Object.isFrozen(parsed) && Object.isFrozen(parsed.target) && Object.isFrozen(parsed.metadata));
  assert.equal(Object.hasOwn(parsed, "executionAuthorized"), false);
  assert.equal(Object.hasOwn(parsed, "completionProved"), false);
  assert.throws(() => Reflect.set(parsed.target, "projectUuid", "0".repeat(32)) || assert.fail("immutable"));
});
for (const field of ["plan", "operationId", "fingerprint", "sha256", "marker", "code", "runtime", "policy", "verify", "phase", "retry", "headEligibility", "fixtureId", "baselineOnly"]) {
  void test(`public request rejects extra ${field}`, () => {
    assert.throws(() => parseClosedSymbolValidationRequest({ ...fixture().request, [field]: true }), /missing or extra/u);
  });
}
for (const path of ["../secret.eprj2", "relative.eprj2", "/wrong.sqlite", "/a\nb.eprj2", "/a\0b.eprj2", "", `/${"a".repeat(2050)}.eprj2`]) {
  void test(`invalid bounded path ${JSON.stringify(path).slice(0, 45)} refuses`, () => {
    const request = fixture().request;
    assert.throws(() => parseClosedSymbolValidationRequest({ ...request, target: { ...request.target, projectPath: path } }));
  });
}
for (const change of ["false-attestation", "action", "null-description", "missing-description", "classification", "metadata-code", "empty-name", "long-name", "long-description", "json-byte-cap", "unpaired-surrogate", "same-peer", "uppercase-uuid", "hyphenated-uuid", "target-extra"] as const) {
  void test(`request ${change} refuses`, () => {
    const request: unknown = structuredClone(fixture().request); assert.ok(isRecord(request));
    const metadata = request["metadata"], target = request["target"]; assert.ok(isRecord(metadata) && isRecord(target));
    if (change === "false-attestation") { request["confirmDisposableMetadataEdit"] = false; }
    if (change === "action") { request["action"] = "resume"; }
    if (change === "null-description") { metadata["description"] = null; }
    if (change === "missing-description") { delete metadata["description"]; }
    if (change === "classification") { metadata["classification"] = []; }
    if (change === "metadata-code") { metadata["code"] = "anything"; }
    if (change === "empty-name") { metadata["name"] = ""; }
    if (change === "long-name") { metadata["name"] = "x".repeat(513); }
    if (change === "long-description") { metadata["description"] = "x".repeat(65_537); }
    if (change === "json-byte-cap") { metadata["description"] = "\u0001".repeat(6000); }
    if (change === "unpaired-surrogate") { metadata["description"] = "\uD800"; }
    if (change === "same-peer") { target["companionPcbUuid"] = target["symbolUuid"]; }
    if (change === "uppercase-uuid") { target["symbolUuid"] = "D".repeat(32); }
    if (change === "hyphenated-uuid") { target["symbolUuid"] = "00000000-0000-0000-0000-000000000000"; }
    if (change === "target-extra") { target["sourceHash"] = "0".repeat(64); }
    assert.throws(() => parseClosedSymbolValidationRequest(request));
  });
}
for (const part of ["root", "target", "metadata"] as const) {
  void test(`${part} getters, prototype, symbols and nonenumerable fields refuse without invoking getter`, () => {
    for (const kind of ["getter", "prototype", "symbol", "nonenumerable"] as const) {
      const value: unknown = structuredClone(fixture().request); assert.ok(isRecord(value));
      const object = part === "root" ? value : value[part]; assert.ok(isRecord(object));
      const names = { root: "action", target: "projectUuid", metadata: "name" }; const key = names[part];
      let invoked = 0;
      if (kind === "getter") { Object.defineProperty(object, key, { enumerable: true, get(): never { invoked += 1; throw new Error("unexpected getter"); } }); }
      if (kind === "prototype") { Object.setPrototypeOf(object, { inherited: true }); }
      if (kind === "symbol") { Object.defineProperty(object, Symbol("hidden"), { value: true }); }
      if (kind === "nonenumerable") { Object.defineProperty(object, key, { enumerable: false }); }
      assert.throws(() => parseClosedSymbolValidationRequest(value)); assert.equal(invoked, 0);
    }
  });
}
void test("32/64 project UUIDs, Windows/Linux aliases and empty description remain scope data", () => {
  const input = fixture().request;
  for (const projectUuid of ["a".repeat(32), "a".repeat(64)]) {
    for (const projectPath of [String.raw`C:\Scratch\Synthetic.eprj2`, "c:/Scratch/./Synthetic.eprj2", "/synthetic/../alias.eprj2"]) {
      const value = parseClosedSymbolValidationRequest({ ...input, target: { ...input.target, projectUuid, projectPath }, metadata: { name: "Keep exact text", description: "" } });
      assert.equal(value.target.projectPath, projectPath); assert.equal(value.metadata.description, "");
    }
  }
});
