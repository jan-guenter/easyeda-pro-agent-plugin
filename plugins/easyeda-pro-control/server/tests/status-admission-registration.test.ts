import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { isRecord } from "../src/core.ts";
import { CALCULATION_ONLY_TOOLS } from "../src/facade-mode.ts";

const DIAGNOSTICS = Object.freeze({ schema: "easyeda-pro-control.admission-scan-diagnostics.v1", journalCount: 3,
  candidateCounts: { legacy: 2, incomplete: 1, invalid: 0, terminal: 0, "current-baseline": 0 },
  journalScanMs: 120, historicalQualificationMs: 30, totalMs: 150 });
interface Observation { observedAt: string; incompleteOperations: unknown[]; diagnostics: typeof DIAGNOSTICS }
type Handler = (input: object) => Promise<Record<string, unknown>>;

async function registeredStatus(options: { connectDuringProbe?: boolean; disconnected?: boolean; failureStage?: "list-tools" | "status"; diagnosticsThrow?: boolean;
  facadeMode?: "legacy-reviewed" | "calculation-only" } = {}): Promise<{
  calls: string[]; invoke: Handler; refuseAdmission: () => void;
}> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const wrapperStart = source.indexOf("function serializedStatusGuarded<Input>(");
  const wrapperEnd = source.indexOf("\nasync function callReadOnly(", wrapperStart);
  const registrationStart = source.indexOf('registerFacadeTool(\n  "easyeda_control_status",');
  const registrationEnd = source.indexOf("\nregisterFacadeTool(", registrationStart + 1);
  const failureStart = source.indexOf("function failure(error: unknown,");
  const failureEnd = source.indexOf("\nfunction serializedGuarded<Input>(", failureStart);
  assert.ok(wrapperStart !== -1 && wrapperEnd > wrapperStart && registrationStart !== -1 && registrationEnd > registrationStart);
  assert.ok(failureStart !== -1 && failureEnd > failureStart);
  const calls: string[] = [];
  let admissionCount = 0, connected = options.disconnected !== true, refused = false;
  let invoke: Handler | undefined;
  const scope = {
    CONTROL_VERSION: "synthetic",
    facadeMode: options.facadeMode ?? "legacy-reviewed",
    CALCULATION_ONLY_TOOLS,
    UpstreamStartupError: class extends Error {},
    boundedTransactionErrorOutput: (): object => ({}),
    isRecord: (value: unknown): boolean => typeof value === "object" && value !== null,
    success: (value: unknown): unknown => value,
    bridgeGate: { run: (task: () => unknown): unknown => task() },
    controlDataDirectory: (): string => "/synthetic",
    engine: {
      observeStatusAdmission: (): Promise<Observation> => {
        calls.push("admission");
        admissionCount += 1;
        if (refused) { return Promise.reject(new Error("fresh orphan blocks status")); }
        return Promise.resolve({ observedAt: `observation-${String(admissionCount)}`, incompleteOperations: [{ observation: admissionCount }], diagnostics: DIAGNOSTICS });
      },
      recover: (): never => { throw new Error("Status must reuse only its same-invocation admission observation."); },
      status: (): Promise<object> => {
        calls.push("status");
        if (options.failureStage === "status") { return Promise.reject(new Error("original status failure")); }
        if (options.connectDuringProbe === true) { connected = true; }
        return Promise.resolve({ synthetic: true });
      },
    },
    facadeLease: { path: "/synthetic/lease", pid: 0 },
    guarded: (handler: Handler): Handler => handler,
    listLibraryExecutionCapabilities: (): unknown[] => [],
    registerFacadeTool: (name: string, _config: unknown, handler: Handler): void => {
      assert.equal(name, "easyeda_control_status"); invoke = handler;
    },
    upstream: {
      listTools: (): Promise<unknown[]> => {
        calls.push("list-tools");
        if (options.failureStage === "list-tools") {
          return Promise.reject(Object.assign(new Error("original startup failure"), { upstreamProcess: { privatePath: "private-untrusted-path" } }));
        }
        return Promise.resolve([]);
      },
      bridgeSessionLifecycle: (): object => ({ activeSession: connected ? {} : null }),
      bridgeConnectionDiagnostics: (): object => ({}),
      processDiagnostics: (): object => {
        if (options.failureStage === undefined) { return {}; }
        calls.push("diagnostics");
        if (options.diagnosticsThrow === true) { throw new Error("private-diagnostic-failure"); }
        return { sandbox: null, localIntegrity: { schema: "easyeda-pro-control.local-integrity-timings.v1", stages: [] } };
      },
      withAuthenticatedBridgeDispatchScope: async (task: () => Promise<unknown>): Promise<unknown> => {
        calls.push("lease-start");
        try { return await task(); }
        finally { calls.push("lease-end"); }
      },
    },
  };
  // Execute the actual registration and status wrapper with synthetic collaborators.
  // No facade initialization, bridge, lease acquisition or editor is started.
  const errorHandlingSource = options.failureStage === undefined ? "" : source.slice(failureStart, failureEnd);
  vm.runInNewContext(stripTypeScriptTypes(`${errorHandlingSource}\n${source.slice(wrapperStart, wrapperEnd)}\n${source.slice(registrationStart, registrationEnd)}`), scope);
  assert.ok(invoke !== undefined);
  return { calls, invoke, refuseAdmission: (): void => { refused = true; } };
}

