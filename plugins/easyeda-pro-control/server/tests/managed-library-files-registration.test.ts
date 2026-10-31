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
import { managedProjectFootprintArchive } from "./helpers/managed-project-footprint-archive.ts";
import { managedLibraryArchiveFixture } from "./helpers/managed-library-archive.ts";

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
    offline: true, implementation: "native-task-equivalent", localArtifactConfirmationRequired: true, publicSdkMethodExecuted: false,
    metadataOnly: false, suppliedFootprintSourceExtraction: true });
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

void test("registered library archive actions inspect complete supplied footprint and symbol source in every mode", async () => {
  for (const mode of ["legacy-reviewed", "calculation-only", "public-utilities-only"] as const) {
    for (const docType of [4, 2] as const) {
      const fixture = managedLibraryArchiveFixture(docType); const tool = await registration(mode);
      const prepared = await tool.invoke({ request: { action: "prepare-file", name: "Supplied.elibz2", base64: fixture.archive.toString("base64"), confirmLocalArtifact: true } });
      assert.ok(isRecord(prepared) && isRecord(prepared["result"]));
      const file = prepared["result"]["file"];
      const extracted = await tool.invoke({ request: { action: "extract-library-archive-sources", file } });
      assert.ok(isRecord(extracted) && isRecord(extracted["result"]));
      assert.equal(extracted["result"]["sourceCount"], 1); assert.equal(extracted["result"]["libraryArchiveRecordFramingValidated"], true);
      const bound = { file, expectedSourceSetSha256: extracted["result"]["sourceSetSha256"] };
      const roster = await tool.invoke({ request: { action: "list-library-archive-sources", ...bound } });
      assert.ok(isRecord(roster) && isRecord(roster["result"]));
      const entries = roster["result"]["sources"]; assert.ok(Array.isArray(entries) && isRecord(entries[0]));
      assert.equal(entries[0]["docType"], docType); assert.equal(Object.hasOwn(entries[0], "documentSource"), false);
      const raw = await tool.invoke({ request: { action: "read-library-archive-source", ...bound, sourceId: entries[0]["sourceId"] } });
      assert.ok(isRecord(raw) && isRecord(raw["result"]));
      assert.equal(raw["result"]["documentSource"], fixture.source); assert.equal(raw["result"]["symbolSubtypeVerified"], false);
      assert.equal(raw["result"]["publicSdkMethodExecuted"], false); assert.equal(raw["result"]["installedRuntimeAdmission"], false);
      assert.equal(raw["result"]["cadFramingValidated"], false); assert.equal(tool.calls.length, 4);
      for (const action of ["export-system-library-file", "inspect-library-archive-symbol-pins", "import-library-archive"]) {
        await assert.rejects(tool.invoke({ request: { action, ...bound, sourceId: entries[0]["sourceId"] } }));
      }
      assert.equal(tool.calls.length, 4);
    }
  }
});

