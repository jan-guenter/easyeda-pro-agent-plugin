import assert from "node:assert/strict";
import { lstat, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { controlDataDirectory, createOperation, operationPath, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, newOperationId, sha256Json } from "../src/core.ts";
import { libraryExecutionLifecycleRefusal } from "../src/library-execution-lifecycle.ts";
import { libraryOperationSchema } from "../src/library-operations.ts";
// oxlint-disable-next-line import/max-dependencies -- Reuse the complete synthetic fingerprint alongside real MCP, storage and process-evidence checks.
import { fingerprint } from "./pcb-selected-objects-fixture.ts";

const cases = [
  { operation: { id: "symbol", action: "library.symbol.create", libraryUuid: "project", name: "Empty", symbolType: 2 }, phase: "symbol-create-prepared" },
  { operation: { id: "symbol", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { name: "Renamed" } }, phase: "symbol-prepared" },
  { operation: { id: "page", action: "document.page.create", schematic: { uuid: "parent" } }, phase: "page-create-prepared" },
  { operation: { id: "page", action: "document.page.rename", target: { uuid: "page" }, name: "Renamed" }, phase: "page-rename-prepared" },
  { operation: { id: "pcb", action: "document.pcb.create" }, phase: "pcb-create-prepared" },
  { operation: { id: "pcb", action: "document.pcb.rename", target: { uuid: "pcb" }, name: "Renamed" }, phase: "document-rename-prepared" },
  { operation: { id: "schematic", action: "document.schematic.create" }, phase: "schematic-create-prepared" },
  { operation: { id: "schematic", action: "document.schematic.rename", target: { uuid: "parent" }, name: "Renamed" }, phase: "document-rename-prepared" },
] as const;

/** New synthetic history only, sealed by the real isolated store. It does not
 * assert past CAD execution or authorize reading its placeholder project files.
 */
async function journal(entry: (typeof cases)[number], state: string, prefix = false, possibleDispatch = !prefix): Promise<{
  operationId: string; paths: string[]; bytes: Buffer[];
}> {
  const hash = "a".repeat(64), operationId = newOperationId();
  const context = { project: { uuid: "project", path: "/synthetic/never-open.eprj2" }, document: { uuid: "pcb", documentType: 3, tabId: "pcb@project" } };
  const operation = libraryOperationSchema.parse(entry.operation);
  const plan = { profile: "easyeda-pro-control.library-execution.v1", operation, expectedContext: context, expectedFingerprint: fingerprint() };
  const artifact = await writePhaseArtifact(operationId, 1, prefix ? "before" : entry.phase, { newSyntheticHistoricalEvidence: true });
  const value = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan), context, state,
    mutationState: prefix ? "before" : "after", saved: state === "completed", reopened: false, hardStop: !prefix,
    orphanedCallPossible: false, mutationMayHaveOccurred: possibleDispatch, nextSafeAction: "Synthetic retained advice; not current execution authority.",
    beforeSourceSha256: sha256Json("synthetic"), updatedAt: "2026-10-12T00:00:00Z", sequence: 1, artifacts: [artifact],
    preCheckpoint: { schema: "easyeda-pro-control.checkpoint.v2", createdAt: "2026-10-12T00:00:00Z", source: context.project.path,
      checkpoint: "/synthetic/never-read.sqlite", receiptPath: "/synthetic/never-read.json", sourceSha256: hash, checkpointSha256: hash,
      sourceDumpSha256: hash, checkpointDumpSha256: hash, receiptSha256: hash,
      sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" }, checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" } } };
  await createOperation(value);
  const paths = [value.journalPath, artifact.path];
  return { operationId, paths, bytes: await Promise.all(paths.map((path) => readFile(path))) };
}
function errorMessage(result: unknown): string {
  assert.ok(isRecord(result)); assert.equal(result["isError"], true);
  const content = result["structuredContent"]; assert.ok(isRecord(content));
  const error = content["error"]; assert.ok(isRecord(error));
  assert.equal(typeof error["message"], "string"); return String(error["message"]);
}