void test("registered status uses one fresh admission and labels its report observation", async () => {
  const fixture = await registeredStatus();
  for (let request = 1; request <= 2; request += 1) {
    const result = await fixture.invoke({});
    assert.equal(result["incompleteOperationsObservedAt"], `observation-${String(request)}`);
    assert.equal(JSON.stringify(result["incompleteOperations"]), JSON.stringify([{ observation: request }]));
    assert.equal(result["admissionScan"], DIAGNOSTICS);
  }
  assert.deepEqual(fixture.calls, ["admission", "list-tools", "lease-start", "status", "lease-end",
    "admission", "list-tools", "lease-start", "status", "lease-end"]);
  fixture.calls.length = 0;
  fixture.refuseAdmission();
  await assert.rejects(fixture.invoke({}), /fresh orphan blocks status/u);
  assert.deepEqual(fixture.calls, ["admission"]);
});

void test("registered disconnected status resamples runtime under a lease without rescanning its report", async () => {
  for (const connectDuringProbe of [false, true]) {
    const fixture = await registeredStatus({ disconnected: true, connectDuringProbe });
    const result = await fixture.invoke({});
    assert.equal(result["incompleteOperationsObservedAt"], "observation-1");
    assert.equal(result["admissionScan"], DIAGNOSTICS);
    const expected = ["admission", "list-tools", "status"];
    if (connectDuringProbe) { expected.push("lease-start", "status", "lease-end"); }
    assert.deepEqual(fixture.calls, expected);
  }
});

void test("status admission diagnostics schema bounds numeric aggregates and refuses private fields", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf("const statusAdmissionDiagnosticsSchema = z.object({");
  const end = source.indexOf("const statusSuccessOutputSchema = z", start);
  assert.ok(start !== -1 && end > start);
  const schema: unknown = vm.runInNewContext(`${source.slice(start, end)}\nstatusAdmissionDiagnosticsSchema;`, { z, Number });
  assert.ok(schema instanceof z.ZodObject);
  assert.deepEqual(schema.parse(DIAGNOSTICS), DIAGNOSTICS);
  for (const field of ["journalCount", "journalScanMs", "historicalQualificationMs", "totalMs"] as const) {
    for (const value of [-1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1, "1"]) {
      assert.equal(schema.safeParse({ ...DIAGNOSTICS, [field]: value }).success, false);
    }
  }
  for (const value of [{ ...DIAGNOSTICS, operationId: "private" },
    { ...DIAGNOSTICS, candidateCounts: { ...DIAGNOSTICS.candidateCounts, path: "private" } },
    { ...DIAGNOSTICS, candidateCounts: { ...DIAGNOSTICS.candidateCounts, legacy: -1 } }]) {
    assert.equal(schema.safeParse(value).success, false);
  }
});