void test("registered tool reads current combined project sources and raw schematic/PCB reports in every mode", async () => {
  const source = '{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","uuid":"1234567890abcdef"}|\n' +
    '{"type":"COMPONENT","id":"component"}||{"symbol":"unresolved","x":0}|\n' +
    '{"type":"DOCHEAD"}||{"docType":"PCB","uuid":"abcdef1234567890"}|\n' +
    '{"type":"LAYER","id":"layer"}||{"physicalLayer":1,"future":"preserved"}|\n';
  const archive = managedProjectFootprintArchive([{ name: "project2.json", content: '{"title":"Combined fixture"}' },
    { name: "Combined.epru", content: source }]);
  for (const mode of ["legacy-reviewed", "calculation-only", "public-utilities-only"] as const) {
    const tool = await registration(mode);
    const prepared = await tool.invoke({ request: { action: "prepare-file", name: "Combined.epro2", base64: archive.toString("base64"), confirmLocalArtifact: true } });
    assert.ok(isRecord(prepared) && isRecord(prepared["result"]));
    const file = prepared["result"]["file"];
    const extracted = await tool.invoke({ request: { action: "extract-project-document-sources", file } });
    assert.ok(isRecord(extracted) && isRecord(extracted["result"]));
    assert.equal(extracted["result"]["documentCount"], 2);
    const bound = { file, expectedSourceSetSha256: extracted["result"]["sourceSetSha256"] };
    const roster = await tool.invoke({ request: { action: "list-project-document-sources", ...bound } });
    assert.ok(isRecord(roster) && isRecord(roster["result"]));
    const items = roster["result"]["sources"]; assert.ok(Array.isArray(items) && isRecord(items[0]) && isRecord(items[1]));
    const schematic = await tool.invoke({ request: { action: "inspect-schematic-records", ...bound, sourceId: items[0]["sourceId"] } });
    assert.ok(isRecord(schematic) && isRecord(schematic["result"]));
    assert.equal(schematic["result"]["connectivityCompiled"], false); assert.equal(schematic["result"]["totalRecognizedRecords"], 1);
    const pcbRequest = { action: "inspect-pcb-stack-rules", ...bound, sourceId: items[1]["sourceId"], section: "stack" };
    const valid = queryOfflineApi(apiRequestSchema.parse({ action: "library-files-validate", query: { request: pcbRequest } }));
    assert.ok(isRecord(valid.result)); assert.equal(valid.result["valid"], true);
    const pcb = await tool.invoke({ request: pcbRequest }); assert.ok(isRecord(pcb) && isRecord(pcb["result"]));
    assert.equal(pcb["result"]["totalSelectedRecords"], 1); assert.equal(pcb["result"]["effectiveRulesEvaluated"], false);
    assert.equal(pcb["result"]["installedRuntimeAdmission"], false); assert.equal(pcb["result"]["publicSdkMethodExecuted"], false);
    const raw = await tool.invoke({ request: { action: "read-project-document-source", ...bound, sourceId: items[0]["sourceId"] } });
    assert.ok(isRecord(raw) && isRecord(raw["result"])); assert.equal(raw["result"]["documentType"], "SCH_PAGE");
    await assert.rejects(tool.invoke({ request: { ...pcbRequest, section: "effective" } }));
    assert.equal(tool.calls.length, 6);
  }
});

void test("registered tool lists unknown footprint UUIDs and reads their sources in every mode without an artifact reader", async () => {
  const other = "fedcba0987654321", uuid = "1234567890abcdef";
  const archive = managedProjectFootprintArchive([{ name: "project2.json", content: '{"title":"Supplied fixture"}' },
    { name: `${uuid}.efoo`, content: "first opaque source\r\n" }, { name: `${other}.efoo`, content: "second opaque source\r\n" }]);
  for (const mode of ["legacy-reviewed", "calculation-only", "public-utilities-only"] as const) {
    const tool = await registration(mode);
    const prepared = await tool.invoke({ request: { action: "prepare-file", name: "Enumeration.epro2", base64: archive.toString("base64"), confirmLocalArtifact: true } });
    assert.ok(isRecord(prepared) && isRecord(prepared["result"]));
    const file = prepared["result"]["file"];
    const extracted = await tool.invoke({ request: { action: "extract-project-footprint-sources", file } });
    assert.ok(isRecord(extracted) && isRecord(extracted["result"]));
    const expectedSourceSetSha256 = extracted["result"]["sourceSetSha256"];
    const requestList = { action: "list-project-footprint-sources", file, expectedSourceSetSha256, length: 1 };
    const offline = queryOfflineApi(apiRequestSchema.parse({ action: "library-files-validate", query: { request: requestList } }));
    assert.ok(isRecord(offline.result)); assert.equal(offline.result["valid"], true);
    const roster = await tool.invoke({ request: requestList });
    assert.ok(isRecord(roster) && isRecord(roster["result"]));
    const page = roster["result"]; assert.equal(page["endOfRoster"], false); assert.equal(page["nextOffset"], 1);
    assert.ok(Array.isArray(page["sources"]) && isRecord(page["sources"][0]));
    const selected = page["sources"][0]; assert.equal(selected["footprintUuid"], uuid);
    assert.equal(Object.hasOwn(selected, "documentSource"), false);
    const last = await tool.invoke({ request: { ...requestList, offset: page["nextOffset"] } });
    assert.ok(isRecord(last) && isRecord(last["result"])); assert.equal(last["result"]["endOfRoster"], true);
    const source = await tool.invoke({ request: { action: "read-project-footprint-source", file, expectedSourceSetSha256, footprintUuid: selected["footprintUuid"] } });
    assert.ok(isRecord(source) && isRecord(source["result"])); assert.equal(source["result"]["documentSource"], "first opaque source\r\n");
    assert.equal(source["result"]["publicSdkMethodExecuted"], false); assert.equal(tool.calls.length, 5);
  }
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
  for (const method of ["extractLibInfo", "extractProjectInfo", "getDocumentFootprintSources"]) {
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
  assert.equal(summary["executionRoutes"]["available-with-managed-file-guards"], 3);
});
