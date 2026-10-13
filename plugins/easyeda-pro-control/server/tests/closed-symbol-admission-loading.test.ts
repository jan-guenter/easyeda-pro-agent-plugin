import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { test } from "node:test";
import { installClosedSymbolTestProfiles } from "./helpers/install-closed-symbol-test-profiles.ts";

void test("only a recognized terminal candidate loads the fixed cache graph; incomplete phase evidence never loads cold stages", async () => {
  // Fixed synthetic source I/O only; install before any possible stage import.
  await installClosedSymbolTestProfiles();
  const root = new URL("../src/", import.meta.url);
  const names = ["closed-symbol-terminal.ts", "closed-symbol-coordinator.ts", "closed-symbol-witness.ts"];
  const cacheNames = ["closed-symbol-terminal-admission-cache.ts", "closed-symbol-terminal-closure-journal.ts",
    "closed-symbol-terminal-closure-plan.ts", "closed-symbol-terminal-closure-observer.ts"];
  const observed: string[] = [];
  // Fixed canonical module URLs only; no supplied path or loader callback.
  const urls = new Map([
    ...names.map((name) => [new URL(name, root).href, name] as const),
    [new URL("closed-symbol-terminal-admission-cache.ts", root).href, "closed-symbol-terminal-admission-cache.ts"],
    [new URL("closed-symbol-terminal-closure-journal.ts", root).href, "closed-symbol-terminal-closure-journal.ts"],
    [new URL("closed-symbol-terminal-closure-plan.ts", root).href, "closed-symbol-terminal-closure-plan.ts"],
    [new URL("closed-symbol-terminal-closure-observer.ts", root).href, "closed-symbol-terminal-closure-observer.ts"],
  ]);
  const hooks = registerHooks({ load(url, context, nextLoad) {
    const name = urls.get(url); if (name !== undefined) { observed.push(name); }
    return nextLoad(url, context);
  } });
  try {
    await import("../src/engine.ts");
    assert.deepEqual([...observed], [], "Engine import must not eagerly load terminal or writer stages.");
    const admission = await import("../src/closed-symbol-terminal-admission.ts");
    const artifacts = await import("../src/artifacts.ts");
    const core = await import("../src/core.ts");
    const { FAMILY } = await import("../src/closed-symbol-journal.ts");
    assert.deepEqual(await admission.scanQualifiedAdmissionOperations(), []); assert.deepEqual([...observed], []);
    const journal = async (operationId: string, state: string, family: string, terminal = false): Promise<void> => {
      const plan = { profile: family, name: "Synthetic module-loading boundary" };
      const value: Record<string, unknown> = { schema: core.OPERATION_SCHEMA, operationId, plan, planHash: core.buildPlanHash(plan), state,
        mutationState: "before", saved: false, reopened: false, hardStop: false, mutationMayHaveOccurred: false, orphanedCallPossible: false,
        nextSafeAction: "Preserve module-loading fixture.", updatedAt: "2026-10-12T00:00:00.000Z", artifacts: [] };
      if (terminal) {
        // The real managed descriptor has a recognized exact routing envelope.
        // Its incomplete body/phase graph must refuse before the cold inspector.
        value["terminalArtifact"] = await artifacts.writePhaseArtifact(operationId, 45, "closed-symbol-terminal", {
          profile: "easyeda-pro-control.closed-symbol-terminal.v1", body: {}, bodySha256: "b".repeat(64),
        });
      }
      await artifacts.createOperation(value);
    };
    await journal("easyeda-module-legacy", "completed", "legacy.test");
    assert.deepEqual(await admission.scanQualifiedAdmissionOperations(), []); assert.deepEqual([...observed], []);
    await journal("easyeda-module-incomplete", "closed-session-recording", FAMILY);
    let values = await admission.scanQualifiedAdmissionOperations();
    assert.equal(values.find((value) => value.summary.operationId === "easyeda-module-incomplete")?.qualification, "incomplete");
    assert.deepEqual([...observed], []);
    await journal("easyeda-module-invalid", "completed", FAMILY);
    values = await admission.scanQualifiedAdmissionOperations();
    assert.equal(values.find((value) => value.summary.operationId === "easyeda-module-invalid")?.qualification, "terminal-evidence-invalid");
    assert.deepEqual([...observed], []);
    await journal("easyeda-module-candidate", "closed-session-completed", FAMILY, true);
    values = await admission.scanQualifiedAdmissionOperations();
    assert.equal(values.find((value) => value.summary.operationId === "easyeda-module-candidate")?.qualification, "terminal-evidence-invalid");
    assert.deepEqual(observed.toSorted((left, right) => left.localeCompare(right)), cacheNames.toSorted((left, right) => left.localeCompare(right)));
    for (const name of names) { assert.equal(observed.includes(name), false, "Incomplete phase evidence must not load the cold terminal or writer graph."); }
    const originalLoads = [...observed];
    values = await admission.scanQualifiedAdmissionOperations();
    assert.equal(values.find((value) => value.summary.operationId === "easyeda-module-candidate")?.qualification, "terminal-evidence-invalid");
    assert.deepEqual(observed, originalLoads, "ESM module reuse is not a semantic-success cache.");
  } finally { hooks.deregister(); }
});
