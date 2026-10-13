import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { canonicalJson, extractToolPayload } from "../src/core.ts";
import { PCB_NAVIGATION_PREFLIGHT_PROFILE, buildPcbNavigationPreferencePreflight } from "../src/pcb-navigation-preflight.ts";
import { executeAndCommitDesign } from "../src/design-execute.ts";
import type { DesignApplyInput, DesignExecutor } from "../src/design-execution.ts";
import { assertDesignExecutionLifecycle } from "../src/design-execution-lifecycle.ts";

const INPUT: DesignApplyInput = { operation: { id: "modify", action: "pcb.text.modify", target: { primitiveId: "a".repeat(16) }, patch: { x: 1 } },
  expectedContext: { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project" } },
  expectedFingerprint: {}, confirmWrite: true };
type Subject = Pick<DesignExecutor, "preflightSaveNavigation" | "apply" | "commit"> & {
  assertNavigationPreferences: (context: DesignApplyInput["expectedContext"]) => Promise<void>;
};
async function fixture(options: { safe?: boolean; contextDrift?: boolean; resolvedDrift?: boolean; resolvedContext?: DesignApplyInput["expectedContext"]; receiptDrift?: boolean; missingProfile?: boolean; afterProfileDrift?: boolean; changeOnApply?: boolean } = {}): Promise<{ subject: Subject; calls: string[]; journal: object }> {
  const source = await readFile(new URL("../src/design-execution.ts", import.meta.url), "utf8");
  const start = source.indexOf("  private async assertNavigationPreferences(");
  const end = source.indexOf("  /** Read already loaded", start);
  const commitStart = source.indexOf("  public async commit(");
  const commitEnd = source.indexOf("  private static hasLibrarySaveEvidence", commitStart);
  assert.ok(start > 0 && end > start && commitStart > end && commitEnd > commitStart);
  const applyStart = source.indexOf("  public async apply(");
  const applyEnd = source.indexOf("  public static async inspect(", applyStart);
  assert.ok(applyStart > end && applyEnd > applyStart);
  assert.doesNotMatch(source.slice(applyStart, applyEnd), /assertNavigationPreferences|preflightSaveNavigation/u);
  const calls: string[] = [];
  const context = options.resolvedContext ?? INPUT.expectedContext;
  let profileChecks = 0, safe = options.safe ?? true, subject: Subject | undefined;
  const journal = { plan: { operation: INPUT.operation, expectedContext: INPUT.expectedContext, expectedFingerprint: {} }, context: INPUT.expectedContext,
    state: "applied-unsaved", after: {}, orphanedCallPossible: false, artifacts: [], sequence: 0 };
  const bindings = {
    assertDesignExecutionLifecycle,
    register: (value: Subject): void => { subject = value; }, calls,
    runtime: (): Promise<void> => { calls.push("runtime"); return Promise.resolve(); },
    engine: { assertBridgeDispatchAllowed: (): Promise<true> => { calls.push("quarantine"); return Promise.resolve(true); },
      assertContext: (): Promise<unknown> => { calls.push("context"); return Promise.resolve(options.resolvedDrift === true ? { ...context, document: { ...context.document, uuid: "wrong-observation" } } : context); }, upstream: {
        installedEasyedaBundles: (): Promise<unknown> => Promise.resolve(options.missingProfile === true ? undefined : { assetsRoot: "/synthetic/assets" }),
        callTool: async (name: string, args: { code: string; timeoutMs: number; confirmWrite: boolean }, timeout: number): Promise<unknown> => {
          calls.push("passive-read"); assert.equal(name, "easyeda_execute"); assert.equal(args.timeoutMs, 15_000); assert.equal(timeout, 25_000);
          const result: unknown = await runInNewContext(`(async()=>{${args.code}})()`, { eda: {
            dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
            dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(options.contextDrift === true ? { ...context.document, uuid: "foreign" } : context.document) },
          }, window: { top: { localStorage: { getItem: (): string => JSON.stringify({ pcbCommandTab: safe }), setItem: (): never => assert.fail("No preference writes") } } } });
          return { structuredContent: { ok: true, result: options.receiptDrift === true ? { profile: PCB_NAVIGATION_PREFLIGHT_PROFILE, admitted: true, extra: true } : result } };
        },
      } },
    verifyLibraryNativeProfile: (): Promise<void> => { profileChecks += 1; calls.push("profile");
      return options.afterProfileDrift === true && profileChecks === 2 ? Promise.reject(new Error("profile drift")) : Promise.resolve(); },
    buildPcbNavigationPreferencePreflight, PCB_NAVIGATION_PREFLIGHT_PROFILE, canonicalJson, extractToolPayload, structuredClone,
    PROFILE: "synthetic-plan", designActionSchema: { parse: (value: unknown): unknown => value },
    loadOperation: (): Promise<object> => Promise.resolve(journal), journalPayload: (value: unknown): unknown => value,
    hasDesignInverseAttempt: (): false => false, assertTransactionTopologyAvailable: (): void => undefined,
    inspectDesignSaveAttempts: (): Promise<object> => Promise.resolve({ attempted: false }),
    DesignExecutor: { hasLibrarySaveEvidence: (): false => false, verifyWireGroupRepairIntent: (): Promise<void> => Promise.resolve(),
      layoutConstructorWitness: (): undefined => undefined },
    apply: (): Promise<Record<string, unknown>> => { calls.push("apply"); if (options.changeOnApply === true) { safe = false; }
      return Promise.resolve({ operationId: "original", state: "applied-unsaved", hardStop: false, orphanedCallPossible: false }); },
  };
  runInNewContext(stripTypeScriptTypes(`class Subject {
    constructor(){this.engine=engine;}
    async assertRuntime(){await runtime();}
    async apply(){return apply();}
    async snapshot(){calls.push('snapshot');throw new Error('SNAPSHOT_BOUNDARY');}
    ${source.slice(start, end)}
    ${source.slice(commitStart, commitEnd)}
  }register(new Subject());`), bindings);
  assert.ok(subject);
  return { subject, calls, journal };
}