void test("retained library MCP reconciliation refuses or returns historical terminal evidence before connecting", async (suite) => {
  const pluginRoot = resolve(import.meta.dirname, "../.."), root = controlDataDirectory();
  const sentinel = join(root, "upstream-executed"), syntheticUpstream = join(root, "must-not-execute.mjs");
  await writeFile(syntheticUpstream, `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(sentinel)}, "unexpected execution");\n`);
  const transport = new StdioClientTransport({ command: process.execPath, args: [join(pluginRoot, "server", "src", "index.ts")], cwd: pluginRoot,
    env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_BRIDGE_TOKEN_FILE: join(root, "missing-key.json"), EASYEDA_UPSTREAM_DATA_DIR: join(root, "upstream-data"),
      EASYEDA_PCB_BUNDLE_VERSION: "3.2.149.5378b690", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.2.53.aee2f57a",
      EASYEDA_ASSETS_ROOT: join(root, "assets"), EASYEDA_UPSTREAM_COMMAND: process.execPath,
      EASYEDA_UPSTREAM_ARGS_JSON: JSON.stringify([syntheticUpstream]), EASYEDA_UPSTREAM_CWD: root }, stderr: "pipe" });
  const client = new Client({ name: "retained-library-preconnection-test", version: "1.0.0" }, { capabilities: {} });
  try {
    await client.connect(transport, { timeout: 15_000, maxTotalTimeout: 15_000 });
    const pid = transport.pid; assert.ok(pid !== null);
    const call = (request: Record<string, unknown>): ReturnType<Client["callTool"]> => client.callTool({ name: "easyeda_control_library", arguments: { request } }, undefined, { timeout: 10_000, maxTotalTimeout: 10_000 });
    const unchangedAndDisconnected = async (retained: Awaited<ReturnType<typeof journal>>): Promise<void> => {
      assert.deepEqual(await Promise.all(retained.paths.map((path) => readFile(path))), retained.bytes);
      const children: string = await readFile(`/proc/${pid}/task/${pid}/children`, "utf8"); assert.equal(children.trim(), "");
      const descriptors = await readdir(`/proc/${pid}/fd`);
      for (const descriptor of descriptors.filter((entry) => !["0", "1", "2"].includes(entry))) {
        let target: string;
        try { target = await readlink(`/proc/${pid}/fd/${descriptor}`); }
        catch (error) { if (isRecord(error) && error["code"] === "ENOENT") { target = ""; } else { throw error; } }
        assert.equal(target.startsWith("socket:"), false);
      }
      await assert.rejects(lstat(sentinel), { code: "ENOENT" });
    };
    await suite.test("exact missing-preparation prefix still requires normal connected admission and is not an offline invalidation", async () => {
      const retained = await journal(cases[2], "planned", true);
      for (const action of ["reconcile", "reconcile-no-mutation"]) {
        const message = errorMessage(await call({ action, operationId: retained.operationId }));
        assert.doesNotMatch(message, /project_structures|undispatched journal envelope/u);
        assert.match(message, /launcher|private|token|bridge|upstream/iu);
        await unchangedAndDisconnected(retained);
      }
    });
    for (const entry of cases) {
      await suite.test(`${entry.operation.action} potentially dispatched history refuses both reconciliation modes offline`, async () => {
        const retained = await journal(entry, "library-needs-review");
        for (const action of ["reconcile", "reconcile-no-mutation"]) {
          const message = errorMessage(await call({ action, operationId: retained.operationId }));
          assert.equal(message, `${entry.operation.action}: ${String(libraryExecutionLifecycleRefusal(entry.operation.action))}`);
          await unchangedAndDisconnected(retained);
        }
      });
      for (const state of ["completed", "rolled-back", "reconciled-no-mutation", "plan-invalidated"]) {
        await suite.test(`${entry.operation.action} terminal ${state} is offline history only`, async () => {
          const retained = await journal(entry, state);
          for (const action of ["inspect", "reconcile", "reconcile-no-mutation"]) {
            const result = await call({ action, operationId: retained.operationId });
            assert.notEqual(result.isError, true); assert.ok(isRecord(result.structuredContent));
            assert.equal(result.structuredContent["state"], state);
            assert.match(String(result.structuredContent["nextSafeAction"]), /^Inspect retained evidence only\./u);
            assert.equal(typeof result.structuredContent["retainedNextSafeAction"], "string");
            await unchangedAndDisconnected(retained);
          }
        });
      }
    }
    await suite.test("missing preparation plus a possible dispatch marker cannot claim the exact prefix exception", async () => {
      const retained = await journal(cases[2], "planned", true, true);
      assert.match(errorMessage(await call({ action: "reconcile", operationId: retained.operationId })), /exact undispatched journal envelope/u);
      await unchangedAndDisconnected(retained);
    });
    await suite.test("terminal retained artifact corruption still fails before any summary or connection", async () => {
      const retained = await journal(cases[0], "completed");
      const path = retained.paths[1]; assert.ok(path !== undefined);
      await writeFile(path, "corrupt synthetic artifact");
      assert.match(errorMessage(await call({ action: "reconcile", operationId: retained.operationId })), /phase artifact.*(size|hash)/u);
      const original = retained.bytes[1]; assert.ok(original); await writeFile(path, original);
      await unchangedAndDisconnected(retained);
    });
  } finally { await client.close().catch(() => null); await transport.close().catch(() => null); }
});
