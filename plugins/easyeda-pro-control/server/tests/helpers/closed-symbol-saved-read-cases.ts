import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { after, test } from "node:test";
import { readExactUtf8Artifact, writePhaseArtifact } from "../../src/artifacts.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { canonicalJson, isRecord, sha256Text } from "../../src/core.ts";
import { installSyntheticNativeProfile } from "./install-synthetic-native-profile.ts";
// oxlint-disable-next-line node/no-top-level-await -- Install this exact worker-local prerequisite mock before loading the real stage graph.
const profile = await installSyntheticNativeProfile();
after(() => { profile.unregister(); });
// oxlint-disable-next-line node/no-top-level-await -- Consumer imports follow the synthetic prerequisite hook; issuer modules stay unchanged.
const { assertOriginalClosedSymbolSavedRead } = await import("../../src/closed-symbol-saved-read.ts");
// oxlint-disable-next-line node/no-top-level-await -- Load the actual stage fixture after its worker-local prerequisite mock.
const { savedReadFixture } = await import("./closed-symbol-saved-read-fixture.ts");

export function registerSavedReadCoreCases(): void {
  void test("actual saved read binds original SQL, reopen and complete raw reply without completion flags", async (context) => {
    const f = await savedReadFixture(context), operationId = f.journal.operationId;
    const result = await f.readStage.read(f.readInput);
    assert.strictEqual(assertOriginalClosedSymbolSavedRead(result, f.engine, operationId), result);
    assert.strictEqual(f.readStage.originalReturn(operationId), f.readState.raw);
    assert.equal(f.readState.calls, 1); assert.equal(result.generation.ordinal, 2);
    assert.equal(result.sourceSha256, f.preparedSource.sourceSha256);
    assert.equal(result.editComparisonResultSha256, f.originalEditComparison.resultSha256);
    assert.equal(result.relation["exactContent"], true);
    for (const key of ["executionAuthorized", "completionProved", "saved", "reopened"] as const) { assert.equal(result[key], false); }
    const artifact = await readExactUtf8Artifact(result.rawArtifact), envelope: unknown = JSON.parse(artifact.text);
    assert.ok(isRecord(envelope)); assert.equal(envelope["rawReturnBase64"], Buffer.from(JSON.stringify(f.readState.raw)).toString("base64"));
    assert.equal(result.rawReturnSha256, sha256Text(JSON.stringify(f.readState.raw)));
    assert.equal(result.rawReturnBytes, Buffer.byteLength(JSON.stringify(f.readState.raw)));
    const retained = await loadClosedSymbolJournal(operationId);
    assert.equal(retained.journal.sequence, 38); assert.equal(retained.journal.orphanedCallPossible, false);
    assert.equal(retained.events.at(-1)?.step, "verify-content-read"); assert.equal(retained.events.at(-1)?.kind, "result");
    assert.equal(result.artifactSha256, retained.journal.artifacts.at(-1)?.sha256);
    assert.throws(() => assertOriginalClosedSymbolSavedRead(structuredClone(result), f.engine, operationId), /original successful/u);
    assert.throws(() => assertOriginalClosedSymbolSavedRead(result, f.engine, `${operationId}-other`), /original successful/u);
    assert.throws(() => assertOriginalClosedSymbolSavedRead(f.readState.raw, f.engine, operationId), /original successful/u);
    await assert.rejects(f.readStage.read(f.readInput), /already consumed/u); assert.equal(f.readState.calls, 1);
  });

  for (const changed of ["source-clone", "navigation-clone", "navigation-raw"] as const) {
    void test(`saved read refuses ${changed} before native dispatch`, async (context) => {
      const f = await savedReadFixture(context);
      const input = { ...f.readInput };
      if (changed === "source-clone") { input.source = structuredClone(input.source); }
      else { input.navigationResult = changed === "navigation-clone" ? structuredClone(input.navigationResult) : f.navigation.originalReturn(f.journal.operationId, "verify-open"); }
      await assert.rejects(f.readStage.read(input)); assert.equal(f.readState.calls, 0);
      await assert.rejects(f.readStage.read(f.readInput), /already consumed/u);
    });
  }
}

