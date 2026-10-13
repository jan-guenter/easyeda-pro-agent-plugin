/* oxlint-disable import/max-dependencies -- Exercise the actual managed scanner with fixed runtime/inspector test interception and concrete schema/reader error classes. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import { dirname } from "node:path";
import { after, before, test } from "node:test";
import { createOperation, loadOperation, operationPath, updateOperation, writePhaseArtifact } from "../src/artifacts.ts";
import { FAMILY } from "../src/closed-symbol-journal.ts";
import { OPERATION_SCHEMA, buildPlanHash, isTerminalOperation, sha256Json, sha256Text } from "../src/core.ts";
import type { UnknownRecord } from "../src/core.ts";
import { MachineProfileError } from "../src/machine-profile.ts";
import { SqlReaderFailureError } from "../src/sqlite-inventory.ts";
import { unitState } from "./helpers/closed-symbol-terminal-admission-unit-fixture.ts";
import { ClosureEvidenceChangedError } from "../src/closed-symbol-terminal-closure-evidence-error.ts";
import { ClosureIneligibleError } from "../src/closed-symbol-terminal-closure-ineligible-error.ts";
import type { QualifiedAdmissionOperation, listQualifiedOperationStates, scanQualifiedAdmissionOperations } from "../src/closed-symbol-terminal-admission.ts";
import { ZodError } from "zod";

let adapter: { listQualifiedOperationStates: typeof listQualifiedOperationStates; scanQualifiedAdmissionOperations: typeof scanQualifiedAdmissionOperations };
let unregister: () => void;
before(async () => {
  const inspectorUrl = new URL("../src/closed-symbol-terminal-admission-cache.ts", import.meta.url);
  const agedUrl = new URL("../src/closed-symbol-aged-terminal.ts", import.meta.url);
  const abandonmentUrl = new URL("../src/closed-symbol-abandonment.ts", import.meta.url);
  const runtimeUrl = new URL("../src/machine-profile.ts", import.meta.url);
  const syntheticUrl = new URL("helpers/closed-symbol-terminal-admission-unit-fixture.ts", import.meta.url);
  const adapterUrl = new URL("../src/closed-symbol-terminal-admission.ts", import.meta.url);
  const hooks = registerHooks({ resolve(specifier, context, nextResolve) {
    const resolved = nextResolve(specifier, context);
    if (context.parentURL === adapterUrl.href && (resolved.url === inspectorUrl.href || resolved.url === agedUrl.href || resolved.url === runtimeUrl.href || resolved.url === abandonmentUrl.href)) {
      return { url: syntheticUrl.href, shortCircuit: true };
    }
    return resolved;
  } });
  unregister = (): void => { hooks.deregister(); };
  adapter = await import("../src/closed-symbol-terminal-admission.ts");
});
after((): void => { unregister(); });

let counter = 0;
async function journal(overrides: UnknownRecord = {}, terminal = false, profile = "easyeda-pro-control.closed-symbol-terminal.v1"): Promise<string> {
  counter += 1; const operationId = `easyeda-terminal-admission-${counter.toString().padStart(4, "0")}`;
  const plan = { profile: terminal ? FAMILY : "unit.legacy", name: "Synthetic admission-only journal" };
  const data: UnknownRecord = { schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan),
    state: terminal ? "closed-session-completed" : "completed", mutationState: "after",
    saved: false, reopened: false, hardStop: false, mutationMayHaveOccurred: false, orphanedCallPossible: false,
    nextSafeAction: "Preserve synthetic evidence.", journalPath: operationPath(operationId),
    updatedAt: "2026-10-12T00:00:00.000Z", artifacts: [], ...overrides };
  if (terminal) {
    const path = `${operationPath(operationId).slice(0, -5)}/45-closed-symbol-terminal.json`;
    await mkdir(dirname(path), { mode: 0o700 });
    const content = `${JSON.stringify({ profile, body: { synthetic: true }, bodySha256: "b".repeat(64) })}\n`;
    await writeFile(path, content, { mode: 0o600 });
    data["terminalArtifact"] = { path, bytes: Buffer.byteLength(content), sha256: sha256Text(content) };
  }
  await createOperation(data); return operationId;
}
function states(): Promise<UnknownRecord[]> { return adapter.listQualifiedOperationStates(); }
async function selected(operationId: string): Promise<QualifiedAdmissionOperation | undefined> {
  const values = await adapter.scanQualifiedAdmissionOperations();
  return values.find((value) => value.summary.operationId === operationId);
}
async function failed(operationId: string, qualification = "terminal-evidence-invalid"): Promise<void> {
  const result = await selected(operationId); assert.ok(result);
  assert.equal(result.qualification, qualification);
  assert.equal(result.bridgeBlocking, true); assert.equal(result.unfinished, true); assert.equal(result.summary.hardStop, true);
  assert.equal(result.authorityRestored, false); assert.equal(result.executionAuthorized, false); assert.equal(result.replayAllowed, false);
  assert.equal(result.historicalCompletionVerified, false);
}

void test("empty and legacy-only scans do no terminal or current-runtime work", async () => {
  assert.deepEqual(await adapter.scanQualifiedAdmissionOperations(), []);
  assert.equal(unitState.runtimeCalls, 0); assert.equal(unitState.inspected.length, 0);
  const operationId = await journal();
  assert.equal(await selected(operationId), undefined);
  const raw = await adapter.listQualifiedOperationStates();
  assert.equal(raw.find((value) => value["operationId"] === operationId)?.["state"], "completed");
  assert.equal(unitState.runtimeCalls, 0); assert.equal(unitState.inspected.length, 0);
});
void test("legacy orphan and unfinished semantics are preserved", async () => {
  const orphan = await journal({ orphanedCallPossible: true });
  const pending = await journal({ state: "applied-unsaved" });
  const one = await selected(orphan), two = await selected(pending); assert.ok(one && two);
  assert.equal(one.bridgeBlocking, true); assert.equal(one.unfinished, false);
  assert.equal(two.bridgeBlocking, false); assert.equal(two.unfinished, true);
  assert.equal(unitState.runtimeCalls, 0);
});
for (const state of ["closed-session-recording", "closed-session-evidence-recorded"]) {
  void test(`readable dedicated ${state} remains unfinished with original risk flags`, async () => {
    const plan = { profile: FAMILY };
    const operationId = await journal({ plan, planHash: buildPlanHash(plan), state });
    const result = await selected(operationId); assert.ok(result);
    assert.equal(result.qualification, "incomplete"); assert.equal(result.unfinished, true); assert.equal(result.bridgeBlocking, false);
    assert.equal(unitState.runtimeCalls, 0);
    if (state === "closed-session-recording") {
      const original = await readFile(operationPath(operationId));
      unitState.abandoned.add(operationId);
      const inspectionsBefore = unitState.abandonmentInspected.filter((value) => value === operationId).length;
      assert.equal(await selected(operationId), undefined);
      const qualifiedStates = await states();
      assert.equal(qualifiedStates.some((value) => value["operationId"] === operationId), false);
      assert.equal(unitState.abandonmentInspected.filter((value) => value === operationId).length, inspectionsBefore + 2);
      assert.equal(isTerminalOperation(await loadOperation(operationId)), false);
      assert.deepEqual(await readFile(operationPath(operationId)), original);
      unitState.overrides.set(operationId, { originalJournalSha256: "0".repeat(64) });
      await failed(operationId, "abandonment-evidence-invalid");
      unitState.overrides.set(operationId, { originalStoredJournalSha256: "0".repeat(64) });
      await failed(operationId, "abandonment-evidence-invalid");
      unitState.overrides.set(operationId, { completionProved: true });
      await failed(operationId, "abandonment-evidence-invalid");
      unitState.overrides.delete(operationId);
      unitState.failures.set(operationId, Object.assign(new Error("SECRET unreadable abandonment sidecar"), { code: "EACCES" }));
      await failed(operationId, "abandonment-evidence-unavailable");
      assert.equal(JSON.stringify(await selected(operationId)).includes("SECRET"), false);
      unitState.failures.delete(operationId);
      assert.equal(await selected(operationId), undefined);
      unitState.abandoned.delete(operationId);
      const absentAgain = await selected(operationId);
      assert.equal(absentAgain?.qualification, "incomplete");
      assert.deepEqual(await readFile(operationPath(operationId)), original);
      assert.equal(unitState.runtimeCalls, 0);
    }
  });
}
for (const state of ["completed", "rolled-back", "reconciled-no-mutation", "plan-invalidated", "closed-session-forged"]) {
  void test(`dedicated family cannot escape through state ${state}`, async () => {
    const plan = { profile: FAMILY };
    const operationId = await journal({ plan, planHash: buildPlanHash(plan), state });
    await failed(operationId);
    const values = await states();
    const value = values.find((entry) => entry["operationId"] === operationId); assert.ok(value);
    assert.equal(value["recordedState"], state); assert.equal(isTerminalOperation(value), false);
    const stored = await loadOperation(operationId); assert.equal(stored["state"], state);
  });
}
for (const overrides of [
  { state: "closed-session-completed" }, { terminalArtifact: null }, { closedPlanSha256: "f".repeat(64) },
  { plan: { profile: FAMILY.replace(".v1", ".v2") } },
]) {
  void test(`reserved claim cannot fall through legacy path: ${JSON.stringify(overrides)}`, async () => {
    const plan = overrides.plan ?? { profile: "unit.legacy" };
    const operationId = await journal({ ...overrides, plan, planHash: buildPlanHash(plan) }); await failed(operationId);
  });
}
void test("valid fixed inspector result is omitted from both adapters but is inspected again for each call", async () => {
  const operationId = await journal({}, true);
  const runtimeBefore = unitState.runtimeCalls;
  assert.equal(await selected(operationId), undefined);
  const values = await adapter.listQualifiedOperationStates();
  assert.equal(values.some((value) => value["operationId"] === operationId), false);
  assert.equal(await selected(operationId), undefined);
  assert.equal(unitState.inspected.filter((value) => value === operationId).length, 3);
  assert.equal(unitState.runtimeCalls, runtimeBefore + 3);
});
for (const [field, value] of [
  ["profile", "wrong"], ["operationId", "easyeda-other-operation"], ["classification", "evidence-only"],
  ["historicalCompletionRecorded", false], ["terminalOutcomeVerified", false],
  ["storedJournalSha256", "0".repeat(64)], ["entireStoredJournalSha256", "0".repeat(64)],
  ["terminalArtifact", null], ["bodySha256", null],
  ["liveOriginalCompletionProved", true], ["currentSourceChecked", true], ["currentOwnershipChecked", true],
  ["authorityRestored", true], ["executionAuthorized", true], ["replayAllowed", true],
] as const) {
  void test(`requires exact terminal-result field ${field}`, async () => {
    const operationId = await journal({}, true);
    unitState.overrides.set(operationId, { [field]: value }); await failed(operationId);
  });
}
void test("terminal descriptor must bind exact path, bytes and hash", async (context) => {
  for (const [field, value] of [["path", "/wrong/path"], ["bytes", 1], ["sha256", "c".repeat(64)]] as const) {
    await context.test(field, async () => {
      const operationId = await journal({}, true);
      const data = await loadOperation(operationId);
      const descriptor = data["terminalArtifact"]; assert.ok(descriptor !== null && typeof descriptor === "object");
      unitState.overrides.set(operationId, { terminalArtifact: { ...descriptor, [field]: value } }); await failed(operationId);
    });
  }
});
void test("missing/oversized/malformed claim refuses before inspector dispatch", async (context) => {
  for (const descriptor of [null, {}, { path: "/wrong", bytes: 65_537, sha256: "a".repeat(64) }]) {
    await context.test(JSON.stringify(descriptor), async () => {
      const operationId = await journal({}, true), value = await loadOperation(operationId);
      value["terminalArtifact"] = descriptor; await updateOperation(value);
      await failed(operationId); assert.equal(unitState.inspected.includes(operationId), false);
    });
  }
});
void test("journal change while semantic inspection runs does not clear the earlier candidate", async () => {
  const operationId = await journal({}, true);
  unitState.before.set(operationId, async () => {
    unitState.before.delete(operationId);
    const value = await loadOperation(operationId); value["unrelatedRetainedField"] = "changed"; await updateOperation(value);
  });
  await failed(operationId);
});
void test("runtime failure is unavailable, bounded and retried only on the next scan", async () => {
  const operationId = await journal({}, true);
  const beforeCalls = unitState.runtimeCalls;
  unitState.runtimeFailure = new Error("SECRET environment/profile detail must not be emitted");
  try {
    await failed(operationId, "terminal-evidence-unavailable");
    assert.equal(unitState.runtimeCalls, beforeCalls + 1);
    assert.equal(unitState.inspected.includes(operationId), false);
  } finally { unitState.runtimeFailure = undefined; }
  assert.equal(await selected(operationId), undefined);
  assert.equal(unitState.runtimeCalls, beforeCalls + 2);
});
for (const [label, error, expected] of [
  ["validation", new Error("SECRET semantic detail"), "terminal-evidence-invalid"],
  ["JSON", new SyntaxError("SECRET bad JSON"), "terminal-evidence-invalid"],
  ["schema", new ZodError([{ code: "invalid_type", expected: "string", path: [], message: "SECRET schema detail" }]), "terminal-evidence-invalid"],
  ["missing", Object.assign(new Error("SECRET missing path"), { code: "ENOENT" }), "terminal-evidence-invalid"],
  ["permission", Object.assign(new Error("SECRET denied path"), { code: "EACCES" }), "terminal-evidence-unavailable"],
  ["runtime", new MachineProfileError("SECRET machine details"), "terminal-evidence-unavailable"],
  ["reader", new SqlReaderFailureError("SECRET reader error", { observedChildClose: true, exitCode: 1, exitSignal: null, elapsedMs: 1 }), "terminal-evidence-unavailable"],
  ["unexpected", new TypeError("SECRET implementation error"), "terminal-evidence-unavailable"],
] as const) {
  void test(`fixed bounded classification for ${label} failure`, async () => {
    const operationId = await journal({}, true); unitState.failures.set(operationId, error);
    await failed(operationId, expected);
    assert.equal(JSON.stringify(await selected(operationId)).includes("SECRET"), false);
  });
}
void test("warm successful candidate never caches semantic success across changed dependency checks", async () => {
  const operationId = await journal({}, true);
  assert.equal(await selected(operationId), undefined);
  unitState.failures.set(operationId, new Error("Unit dependency changed after prior success."));
  await failed(operationId);
  assert.equal(unitState.inspected.filter((value) => value === operationId).length, 2);
});

void test("actual scanner preserves complete and partial legacy summary projections", async () => {
  const operationId = await journal({ state: "applied-unsaved", orphanedCallPossible: true, orphanedCallPhase: 7, unknownPhase: { raw: true },
    preCheckpoint: { receiptPath: "/synthetic/pre.json", checkpoint: "/synthetic/pre.eprj2" },
    finalCheckpoint: { receiptPath: "/synthetic/final.json", checkpoint: "/synthetic/final.eprj2" } });
  const value = await loadOperation(operationId);
  const artifact = await writePhaseArtifact(operationId, 1, "summary-retention", { synthetic: true });
  value.artifacts = [artifact]; await updateOperation(value);
  const full = await selected(operationId); assert.ok(full);
  assert.equal(full.summary.orphanedCallPhase, undefined); assert.equal(full.summary.unknownPhase, undefined);
  assert.deepEqual(full.summary.artifacts, { count: 1, recent: [artifact] });
  assert.deepEqual(full.summary.checkpoints, { pre: { receiptPath: "/synthetic/pre.json", checkpointPath: "/synthetic/pre.eprj2" }, final: { receiptPath: "/synthetic/final.json", checkpointPath: "/synthetic/final.eprj2" } });
  const incomplete = await loadOperation(operationId); delete incomplete["updatedAt"]; await updateOperation(incomplete);
  const partial = await selected(operationId); assert.ok(partial);
  assert.equal(partial.summary.orphanedCallPhase, 7); assert.deepEqual(partial.summary.unknownPhase, { raw: true });
  assert.deepEqual(partial.summary.artifacts, full.summary.artifacts); assert.deepEqual(partial.summary.checkpoints, full.summary.checkpoints);
});

for (const profile of ["easyeda-pro-control.closed-symbol-terminal.v1", "easyeda-pro-control.closed-symbol-terminal.v2"] as const) {
  void test(`${profile} selects exactly its fixed inspector and never a fallback`, async () => {
    const aged = profile.endsWith(".v2"), operationId = await journal({}, true, profile);
    const own = aged ? unitState.agedInspected : unitState.inspected;
    const other = aged ? unitState.inspected : unitState.agedInspected;
    assert.equal(await selected(operationId), undefined);
    assert.equal(await selected(operationId), undefined);
    assert.equal(own.filter((value) => value === operationId).length, 2);
    assert.equal(other.includes(operationId), false);
    unitState.failures.set(operationId, new Error("Synthetic fixed inspector refusal"));
    await failed(operationId);
    assert.equal(own.filter((value) => value === operationId).length, 3);
    assert.equal(other.includes(operationId), false);
  });
  void test(`${profile} rejects the other inspector result and an altered body digest`, async () => {
    const operationId = await journal({}, true, profile);
    unitState.overrides.set(operationId, { profile: profile.endsWith(".v1") ? "private.closed-symbol-historical-terminal.v2" : "private.closed-symbol-historical-terminal.v1" });
    await failed(operationId);
    unitState.overrides.set(operationId, { bodySha256: "c".repeat(64) });
    await failed(operationId);
  });
}
async function replaceTerminal(operationId: string, bytes: Uint8Array): Promise<void> {
  const current = await loadOperation(operationId), descriptor = current["terminalArtifact"];
  assert.ok(typeof descriptor === "object" && descriptor !== null && "path" in descriptor && typeof descriptor.path === "string");
  await writeFile(descriptor.path, bytes);
  current["terminalArtifact"] = { path: descriptor.path, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
  await updateOperation(current);
}
for (const [label, content] of [
  ["unknown profile", JSON.stringify({ profile: "easyeda-pro-control.closed-symbol-terminal.v3", body: {}, bodySha256: "b".repeat(64) })],
  ["missing profile", JSON.stringify({ body: {}, bodySha256: "b".repeat(64) })],
  ["mixed root", JSON.stringify({ profile: "easyeda-pro-control.closed-symbol-terminal.v2", body: {}, bodySha256: "b".repeat(64), legacy: true })],
  ["malformed JSON", "{"],
] as const) {
  void test(`routing ${label} refuses before either inspector`, async () => {
    const operationId = await journal({}, true);
    await replaceTerminal(operationId, Buffer.from(content));
    await failed(operationId);
    assert.equal(unitState.inspected.includes(operationId), false); assert.equal(unitState.agedInspected.includes(operationId), false);
  });
}
void test("routing rejects invalid UTF-8 even with its exact managed length and hash", async () => {
  const operationId = await journal({}, true);
  await replaceTerminal(operationId, Buffer.from([0xC0, 0xAF]));
  await failed(operationId);
  assert.equal(unitState.inspected.includes(operationId), false); assert.equal(unitState.agedInspected.includes(operationId), false);
});
void test("routing hash mismatch refuses without invoking either inspector", async () => {
  const operationId = await journal({}, true);
  const current = await loadOperation(operationId), descriptor = current["terminalArtifact"];
  assert.ok(typeof descriptor === "object" && descriptor !== null && "path" in descriptor && typeof descriptor.path === "string");
  await writeFile(descriptor.path, Buffer.from("x"));
  await failed(operationId);
  assert.equal(unitState.inspected.includes(operationId), false); assert.equal(unitState.agedInspected.includes(operationId), false);
});

void test("locked dispatch forwards exact compact candidate and original current runtime, never an operation-only argument", async () => {
  const operationId = await journal({}, true);
  assert.equal(await selected(operationId), undefined);
  const entry = unitState.lockedInputs.at(-1); assert.ok(entry);
  const value = await loadOperation(operationId);
  assert.deepEqual(entry.candidate, { operationId, state: "closed-session-completed", family: FAMILY,
    storedJournalSha256: value["journalSha256"], entireStoredJournalSha256: sha256Json(value),
    terminalArtifact: value["terminalArtifact"] });
  assert.equal(entry.runtime, unitState.runtimes.at(-1));
});
class ForgedClosureError extends Error { public override name = "ForgedClosureError"; }
for (const [label, error, expected] of [
  ["genuine changed", new ClosureEvidenceChangedError("SECRET changed"), "terminal-evidence-invalid"],
  ["genuine ineligible", new ClosureIneligibleError("SECRET ineligible"), "terminal-evidence-unavailable"],
  ["forged changed name", Object.assign(new TypeError("SECRET forged"), { name: "ClosureEvidenceChangedError" }), "terminal-evidence-unavailable"],
  ["forged ineligible name", Object.assign(new TypeError("SECRET forged"), { name: "ClosureIneligibleError" }), "terminal-evidence-unavailable"],
  ["forged changed class", Object.assign(new ForgedClosureError("SECRET counterfeit"), { name: "ClosureEvidenceChangedError" }), "terminal-evidence-unavailable"],
  ["forged ineligible class", Object.assign(new ForgedClosureError("SECRET counterfeit"), { name: "ClosureIneligibleError" }), "terminal-evidence-unavailable"],
  ["aggregate changed", new AggregateError([new ClosureEvidenceChangedError("SECRET changed")], "SECRET cleanup"), "terminal-evidence-unavailable"],
  ["aggregate ineligible", new AggregateError([new ClosureIneligibleError("SECRET ineligible")], "SECRET cleanup"), "terminal-evidence-unavailable"],
  ["unknown object", { name: "ClosureEvidenceChangedError", message: "SECRET shape" }, "terminal-evidence-unavailable"],
] as const) {
  void test(`combined locked branch maps ${label} by exact class without fallback or replay`, async () => {
    const operationId = await journal({}, true);
    unitState.failures.set(operationId, error);
    await failed(operationId, expected);
    assert.equal(unitState.inspected.filter((id) => id === operationId).length, 1);
    assert.equal(unitState.agedInspected.includes(operationId), false);
    assert.equal(JSON.stringify(await selected(operationId)).includes("SECRET"), false);
    assert.equal(unitState.inspected.filter((id) => id === operationId).length, 2);
    assert.equal(unitState.agedInspected.includes(operationId), false);
  });
}

