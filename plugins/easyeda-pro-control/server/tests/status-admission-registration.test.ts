import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";

interface Observation { observedAt: string; incompleteOperations: unknown[] }
type Handler = (input: object) => Promise<Record<string, unknown>>;

async function registeredStatus(options: { connectDuringProbe?: boolean; disconnected?: boolean } = {}): Promise<{
  calls: string[]; invoke: Handler; refuseAdmission: () => void;
}> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const wrapperStart = source.indexOf("function serializedStatusGuarded<Input>(");
  const wrapperEnd = source.indexOf("\nasync function callReadOnly(", wrapperStart);
  const registrationStart = source.indexOf('registerFacadeTool(\n  "easyeda_control_status",');
  const registrationEnd = source.indexOf("\nconst apiRequestSchema", registrationStart);
  assert.ok(wrapperStart !== -1 && wrapperEnd > wrapperStart && registrationStart !== -1 && registrationEnd > registrationStart);
  const calls: string[] = [];
  let admissionCount = 0, connected = options.disconnected !== true, refused = false;
  let invoke: Handler | undefined;
  const scope = {
    CONTROL_VERSION: "synthetic",
    bridgeGate: { run: (task: () => unknown): unknown => task() },
    controlDataDirectory: (): string => "/synthetic",
    engine: {
      observeStatusAdmission: (): Promise<Observation> => {
        calls.push("admission");
        admissionCount += 1;
        if (refused) { return Promise.reject(new Error("fresh orphan blocks status")); }
        return Promise.resolve({ observedAt: `observation-${String(admissionCount)}`, incompleteOperations: [{ observation: admissionCount }] });
      },
      recover: (): never => { throw new Error("Status must reuse only its same-invocation admission observation."); },
      status: (): Promise<object> => {
        calls.push("status");
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
      listTools: (): Promise<unknown[]> => { calls.push("list-tools"); return Promise.resolve([]); },
      bridgeSessionLifecycle: (): object => ({ activeSession: connected ? {} : null }),
      bridgeConnectionDiagnostics: (): object => ({}),
      processDiagnostics: (): object => ({}),
      withAuthenticatedBridgeDispatchScope: async (task: () => Promise<unknown>): Promise<unknown> => {
        calls.push("lease-start");
        try { return await task(); }
        finally { calls.push("lease-end"); }
      },
    },
  };
  // Execute the actual registration and status wrapper with synthetic collaborators.
  // No facade initialization, bridge, lease acquisition or editor is started.
  vm.runInNewContext(stripTypeScriptTypes(`${source.slice(wrapperStart, wrapperEnd)}\n${source.slice(registrationStart, registrationEnd)}`), scope);
  assert.ok(invoke !== undefined);
  return { calls, invoke, refuseAdmission: (): void => { refused = true; } };
}

void test("registered status uses one fresh admission and labels its report observation", async () => {
  const fixture = await registeredStatus();
  for (let request = 1; request <= 2; request += 1) {
    const result = await fixture.invoke({});
    assert.equal(result["incompleteOperationsObservedAt"], `observation-${String(request)}`);
    assert.equal(JSON.stringify(result["incompleteOperations"]), JSON.stringify([{ observation: request }]));
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
    const expected = ["admission", "list-tools", "status"];
    if (connectDuringProbe) { expected.push("lease-start", "status", "lease-end"); }
    assert.deepEqual(fixture.calls, expected);
  }
});
