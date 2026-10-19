import assert from "node:assert/strict";
import { lstat, readFile, readdir, readlink, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { createTestTemporaryDirectory } from "./helpers/temporary-directory.ts";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { isRecord } from "../src/core.ts";
import { DESIGN_STRUCTURE_LIFECYCLE_REFUSAL } from "../src/design-execution-lifecycle.ts";
import { libraryExecutionLifecycleRefusal } from "../src/library-execution-lifecycle.ts";
// oxlint-disable-next-line import/max-dependencies -- This process-bound integration test also uses the shared canonical temporary-root helper.
import { context, fingerprint } from "./pcb-selected-objects-fixture.ts";

const libraryOperations = [
  { id: "symbol-create", action: "library.symbol.create", libraryUuid: "project", name: "Empty", symbolType: 2 },
  { id: "symbol-modify", action: "library.symbol.modify", libraryUuid: "project", target: { uuid: "symbol" }, patch: { name: "New name" } },
  { id: "page-create", action: "document.page.create", schematic: { uuid: "parent" } },
  { id: "page-rename", action: "document.page.rename", target: { uuid: "page" }, name: "New name" },
  { id: "pcb-create", action: "document.pcb.create" },
  { id: "pcb-rename", action: "document.pcb.rename", target: { uuid: "pcb" }, name: "New name" },
  { id: "schematic-create", action: "document.schematic.create" },
  { id: "schematic-rename", action: "document.schematic.rename", target: { uuid: "parent" }, name: "New name" },
] as const;

function failureMessage(result: unknown): string {
  assert.ok(isRecord(result)); assert.equal(result["isError"], true);
  const payload = result["structuredContent"]; assert.ok(isRecord(payload), JSON.stringify(result));
  const error = payload["error"]; assert.ok(isRecord(error));
  assert.equal(typeof error["message"], "string"); return String(error["message"]);
}

async function assertOffline(root: string, pid: number, allowEmptyOperationDirectory = false): Promise<void> {
  const control = join(root, "control");
  const lease: unknown = JSON.parse(await readFile(join(control, "facade.lock"), "utf8"));
  assert.ok(isRecord(lease)); assert.equal(lease["pid"], pid);
  assert.equal(Object.hasOwn(lease, "childPid"), false);
  const entries = await readdir(control);
  assert.deepEqual(entries.toSorted(), allowEmptyOperationDirectory ? ["facade.lock", "operations"] : ["facade.lock"]);
  if (allowEmptyOperationDirectory) { assert.deepEqual(await readdir(join(control, "operations")), []); }
  await assert.rejects(lstat(join(root, "upstream-executed")), { code: "ENOENT" });
  const children = await readFile(`/proc/${pid}/task/${pid}/children`, "utf8");
  assert.equal(children.trim(), "");
  const descriptors = await readdir(`/proc/${pid}/fd`);
  for (const descriptor of descriptors.filter((entry) => !["0", "1", "2"].includes(entry))) {
    // Libuv can use UNIX socketpairs for stdio; only extra sockets are forbidden.
    let target: string;
    try { target = await readlink(`/proc/${pid}/fd/${descriptor}`); }
    catch (error) {
      if (isRecord(error) && error["code"] === "ENOENT") { target = ""; }
      else { throw error; }
    }
    assert.equal(target.startsWith("socket:"), false, `Unexpected socket on fd ${descriptor}`);
  }
}

void test("actual MCP lifecycle refusals precede connection without launching upstream or publishing journals", async (suite) => {
  const root = await createTestTemporaryDirectory("easyeda-lifecycle-preconnection-");
  const pluginRoot = resolve(import.meta.dirname, "../..");
  const syntheticUpstream = join(root, "must-not-execute.mjs");
  await writeFile(syntheticUpstream, `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(join(root, "upstream-executed"))}, "unexpected execution");\n`);
  // The synthetic unreviewed launcher and absent private key also prevent a
  // Regressed connection from acquiring a gateway or any real upstream authority.
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [join(pluginRoot, "server", "src", "index.ts")], cwd: pluginRoot,
    env: { EASYEDA_CONTROL_DATA_DIR: join(root, "control"), EASYEDA_BRIDGE_TOKEN_FILE: join(root, "missing-key.json"),
      EASYEDA_UPSTREAM_DATA_DIR: join(root, "upstream-data"), EASYEDA_ASSETS_ROOT: join(root, "assets"),
      EASYEDA_PCB_BUNDLE_VERSION: "3.2.149.5378b690", EASYEDA_PUBLIC_API_BUNDLE_VERSION: "0.2.53.aee2f57a",
      EASYEDA_UPSTREAM_COMMAND: process.execPath, EASYEDA_UPSTREAM_ARGS_JSON: JSON.stringify([syntheticUpstream]), EASYEDA_UPSTREAM_CWD: root },
    stderr: "pipe" });
  const client = new Client({ name: "lifecycle-preconnection-test", version: "1.0.0" }, { capabilities: {} });
  try {
    await client.connect(transport, { timeout: 15_000, maxTotalTimeout: 15_000 });
    const pid = transport.pid; assert.ok(pid !== null);
    const expectedFingerprint = fingerprint();
    const facadeImplementation = expectedFingerprint["facadeImplementation"]; assert.ok(isRecord(facadeImplementation));
    // The compiler fixture includes the manifest's count, not a wire field.
    delete facadeImplementation["fileCount"];
    const call = (name: string, request: Record<string, unknown>): ReturnType<Client["callTool"]> =>
      client.callTool({ name, arguments: { request } }, undefined, { timeout: 10_000, maxTotalTimeout: 10_000 });
    await assertOffline(root, pid);
    for (const operation of libraryOperations) {
      await suite.test(`${operation.action} refuses before connection`, async () => {
        const result = await call("easyeda_control_library", { action: "execute", operation, expectedContext: context, expectedFingerprint, confirmWrite: true });
        await assertOffline(root, pid);
        assert.equal(failureMessage(result), `${operation.action}: ${String(libraryExecutionLifecycleRefusal(operation.action))}`);
      });
    }
    for (const documentType of [1, 2, 3]) {
      const operation = documentType === 3
        ? { id: "pcb-text", action: "pcb.text.modify", target: { primitiveId: "a".repeat(16) }, patch: { x: 1 } }
        : { id: "sch-text", action: "sch.text.modify", documentType, target: { primitiveId: "text" }, patch: { x: 1 } };
      for (const action of ["apply", "execute"]) {
        for (const contextType of [documentType, 4]) {
          await suite.test(`design ${action} type ${String(documentType)} refuses with context ${String(contextType)}`, async () => {
            const expectedContext = { ...context, document: { ...context.document, documentType: contextType } };
            const result = await call("easyeda_control_design", { action, operation, expectedContext, expectedFingerprint, confirmWrite: true });
            await assertOffline(root, pid);
            assert.equal(failureMessage(result), contextType === documentType ? DESIGN_STRUCTURE_LIFECYCLE_REFUSAL : "Wrong editor for design action.");
          });
        }
      }
    }
    await suite.test("capabilities remain offline and malformed requests retain schema refusal", async () => {
      for (const name of ["easyeda_control_library", "easyeda_control_design"]) {
        const capabilities = await call(name, { action: "capabilities" });
        assert.notEqual(capabilities.isError, true);
        const result = await call(name, { action: "execute", operation: { ...libraryOperations[0], lifecycleProved: true },
          expectedContext: context, expectedFingerprint: {}, confirmWrite: true });
        assert.equal(result.isError, true);
        assert.match(JSON.stringify(result.content), /Input validation error/u);
        await assertOffline(root, pid);
      }
    });
    await suite.test("exact footprint type 4 still reaches independent runtime admission, not a global design refusal", async () => {
      const result = await call("easyeda_control_design", { action: "apply",
        operation: { id: "footprint-text", action: "footprint.text.delete", target: { primitiveId: "text" } },
        expectedContext: { ...context, document: { ...context.document, documentType: 4 } }, expectedFingerprint, confirmWrite: true });
      const message = failureMessage(result);
      assert.match(message, /upstream|launcher|EASYEDA/iu);
      assert.notEqual(message, DESIGN_STRUCTURE_LIFECYCLE_REFUSAL);
      await assertOffline(root, pid, true);
    });
  } finally {
    await client.close().catch(() => null); await transport.close().catch(() => null);
    await rm(root, { recursive: true, force: true });
  }
});
