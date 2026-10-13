import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { SDK_SYSTEM_API_SHA256, SDK_SYSTEM_API_VERSION, buildSdkSystemProgram, parseSdkSystemRequest, querySdkSystemMethods, sdkSystemDescriptors, validateSdkSystemArguments, validateSdkSystemResult } from "../src/sdk-system.ts";

interface Case { namespace: "sys_Unit" | "sys_Environment"; name: string; args: Record<string, unknown>; positional: unknown[]; value: number | string | boolean }
const cases: Case[] = [
  { namespace: "sys_Unit", name: "milToMm", args: { mil: 100 }, positional: [100, undefined], value: 2.54 },
  { namespace: "sys_Unit", name: "milToInch", args: { mil: 6, numberOfDecimals: 6 }, positional: [6, 6], value: 0.006 },
  { namespace: "sys_Unit", name: "mmToMil", args: { mm: 1, numberOfDecimals: 2 }, positional: [1, 2], value: 39.37 },
  { namespace: "sys_Unit", name: "mmToInch", args: { mm: 25.4 }, positional: [25.4, undefined], value: 1 },
  { namespace: "sys_Unit", name: "inchToMil", args: { inch: 1 }, positional: [1, undefined], value: 1000 },
  { namespace: "sys_Unit", name: "inchToMm", args: { inch: -1 }, positional: [-1, undefined], value: -25.4 },
  ...["isClient", "isWeb", "isEasyEDAProEdition", "isJLCEDAProEdition", "isProPrivateEdition", "isOnlineMode", "isHalfOfflineMode", "isOfflineMode"].map((name): Case => ({ namespace: "sys_Environment", name, args: {}, positional: [], value: true })),
  { namespace: "sys_Environment", name: "getEditorCurrentVersion", args: { onlySemantic: false }, positional: [false], value: "3.2.206" },
  { namespace: "sys_Environment", name: "getEditorCompliedDate", args: {}, positional: [], value: "2026-10-10" },
  { namespace: "sys_Environment", name: "isEditorCurrentVersionGreaterThanOrEqual", args: { version: "3.2.207" }, positional: ["3.2.207"], value: true },
  { namespace: "sys_Environment", name: "isEditorCurrentVersionLessThanOrEqual", args: { version: "3.2.205" }, positional: ["3.2.205"], value: true },
];

function runProgram(request: unknown, eda: Record<string, unknown>): unknown {
  return runInNewContext(`(()=>{${buildSdkSystemProgram(request)}})()`, { eda, TextEncoder }, { timeout: 1000 }) as unknown;
}

void test("all18 system methods bind the literal receiver and exact arguments in two synchronous samples", () => {
  for (const current of cases) {
    const request = { method: `eda.${current.namespace}.${current.name}`, arguments: current.args };
    let calls = 0;
    const owner: Record<string, unknown> = {};
    owner[current.name] = function read(this: unknown, ...args: unknown[]): unknown {
      assert.equal(this, owner);
      assert.deepEqual(structuredClone(args), current.positional);
      calls += 1;
      return current.value;
    };
    const result = validateSdkSystemResult(request, decodeExactReadEnvelope(runProgram(request, { [current.namespace]: owner })));
    assert.equal(calls, 2);
    assert.equal(result["value"], current.value);
    assert.equal(result["apiVersion"], SDK_SYSTEM_API_VERSION);
    assert.equal(result["apiSha256"], SDK_SYSTEM_API_SHA256);
    if (current.namespace === "sys_Unit") {
      assert.equal(result["negativeZero"], false);
      assert.equal(result["numberOfDecimals"], current.args["numberOfDecimals"] ?? 4);
      assert.equal(result["effect"], "supplied-value-calculation");
    }
  }
});

void test("system discovery and strict argument validation never grant execution authority", () => {
  assert.equal(sdkSystemDescriptors().length, 18);
  assert.equal(new Set(sdkSystemDescriptors().map((entry) => entry.path)).size, 18);
  assert.equal(querySdkSystemMethods()["total"], 18);
  const detail = querySdkSystemMethods({ method: "eda.sys_Unit.mmToMil", includeSchemas: true });
  assert.equal(detail["total"], 1);
  assert.match(JSON.stringify(detail), /"output":"mil"/u);
  assert.equal(JSON.stringify(querySdkSystemMethods()).includes("inputSchema"), false);
  for (const descriptor of sdkSystemDescriptors()) {
    assert.equal(descriptor.invocationEnabledByDiscovery, false);
    assert.equal(descriptor.provenance.liveValidation, "not-recorded");
  }
  assert.equal(validateSdkSystemArguments({ method: "eda.sys_Environment.isClient", arguments: {} })["valid"], true);
  assert.equal(validateSdkSystemArguments({ method: "eda.sys_Environment.isClient", arguments: { code: "private()" } })["valid"], false);
  for (const version of ["dev", "v3.2.206", "03.2.206", "3.2", "3.2.206.715d940d", "3.2.206-beta", "3.2.206+build", "1000000.0.0"]) {
    assert.throws(() => parseSdkSystemRequest({ method: "eda.sys_Environment.isEditorCurrentVersionGreaterThanOrEqual", arguments: { version } }));
  }
  for (const mil of [Infinity, Number.NaN, "1", 1_000_000_001]) {
    assert.throws(() => buildSdkSystemProgram({ method: "eda.sys_Unit.milToMm", arguments: { mil } }));
  }
  for (const numberOfDecimals of [-1, 0.5, 13]) {
    assert.throws(() => buildSdkSystemProgram({ method: "eda.sys_Unit.milToMm", arguments: { mil: 1, numberOfDecimals } }));
  }
  assert.throws(() => buildSdkSystemProgram({ method: "eda.sys_Environment.getUserInfo", arguments: {} }));
  assert.throws(() => buildSdkSystemProgram({ method: "eda.sys_Unit.getFrontendDataUnit", arguments: {} }));
  assert.throws(() => querySdkSystemMethods({ method: "eda.sys_Environment.constructor" }));
});

