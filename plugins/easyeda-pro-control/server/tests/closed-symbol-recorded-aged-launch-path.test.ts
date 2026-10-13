/** Genuine managed phase/qualification resealing over actual synthetic stages; no historical parser or issuer mock. */
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { after, test } from "node:test";
import { installSyntheticNativeProfile } from "./helpers/install-synthetic-native-profile.ts";
import { loadClosedSymbolJournal } from "../src/closed-symbol-journal.ts";
import { inspectRecordedClosedCopy } from "../src/closed-symbol-recorded-copy.ts";
import { validateRecordedNativeSource } from "../src/closed-symbol-recorded-native.ts";
import { syntheticSqlRuntime } from "./helpers/sqlite-inventory-fixture.ts";
import { canonicalJson, isRecord, sha256Json, sha256Text } from "../src/core.ts";
import { reconstructRecordedAgedSymbolWitness } from "../src/closed-symbol-recorded-aged-witness.ts";

// oxlint-disable-next-line node/no-top-level-await -- Install only the worker-local synthetic immutable source-profile I/O before stage imports.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- The original stage graph must share its unmodified issuer registry after the fixed synthetic I/O hook.
const { writeFixture } = await import("./helpers/closed-symbol-recorded-aged-write-fixture.ts");

function bag(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }

void test("actual phase-loaded aged replay rejects a self-resealed edit executable differing from baseline", async (context) => {
  const f = await writeFixture(context); await f.writer.write(f.writeInput);
  const original = await loadClosedSymbolJournal(f.journal.operationId);
  const admission = original.events[3], initial = original.events[0];
  assert.ok(initial && admission?.generation && "captureSha256" in admission.generation);
  const nativeSource = validateRecordedNativeSource({ journal: original.journal, fingerprint: f.identity,
    bootstrapStatus: bag(initial.data)["runtimeStatus"], launchClock: f.launchClock, launchGeneration: admission.generation });
  const historical = await inspectRecordedClosedCopy({ operationId: f.journal.operationId, phase: "baseline-copy", runtime: await syntheticSqlRuntime() });
  const fixed = { baselineInventory: historical.inventory, nativeSource, mainReferenceIntent: f.reference.intentArtifact, mainReferenceResult: f.reference.resultArtifact };
  const positive = await reconstructRecordedAgedSymbolWitness({ ...original, ...fixed });
  assert.deepEqual(positive.result, f.witness);
  const calls = { reference: f.transport.calls, witness: f.agedState.calls, write: f.writeState.calls };
  const retained = await Promise.all(original.journal.artifacts.map(async (artifact) => ({ path: artifact.path, bytes: await readFile(artifact.path) })));
  const journalBytes = await readFile(original.journal.journalPath);
  const qualificationBytes = await readFile(f.witness.clockArtifact.path);
  const qualification = bag(JSON.parse(qualificationBytes.toString("utf8")) as unknown);
  const events = structuredClone(original.events), journal = structuredClone(original.journal);
  const raw = events[19], request = events[18], write = events[20];
  assert.ok(request && raw && write);
  const requestData = bag(request.data);
  const launchClock = bag(requestData["launchClock"]);
  const owner = bag(launchClock["ownerBinding"]);
  const originalExecutable = owner["executable"];
  assert.equal(originalExecutable, nativeSource.executable);
  const substituted = String.raw`C:\DifferentSyntheticLocation\same-image.exe`;
  assert.notEqual(originalExecutable, substituted);
  owner["executable"] = substituted;
  qualification["launchClock"] = structuredClone(launchClock);
  const newRequestHash = sha256Json(requestData);
  Object.assign(request, { requestSha256: newRequestHash, dataSha256: newRequestHash });
  Object.assign(raw, { requestSha256: newRequestHash });
  qualification["requestSha256"] = newRequestHash;
  try {
    for (let index = 18; index < events.length; index += 1) {
      const artifact = journal.artifacts[index], event = events[index]; assert.ok(event && artifact);
      if (index === 20) {
        qualification["rawResultArtifactSha256"] = journal.artifacts[19]?.sha256;
        const text = `${JSON.stringify(qualification)}\n`;
        const digest = sha256Text(text), writeData = bag(write.data);
        Object.assign(bag(writeData["witnessClockArtifact"]), { sha256: digest, bytes: Buffer.byteLength(text) });
        writeData["witnessClockArtifactSha256"] = digest;
        writeData["witnessArtifactSha256"] = journal.artifacts[19]?.sha256;
        const writeHash = sha256Json(writeData);
        Object.assign(write, { requestSha256: writeHash, dataSha256: writeHash });
        const returned = events[21]; assert.ok(returned); Object.assign(returned, { requestSha256: writeHash });
        await writeFile(f.witness.clockArtifact.path, text, { mode: 0o600 });
      }
      Object.assign(event, { previousArtifactSha256: journal.artifacts[index - 1]?.sha256 ?? null });
      const text = `${JSON.stringify(event)}\n`;
      assert.ok(Buffer.byteLength(text) <= 60_000);
      await writeFile(artifact.path, text, { mode: 0o600 });
      Object.assign(artifact, { bytes: Buffer.byteLength(text), sha256: sha256Text(text) });
    }
    // Test-only corruption model: the generic writer correctly refuses an already
    // Changed graph. Reseal the isolated test journal directly, then require the
    // Actual strict loader to verify all current managed bytes before replay.
    delete journal["journalSha256"];
    journal["journalSha256"] = sha256Text(canonicalJson(journal));
    await writeFile(journal.journalPath, `${JSON.stringify(journal)}\n`, { mode: 0o600 });
    const loaded = await loadClosedSymbolJournal(f.journal.operationId);
    assert.equal(loaded.events.length, 22);
    const loadedClock = bag(bag(loaded.events[18]?.data)["launchClock"]);
    assert.equal(bag(loadedClock["ownerBinding"])["executable"], substituted);
    assert.equal(bag(bag(qualification["launchClock"])["ownerBinding"])["executableSha256"], nativeSource.executableSha256);
    await assert.rejects(reconstructRecordedAgedSymbolWitness({ ...loaded, ...fixed }), /Recorded aged witness refused/u);
  } finally {
    for (const item of retained) { await writeFile(item.path, item.bytes, { mode: 0o600 }); }
    await writeFile(f.witness.clockArtifact.path, qualificationBytes, { mode: 0o600 });
    await writeFile(original.journal.journalPath, journalBytes, { mode: 0o600 });
    assert.equal(canonicalJson(await loadClosedSymbolJournal(f.journal.operationId)), canonicalJson(original));
    assert.deepEqual({ reference: f.transport.calls, witness: f.agedState.calls, write: f.writeState.calls }, calls);
  }
});
