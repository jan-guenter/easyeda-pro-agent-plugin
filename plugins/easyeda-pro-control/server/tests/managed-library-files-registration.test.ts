/** Actual registration and offline API composition with isolated supplied files. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { isRecord } from "../src/core.ts";
import { extensionApiCoverageSummary, inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { facadeToolRegistered, publicUtilitiesOnlyCapabilities } from "../src/facade-mode.ts";
import type { FacadeMode } from "../src/facade-mode.ts";
import { executeManagedLibraryFiles } from "../src/managed-library-files-runtime.ts";
// oxlint-disable-next-line import/max-dependencies -- This composition test checks the real registration, runtime, discovery and coverage together; splitting it would hide their contract.
import { managedLibraryFilesRequestSchema } from "../src/managed-library-files.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

const request = { action: "prepare-file", name: "registration.efoo",
  base64: Buffer.from('["DOCTYPE","FOOTPRINT","1.0"]\n["HEAD",{}]\n').toString("base64"), confirmLocalArtifact: true };
type Handler = (input: unknown) => Promise<unknown>;
async function registration(mode: FacadeMode): Promise<{ calls: unknown[]; invoke: Handler }> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_library_files",');
  const end = source.indexOf("\n);\n", start);
  const guardedStart = source.indexOf("function guarded<Input>(");
  const guardedEnd = source.indexOf("\nfunction serializedGuarded<Input>(", guardedStart);
  const registerStart = source.indexOf("function registerFacadeTool<InputArgs extends z.ZodRawShape>(");
  const registerEnd = source.indexOf("\nregisterFacadeTool(", registerStart);
  assert.ok(start > 0 && end > start && guardedStart > 0 && guardedEnd > guardedStart && registerStart > 0 && registerEnd > registerStart);
  const calls: unknown[] = []; let handler: Handler | undefined, inputSchema: z.ZodType | undefined;
  runInNewContext(stripTypeScriptTypes(`${source.slice(guardedStart, guardedEnd)}\n${source.slice(registerStart, registerEnd)}\n${source.slice(start, end + "\n);".length)}`), {
    z, managedLibraryFilesRequestSchema, facadeMode: mode, facadeToolRegistered,
    toolOutputSchemas: { easyeda_control_library_files: z.unknown() },
    success: (value: unknown): unknown => value,
    failure: (error: unknown): object => ({ failed: true, message: String(error) }),
    server: { registerTool: (name: string, config: { inputSchema: z.ZodRawShape; annotations: object; outputSchema: z.ZodType }, registeredHandler: Handler): void => {
      assert.equal(name, "easyeda_control_library_files"); assert.ok(config.outputSchema instanceof z.ZodType);
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false });
      inputSchema = z.object(config.inputSchema); handler = registeredHandler;
    } },
    executeManagedLibraryFiles: (input: unknown): Promise<unknown> => { calls.push(input); return executeManagedLibraryFiles(input); },
    // No engine, upstream, bridge gate or native runtime exists in this realm.
  });
  assert.ok(handler); assert.ok(inputSchema);
  const invoke = handler, schema = inputSchema;
  return { calls, invoke: async input => {
    const result = await invoke(schema.parse(input));
    return result;
  } };
}

void test("managed file tool prepares and extracts supplied bytes in every facade mode without app machinery", async () => {
  for (const mode of ["legacy-reviewed", "calculation-only", "public-utilities-only"] as const) {
    const tool = await registration(mode);
    const prepared = await tool.invoke({ request });
    assert.ok(isRecord(prepared) && isRecord(prepared["result"]));
    const result = prepared["result"]; assert.equal(result["localArtifactWritten"], true);
    assert.equal(result["offline"], true); assert.equal(result["publicSdkMethodExecuted"], false); assert.equal(result["installedRuntimeAdmission"], false);
    const extracted = await tool.invoke({ request: { action: "extract-library-info", files: [result["file"]] } });
    assert.ok(isRecord(extracted) && isRecord(extracted["result"]));
    assert.equal(extracted["result"]["metadataOnly"], true); assert.equal(extracted["result"]["designValidityVerified"], false);
    assert.equal(extracted["result"]["methodEquivalent"], "eda.sys_FileManager.extractLibInfo");
    assert.equal(tool.calls.length, 2);
  }
  const capabilities = publicUtilitiesOnlyCapabilities();
  assert.deepEqual(capabilities["libraryFiles"], { tool: "easyeda_control_library_files", runtimeAdmissionRequired: false,
    offline: true, implementation: "native-task-equivalent", localArtifactConfirmationRequired: true, publicSdkMethodExecuted: false, metadataOnly: true });
});

void test("strict registration refuses injected paths and mismatched actions before local publication", async () => {
  const tool = await registration("public-utilities-only");
  for (const invalid of [{ ...request, path: "/external.efoo" }, { ...request, confirmLocalArtifact: false },
    { ...request, name: "../source.efoo" }, { ...request, expectedFingerprint: {} }, { action: "import-library", files: [] }]) {
    await assert.rejects(tool.invoke({ request: invalid }));
  }
  assert.deepEqual(tool.calls, []);
  const failed = await tool.invoke({ request: { ...request, base64: "e30=" } });
  assert.ok(isRecord(failed)); assert.equal(failed["failed"], true); assert.equal(tool.calls.length, 1);
  assert.equal(JSON.stringify(failed).includes("e30="), false);
});

void test("offline discovery validates content without echoing it and coverage distinguishes managed-file authority", () => {
  const catalog = queryOfflineApi(apiRequestSchema.parse({ action: "library-files", query: { includeSchemas: true } }));
  assert.ok(isRecord(catalog.result)); assert.ok(isRecord(catalog.result["inputSchema"]));
  assert.equal(catalog.result["executionAuthorized"], false); assert.equal(catalog.result["publicSdkMethodExecuted"], false);
  const valid = queryOfflineApi(apiRequestSchema.parse({ action: "library-files-validate", query: { request } }));
  assert.ok(isRecord(valid.result) && isRecord(valid.result["requestSummary"]));
  assert.equal(valid.result["valid"], true); assert.equal(valid.result["executionAuthorized"], false);
  assert.equal(valid.result["requestSummary"]["base64Echoed"], false); assert.equal(JSON.stringify(valid).includes(request.base64), false);
  assert.equal(Object.hasOwn(valid.result, "request"), false);
  for (const method of ["extractLibInfo", "extractProjectInfo"]) {
    const entry = inventoryExtensionApiCoverage().find(row => row.path === `eda.sys_FileManager.${method}`); assert.ok(entry);
    assert.equal(entry.status, "implemented-native-equivalent"); assert.equal(entry.completeDeclaredContractSupported, false);
    assert.equal(entry.currentGenerationLiveValidation, "not-recorded"); assert.equal(entry.routes.length, 1);
    const route = entry.routes[0]; assert.ok(route);
    assert.equal(route.tool, "easyeda_control_library_files"); assert.equal(route.executionState, "available-with-managed-file-guards");
    assert.equal(route.implementation, "native-task-equivalent"); assert.ok(route.inputDiscovery);
    const discovery = queryOfflineApi(apiRequestSchema.parse(route.inputDiscovery.arguments["request"]));
    assert.ok(isRecord(discovery.result));
  }
  const summary = extensionApiCoverageSummary(); assert.ok(isRecord(summary["executionRoutes"]));
  assert.equal(summary["executionRoutes"]["available-with-managed-file-guards"], 2);
});
