import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";

import { publicSdkReadImplementationKind, publicSdkReadRequestSchema } from "../src/public-sdk-read.ts";
import { isSchematicNativeIdMethod } from "../src/schematic-native-ids.ts";
import { SCHEMATIC_COMPONENT_PROPERTY_METHOD } from "../src/schematic-component-properties.ts";
import { SYMBOL_PIN_ENUMERATION_METHOD } from "../src/symbol-pin-enumeration.ts";
// oxlint-disable-next-line import/max-dependencies -- The real registration handler needs each production authority classifier, not a duplicated test classifier.
import { SCHEMATIC_TEXT_READ_METHODS, isSchematicTextReadMethod } from "../src/schematic-text-read.ts";
import { SCHEMATIC_NETGROUP_READ_METHODS, isSchematicNetGroupReadMethod } from "../src/schematic-netgroup-read.ts";
import { SCHEMATIC_PRIMITIVE_READ_METHODS } from "../src/schematic-primitive-read.ts";
import { PCB_NET_MEMBERSHIP_METHOD } from "../src/pcb-net-membership.ts";
import { PCB_PRIMITIVE_TYPE_METHOD } from "../src/pcb-primitive-type-read.ts";
import { PCB_ACTIVE_LAYER_METHOD } from "../src/pcb-active-layer-read.ts";
import { PCB_SELECTED_OBJECTS_METHOD } from "../src/pcb-selected-objects.ts";
import { PCB_SOURCE_OBJECTS_METHOD, PCB_SOURCE_OBJECT_METHOD, isPcbSourceObjectsMethod } from "../src/pcb-source-objects.ts";
import { PcbSelectedReadTimings } from "../src/pcb-selected-read-timings.ts";
import { isRecord } from "../src/core.ts";