export function registerSavedReadReplyCases(): void {
  for (const changed of ["shape", "project", "ticket", "content", "flags"] as const) {
    void test(`settled saved read ${changed} refuses without retry or saved claim`, async (context) => {
      const f = await savedReadFixture(context);
      f.readState.after = (raw): void => {
        assert.ok(isRecord(raw) && Array.isArray(raw["content"])); const first: unknown = raw["content"][0]; assert.ok(isRecord(first) && typeof first["text"] === "string");
        const value: unknown = JSON.parse(first["text"]); assert.ok(isRecord(value));
        if (changed === "shape") { value["unexpected"] = true; }
        if (changed === "project") { value["projectUuid"] = "9".repeat(64); }
        if (changed === "ticket") { value["maximumTicket"] = f.preparedSource.maximumTicket + 1; }
        if (changed === "content") { value["content"] = `${String(value["content"])} `; }
        if (changed === "flags") { value["completionProved"] = true; }
        first["text"] = JSON.stringify(value);
      };
      await assert.rejects(f.readStage.read(f.readInput)); assert.equal(f.readState.calls, 1);
      assert.strictEqual(f.readStage.originalReturn(f.journal.operationId), f.readState.raw);
      const retained = await loadClosedSymbolJournal(f.journal.operationId);
      assert.equal(retained.events.at(-1)?.kind, "result"); assert.equal(retained.journal.orphanedCallPossible, false); assert.equal(retained.journal.saved, false);
      assert.throws(() => assertOriginalClosedSymbolSavedRead(f.readState.raw, f.engine, f.journal.operationId), /original successful/u);
      await assert.rejects(f.readStage.read(f.readInput), /already consumed/u);
    });
  }
}

export function registerSavedReadTransportCases(): void {
  void test("uncertain saved read retains orphan intent and never retries", async (context) => {
    const f = await savedReadFixture(context); f.readState.fail = true;
    await assert.rejects(f.readStage.read(f.readInput));
    const retained = await loadClosedSymbolJournal(f.journal.operationId);
    assert.equal(retained.events.at(-1)?.kind, "intent"); assert.equal(retained.journal.orphanedCallPossible, true);
    assert.equal(f.readStage.originalReturn(f.journal.operationId), undefined);
    await assert.rejects(f.readStage.read(f.readInput), /already consumed/u); assert.equal(f.readState.calls, 1);
  });

  void test("oversized complete raw saved reply remains in memory but is never truncated or issued", async (context) => {
    const f = await savedReadFixture(context);
    f.readState.after = (raw): void => { assert.ok(isRecord(raw)); raw["oversized"] = "x".repeat(172_033); };
    await assert.rejects(f.readStage.read(f.readInput), /fixed byte bound/u);
    assert.strictEqual(f.readStage.originalReturn(f.journal.operationId), f.readState.raw);
    assert.ok(isRecord(f.readState.raw)); assert.equal(String(f.readState.raw["oversized"]).length, 172_033);
    const retained = await loadClosedSymbolJournal(f.journal.operationId);
    assert.equal(retained.events.at(-1)?.kind, "intent"); assert.equal(retained.journal.orphanedCallPossible, true);
    await assert.rejects(f.readStage.read(f.readInput), /already consumed/u); assert.equal(f.readState.calls, 1);
  });

  void test("saved read does not repeat ambiguous extra-capture cleanup", async (context) => {
    const f = await savedReadFixture(context), release = f.engine.releaseClosedSessionAuthority.bind(f.engine);
    let releases = 0;
    context.mock.method(f.engine, "releaseClosedSessionAuthority", async (...args: Parameters<typeof release>): Promise<void> => {
      if (args[0].phase === "closed-verification" && args[0].challengeAttempt === 2) { releases += 1; throw new Error("Synthetic extra cleanup uncertainty"); }
      await release(...args);
    });
    await assert.rejects(f.readStage.read(f.readInput), /cleanup uncertainty/u); assert.equal(releases, 1); assert.equal(f.readState.calls, 1);
    assert.strictEqual(f.readStage.originalReturn(f.journal.operationId), f.readState.raw);
    assert.ok(f.readStage.originalClockCapture(f.journal.operationId) !== undefined);
    await assert.rejects(f.readStage.read(f.readInput), /already consumed/u); assert.equal(releases, 1);
  });
}

