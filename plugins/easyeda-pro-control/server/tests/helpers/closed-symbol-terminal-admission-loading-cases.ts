import assert from "node:assert/strict";
import childProcess from "node:child_process";
import { registerHooks, syncBuiltinESMExports } from "node:module";
import { test } from "node:test";
import { installClosedSymbolTestProfiles } from "./install-closed-symbol-test-profiles.ts";

export function registerLoadingCase(version: 1 | 2): void {
  void test(`fixed v${version} selection loads only its entry graph, after profile hooks`, async (context) => {
    await installClosedSymbolTestProfiles();
    let children = 0;
    const refuseChild = (): never => { children += 1; throw new Error("No child is part of the module-loading test"); };
    context.mock.method(childProcess, "spawn", refuseChild); context.mock.method(childProcess, "execFile", refuseChild);
    syncBuiltinESMExports();
    context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
    const source = new URL("../../src/", import.meta.url);
    const graphNames = ["closed-symbol-terminal.ts", "closed-symbol-aged-terminal.ts", "closed-symbol-coordinator.ts", "closed-symbol-witness.ts"];
    const graphUrls = new Map([...graphNames.map((name) => [new URL(name, source).href, name] as const),
      [new URL("../../src/closed-symbol-terminal-admission-cache.ts", import.meta.url).href, "locked-admission-cache"]]);
    for (const name of ["closure-journal", "closure-observer", "closure-plan"]) {
      graphUrls.set(new URL(`../../src/closed-symbol-terminal-${name}.ts`, import.meta.url).href, name);
    }
    const adapterUrl = new URL("../../src/closed-symbol-terminal-admission.ts", import.meta.url).href;
    const runtimeUrl = new URL("machine-profile.ts", source).href;
    const fixtureUrl = new URL("closed-symbol-terminal-admission-unit-fixture.ts", import.meta.url).href;
    const observed: string[] = [];
    const hook = registerHooks({
      resolve(specifier, conditions, nextResolve) {
        const resolved = nextResolve(specifier, conditions);
        return conditions.parentURL === adapterUrl && resolved.url === runtimeUrl ? { url: fixtureUrl, shortCircuit: true } : resolved;
      },
      load(url, conditions, nextLoad) {
        const name = graphUrls.get(url); if (name !== undefined) { observed.push(name); }
        return nextLoad(url, conditions);
      },
    });
    try {
      await import("../../src/engine.ts");
      const admission = await import("../../src/closed-symbol-terminal-admission.ts");
      const artifacts = await import("../../src/artifacts.ts");
      const core = await import("../../src/core.ts");
      const { FAMILY } = await import("../../src/closed-symbol-journal.ts");
      assert.deepEqual([...observed], []); assert.deepEqual(await admission.scanQualifiedAdmissionOperations(), []);
      const journal = async (operationId: string, state: string, family: string, profile?: string): Promise<void> => {
        const plan = { profile: family, name: "Synthetic loading boundary" };
        const value: Record<string, unknown> = { schema: core.OPERATION_SCHEMA, operationId, plan, planHash: core.buildPlanHash(plan), state,
          mutationState: "before", saved: false, reopened: false, hardStop: false, mutationMayHaveOccurred: false, orphanedCallPossible: false,
          nextSafeAction: "Preserve synthetic evidence", updatedAt: "2026-10-12T00:00:00.000Z", artifacts: [] };
        if (profile !== undefined) {
          value["terminalArtifact"] = await artifacts.writePhaseArtifact(operationId, 45, "closed-symbol-terminal", { profile, body: {}, bodySha256: "b".repeat(64) });
        }
        await artifacts.createOperation(value);
      };
      await journal("easyeda-loading-legacy", "completed", "unit.legacy");
      await journal("easyeda-loading-incomplete", "closed-session-recording", FAMILY);
      await journal("easyeda-loading-reserved", "completed", FAMILY);
      await journal("easyeda-loading-unknown", "closed-session-completed", FAMILY, "unknown");
      await admission.scanQualifiedAdmissionOperations(); assert.deepEqual([...observed], []);
      const operationId = "easyeda-loading-recognized";
      await journal(operationId, "closed-session-completed", FAMILY, `easyeda-pro-control.closed-symbol-terminal.v${version}`);
      const result = await admission.scanQualifiedAdmissionOperations();
      assert.equal(result.find((value) => value.summary.operationId === operationId)?.qualification, "terminal-evidence-invalid");
      const own = version === 1 ? "closed-symbol-terminal.ts" : "closed-symbol-aged-terminal.ts";
      const other = version === 1 ? "closed-symbol-aged-terminal.ts" : "closed-symbol-terminal.ts";
      assert.equal(observed.includes(own), version === 2); assert.equal(observed.includes(other), false);
      for (const name of ["locked-admission-cache", "closure-journal", "closure-observer", "closure-plan"]) {
        assert.equal(observed.includes(name), version === 1);
      }
      assert.equal(observed.includes("closed-symbol-coordinator.ts"), version === 2); assert.equal(children, 0);
    } finally { hook.deregister(); }
  });
}