void test("restricted status separates historical metadata and canvas validation from current authority", async () => {
  const fixture = await registeredStatus({ facadeMode: "calculation-only" });
  const result = await fixture.invoke({});
  const facade = result["facade"], upstream = result["upstream"];
  assert.ok(isRecord(facade) && isRecord(upstream) && isRecord(upstream["capabilities"]));
  assert.equal(facade["mode"], "calculation-only");
  assert.equal(JSON.stringify(facade["availableTools"]), JSON.stringify(CALCULATION_ONLY_TOOLS));
  assert.ok(typeof facade["capabilityScope"] === "string");
  assert.match(facade["capabilityScope"], /META-only symbol lifecycle passed an installed101500 disposable forward\/inverse round trip/u);
  assert.match(facade["capabilityScope"], /Installed123000 passed the separate ordinary unused META-only forward-only route/u);
  assert.match(facade["capabilityScope"], /historical validation grants no current-invocation authority/u);
  assert.match(facade["capabilityScope"], /Ordinary unused-symbol metadata accepts complete META-only or bounded canvas-segments history/u);
  assert.match(facade["capabilityScope"], /exactly one write and no inverse/u);
  assert.match(facade["capabilityScope"], /Installed080000 passed the ordinary unused drawn-symbol forward lifecycle/u);
  assert.match(facade["capabilityScope"], /Installed210000 passed the disposable canvas-segments forward\/inverse round trip with complete closed SQL, reopened content and final closure/u);
  assert.match(facade["capabilityScope"], /Generic design writers remain disabled/u);
  const capabilities = upstream["capabilities"];
  assert.equal(JSON.stringify(capabilities["designAccess"]), JSON.stringify({ enabled: false, scope: "generic-design-routes" }));
  assert.equal(JSON.stringify(capabilities["projectPcb"]), JSON.stringify({ tool: "easyeda_control_project_pcb", runtimeAdmissionRequired: true,
    explicitTargetRequired: true, nativeEquivalent: true, noEditorTabsRequired: true, savedMembershipVerified: false, cadAuthority: false, connectedValidation: false }));
  assert.equal(JSON.stringify(capabilities["projectSymbolMetadata"]), JSON.stringify({ tool: "easyeda_control_project_symbol_metadata",
    scope: "unreferenced-project-local-meta-only-or-bounded-canvas-segments-name-description-forward-only", runtimeAdmissionRequired: true,
    designMutation: true, connectedValidation: false, originalOwnerRequired: true,
    historicalConnectedValidation: "installed123000-ordinary-unused-meta-only-forward-only",
    historicalCanvasConnectedValidation: "installed080000-ordinary-unused-canvas-segments-forward-only",
    sharedLifecycleConnectedValidation: "installed101500-disposable-meta-only-roundtrip",
    phaseEffectAcknowledgementsRequired: true, inverseSupported: false, genericWritersEnabled: false }));
  assert.equal(JSON.stringify(capabilities["disposableSymbolCopy"]), JSON.stringify({ tool: "easyeda_control_disposable_symbol_copy",
    scope: "original-disposable-project-local-supported-symbol-copy", runtimeAdmissionRequired: true, designMutation: true,
    connectedValidation: false, originalOwnerRequired: true,
    historicalConnectedValidation: "installed094000-disposable-supported-drawn-symbol-copy", phaseEffectAcknowledgementsRequired: true,
    inverseSupported: false, ordinaryProjectsSupported: false, genericWritersEnabled: false }));
  assert.equal(JSON.stringify(capabilities["disposablePcbRename"]), JSON.stringify({ tool: "easyeda_control_disposable_pcb_rename",
    scope: "original-disposable-project-local-pcb-title-forward-only", runtimeAdmissionRequired: true, designMutation: true,
    connectedValidation: false, originalOwnerRequired: true,
    historicalConnectedValidation: "installed195000-disposable-pcb-title-only-lifecycle", phaseEffectAcknowledgementsRequired: true,
    inverseSupported: false, ordinaryProjectsSupported: false, savedMetadataOnly: true, completeCanvasRead: false, genericWritersEnabled: false }));
  assert.equal(JSON.stringify(capabilities["disposableValidation"]), JSON.stringify({ tool: "easyeda_control_project_open", actions: "validation-*",
    scope: "sealed-disposable-unused-meta-only-or-bounded-canvas-segments-symbol-name-description-forward-inverse", designMutation: true, connectedValidation: false,
    sharedLifecycleConnectedValidation: "installed101500-disposable-meta-only-roundtrip",
    canvasSegmentsValidation: "installed210000-disposable-canvas-segments-roundtrip",
    normalWritersEnabled: false, phaseEffectAcknowledgementsRequired: true, originalOwnerRequired: true }));
  const navigation = capabilities["navigation"];
  assert.ok(isRecord(navigation));
  assert.equal(navigation["scope"], "registered-disposable-project-and-existing-pcb-opening-plus-owned-validation-reopening");
  assert.equal(navigation["retainedLaunchRequired"], true); assert.equal(navigation["unchangedStorageGuaranteed"], false);
  assert.deepEqual(fixture.calls, ["admission", "list-tools", "lease-start", "status", "lease-end"]);
});

void test("registered failed startup/status retains failure and safe passive diagnostics without a retry", async () => {
  for (const failureStage of ["list-tools", "status"] as const) {
    const fixture = await registeredStatus({ failureStage });
    const result = await fixture.invoke({});
    assert.equal(result["isError"], true);
    const serialized = JSON.stringify(result);
    assert.match(serialized, /original (startup|status) failure/u);
    assert.match(serialized, /local-integrity-timings\.v1/u);
    assert.match(serialized, /"sandbox":null/u);
    assert.doesNotMatch(serialized, /private-untrusted-path/u);
    assert.deepEqual(fixture.calls, failureStage === "list-tools"
      ? ["admission", "list-tools", "diagnostics"]
      : ["admission", "list-tools", "lease-start", "status", "lease-end", "diagnostics"]);
  }
});

void test("registered status diagnostic failure cannot replace the original error", async () => {
  const fixture = await registeredStatus({ failureStage: "list-tools", diagnosticsThrow: true });
  const result = await fixture.invoke({});
  assert.equal(result["isError"], true);
  assert.match(JSON.stringify(result), /original startup failure/u);
  assert.doesNotMatch(JSON.stringify(result), /private-diagnostic-failure|private-untrusted-path|upstreamProcess/u);
  assert.deepEqual(fixture.calls, ["admission", "list-tools", "diagnostics"]);
});
