import assert from "node:assert/strict";
import { lstat, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { controlDataDirectory, createOperation, operationPath, writePhaseArtifact } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, newOperationId, sha256Json } from "../src/core.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";

async function journal(documentType: number, state: string, currentType = documentType): Promise<{
  operationId: string; paths: string[]; bytes: Buffer[];
}> {
  const operationId = newOperationId();
  const context = { project: { uuid: "synthetic-project", path: "/synthetic/never-open.eprj2" },
    document: { uuid: "document", documentType, tabId: "document@synthetic-project" } };
  let operation: Record<string, unknown>;
  if (documentType === 4) { operation = { id: "text", action: "footprint.text.delete", target: { primitiveId: "text" } }; }
  else if (documentType === 3) { operation = { id: "text", action: "pcb.text.modify", target: { primitiveId: "a".repeat(16) }, patch: { x: 1 } }; }
  else { operation = { id: "text", action: "sch.text.modify", documentType, target: { primitiveId: "text" }, patch: { x: 1 } }; }
  const plan = { profile: "easyeda-pro-control.typed-design-transaction.v1", operation, expectedContext: context, expectedFingerprint: {} };
  const source = { schema: "easyeda-pro-control.document-source.v1", document: { uuid: "document", docType: "PCB" }, objects: [] };
  const artifact = await writePhaseArtifact(operationId, 1, "before", { synthetic: true });
  const value = { schema: OPERATION_SCHEMA, operationId, journalPath: operationPath(operationId), plan, planHash: buildPlanHash(plan),
    context: { ...context, document: { ...context.document, documentType: currentType } }, state,
    mutationState: "after", saved: state === "completed", reopened: state === "completed", hardStop: false, orphanedCallPossible: false,
    mutationMayHaveOccurred: true, nextSafeAction: "Synthetic historical advice only.", before: { ...source, sha256: sha256Json(source) },
    preCheckpoint: { receiptPath: "/synthetic/never-read.json" }, sequence: 1, artifacts: [artifact] };
  await createOperation(value);
  const paths = [value.journalPath, artifact.path];
  return { operationId, paths, bytes: await Promise.all(paths.map((path) => readFile(path))) };
}

void test("retained design MCP actions refuse or return terminal evidence before connecting", async (suite) => {
  const pluginRoot = resolve(import.meta.dirname, "../.."), root = controlDataDirectory();
  const sentinel = join(root, "upstream-executed"), syntheticUpstream = join(root, "must-not-execute.mjs");
  await writeFile(syntheticUpstream, `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(sentinel)}, "unexpected execution");\n`);
  const transport = new StdioClientTransport({ command: process.execPath, args: [join(pluginRoot, "server", "src", "index.ts")], cwd: pluginRoot,
    env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_BRIDGE_TOKEN_FILE: join(root, "missing-key.json"), EASYEDA_UPSTREAM_DATA_DIR: join(root, "upstream-data"),
      EASYEDA_ASSETS_ROOT: join(root, "assets"), EASYEDA_UPSTREAM_COMMAND: process.execPath,
      EASYEDA_UPSTREAM_ARGS_JSON: JSON.stringify([syntheticUpstream]), EASYEDA_UPSTREAM_CWD: root }, stderr: "pipe" });
  const client = new Client({ name: "retained-design-preconnection-test", version: "1.0.0" }, { capabilities: {} });
  try {
    await client.connect(transport, { timeout: 15_000, maxTotalTimeout: 15_000 });
    const pid = transport.pid; assert.ok(pid !== null);
    const call = (request: Record<string, unknown>): ReturnType<Client["callTool"]> => client.callTool({ name: "easyeda_control_design", arguments: { request } }, undefined, { timeout: 10_000, maxTotalTimeout: 10_000 });
    const offline = async (retained: Awaited<ReturnType<typeof journal>>): Promise<void> => {
      assert.deepEqual(await Promise.all(retained.paths.map((path) => readFile(path))), retained.bytes);
      const children = await readFile(`/proc/${pid}/task/${pid}/children`, "utf8"); assert.equal(children.trim(), "");
      const descriptors = await readdir(`/proc/${pid}/fd`);
      for (const descriptor of descriptors.filter((entry) => !["0", "1", "2"].includes(entry))) {
        let target: string;
        try { target = await readlink(`/proc/${pid}/fd/${descriptor}`); }
        catch (error) { if (isRecord(error) && error["code"] === "ENOENT") { target = ""; } else { throw error; } }
        assert.equal(target.startsWith("socket:"), false);
      }
      await assert.rejects(lstat(sentinel), { code: "ENOENT" });
    };
    for (const documentType of [1, 2, 3]) {
      for (const [expectedType, currentType] of [[documentType, documentType], [documentType, 4], [4, documentType]] as const) {
        await suite.test(`both retained contexts are checked: expected ${String(expectedType)}, current ${String(currentType)}`, async () => {
          const retained = await journal(expectedType, "applied-unsaved", currentType);
          for (const action of ["commit", "rollback", "reconcile", "repair-layout-net-labels", "repair-layout-wire-groups", "repair-layout-label-visibility"]) {
            const result = await call({ action, operationId: retained.operationId, ...(action === "reconcile" ? {} : { confirmWrite: true }) });
            assert.equal(result.isError, true); assert.ok(isRecord(result.structuredContent), JSON.stringify(result));
            const error = result.structuredContent["error"]; assert.ok(isRecord(error));
            assert.equal(error["message"], DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
            await offline(retained);
          }
        });
      }
      for (const state of ["completed", "rolled-back", "reconciled-no-mutation", "plan-invalidated"]) {
        await suite.test(`terminal ${state} type ${String(documentType)} remains offline and byte-exact`, async () => {
          const retained = await journal(documentType, state);
          const inspected = await call({ action: "inspect", operationId: retained.operationId });
          const reconciled = await call({ action: "reconcile", operationId: retained.operationId });
          assert.notEqual(inspected.isError, true); assert.notEqual(reconciled.isError, true);
          assert.deepEqual(reconciled.structuredContent, inspected.structuredContent);
          await offline(retained);
        });
      }
    }
    await suite.test("artifact tampering still fails before terminal summary or connection", async () => {
      const retained = await journal(3, "completed");
      const path = retained.paths[1]; assert.ok(path !== undefined);
      await writeFile(path, "tampered synthetic evidence");
      const result = await call({ action: "reconcile", operationId: retained.operationId });
      assert.equal(result.isError, true); assert.ok(isRecord(result.structuredContent));
      const error = result.structuredContent["error"]; assert.ok(isRecord(error));
      assert.match(String(error["message"]), /phase artifact.*(hash|size)/u);
      const before = retained.bytes[1]; assert.ok(before); await writeFile(path, before);
      await offline(retained);
    });
    await suite.test("retained footprint actions still require the independent runtime admission", async () => {
      const retained = await journal(4, "applied-unsaved");
      for (const action of ["commit", "rollback", "reconcile"]) {
        const result = await call({ action, operationId: retained.operationId, ...(action === "reconcile" ? {} : { confirmWrite: true }) });
        assert.equal(result.isError, true); assert.ok(isRecord(result.structuredContent));
        const error = result.structuredContent["error"]; assert.ok(isRecord(error));
        assert.match(String(error["message"]), /Configured upstream.*reviewed launcher/u);
        await offline(retained);
      }
    });
  } finally { await client.close().catch(() => null); await transport.close().catch(() => null); }
});
