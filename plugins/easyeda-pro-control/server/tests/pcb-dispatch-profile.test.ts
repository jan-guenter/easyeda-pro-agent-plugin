import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { isRecord } from "../src/core.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { flatTransactionBinding } from "../src/flat-transaction-binding.ts";

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
  return { plan: { operation: { action: "pcb.text.modify" } }, context: { document: { documentType } }, state: "planned" };
}

void test("PCB apply, inverse and lifecycle dispatches pin UI bytes and retain the original return before post-checks", async () => {
  for (const phase of ["apply", "inverse", "save-reopen"]) {
    const current = await harness("none");
    assert.deepEqual(await current.invoke(journal(), phase), { ok: true, id: "original-ack" });
    const manager = phase === "save-reopen" ? ["manager-profile"] : [];
    assert.deepEqual(current.calls, ["runtime", "installed", ...manager, "profile-1", "journal", "dispatch",
      `artifact-${phase}`, ...manager, "profile-2"]);
    assert.deepEqual(current.returns, [{ ok: true, id: "original-ack" }]);
  }
});

void test("every native lifecycle retains its original raw or decoded acknowledgment before the second manager profile check", async () => {
  for (const [phase, documentType] of [["save-reopen", 3], ["footprint-reopen", 4], ["symbol-reopen", 2],
    ["footprint-reopen-recovery", 4], ["symbol-reopen-recovery", 2]] as const) {
    for (const enveloped of [false, true]) {
      const current = await harness("manager-after", enveloped);
      const retained: Record<string, unknown> = { ...journal(documentType), operationId: "synthetic", planHash: "original", sequence: 0, after: { sha256: "original-source" } };
      await assert.rejects(current.invoke(retained, phase), /manager profile drift/u);
      assert.equal(current.calls.filter((entry) => entry === "dispatch").length, 1);
      assert.equal(current.calls.filter((entry) => entry === "manager-profile").length, 2);
      assert.equal(current.calls.filter((entry) => entry === `artifact-${phase}`).length, 1);
      assert.ok(current.calls.indexOf(`artifact-${phase}`) < current.calls.lastIndexOf("manager-profile"));
      assert.deepEqual(current.returns.at(-1), { ok: true, id: "original-ack" });
      assert.equal(retained["hardStop"], true);
      assert.equal(retained["state"], `${phase}-dispatching`);
      assert.equal(current.calls.at(-1), "manager-profile");
    }
  }
});

void test("missing or changed pre-dispatch UI profile cannot invoke any PCB writer or inverse", async () => {
  for (const phase of ["apply", "inverse"]) {
    for (const failure of ["missing", "before"] as const) {
      const current = await harness(failure), retained = journal();
      await assert.rejects(current.invoke(retained, phase), /implementation identity|profile drift/u);
      assert.deepEqual(current.calls, ["runtime", "installed", ...(failure === "before" ? ["profile-1"] : [])]);
      assert.deepEqual(current.returns, []); assert.equal(retained["state"], "planned");
    }
  }
});

void test("post-dispatch profile drift preserves original acknowledgment and never repeats a native call", async () => {
  for (const phase of ["apply", "inverse"]) {
    const current = await harness("after");
    await assert.rejects(current.invoke(journal(), phase), /profile drift/u);
    assert.deepEqual(current.calls, ["runtime", "installed", "profile-1", "journal", "dispatch", `artifact-${phase}`, "profile-2"]);
    assert.deepEqual(current.returns, [{ ok: true, id: "original-ack" }]);
  }
  const failed = await harness("dispatch");
  await assert.rejects(failed.invoke(journal(), "apply"), /dispatch failure/u);
  assert.deepEqual(failed.calls, ["runtime", "installed", "profile-1", "journal", "dispatch"]);
  assert.deepEqual(failed.returns, []);
});

void test("PCB dispatch admission does not broaden or replace non-PCB operation guards", async () => {
  const current = await harness("none");
  await current.invoke(journal(4), "apply");
  assert.deepEqual(current.calls, ["runtime", "journal", "dispatch", "artifact-apply"]);
});
