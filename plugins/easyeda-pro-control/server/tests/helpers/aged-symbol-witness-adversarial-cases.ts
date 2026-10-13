import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { loadClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { assertOriginalClosedSymbolWitness } from "../../src/closed-symbol-witness.ts";
import { isRecord } from "../../src/core.ts";
import { agedWitnessFixture } from "./aged-symbol-witness-fixture.ts";

function record(value: unknown): Record<string, unknown> { assert.ok(isRecord(value)); return value; }
function array(value: unknown): unknown[] { assert.ok(Array.isArray(value)); return value; }
function block(value: unknown): Record<string, unknown> { return record(array(record(value)["content"])[0]); }
function restore(context: Parameters<typeof agedWitnessFixture>[0]): void {
  syncBuiltinESMExports(); context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

export function registerAgedAdversarialCases(selection: "artifacts" | "native" | "controls" | "returns"): void {
if (selection === "artifacts") {
for (const which of ["intent", "result"] as const) {
  for (const when of ["initial", "final"] as const) {
    void test(`original reference ${which} artifact drift at ${when} read refuses issuance`, async (context) => {
      const f = await agedWitnessFixture(context);
      const descriptor = which === "intent" ? f.reference.intentArtifact : f.reference.resultArtifact;
      const originalBytes = await fsPromises.readFile(descriptor.path);
      const open = fsPromises.open; let changed = false, reads = 0;
      context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
        if (String(args[0]).endsWith(`/${basename(descriptor.path)}`)) {
          assert.match(String(args[0]), /^\/proc\/(?:self|\d+)\/fd\/\d+\//u);
          assert.equal(await fsPromises.realpath(args[0]), descriptor.path);
          reads += 1;
          if (reads === (when === "initial" ? 1 : 2)) {
            const bytes = await fsPromises.readFile(descriptor.path); bytes[0] = 32;
            await fsPromises.writeFile(descriptor.path, bytes); changed = true;
          }
        }
        return open(...args);
      }); restore(context);
      try { await assert.rejects(f.collector.collect(f.collectInput), /digest|SHA|hash|changed|identity/iu); }
      finally { await fsPromises.writeFile(descriptor.path, originalBytes); }
      assert.equal(changed, true); assert.equal(f.agedState.calls, when === "initial" ? 0 : 1);
      assert.throws(() => assertOriginalClosedSymbolWitness(f.collector.originalReturn(f.journal.operationId), f.engine, f.journal.operationId), /missing|not issued/u);
      await assert.rejects(f.collector.collect(f.collectInput), /already consumed/u);
    });
  }
}


}
if (selection === "native") {
for (const kind of ["offset", "rules", "frequency", "qpc-backward", "utc-backward"] as const) {
  void test(`aged collector refuses original native ${kind} drift`, async (context) => {
    const f = await agedWitnessFixture(context), previous = f.owner.behavior.mutateResponse;
    let changed = false;
    f.owner.behavior.mutateResponse = (request, response): void => {
      previous?.(request, response);
      if (request["action"] !== "clocked-capture" || changed) { return; }
      const clock = record(response["clock"]);
      for (const side of ["before", "after"]) {
        const sample = record(clock[side]);
        if (kind === "offset") { sample["localOffsetMinutes"] = 60; }
        else if (kind === "rules") { sample["zoneRulesSha256"] = "e".repeat(64); }
        else if (kind === "frequency") { sample["qpcFrequency"] = "2000000"; }
        else if (kind === "qpc-backward") {
          sample["qpcBefore"] = String(BigInt(String(sample["qpcBefore"])) - 100_000_000n);
          sample["qpcAfter"] = String(BigInt(String(sample["qpcAfter"])) - 100_000_000n);
        } else {
          sample["utcBeforeTicks"] = String(BigInt(String(sample["utcBeforeTicks"])) - 1_000_000_000n);
          sample["utcAfterTicks"] = String(BigInt(String(sample["utcAfterTicks"])) - 1_000_000_000n);
        }
      }
      changed = true;
    };
    await assert.rejects(f.collector.collect(f.collectInput), /clock|timezone|counter|CLOCK|drift|continuity/u);
    assert.equal(changed, true); assert.ok(f.agedState.calls <= 1);
    await assert.rejects(f.collector.collect(f.collectInput), /already consumed/u);
  });
}


}
if (selection === "controls") {
for (const kind of ["historical-offset-as-current", "historical-vector", "current-vector", "different-literal"] as const) {
  void test(`aged collector refuses ${kind} renderer controls`, async (context) => {
    const f = await agedWitnessFixture(context);
    f.agedState.after = (value): void => {
      const controls = record(value["controlsAfter"]), witness = record(value["witness"]);
      if (kind === "historical-offset-as-current") { witness["rendererTimezoneOffsetMinutes"] = -60; }
      else if (kind === "historical-vector") { record(array(controls["sql"])[0])["offsetMinutes"] = -120; }
      else if (kind === "current-vector") { record(controls["clockBefore"])["offsetMinutes"] = -60; }
      else { controls["scope"] = { createdAtLiteral: "2026-01-15 12:34:57", referenceUtcMs: f.reference.request.referenceUtcMs }; }
    };
    await assert.rejects(f.collector.collect(f.collectInput), /REFUSED|differs|disagree/u); assert.equal(f.agedState.calls, 1);
    const loaded = await loadClosedSymbolJournal(f.journal.operationId); assert.equal(loaded.events.at(-1)?.step, "edit-witness");
    assert.equal(loaded.events.at(-1)?.kind, "result"); assert.equal(loaded.journal.saved, false);
    await assert.rejects(f.collector.collect(f.collectInput), /already consumed/u);
  });
}


}
if (selection === "returns") {
for (const boundary of ["publication", "after-validation"] as const) {
  void test(`aged collector seals original composite reply at ${boundary}`, async (context) => {
    const f = await agedWitnessFixture(context); let changed = false, valid = "";
    if (boundary === "publication") { f.agedState.after = (value): void => { valid = JSON.stringify(value); record(value["witness"])["workerMaxTicket"] = -1; }; }
    const link = fsPromises.link;
    context.mock.method(fsPromises, "link", async (...args: Parameters<typeof link>): Promise<void> => {
      await link(...args);
      if (boundary === "publication" && String(args[1]).endsWith("/20-edit-witness-result.json")) { block(f.agedState.raw)["text"] = valid; changed = true; }
    }); restore(context);
    if (boundary === "after-validation") {
      f.state.afterRuntime = (): Promise<void> => {
        if (!changed && f.agedState.raw !== undefined) {
          const content = block(f.agedState.raw), value: unknown = JSON.parse(String(content["text"]));
          record(record(value)["witness"])["workerMaxTicket"] = 42; content["text"] = JSON.stringify(value); changed = true;
        }
        return Promise.resolve();
      };
    }
    await assert.rejects(f.collector.collect(f.collectInput), /settled reply changed/u);
    assert.equal(changed, true); assert.equal(f.agedState.calls, 1);
    assert.strictEqual(f.collector.originalReturn(f.journal.operationId), f.agedState.raw);
    assert.throws(() => assertOriginalClosedSymbolWitness(f.agedState.raw, f.engine, f.journal.operationId), /not issued/u);
  });
}

}
}

