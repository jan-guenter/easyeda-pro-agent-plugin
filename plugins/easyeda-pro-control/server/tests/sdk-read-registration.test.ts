import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";

import { publicSdkReadRequestSchema } from "../src/public-sdk-read.ts";
import { isSchematicNativeIdMethod } from "../src/schematic-native-ids.ts";

interface Input { request: { method: string; arguments: Record<string, unknown> }; expectedContext: object; expectedFingerprint: object; evidence: object; returnMode: "full"; maxInlineBytes: number }
type Handler = (input: Input) => Promise<Record<string, unknown>>;
async function registeredSdkRead(failure: "none" | "status" | "dispatch"): Promise<{ invoke: Handler; calls: string[]; effects: Record<string, unknown>[] }> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_sdk_read",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_exact_read",', start);
  assert.ok(start !== -1 && end > start);
  const calls: string[] = [], effects: Record<string, unknown>[] = [];
  let invoke: Handler | undefined;
  const scope = {
    z, publicSdkReadRequestSchema, isSchematicNativeIdMethod,
    contextSchema: z.object({}), privateFingerprintSchema: z.object({}), evidenceSchema: z.object({}),
    CONTROL_VERSION: "synthetic", MAX_INLINE_RESULT_BYTES: 262_144,
    serializedLiveGuarded: (handler: Handler): Handler => handler,
    registerFacadeTool: (name: string, config: { description: string }, handler: Handler): void => {
      assert.equal(name, "easyeda_control_sdk_read"); assert.match(config.description, /native identity-only/u); invoke = handler;
    },
    reserveEvidencePaths: (): Promise<object> => { calls.push("reserve"); return Promise.resolve({ synthetic: true }); },
    releaseEvidenceReservation: (): Promise<void> => { calls.push("release"); return Promise.resolve(); },
    finalizeDispatchedFailure: (_reservation: unknown, _request: unknown, _error: unknown, metadata: Record<string, unknown>): Promise<void> => {
      calls.push("retain-failure"); effects.push(metadata); return Promise.resolve();
    },
    validatePrivateFingerprint: (): void => { calls.push("fingerprint"); },
    assertSubset: (): void => { calls.push("subset"); },
    engine: {
      status: (): Promise<object> => { calls.push("status"); return failure === "status" ? Promise.reject(new Error("synthetic status failure")) : Promise.resolve({ stableFingerprint: {} }); },
      publicSdkRead: (): Promise<object> => { calls.push("read"); return failure === "dispatch" ? Promise.reject(new Error("synthetic dispatch failure")) : Promise.resolve({ synthetic: true }); },
    },
    withEvidence: (_request: unknown, _result: unknown, _evidence: unknown, metadata: Record<string, unknown>): Promise<Record<string, unknown>> => {
      calls.push("evidence"); return Promise.resolve(metadata);
    },
  };
  // Execute the actual registration handler. Collaborators are synthetic; this
  // Starts no facade, bridge, lease, evidence I/O or EasyEDA process.
  vm.runInNewContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.ok(invoke !== undefined);
  return { invoke, calls, effects };
}

for (const method of ["eda.sys_Environment.getEditorCurrentVersion", "eda.sch_PrimitiveText.getAllPrimitiveId", "eda.sch_PrimitiveWire.getAllPrimitiveId", "eda.sch_PrimitiveBus.getAllPrimitiveId"]) {
  void test(`registered SDK reader labels success and failure evidence correctly: ${method}`, async () => {
    const native = isSchematicNativeIdMethod(method);
    const input: Input = { request: { method, arguments: {} }, expectedContext: {}, expectedFingerprint: {}, evidence: {}, returnMode: "full", maxInlineBytes: 1024 };
    for (const failure of ["none", "status", "dispatch"] as const) {
      const current = await registeredSdkRead(failure);
      if (failure === "none") {
        const result = await current.invoke(input);
        assert.equal(result["reader"], native ? "fixed-native-id-observation" : "fixed-public-sdk-observation");
        assert.deepEqual(current.calls, ["reserve", "fingerprint", "status", "subset", "read", "evidence"]);
      } else {
        await assert.rejects(current.invoke(input), /synthetic/u);
        if (failure === "status") {
          assert.deepEqual(current.calls, ["reserve", "fingerprint", "status", "release"]); assert.equal(current.effects.length, 0);
        } else {
          assert.deepEqual(current.calls, ["reserve", "fingerprint", "status", "subset", "read", "retain-failure"]);
          assert.equal(current.effects[0]?.["effect"], native ? "fixed-native-id-read" : "fixed-public-sdk-read");
        }
      }
    }
  });
}