export function registerSavedReadArtifactCases(): void {
  for (const boundary of ["raw-publication", "result-publication", "raw-mutation", "raw-corruption", "raw-existing"] as const) {
    void test(`saved read ${boundary} retains original reply and refuses completion`, async (context) => {
      const f = await savedReadFixture(context), operationId = f.journal.operationId;
      if (boundary === "raw-existing") { await writePhaseArtifact(operationId, 38, "verify-content-read-raw", { existing: true }); }
      const link = fsPromises.link; let injected = boundary === "raw-existing";
      context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
        const name = basename(String(args[1]));
        if ((boundary === "raw-publication" && name === "38-verify-content-read-raw.json") ||
            (boundary === "result-publication" && name === "38-verify-content-read-result.json")) {
          injected = true; throw new Error("Synthetic saved-read publication failure");
        }
        await link(...args);
        if (name === "38-verify-content-read-raw.json" && boundary === "raw-mutation") {
          assert.ok(isRecord(f.readState.raw)); f.readState.raw["changedAfterReceipt"] = true; injected = true;
        }
        if (name === "38-verify-content-read-raw.json" && boundary === "raw-corruption") {
          await fsPromises.writeFile(args[1], "{}\n"); injected = true;
        }
      }); syncBuiltinESMExports();
      try {
        await assert.rejects(f.readStage.read(f.readInput)); assert.equal(injected, true); assert.equal(f.readState.calls, 1);
        assert.strictEqual(f.readStage.originalReturn(operationId), f.readState.raw);
        assert.throws(() => assertOriginalClosedSymbolSavedRead(f.readState.raw, f.engine, operationId), /original successful/u);
        const retained = await loadClosedSymbolJournal(operationId); assert.equal(retained.journal.saved, false);
        await assert.rejects(f.readStage.read(f.readInput), /already consumed/u);
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
    });
  }
}

export function registerSavedReadBoundaryCases(): void {
  void test("saved read refuses a valid concurrent append before its final issuance", async (context) => {
    const f = await savedReadFixture(context);
    const runtime = f.engine.runtimeIdentity.bind(f.engine); let advanced = false;
    context.mock.method(f.engine, "runtimeIdentity", async (...args: Parameters<typeof runtime>): ReturnType<typeof runtime> => {
      const value = await runtime(...args);
      if (!advanced && f.readState.calls === 1) {
        const retained = await loadClosedSymbolJournal(f.journal.operationId);
        if (retained.journal.sequence === 38 && !retained.journal.orphanedCallPossible) {
          await appendClosedSymbolEvent(retained.journal, { step: "verify-close", kind: "intent", generation: f.verifyGeneration,
            requestSha256: "1".repeat(64), data: { syntheticConcurrent: true } }); advanced = true;
        }
      }
      return value;
    });
    const caller = canonicalJson(f.journal);
    await assert.rejects(f.readStage.read(f.readInput), /journal changed|journal advanced/u);
    assert.equal(advanced, true); assert.equal(canonicalJson(f.journal), caller); assert.equal(f.readState.calls, 1);
    const retained = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(retained.journal.sequence, 39);
    await assert.rejects(f.readStage.read(f.readInput), /already consumed/u);
  });

  for (const changed of ["scope", "caller"] as const) {
    void test(`saved read refuses late ${changed} drift during its final journal read`, async (context) => {
      const f = await savedReadFixture(context), operationId = f.journal.operationId;
      const open = fsPromises.open, release = f.engine.releaseClosedSessionAuthority.bind(f.engine);
      let armed = false, injected = false;
      context.mock.method(f.engine, "releaseClosedSessionAuthority", async (...args: Parameters<typeof release>): Promise<void> => {
        await release(...args);
        if (args[0].phase === "closed-verification" && args[0].challengeAttempt === 2) { armed = true; }
      });
      context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>) => {
        const handle = await open(...args);
        if (armed && !injected && basename(String(args[0])) === `${operationId}.json`) {
          if (changed === "scope") { f.state.scope = false; }
          else { f.journal.saved = true; }
          injected = true;
        }
        return handle;
      }); syncBuiltinESMExports();
      try {
        await assert.rejects(f.readStage.read(f.readInput), /scope|caller changed/u); assert.equal(injected, true);
        assert.strictEqual(f.readStage.originalReturn(operationId), f.readState.raw); assert.equal(f.readState.calls, 1);
        const retained = await loadClosedSymbolJournal(operationId);
        assert.equal(retained.journal.saved, false);
      } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
    });
  }
}