void test("system unit transport preserves signed zero and explicit zero precision without normalization", () => {
  const request = { method: "eda.sys_Unit.milToMm", arguments: { mil: -0, numberOfDecimals: 0 } };
  const result = validateSdkSystemResult(request, decodeExactReadEnvelope(runProgram(request, { sys_Unit: {
    milToMm: (mil: number, numberOfDecimals: number): number => {
      assert.equal(Object.is(mil, -0), true);
      assert.equal(numberOfDecimals, 0);
      return -0;
    },
  } })));
  assert.equal(Object.is(result["value"], 0), true);
  assert.equal(result["negativeZero"], true);
  assert.equal(result["numberOfDecimals"], 0);
  const serialized = JSON.stringify(result);
  assert.match(serialized, /"negativeZero":true/u);
  let sample = 0;
  assert.throws(() => runProgram(request, { sys_Unit: { milToMm: (): number => { sample += 1; return sample === 1 ? -0 : 0; } } }), /SDK_SYSTEM_READ_FAILED/u);
});

void test("system read refuses replaced owners or methods, unstable scalars, promises and private errors", () => {
  const request = { method: "eda.sys_Environment.isClient", arguments: {} };
  let calls = 0;
  const owner: Record<string, unknown> = {};
  owner["isClient"] = (): boolean => { calls += 1; owner["isClient"] = (): boolean => true; return true; };
  assert.throws(() => runProgram(request, { sys_Environment: owner }), /SDK_SYSTEM_READ_FAILED/u);
  assert.equal(calls, 1);
  const eda: Record<string, unknown> = { sys_Environment: { isClient: (): boolean => { eda["sys_Environment"] = {}; return true; } } };
  assert.throws(() => runProgram(request, eda), /SDK_SYSTEM_READ_FAILED/u);
  let sample = false;
  for (const isClient of [(): string => "true", (): Promise<boolean> => Promise.resolve(true), (): boolean => { sample = !sample; return sample; },
    (): never => { throw new Error("PRIVATE_RUNTIME_FAILURE"); }]) {
    assert.throws(() => runProgram(request, { sys_Environment: { isClient } }), { message: "SDK_SYSTEM_READ_FAILED" });
  }
  assert.throws(() => runProgram(request, {}), /SDK_SYSTEM_READ_FAILED/u);
  for (const value of [Infinity, Number.NaN, 1_000_000_000_001]) {
    assert.throws(() => runProgram({ method: "eda.sys_Unit.milToMm", arguments: { mil: 1 } }, { sys_Unit: { milToMm: (): number => value } }), /SDK_SYSTEM_READ_FAILED/u);
  }
  for (const value of ["", "x".repeat(129), "date\nsecret", {}]) {
    assert.throws(() => runProgram({ method: "eda.sys_Environment.getEditorCompliedDate", arguments: {} }, { sys_Environment: { getEditorCompliedDate: (): unknown => value } }), /SDK_SYSTEM_READ_FAILED/u);
  }
});

void test("system result validator rejects mismatched identity, wrong scalar types and contradictory zero markers", () => {
  const request = { method: "eda.sys_Unit.milToMm", arguments: { mil: 100 } };
  const payload = { ok: true, kind: "sdk-system", method: request.method, value: 2.54, negativeZero: false };
  for (const invalid of [{ ...payload, method: "eda.sys_Unit.mmToMil" }, { ...payload, private: "hidden" }, { ...payload, value: "2.54" },
    { ...payload, negativeZero: true }, { ...payload, negativeZero: undefined }, { ...payload, value: -0, negativeZero: true }]) {
    assert.throws(() => validateSdkSystemResult(request, invalid));
  }
  const metaRequest = { method: "eda.sys_Environment.isClient", arguments: {} };
  assert.throws(() => validateSdkSystemResult(metaRequest, { ...payload, method: metaRequest.method, value: true }));
  const dateRequest = { method: "eda.sys_Environment.getEditorCompliedDate", arguments: {} };
  const dateResult = validateSdkSystemResult(dateRequest, { ok: true, kind: "sdk-system", method: dateRequest.method, value: "2026-10-10" });
  assert.equal(dateResult["effect"], "environment-metadata-local-cache");
  assert.match(JSON.stringify(dateResult["limitations"]), /local runtime cache/u);
  for (const name of ["isEditorCurrentVersionGreaterThanOrEqual", "isEditorCurrentVersionLessThanOrEqual"]) {
    const description = sdkSystemDescriptors().find((entry) => entry.method === `eda.sys_Environment.${name}`);
    assert.match(JSON.stringify(description), /SUPPLIED version/u);
  }
});