interface Input { request: { method: string; arguments: Record<string, unknown> }; expectedContext: object; expectedFingerprint: object; evidence: object; returnMode: "full"; maxInlineBytes: number }
type Handler = (input: Input) => Promise<Record<string, unknown>>;
async function registeredSdkRead(failure: "none" | "status" | "dispatch" | "final-status" | "fingerprint"): Promise<{ invoke: Handler; calls: string[]; effects: Record<string, unknown>[] }> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_sdk_read",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_exact_read",', start);
  assert.ok(start !== -1 && end > start);
  const calls: string[] = [], effects: Record<string, unknown>[] = [];
  let statuses = 0;
  let invoke: Handler | undefined;
  const status = (): Promise<object> => {
    calls.push("status"); statuses += 1;
    return failure === "status" || failure === "final-status" && statuses === 2
      ? Promise.reject(new Error("synthetic status failure")) : Promise.resolve({ stableFingerprint: {} });
  };
  const coordinatedRead = async (route: string): Promise<object> => {
    calls.push(route);
    // Real coordinator tests separately prove these runtime/quarantine checks.
    // Here the production registration must leave their admission ownership
    // Intact, without adding a third full status or swallowing either refusal.
    await status();
    calls.push("coordinator-subset");
    if (failure === "dispatch") { throw new Error("synthetic dispatch failure"); }
    await status();
    return { synthetic: true };
  };
  const scope = {
    z, publicSdkReadRequestSchema, publicSdkReadImplementationKind, isSchematicNativeIdMethod, SCHEMATIC_COMPONENT_PROPERTY_METHOD, SYMBOL_PIN_ENUMERATION_METHOD, isSchematicTextReadMethod,
    isSchematicNetGroupReadMethod, PCB_NET_MEMBERSHIP_METHOD, PCB_PRIMITIVE_TYPE_METHOD, PCB_ACTIVE_LAYER_METHOD, PCB_SELECTED_OBJECTS_METHOD, PcbSelectedReadTimings, isRecord, isPcbSourceObjectsMethod,
    contextSchema: z.object({}), privateFingerprintSchema: z.object({}), evidenceSchema: z.object({}),
    CONTROL_VERSION: "synthetic", MAX_INLINE_RESULT_BYTES: 262_144,
    serializedLiveGuarded: (handler: Handler): Handler => handler,
    registerFacadeTool: (name: string, config: { description: string }, handler: Handler): void => {
      assert.equal(name, "easyeda_control_sdk_read"); assert.match(config.description, /native identity, property-name, Pin-getter, Text, Wire\/Bus, filtered PCB net-membership and PCB identity-type/u); invoke = handler;
    },
    reserveEvidencePaths: (): Promise<object> => { calls.push("reserve"); return Promise.resolve({ synthetic: true }); },
    releaseEvidenceReservation: (): Promise<void> => { calls.push("release"); return Promise.resolve(); },
    finalizeDispatchedFailure: (_reservation: unknown, _request: unknown, _error: unknown, metadata: Record<string, unknown>): Promise<void> => {
      calls.push("retain-failure"); effects.push(metadata); return Promise.resolve();
    },
    validatePrivateFingerprint: (): void => {
      calls.push("fingerprint");
      if (failure === "fingerprint") { throw new Error("synthetic fingerprint failure"); }
    },
    assertSubset: (): void => { calls.push("subset"); },
    readPcbNetMembership: (_engine: unknown, request: Input["request"], expectedContext: object, expectedFingerprint: object): Promise<object> => {
      assert.equal(request.method, PCB_NET_MEMBERSHIP_METHOD); assert.deepEqual(expectedContext, {}); assert.deepEqual(expectedFingerprint, {});
      return coordinatedRead("pcb-membership");
    },
    readPcbPrimitiveType: (_engine: unknown, request: Input["request"], expectedContext: object, expectedFingerprint: object): Promise<object> => {
      assert.equal(request.method, PCB_PRIMITIVE_TYPE_METHOD); assert.deepEqual(request.arguments, { id: "fixture" });
      assert.deepEqual(expectedContext, {}); assert.deepEqual(expectedFingerprint, {});
      return coordinatedRead("pcb-type");
    },
    readPcbActiveLayer: (_engine: unknown, request: Input["request"], expectedContext: object, expectedFingerprint: object): Promise<object> => {
      assert.equal(request.method, PCB_ACTIVE_LAYER_METHOD); assert.deepEqual(request.arguments, {});
      assert.deepEqual(expectedContext, {}); assert.deepEqual(expectedFingerprint, {});
      return coordinatedRead("active-layer");
    },
    readPcbSelectedObjects: (_engine: unknown, request: Input["request"], expectedContext: object, expectedFingerprint: object, timings: PcbSelectedReadTimings): Promise<object> => {
      assert.equal(request.method, PCB_SELECTED_OBJECTS_METHOD); assert.deepEqual(request.arguments, {});
      assert.deepEqual(expectedContext, {}); assert.deepEqual(expectedFingerprint, {});
      assert.ok(timings instanceof PcbSelectedReadTimings);
      return timings.measure("source-read", () => coordinatedRead("selected-source"));
    },
    readPcbSourceObjects: (_engine: unknown, request: Input["request"], expectedContext: object, expectedFingerprint: object): Promise<object> => {
      assert.ok(isPcbSourceObjectsMethod(request.method));
      assert.deepEqual(request.arguments, request.method === PCB_SOURCE_OBJECT_METHOD ? { id: "fixture" } : { ids: ["fixture"] });
      assert.deepEqual(expectedContext, {}); assert.deepEqual(expectedFingerprint, {});
      return coordinatedRead("explicit-source");
    },
    engine: {
      status,
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

for (const method of ["eda.sys_Environment.getEditorCurrentVersion", "eda.sch_PrimitiveText.getAllPrimitiveId", "eda.sch_PrimitiveWire.getAllPrimitiveId", "eda.sch_PrimitiveBus.getAllPrimitiveId", SCHEMATIC_COMPONENT_PROPERTY_METHOD, SYMBOL_PIN_ENUMERATION_METHOD, ...SCHEMATIC_TEXT_READ_METHODS, ...SCHEMATIC_NETGROUP_READ_METHODS, ...SCHEMATIC_PRIMITIVE_READ_METHODS, PCB_NET_MEMBERSHIP_METHOD, PCB_PRIMITIVE_TYPE_METHOD, PCB_ACTIVE_LAYER_METHOD, PCB_SELECTED_OBJECTS_METHOD, PCB_SOURCE_OBJECT_METHOD, PCB_SOURCE_OBJECTS_METHOD]) {
  void test(`registered SDK reader labels success and failure evidence correctly: ${method}`, async () => {
    const native = publicSdkReadImplementationKind(method) === "native-task-equivalent";
    let reader = native ? "fixed-native-task-observation" : "fixed-public-sdk-observation";
    let effect = native ? "fixed-native-task-read" : "fixed-public-sdk-read";
    if (isSchematicNativeIdMethod(method)) { reader = "fixed-native-id-observation"; effect = "fixed-native-id-read"; }
    if (method === SCHEMATIC_COMPONENT_PROPERTY_METHOD) { reader = "fixed-native-property-name-observation"; effect = "fixed-native-property-name-read"; }
    if (method === SYMBOL_PIN_ENUMERATION_METHOD) { reader = "fixed-native-pin-getter-observation"; effect = "fixed-native-pin-getter-read"; }
    if (isSchematicTextReadMethod(method)) { reader = "fixed-native-text-state-observation"; effect = "fixed-native-text-state-read"; }
    if (isSchematicNetGroupReadMethod(method)) { reader = "fixed-native-netgroup-state-observation"; effect = "fixed-native-netgroup-state-read"; }
    if (method === PCB_NET_MEMBERSHIP_METHOD) { reader = "fixed-native-net-membership-observation"; effect = "fixed-native-net-membership-read"; }
    if (method === PCB_PRIMITIVE_TYPE_METHOD) { reader = "fixed-native-pcb-type-observation"; effect = "fixed-native-pcb-type-read"; }
    if (method === PCB_ACTIVE_LAYER_METHOD) { reader = "fixed-native-active-layer-observation"; effect = "fixed-native-active-layer-read"; }
    if (method === PCB_SELECTED_OBJECTS_METHOD) { reader = "fixed-native-selected-source-observation"; effect = "fixed-native-selected-source-read"; }
    if (isPcbSourceObjectsMethod(method)) { reader = "fixed-native-explicit-source-observation"; effect = "fixed-native-explicit-source-read"; }
    let argumentsData: Record<string, unknown> = method.endsWith(".get") ? { primitiveIds: "fixture" } : {};
    if (method === PCB_NET_MEMBERSHIP_METHOD) { argumentsData = { net: "GND", primitiveTypes: ["Line"] }; }
    if (method === PCB_PRIMITIVE_TYPE_METHOD) { argumentsData = { id: "fixture" }; }
    if (isPcbSourceObjectsMethod(method)) { argumentsData = method === PCB_SOURCE_OBJECT_METHOD ? { id: "fixture" } : { ids: ["fixture"] }; }
    if (method === SCHEMATIC_PRIMITIVE_READ_METHODS[0]) { argumentsData = { id: "fixture" }; }
    if (method === SCHEMATIC_PRIMITIVE_READ_METHODS[1]) { argumentsData = { ids: ["fixture"] }; }
    const input: Input = { request: { method, arguments: argumentsData }, expectedContext: {}, expectedFingerprint: {}, evidence: {}, returnMode: "full", maxInlineBytes: 1024 };
    let dispatch = "read";
    if (method === PCB_NET_MEMBERSHIP_METHOD) { dispatch = "pcb-membership"; }
    if (method === PCB_PRIMITIVE_TYPE_METHOD) { dispatch = "pcb-type"; }
    if (method === PCB_ACTIVE_LAYER_METHOD) { dispatch = "active-layer"; }
    if (method === PCB_SELECTED_OBJECTS_METHOD) { dispatch = "selected-source"; }
    if (isPcbSourceObjectsMethod(method)) { dispatch = "explicit-source"; }
    const coordinated = dispatch !== "read";
    for (const failure of ["none", "status", "dispatch", "fingerprint", ...(coordinated ? ["final-status" as const] : [])] as const) {
      const current = await registeredSdkRead(failure);
      if (failure === "none") {
        const result = await current.invoke(input);
        assert.equal(result["reader"], reader);
        if (method === PCB_SELECTED_OBJECTS_METHOD) {
          const diagnostics = result["diagnostics"]; assert.ok(isRecord(diagnostics));
          assert.deepEqual(diagnostics["selectedReaderTimings"], result["selectedReaderTimings"]);
          assert.ok(isRecord(result["selectedReaderTimings"]));
          assert.equal(result["selectedReaderTimings"]["authority"], "passive-diagnostics-not-native-observation-or-admission-proof");
        } else { assert.equal(result["diagnostics"], undefined); assert.equal(result["selectedReaderTimings"], undefined); }
        assert.deepEqual(current.calls, coordinated
          ? ["reserve", "fingerprint", dispatch, "status", "coordinator-subset", "status", "evidence"]
          : ["reserve", "fingerprint", "status", "subset", dispatch, "evidence"]);
      } else {
        await assert.rejects(current.invoke(input), /synthetic/u);
        if (failure === "fingerprint") {
          assert.deepEqual(current.calls, ["reserve", "fingerprint", "release"]); assert.equal(current.effects.length, 0);
        } else if (coordinated) {
          const beforeFailure = failure === "status" ? [] : ["coordinator-subset", ...(failure === "final-status" ? ["status"] : [])];
          assert.deepEqual(current.calls, ["reserve", "fingerprint", dispatch, "status", ...beforeFailure, "retain-failure"]);
          assert.equal(current.effects[0]?.["effect"], effect);
          if (method === PCB_SELECTED_OBJECTS_METHOD) {
            const timings = current.effects[0]?.["selectedReaderTimings"]; assert.ok(isRecord(timings));
            const stages = timings["stages"]; assert.ok(Array.isArray(stages));
            assert.ok(isRecord(stages[0])); assert.equal(stages[0]["failedCount"], 1);
          } else { assert.equal(current.effects[0]?.["selectedReaderTimings"], undefined); }
        } else if (failure === "status") {
          assert.deepEqual(current.calls, ["reserve", "fingerprint", "status", "release"]); assert.equal(current.effects.length, 0);
        } else {
          assert.deepEqual(current.calls, ["reserve", "fingerprint", "status", "subset", dispatch, "retain-failure"]);
          assert.equal(current.effects[0]?.["effect"], effect);
        }
      }
    }
  });
}
