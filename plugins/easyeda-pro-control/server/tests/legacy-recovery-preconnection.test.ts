import assert from "node:assert/strict";
import { lstat, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { controlDataDirectory, createOperation, operationPath } from "../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, isRecord, newOperationId } from "../src/core.ts";
import { LEGACY_RECOVERY_FAMILY_REFUSAL } from "../src/legacy-recovery-family.ts";

async function assertOffline(pid: number, sentinel: string): Promise<void> {
  const children: string = await readFile(`/proc/${pid}/task/${pid}/children`, "utf8");
  assert.equal(children.trim(), "");
  const descriptors = await readdir(`/proc/${pid}/fd`);
  for (const descriptor of descriptors.filter((entry) => !["0", "1", "2"].includes(entry))) {
    let target: string;
    try { target = await readlink(`/proc/${pid}/fd/${descriptor}`); }
    catch (error) { if (isRecord(error) && error["code"] === "ENOENT") { target = ""; } else { throw error; } }
    assert.equal(target.startsWith("socket:"), false);
  }
  await assert.rejects(lstat(sentinel), { code: "ENOENT" });
}

void test("actual legacy MCP endpoint refuses typed journal families offline without rewriting retained evidence", async (suite) => {
  const pluginRoot = resolve(import.meta.dirname, "../.."), root = controlDataDirectory();
  const sentinel = join(root, "upstream-executed"), syntheticUpstream = join(root, "must-not-execute.mjs");
  const journals: { operationId: string; profile: string | undefined; state: string; documentType: number; bytes: Buffer }[] = [];
  for (const profile of ["easyeda-pro-control.typed-design-transaction.v1", "easyeda-pro-control.library-execution.v1",
    "easyeda-pro-control.rule-check-transaction.v1", "easyeda-pro-control.project-open.v1", "unknown-profile", undefined]) {
    for (const state of ["apply-outcome-unknown", "applied-unsaved", "commit-needs-recovery", "completed"]) {
      for (const documentType of [3, 4]) {
        const operationId = newOperationId(), plan = { ...(profile === undefined ? {} : { profile }), expectedContext: { document: { documentType } } };
        await createOperation({ schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan),
          state, context: plan.expectedContext, sequence: 0, artifacts: [], orphanedCallPossible: false });
        journals.push({ operationId, profile, state, documentType, bytes: await readFile(operationPath(operationId)) });
      }
    }
  }
  await writeFile(syntheticUpstream, `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(sentinel)}, "unexpected execution");\n`);
  const transport = new StdioClientTransport({ command: process.execPath, args: [join(pluginRoot, "server", "src", "index.ts")], cwd: pluginRoot,
    env: { EASYEDA_CONTROL_DATA_DIR: root, EASYEDA_BRIDGE_TOKEN_FILE: join(root, "missing-key.json"),
      EASYEDA_UPSTREAM_DATA_DIR: join(root, "upstream-data"), EASYEDA_ASSETS_ROOT: join(root, "assets"),
      EASYEDA_UPSTREAM_COMMAND: process.execPath, EASYEDA_UPSTREAM_ARGS_JSON: JSON.stringify([syntheticUpstream]), EASYEDA_UPSTREAM_CWD: root }, stderr: "pipe" });
  const client = new Client({ name: "legacy-recovery-preconnection-test", version: "1.0.0" }, { capabilities: {} });
  try {
    await client.connect(transport, { timeout: 15_000, maxTotalTimeout: 15_000 });
    const pid = transport.pid; assert.ok(pid !== null);
    const entries = await readdir(join(root, "operations"));
    for (const journal of journals) {
      await suite.test(`${journal.profile ?? "malformed-no-profile"} ${journal.state} type ${String(journal.documentType)}`, async () => {
        for (const resolution of ["reconciled-no-mutation", "reconciled-applied-unsaved", "reconciled-saved-reopened"]) {
          const result = await client.callTool({ name: "easyeda_control_recover_incomplete", arguments: {
            operationId: journal.operationId, resolution, confirmation: `${journal.operationId}:${resolution}`,
            confirmDiscardAnyUnsavedState: true, confirmRepeatAfterUnknownRecovery: true,
          } }, undefined, { timeout: 10_000, maxTotalTimeout: 10_000 });
          assert.equal(result.isError, true); assert.ok(isRecord(result.structuredContent));
          const error = result.structuredContent["error"]; assert.ok(isRecord(error));
          assert.equal(error["message"], LEGACY_RECOVERY_FAMILY_REFUSAL);
          assert.deepEqual(await readFile(operationPath(journal.operationId)), journal.bytes);
          assert.deepEqual(await readdir(join(root, "operations")), entries);
          await assertOffline(pid, sentinel);
        }
      });
    }
  } finally { await client.close().catch(() => null); await transport.close().catch(() => null); }
});
