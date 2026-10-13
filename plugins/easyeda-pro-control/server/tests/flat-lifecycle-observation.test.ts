import assert from "node:assert/strict";
import { readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { test } from "node:test";
import { controlDataDirectory, createOperation, loadOperation, readArtifact, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, isErrnoException, sha256Text } from "../src/core.ts";
import { buildFlatLifecycleObservation } from "../src/flat-lifecycle-observation.ts";
import { nativeLibraryHeaderEvidence } from "../src/native-library-header-evidence.ts";
import { context, fixture, hash } from "./flat-display-fixture.ts";

type Identity = Parameters<typeof buildFlatLifecycleObservation>[0];
type Evidence = Parameters<typeof buildFlatLifecycleObservation>[1];
const artifactLimit = 16 * 1024 * 1024;

function identity(phase: Identity["phase"] = "commit"): Identity {
  return { phase, sourcePhase: phase === "commit" || phase === "retained-save" ? "after" : "before",
    operationId: `easyeda-flat-observation-${phase}`, originalPlanHash: "1".repeat(64), flatBindingSha256: "2".repeat(64),
    context, sourceSha256: "3".repeat(64), nativeSha256: "4".repeat(64) };
}

function paddingBody(evidence: Evidence): Record<string, unknown> {
  const body = evidence.observation.pages[0]?.symbols[0]?.body;
  assert.ok(body);
  return body;
}

for (const phase of ["commit", "retained-save", "baseline-reconcile", "inverse"] as const) {
  void test(`flat ${phase} observation retains only its explicit projection`, () => {
    const inputIdentity = { ...identity(phase), extraIdentity: "Excluded identity value", saved: true, executionAuthority: true };
    const inputEvidence = { ...fixture().evidence, extraEvidence: "Excluded evidence value", terminalCheckpoint: { marker: "Not an observer checkpoint" } };
    const before = canonicalJson({ inputIdentity, inputEvidence });
    const result = buildFlatLifecycleObservation(inputIdentity, inputEvidence);
    assert.deepEqual(result, {
      schema: "easyeda-pro-control.flat-lifecycle-observation.v1", phase, sourcePhase: inputIdentity.sourcePhase,
      operationId: inputIdentity.operationId, originalPlanHash: inputIdentity.originalPlanHash,
      flatBindingSha256: inputIdentity.flatBindingSha256, context: inputIdentity.context,
      sourceSha256: inputIdentity.sourceSha256, nativeSha256: inputIdentity.nativeSha256,
      observerCheckpoint: inputEvidence.checkpoint, projectBinding: inputEvidence.projectBinding,
      observation: inputEvidence.observation, observationSha256: sha256Text(canonicalJson(inputEvidence.observation)),
      topologyProof: inputEvidence.proof, compiledTopology: false,
    });
    assert.equal(canonicalJson({ inputIdentity, inputEvidence }), before, "Serialization must not modify the supplied evidence.");
    assert.equal(Object.hasOwn(result, "history"), false);
    assert.equal(Object.hasOwn(result, "libraryHeaderEvidence"), false);
    assert.equal(Object.hasOwn(result, "saved"), false);
    assert.equal(Object.hasOwn(result, "executionAuthority"), false);
  });
}

void test("flat observation never accesses the decoded history while projecting already verified evidence", () => {
  const evidence = fixture().evidence;
  Object.defineProperty(evidence, "history", { get: (): never => { throw new Error("Decoded whole-project history must not be read."); } });
  const result = buildFlatLifecycleObservation(identity(), evidence);
  assert.deepEqual(result.observation, evidence.observation);
  assert.equal(Object.hasOwn(result, "history"), false);
});

void test("flat observation retains optional library header commitments only when present", async () => {
  const evidence = fixture().evidence;
  const libraryHeaderEvidence = await nativeLibraryHeaderEvidence(evidence.history,
    { checkpointSha256: hash, projectUuid: evidence.projectBinding.projectUuid });
  const present = buildFlatLifecycleObservation(identity(), { ...evidence, libraryHeaderEvidence });
  assert.equal(Object.hasOwn(present, "libraryHeaderEvidence"), true);
  assert.deepEqual(present.libraryHeaderEvidence, libraryHeaderEvidence);
  assert.equal(present.observationSha256, buildFlatLifecycleObservation(identity(), evidence).observationSha256,
    "Optional checkpoint commitments are separate from the raw observation hash.");
  Object.defineProperty(evidence, "libraryHeaderEvidence", { value: undefined, enumerable: true });
  const absent = buildFlatLifecycleObservation(identity(), evidence);
  assert.equal(Object.hasOwn(absent, "libraryHeaderEvidence"), false,
    "An explicitly undefined optional field is absent from the artifact, not retained as an own property.");
});

void test("flat observation hash is canonical and binds raw contents rather than a supplied summary", () => {
  const evidence = fixture().evidence;
  const reordered: Evidence["observation"] = { ...evidence.observation, settings: { netLabelInterPageConnection: true, defaultNetName: true } };
  assert.notEqual(JSON.stringify(reordered), JSON.stringify(evidence.observation));
  const original = buildFlatLifecycleObservation(identity(), evidence);
  const same = buildFlatLifecycleObservation(identity(), { ...evidence, observation: reordered });
  assert.equal(same.observationSha256, original.observationSha256);
  // This is a serializer test, not a replacement for the caller's live/source validation.
  paddingBody(evidence)["serializationPadding"] = "Retained native body text Ω";
  const suppliedHash = { ...evidence, observationSha256: "f".repeat(64) };
  const changed = buildFlatLifecycleObservation(identity(), suppliedHash);
  assert.notEqual(changed.observationSha256, original.observationSha256);
  assert.equal(changed.observationSha256, sha256Text(canonicalJson(evidence.observation)));
});

void test("flat observation accepts exactly 16 MiB of UTF-8 JSON including its trailing newline and refuses one more byte", () => {
  const binding = identity(), evidence = fixture().evidence;
  const body = paddingBody(evidence);
  // Size the retained raw body without adding fields to the observation's outer schema.
  body["serializationPadding"] = "";
  const baseBytes = Buffer.byteLength(`${JSON.stringify(buildFlatLifecycleObservation(binding, evidence))}\n`);
  const available = artifactLimit - baseBytes;
  assert.ok(available > 0);
  const padding = "€".repeat(Math.floor(available / 3)) + "x".repeat(available % 3);
  body["serializationPadding"] = padding;
  const exact = JSON.stringify(buildFlatLifecycleObservation(binding, evidence));
  assert.ok(exact.length < artifactLimit, "UTF-16 character counts must not stand in for UTF-8 bytes.");
  assert.equal(Buffer.byteLength(exact), artifactLimit - 1);
  assert.equal(Buffer.byteLength(`${exact}\n`), artifactLimit);
  body["serializationPadding"] = `${padding}x`;
  assert.throws(() => buildFlatLifecycleObservation(binding, evidence), /exceeds the 16 MiB artifact bound/u,
    "The additional byte fits without LF, so this also tests that the terminating newline counts.");
});

void test("large retained observations use bounded managed pages, private exclusive publication and fresh journal integrity checks", async () => {
  const root = controlDataDirectory();
  assert.ok(basename(root).startsWith("easyeda-test-control-"), "Run with the mandatory test-isolation preload.");
  const binding = identity(), evidence = fixture().evidence;
  const body = paddingBody(evidence), pageSize = 256 * 1024;
  body["serializationPadding"] = "";
  const empty = JSON.stringify(buildFlatLifecycleObservation(binding, evidence));
  const paddingKey = '"serializationPadding":"';
  const keyOffset = empty.indexOf(paddingKey); assert.notEqual(keyOffset, -1);
  const prefixBytes = Buffer.byteLength(empty.slice(0, keyOffset + paddingKey.length));
  const beforeEuro = pageSize - prefixBytes - 2; assert.ok(beforeEuro > 0);
  const betweenCharacters = pageSize - 6;
  body["serializationPadding"] = `${"x".repeat(beforeEuro)}€${"x".repeat(betweenCharacters)}😀${"x".repeat(600 * 1024 - beforeEuro - betweenCharacters)}`;
  const value = buildFlatLifecycleObservation(binding, evidence);
  const text = `${JSON.stringify(value)}\n`;
  const emojiOffset = text.indexOf("😀"), euroOffset = text.indexOf("€");
  assert.notEqual(emojiOffset, -1); assert.notEqual(euroOffset, -1);
  assert.equal(Buffer.byteLength(text.slice(0, euroOffset)), pageSize - 2,
    "The first page must end after two bytes of a three-byte UTF-8 character.");
  assert.equal(Buffer.byteLength(text.slice(0, emojiOffset)), 2 * pageSize - 5,
    "After shortening the first page by two bytes, the next page ends after three bytes of a four-byte character.");
  const descriptor = await writePhaseArtifact(binding.operationId, 7, "flat-commit-observation", value);
  const plan = { name: "Synthetic retained observation", expectedContext: context };
  const journalPath = await createOperation({ schema: OPERATION_SCHEMA, operationId: binding.operationId,
    plan, planHash: buildPlanHash(plan), state: "completed", artifacts: [descriptor] });
  assert.equal(descriptor.sha256, sha256Text(text));
  assert.equal(descriptor.bytes, Buffer.byteLength(text));
  assert.ok(descriptor.bytes > pageSize);
  const artifactInfo = await stat(descriptor.path);
  const journalInfo = await stat(journalPath);
  const directoryInfo = await stat(dirname(descriptor.path));
  assert.equal(artifactInfo.mode % 4096, 0o600);
  assert.equal(journalInfo.mode % 4096, 0o600);
  assert.equal(directoryInfo.mode % 4096, 0o700);
  const first = await readArtifact(descriptor.path, 0, descriptor.bytes);
  assert.equal(first.bytesRead, pageSize);
  assert.equal(first.eof, false, "A full-size request is still a bounded first page, not the complete evidence.");
  assert.ok(first.text.endsWith("\uFFFD"), "Independent UTF-8 decoding replaces the incomplete character.");
  assert.notEqual(Buffer.byteLength(first.text), first.bytesRead,
    "Naively concatenating independently decoded pages would corrupt this observation.");
  const fourByteSplit = await readArtifact(descriptor.path, pageSize - 2, pageSize);
  assert.ok(fourByteSplit.text.endsWith("\uFFFD"));
  assert.equal(Buffer.byteLength(fourByteSplit.text), fourByteSplit.bytesRead,
    "A replacement for three truncated bytes has the same encoded length, so byte counts alone miss this split.");
  const chunks: string[] = [];
  let offset = 0, shortenedBytes = 0;
  while (offset < descriptor.bytes) {
    let length = Math.min(pageSize, descriptor.bytes - offset);
    let page = await readArtifact(descriptor.path, offset, length);
    // Consumer-side reconstruction also checks trailing replacements; this is not a change to DesignExecutor.phase.
    // A genuine trailing U+FFFD is safely deferred as a complete character to the next page.
    for (let attempt = 0; attempt < 3 &&
      (page.text.endsWith("\uFFFD") || Buffer.byteLength(page.text) !== page.bytesRead); attempt += 1) {
      length -= 1; shortenedBytes += 1;
      page = await readArtifact(descriptor.path, offset, length);
    }
    assert.equal(page.offset, offset);
    assert.equal(page.size, descriptor.bytes);
    assert.ok(page.bytesRead > 0 && page.bytesRead <= pageSize);
    assert.equal(Buffer.byteLength(page.text), page.bytesRead);
    assert.equal(page.text.endsWith("\uFFFD"), false);
    offset += page.bytesRead; chunks.push(page.text);
    assert.equal(page.eof, offset === descriptor.bytes);
  }
  assert.equal(shortenedBytes, 5, "Retreat by two then three bytes and consume each complete character on the next page.");
  const complete = chunks.join("");
  assert.equal(complete, text);
  assert.equal(sha256Text(complete), descriptor.sha256);
  const decoded: unknown = JSON.parse(complete);
  assert.deepEqual(decoded, value);
  const loaded = await loadOperation(binding.operationId);
  assert.deepEqual(loaded.artifacts, [descriptor]);
  await assert.rejects(writePhaseArtifact(binding.operationId, 7, "flat-commit-observation", { replaced: true }),
    (error: unknown) => isErrnoException(error) && error.code === "EEXIST");
  assert.equal(await readFile(descriptor.path, "utf8"), text, "A refused second publication preserves the original bytes.");
  const unchanged = await loadOperation(binding.operationId);
  assert.deepEqual(unchanged.artifacts, [descriptor]);
  // Alter same-size raw padding after the successful journal read warmed its cache.
  const changed = text.replace("x".repeat(32), `y${"x".repeat(31)}`);
  assert.notEqual(changed, text);
  assert.equal(Buffer.byteLength(changed), descriptor.bytes);
  await writeFile(descriptor.path, changed, "utf8");
  await assert.rejects(loadOperation(binding.operationId), /phase artifact failed hash verification/u,
    "Previously loaded journals must rehash the complete retained observation.");
});
