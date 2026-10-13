import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { isRecord } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { flatTransactionBinding } from "../src/flat-transaction-binding.ts";
import { assertDesignExecutionLifecycle } from "../src/design-execution-lifecycle.ts";

type Invoke = (journal: Record<string, unknown>, phase: string) => Promise<unknown>;
async function harness(failure: "none" | "missing" | "before" | "after" | "dispatch" | "manager-after", enveloped = false): Promise<{
  invoke: Invoke; calls: string[]; returns: unknown[];
}> {
  const source = await readFile(new URL("../src/design-execution.ts", import.meta.url), "utf8");
  const start = source.indexOf("  private async call(");
  const end = source.indexOf("\n  public async apply(", start);
  assert.ok(start > 0 && end > start);
  const calls: string[] = [], returns: unknown[] = [];
  let invoke: Invoke | undefined, managerProfiles = 0, profiles = 0;
  // Exercise the maintained coordinator method, not a copied ordering model.
  // All authorities and artifact writes are synthetic; no live engine exists.
  const scope = {
    flatTransactionBinding,
    assertDesignExecutionLifecycle,
    register: (value: Invoke): void => { invoke = value; },
    runtime: (): Promise<void> => { calls.push("runtime"); return Promise.resolve(); },
    engine: {
      upstream: { installedEasyedaBundles: (): Promise<unknown> => {
        calls.push("installed"); return Promise.resolve(failure === "missing" ? undefined : { assetsRoot: "/synthetic/assets" });
      } },
      dispatchWithOrphanTracking: (): Promise<unknown> => {
        calls.push("dispatch");
        const acknowledgment = { ok: true, id: "original-ack" }, json = JSON.stringify(acknowledgment);
        return failure === "dispatch" ? Promise.reject(new Error("synthetic dispatch failure")) : Promise.resolve(enveloped
          ? { schema: "easyeda-pro-control.exact-json.v1", utf8Bytes: Buffer.byteLength(json), json } : acknowledgment);
      },
    },
    assertTransactionTopologyAvailable: (): void => {
      // Topology admission has separate tests; no live bridge exists here.
    },
    verifyLibraryNativeProfile: (root: string): Promise<void> => {
      assert.equal(root, "/synthetic/assets"); profiles += 1; calls.push(`profile-${profiles}`);
      return failure === "before" && profiles === 1 || failure === "after" && profiles === 2
        ? Promise.reject(new Error("synthetic UI profile drift")) : Promise.resolve();
    },
    verifyDeviceAssociationNativeProfile: (): Promise<void> => {
      calls.push("manager-profile"); managerProfiles += 1;
      return failure === "manager-after" && managerProfiles === 2 ? Promise.reject(new Error("synthetic manager profile drift")) : Promise.resolve();
    },
    designSavePhase: (): undefined => undefined,
    updateOperation: (): Promise<void> => { calls.push("journal"); return Promise.resolve(); },
    wrapWithContextGuard: (code: string): string => code,
    extractToolPayload: (value: unknown): unknown => value,
    decodeExactReadEnvelope,
    isRecord,
    DesignExecutor: { artifact: (_journal: unknown, phase: string, value: unknown): Promise<void> => {
      calls.push(`artifact-${phase}`); returns.push(value); return Promise.resolve();
    } },
  };
  vm.runInNewContext(stripTypeScriptTypes(`class Subject {
    constructor(engine) { this.engine = engine; }
    async assertRuntime() { await runtime(); }
    ${source.slice(start, end)}
  }
  const subject = new Subject(engine);
  register((journal, phase) => subject.call(journal, phase, "maintained-generated-code"));`), scope);
  assert.ok(invoke);
  return { invoke, calls, returns };
}

function journal(documentType = 3): Record<string, unknown> {
  return { plan: { operation: { action: documentType === 4 ? "footprint.text.modify" : "pcb.text.modify" },
    expectedContext: { document: { documentType } } }, context: { document: { documentType } }, state: "planned" };
}

void test("PCB apply, inverse and lifecycle dispatches refuse before runtime or UI profile acquisition", async () => {
  for (const phase of ["apply", "inverse", "save-reopen"]) {
    const current = await harness("none");
    const retained = journal();
    const before = structuredClone(retained);
    await assert.rejects(current.invoke(retained, phase), /operation-owned completion.*project_structures/u);
    assert.deepEqual(current.calls, []); assert.deepEqual(current.returns, []); assert.deepEqual(retained, before);
  }
});

void test("blocked PCB and symbol lifecycles refuse while footprint retains original raw or decoded acknowledgment before post-checks", async () => {
  for (const [phase, documentType] of [["save-reopen", 3], ["footprint-reopen", 4], ["symbol-reopen", 2],
    ["footprint-reopen-recovery", 4], ["symbol-reopen-recovery", 2]] as const) {
    for (const enveloped of [false, true]) {
      const current = await harness("manager-after", enveloped);
      const retained: Record<string, unknown> = { ...journal(documentType), operationId: "synthetic", planHash: "original", sequence: 0, after: { sha256: "original-source" } };
      if (documentType === 4) {
      await assert.rejects(current.invoke(retained, phase), /manager profile drift/u);
      assert.equal(current.calls.filter((entry) => entry === "dispatch").length, 1);
      assert.equal(current.calls.filter((entry) => entry === "manager-profile").length, 2);
      assert.equal(current.calls.filter((entry) => entry === `artifact-${phase}`).length, 1);
      assert.ok(current.calls.indexOf(`artifact-${phase}`) < current.calls.lastIndexOf("manager-profile"));
      assert.deepEqual(current.returns.at(-1), { ok: true, id: "original-ack" });
      assert.equal(retained["hardStop"], true);
      assert.equal(retained["state"], `${phase}-dispatching`);
      assert.equal(current.calls.at(-1), "manager-profile");
      } else {
        const before = structuredClone(retained);
        await assert.rejects(current.invoke(retained, phase), /operation-owned completion.*project_structures/u);
        assert.deepEqual(current.calls, []); assert.deepEqual(current.returns, []); assert.deepEqual(retained, before);
      }
    }
  }
});

void test("missing or changed pre-dispatch UI profile cannot bypass the earlier PCB lifecycle refusal", async () => {
  for (const phase of ["apply", "inverse"]) {
    for (const failure of ["missing", "before"] as const) {
      const current = await harness(failure), retained = journal();
      await assert.rejects(current.invoke(retained, phase), /operation-owned completion.*project_structures/u);
      assert.deepEqual(current.calls, []);
      assert.deepEqual(current.returns, []); assert.equal(retained["state"], "planned");
    }
  }
});

void test("PCB failure simulations cannot reach dispatch or post-dispatch profile checks", async () => {
  for (const phase of ["apply", "inverse"]) {
    const current = await harness("after");
    await assert.rejects(current.invoke(journal(), phase), /operation-owned completion.*project_structures/u);
    assert.deepEqual(current.calls, []); assert.deepEqual(current.returns, []);
  }
  const failed = await harness("dispatch");
  await assert.rejects(failed.invoke(journal(), "apply"), /operation-owned completion.*project_structures/u);
  assert.deepEqual(failed.calls, []);
  assert.deepEqual(failed.returns, []);
});

void test("PCB dispatch admission does not broaden or replace non-PCB operation guards", async () => {
  const current = await harness("none");
  await current.invoke(journal(4), "apply");
  assert.deepEqual(current.calls, ["runtime", "journal", "dispatch", "artifact-apply"]);
});