void test("maintained execute refuses the structure lifecycle before reading even an unsafe preference", async () => {
  const scene = await fixture({ safe: false });
  const original = canonicalJson(scene.journal);
  await assert.rejects(executeAndCommitDesign(scene.subject, INPUT), /operation-owned completion.*project_structures/u);
  assert.deepEqual(scene.calls, []);
  assert.equal(canonicalJson(scene.journal), original);
});

void test("maintained commit and execute refuse before preference checks, snapshots, apply or Save intent", async () => {
  const scene = await fixture({ safe: false });
  const original = canonicalJson(scene.journal);
  await assert.rejects(scene.subject.commit("original"), /operation-owned completion.*project_structures/u);
  assert.deepEqual(scene.calls, []); assert.equal(canonicalJson(scene.journal), original);
  const late = await fixture({ changeOnApply: true });
  await assert.rejects(executeAndCommitDesign(late.subject, INPUT), /operation-owned completion.*project_structures/u);
  assert.deepEqual(late.calls, []);
});

void test("public preflight refuses before all simulated context, UI profile and passive-read failures", async () => {
  for (const options of [{ contextDrift: true }, { resolvedDrift: true }, { receiptDrift: true }, { missingProfile: true }, { afterProfileDrift: true }]) {
    const scene = await fixture(options);
    const before = canonicalJson(scene.journal);
    await assert.rejects(scene.subject.preflightSaveNavigation(INPUT), /operation-owned completion.*project_structures/u);
    assert.deepEqual(scene.calls, []); assert.equal(canonicalJson(scene.journal), before);
  }
  const safe = await fixture(); await assert.rejects(safe.subject.preflightSaveNavigation(INPUT), /operation-owned completion.*project_structures/u);
  assert.deepEqual(safe.calls, []);
  assert.throws(() => buildPcbNavigationPreferencePreflight({ ...INPUT.expectedContext, document: { ...INPUT.expectedContext.document, tabId: "" } }));
  assert.throws(() => buildPcbNavigationPreferencePreflight({ ...INPUT.expectedContext, document: { ...INPUT.expectedContext.document, documentType: 4 } }));
});

void test("omitting tab metadata or claiming a symbol editor cannot bypass lifecycle refusal", async () => {
  const scene = await fixture();
  const reduced = { ...INPUT, expectedContext: { ...INPUT.expectedContext, document: { uuid: "board", documentType: 3 } } };
  await assert.rejects(scene.subject.preflightSaveNavigation(reduced), /operation-owned completion.*project_structures/u);
  assert.deepEqual(scene.calls, []);
  const symbolContext = { ...INPUT.expectedContext, document: { uuid: "symbol", documentType: 2, tabId: "symbol@project", parentLibraryUuid: "owner" } };
  const symbol = await fixture({ resolvedContext: symbolContext });
  await assert.rejects(symbol.subject.preflightSaveNavigation({ ...INPUT, expectedContext: { ...symbolContext, document: { uuid: "symbol", documentType: 2 } } }), /operation-owned completion.*project_structures/u);
  assert.deepEqual(symbol.calls, []);
});

void test("dormant preference reader keeps its fixed bounds and identity guards without enabling public preflight", async () => {
  for (const options of [{ safe: false }, { contextDrift: true }, { receiptDrift: true }, { missingProfile: true }, { afterProfileDrift: true }]) {
    const scene = await fixture(options);
    await assert.rejects(scene.subject.assertNavigationPreferences(INPUT.expectedContext), /PREFERENCES_UNSAFE|CONTEXT|admission|implementation identity|profile drift/u);
    assert.equal(scene.calls.includes("apply"), false); assert.equal(scene.calls.includes("snapshot"), false);
  }
  const scene = await fixture();
  // Direct synthetic helper regression, not an enabled DesignExecutor entry.
  await scene.subject.assertNavigationPreferences(INPUT.expectedContext);
  assert.deepEqual(scene.calls, ["quarantine", "profile", "passive-read", "profile", "context"]);
});
