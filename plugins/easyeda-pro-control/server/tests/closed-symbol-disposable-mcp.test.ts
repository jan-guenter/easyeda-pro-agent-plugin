import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { ChildProcess, SpawnOptions } from "node:child_process";
import { lstat, mkdtemp, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { isRecord, sha256Text } from "../src/core.ts";
import { closedSymbolDisposableOutputSchema } from "../src/closed-symbol-disposable-tool.ts";
// eslint-disable-next-line import/max-dependencies -- Reuse the exact ordinary result parser in the existing SDK boundary test.
import { closedSymbolOperationOutputSchema } from "../src/closed-symbol-operation-tool.ts";
import { requestData } from "./helpers/disposable-tool-data.ts";
import { assertTestIsolation } from "../../scripts/test-isolation.ts";

const tool = "easyeda_control_validate_closed_symbol";
interface ClientErrorObservation {
  readonly sequence: number; readonly phase: string;
  readonly kind: "buffer-limit" | "parser-after-discard" | "unexpected";
  readonly message: string; readonly messageTruncated: boolean;
  readonly chunkNumber: number; readonly chunkBytes: number; readonly chunkHasNewline: boolean;
  readonly stdoutBytes: number; readonly completeLines: number; readonly priorOverflowObserved: boolean;
}
interface OfflineFixture {
  readonly client: Client;
  readonly call: (name: string, args: Record<string, unknown>) => ReturnType<Client["callTool"]>;
  readonly listTools: () => ReturnType<Client["listTools"]>;
  readonly catalogObservation: () => Readonly<{ completeLines: number; largestLineBytes: number; stdoutBytes: number }>;
  readonly runtimeStatus: () => Promise<unknown>;
  readonly unchangedAndOffline: () => Promise<void>;
}
async function bounded<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    // eslint-disable-next-line promise/avoid-new -- Bridge one deadline timer to rejection while preserving the original async operation.
    return await Promise.race([promise, new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => { reject(new Error("Owned index test child did not settle within its bound.")); }, milliseconds);
    })]);
  } finally { if (timer !== undefined) { clearTimeout(timer); } }
}
async function fixture(context: TestContext, scenario: "seeded" | "missing-assets" | "invalid-assets" | "ordinary-history" | "copy-history",
  catalogOverflowControl = false): Promise<OfflineFixture> {
  assert.equal(process.versions.node, "24.18.0");
  const parentIdentity = await assertTestIsolation(), parentRoot = parentIdentity.directory;
  const reports = await mkdtemp(join(parentRoot, "index-case-"));
  const pluginRoot = resolve(import.meta.dirname, "../.."), preload = join(pluginRoot, "scripts/test-isolation.ts");
  const entry = join(pluginRoot, "server/tests/helpers/disposable-index-child.ts");
  const expectedArgs = ["--import", preload, entry, scenario];
  const originalSpawn = childProcess.spawn;
  let child: ChildProcess | undefined, processCalls = 0, stderr = "", stderrOverflow = false;
  let completeLines = 0, largestLineBytes = 0, pendingLineBytes = 0, stdoutBytes = 0;
  let activePhase = "connect", clientErrors = 0, firstClientError: unknown, firstErrorPhase: string | null = null;
  let chunkBytes = 0, chunkHasNewline = false, chunksObserved = 0, errorListOverflow = false, overflowObserved = false;
  const errorRecords: { original: Error; observation: Readonly<ClientErrorObservation> }[] = [];
  const catalogCapBytes = catalogOverflowControl ? 65_536 : 1_048_576;
  const { promise: closed, resolve: resolveClose } = Promise.withResolvers<{ code: number | null; signal: NodeJS.Signals | null }>();
  context.mock.method(childProcess, "spawn", (command: string, args: readonly string[], options: SpawnOptions): ChildProcess => {
    assert.equal(command, process.execPath); assert.deepEqual(args, expectedArgs); assert.equal(options.cwd, pluginRoot);
    assert.equal(options.shell, false); assert.equal(processCalls, 0); processCalls += 1;
    const returned = originalSpawn(command, args, options); child = returned;
    returned.once("close", (code, signal) => { resolveClose({ code, signal }); });
    assert.ok(returned.stdout !== null);
    returned.stdout.on("data", (value: Buffer) => {
      stdoutBytes += value.length;
      chunkBytes = value.length; chunkHasNewline = value.includes(10); chunksObserved += 1;
      let newline = value.indexOf(10), start = 0;
      while (newline >= 0) {
        completeLines += 1;
        largestLineBytes = Math.max(largestLineBytes, pendingLineBytes + newline - start + 1);
        pendingLineBytes = 0; start = newline + 1; newline = value.indexOf(10, start);
      }
      pendingLineBytes += value.length - start;
    });
    return returned;
  });
  syncBuiltinESMExports();
  const transport = new StdioClientTransport({ command: process.execPath, args: expectedArgs, cwd: pluginRoot,
    env: { NODE_NO_WARNINGS: "1", TMPDIR: parentIdentity.temporaryDirectory,
      EASYEDA_INDEX_TEST_PARENT_ROOT: JSON.stringify(parentIdentity), EASYEDA_INDEX_TEST_REPORT_DIRECTORY: reports }, stderr: "pipe", maxBufferSize: catalogCapBytes });
  transport.stderr?.on("data", (value: Buffer) => {
    if (Buffer.byteLength(stderr) + value.length > 32_768) { stderrOverflow = true; }
    else { stderr += value.toString("utf8"); }
  });
  const client = new Client({ name: "disposable-index-offline", version: "1.0.0" }, { capabilities: {} });
  // eslint-disable-next-line unicorn/prefer-add-event-listener -- The actual SDK exposes this callback property, not a DOM EventTarget.
  client.onerror = (error): void => {
    if (clientErrors === 0) { firstClientError = error; firstErrorPhase = activePhase; }
    clientErrors += 1;
    if (errorRecords.length === 8) { errorListOverflow = true; return; }
    let kind: ClientErrorObservation["kind"] = "unexpected";
    if (error.message === "ReadBuffer exceeded maximum size of 65536 bytes") { kind = "buffer-limit"; }
    else if (error instanceof SyntaxError && overflowObserved && chunkHasNewline) { kind = "parser-after-discard"; }
    errorRecords.push({ original: error, observation: Object.freeze({
      sequence: clientErrors, phase: activePhase, kind, message: error.message.slice(0, 2048),
      messageTruncated: error.message.length > 2048, chunkNumber: chunksObserved, chunkBytes, chunkHasNewline,
      stdoutBytes, completeLines, priorOverflowObserved: overflowObserved,
    }) });
    if (kind === "buffer-limit") { overflowObserved = true; }
  };
  context.after(async () => {
    const cleanupErrors: unknown[] = [];
    try { await bounded(client.close(), 6000); } catch (error) { cleanupErrors.push(error); }
    try { await bounded(transport.close(), 6000); } catch (error) { cleanupErrors.push(error); }
    const outcome = await bounded(closed, 10_000);
    const diagnostic = { scenario, catalogOverflowControl, catalogCapBytes, activePhase, clientErrors, firstErrorPhase,
      firstErrorMessage: firstClientError instanceof Error ? firstClientError.message.slice(0, 2048) : null,
      errorListOverflow, errors: errorRecords.map(item => item.observation),
      completeLines, largestLineBytes, pendingLineBytes, stdoutBytes, outcome, cleanupFailures: cleanupErrors.length,
      stderr: stderr.slice(0, 4096), stderrTruncated: stderrOverflow || stderr.length > 4096 };
    const diagnosticText = JSON.stringify(diagnostic);
    assert.ok(Buffer.byteLength(diagnosticText) <= 32_768);
    await writeFile(join(reports, "client-diagnostic.json"), diagnosticText, { flag: "wx", mode: 0o600 });
    assert.equal(outcome.code, 0); assert.equal(outcome.signal, null);
    assert.equal(processCalls, 1); assert.equal(stderrOverflow, false); assert.equal(stderr, "");
    const exit: unknown = JSON.parse(await readFile(join(reports, "child-exit.json"), "utf8"));
    assert.ok(isRecord(exit)); assert.equal(exit["processAttempts"], 0); assert.equal(exit["networkAttempts"], 0);
    assert.equal(exit["windowsReadAttempts"], 0); assert.equal(exit["lifetimeExpired"], false); assert.equal(exit["code"], 0);
    assert.ok(child !== undefined && child.exitCode === 0);
    assert.equal(errorListOverflow, false); assert.equal(errorRecords.length, clientErrors);
    if (catalogOverflowControl) {
      assert.ok(clientErrors >= 1 && clientErrors <= 8); assert.equal(firstErrorPhase, "list-tools");
      assert.ok(firstClientError instanceof Error);
      assert.equal(firstClientError.message, "ReadBuffer exceeded maximum size of 65536 bytes");
      for (const [index, record] of errorRecords.entries()) {
        const observation = record.observation;
        assert.equal(observation.sequence, index + 1); assert.equal(observation.phase, "list-tools");
        assert.notEqual(observation.kind, "unexpected"); assert.ok(observation.chunkNumber > 0 && observation.chunkBytes > 0);
        if (index === 0) {
          assert.equal(record.original, firstClientError); assert.equal(observation.kind, "buffer-limit");
        } else { assert.equal(observation.priorOverflowObserved, true); }
        if (observation.kind === "buffer-limit") {
          assert.equal(record.original.message, "ReadBuffer exceeded maximum size of 65536 bytes");
        } else {
          assert.ok(record.original instanceof SyntaxError); assert.equal(observation.chunkHasNewline, true);
        }
      }
    } else { assert.equal(clientErrors, 0); }
    if (cleanupErrors.length > 0) { throw new AggregateError(cleanupErrors, "Owned SDK child cleanup refused."); }
  });
  await client.connect(transport, { timeout: 20_000, maxTotalTimeout: 20_000 });
  const ready: unknown = JSON.parse(await readFile(join(reports, "child-ready.json"), "utf8"));
  assert.ok(isRecord(ready)); assert.equal(ready["pid"], transport.pid); assert.notEqual(ready["root"], parentRoot);
  const journalValue = ready["journalPath"], pid = transport.pid, rootValue = ready["root"];
  assert.ok(typeof rootValue === "string" && typeof journalValue === "string" && pid !== null);
  const journalPath = journalValue, retainedReady = ready, root = rootValue;
  async function unchangedAndOffline(): Promise<void> {
    const bytes = await readFile(journalPath), info = await lstat(journalPath);
    assert.equal(bytes.length, retainedReady["journalBytes"]); assert.equal(sha256Text(bytes.toString("utf8")), retainedReady["journalSha256"]);
    assert.equal(info.ino, retainedReady["inode"]); assert.equal(info.dev, retainedReady["device"]); assert.equal(info.mode, retainedReady["mode"]);
    assert.equal(info.uid, retainedReady["uid"]);
    const rootEntries = await readdir(root);
    assert.deepEqual(rootEntries.toSorted(), ["facade.lock", "operations"]);
    assert.deepEqual(await readdir(join(root, "operations")), ["easyeda-index-original-unfinished.json"]);
    const children = await readFile(`/proc/${String(pid)}/task/${String(pid)}/children`, "utf8");
    assert.equal(children.trim(), "");
    for (const fd of await readdir(`/proc/${String(pid)}/fd`)) {
      if (!["0", "1", "2"].includes(fd)) {
        let target: string | undefined;
        try { target = await readlink(`/proc/${String(pid)}/fd/${fd}`); }
        catch (error) { if (!isRecord(error) || error["code"] !== "ENOENT") { throw error; } }
        if (target !== undefined) { assert.equal(target.startsWith("socket:"), false); }
      }
    }
  }
  const call = (name: string, args: Record<string, unknown>): ReturnType<Client["callTool"]> => {
    activePhase = `tool:${name}`;
    return client.callTool({ name, arguments: args }, undefined, { timeout: 15_000, maxTotalTimeout: 15_000 });
  };
  const listTools = (): ReturnType<Client["listTools"]> => {
    activePhase = "list-tools"; return client.listTools();
  };
  const catalogObservation = (): ReturnType<OfflineFixture["catalogObservation"]> =>
    Object.freeze({ completeLines, largestLineBytes, stdoutBytes });
  async function runtimeStatus(): Promise<unknown> {
    const response = await call("easyeda_control_runtime", { request: { action: "status" } });
    assert.notEqual(response.isError, true); assert.ok(isRecord(response.structuredContent));
    return response.structuredContent["result"];
  }
  return { client, call, listTools, catalogObservation, runtimeStatus, unchangedAndOffline };
}
function strictResponse(value: unknown): ReturnType<typeof closedSymbolDisposableOutputSchema.parse>["result"] {
  assert.ok(isRecord(value)); assert.equal(value["isError"], true);
  const parsed = closedSymbolDisposableOutputSchema.parse(value["structuredContent"]);
  const content = value["content"]; assert.ok(Array.isArray(content));
  const first: unknown = content[0]; assert.ok(isRecord(first) && typeof first["text"] === "string");
  assert.deepEqual(JSON.parse(first["text"]), { ok: false, structuredContent: true,
    jsonBytes: Buffer.byteLength(JSON.stringify(parsed)), sha256: sha256Text(JSON.stringify(parsed)) });
  return parsed.result;
}

void test("the old 64 KiB TEST client limit refuses the actual catalog and observes clean original child close", { timeout: 60_000 }, async context => {
  const f = await fixture(context, "seeded", true);
  await f.unchangedAndOffline(); assert.deepEqual(await f.runtimeStatus(), { state: "not-launched" });
  await assert.rejects(f.listTools(), /Connection closed/u);
});
void test("actual SDK strict envelope does not consume the sole offline validation attempt", { timeout: 60_000 }, async context => {
  const f = await fixture(context, "seeded");
  await f.unchangedAndOffline(); assert.deepEqual(await f.runtimeStatus(), { state: "not-launched" });
  const listed = await f.listTools();
  const catalog = f.catalogObservation();
  assert.ok(catalog.largestLineBytes > 65_536 && catalog.largestLineBytes <= 1_048_576);
  const entry = listed.tools.find(item => item.name === tool); assert.ok(entry !== undefined);
  assert.equal(listed.tools.length, 51); assert.equal(entry.inputSchema["additionalProperties"], false);
  assert.ok(listed.tools.some(item => item.name === "easyeda_control_disposable_schematic_rename"));
  assert.equal(entry.annotations?.readOnlyHint, false); assert.equal(entry.annotations?.destructiveHint, true);
  assert.equal(entry.annotations?.idempotentHint, false);
  assert.ok(entry.outputSchema !== undefined); assert.equal(entry.outputSchema.type, "object");
  assert.deepEqual(entry.outputSchema.required, ["result"]); assert.equal(entry.outputSchema["additionalProperties"], false);
  for (const malformed of [{ ...requestData(), unexpectedOuter: true },
    { request: { ...requestData().request, unexpectedInner: true } },
    { request: { ...requestData().request, confirmDisposableMetadataEdit: false } }]) {
    const response = await f.call(tool, malformed); assert.equal(response.isError, true);
    assert.match(JSON.stringify(response.content), /Input validation error/u);
    await f.unchangedAndOffline(); assert.deepEqual(await f.runtimeStatus(), { state: "not-launched" });
  }
  for (const metadata of [{ name: " \t ", description: "" }, { name: "Valid", description: "é".repeat(20_000) },
    { name: "Valid", description: "\uD800" }]) {
    const response = strictResponse(await f.call(tool, { request: { ...requestData().request, metadata } }));
    assert.ok("attemptReserved" in response); assert.equal(response.attemptReserved, false);
    assert.equal(response.phase, "request"); assert.equal(response.reason, "invalid-request");
    await f.unchangedAndOffline(); assert.deepEqual(await f.runtimeStatus(), { state: "not-launched" });
  }
  const ordinaryScope = requestData().request;
  const ordinary = await f.call("easyeda_control_symbol_metadata", { request: { action: "execute-closed-symbol", target: ordinaryScope.target,
    operation: { id: "ordinary-symbol-metadata", action: "library.symbol.modify", libraryUuid: ordinaryScope.target.projectUuid,
      target: { uuid: ordinaryScope.target.symbolUuid }, patch: ordinaryScope.metadata }, confirmWrite: true } });
  assert.equal(ordinary.isError, true);
  const blocked = closedSymbolOperationOutputSchema.parse(ordinary.structuredContent).result;
  assert.ok(blocked.outcome === "stopped"); assert.equal(blocked.phase, "validation"); assert.equal(blocked.attemptReserved, false);
  assert.ok(Array.isArray(ordinary.content));
  const ordinaryDiagnostic: unknown = ordinary.content[1];
  assert.ok(isRecord(ordinaryDiagnostic) && typeof ordinaryDiagnostic["text"] === "string");
  assert.match(ordinaryDiagnostic["text"], /"errorCode":"VALIDATION_REQUIRED"/u);
  await f.unchangedAndOffline(); assert.deepEqual(await f.runtimeStatus(), { state: "not-launched" });
  const stoppedReply = await f.call(tool, requestData());
  const stopped = strictResponse(stoppedReply);
  assert.ok(Array.isArray(stoppedReply.content));
  const stoppedDiagnostic: unknown = stoppedReply.content[1];
  assert.ok(isRecord(stoppedDiagnostic) && typeof stoppedDiagnostic["text"] === "string");
  assert.match(stoppedDiagnostic["text"], /"stage":"admission"/u);
  assert.equal(stopped.profile, "easyeda-pro-control.closed-symbol-disposable-result.v1");
  assert.ok(stopped.outcome === "stopped" && "claimState" in stopped);
  assert.equal(stopped.phase, "admission"); assert.equal(stopped.claimState, "not-attempted");
  assert.equal(stopped.operationId, null); assert.equal(stopped.claimArtifact, null); assert.equal(stopped.terminalArtifact, null);
  assert.equal(stopped.completionProved, false); await f.unchangedAndOffline();
  const status = await f.runtimeStatus(); assert.ok(isRecord(status)); assert.equal(status["state"], "not-launched");
  assert.equal(status["launch"], null); assert.equal(status["executableSha256"], null);
  const second = strictResponse(await f.call(tool, requestData()));
  assert.ok("attemptReserved" in second); assert.equal(second.attemptReserved, true);
  assert.equal(second.entryInvocationAttempted, false); assert.equal(second.entryReturnObserved, false);
  assert.equal(second.phase, "reservation"); assert.equal(second.reason, "attempt-unavailable");
  await f.unchangedAndOffline();
});
for (const scenario of ["missing-assets", "invalid-assets"] as const) {
  void test(`actual MCP ${scenario} setup failure remains permanently reserved without entry/native dispatch`, { timeout: 60_000 }, async context => {
    const f = await fixture(context, scenario);
    const refused = strictResponse(await f.call(tool, requestData()));
    assert.ok("attemptReserved" in refused); assert.equal(refused.attemptReserved, true);
    assert.equal(refused.entryInvocationAttempted, false); assert.equal(refused.entryReturnObserved, false);
    assert.equal(refused.reason, "setup-refused"); assert.equal(refused.phase, scenario === "missing-assets" ? "reservation" : "construction");
    assert.equal(refused.entryObservation, null); await f.unchangedAndOffline();
    assert.deepEqual(await f.runtimeStatus(), { state: "not-launched" });
    const again = strictResponse(await f.call(tool, requestData()));
    assert.ok("attemptReserved" in again); assert.equal(again.reason, "attempt-unavailable");
    await f.unchangedAndOffline();
  });
}

/** Schema-valid synthetic data only. The continuation guard must refuse it
 * before any runtime comparison, filesystem admission or owner allocation.
 */
function replacementFingerprint(): Record<string, unknown> {
  const hash = "a".repeat(64);
  return {
    facadeImplementation: { version: "synthetic", operationSchema: "synthetic", mode: "source-tree", sha256: hash,
      files: [{ path: "/synthetic/source.ts", relativePath: "source.ts", bytes: 1, sha256: hash }] },
    reviewedCompatibilityManifest: { path: "/synthetic/reviewed.json", bytes: 1, sha256: hash,
      schema: "easyeda-pro-control.reviewed-compatibility.v1", reviewedAt: "synthetic" },
    upstreamServer: { version: "synthetic" }, upstreamImplementationDrift: false, toolCount: 1, toolCatalogSha256: hash,
    upstreamLauncher: { command: "/synthetic/node", commandSha256: hash, args: ["/synthetic/upstream.js"],
      entrypoint: "/synthetic/upstream.js", entrypointSha256: hash, cwd: "/synthetic",
      executionClosure: { root: "/synthetic", directoryCount: 1, fileCount: 1, symlinkCount: 0, totalBytes: 1, sha256: hash },
      implementationTree: { root: "/synthetic", fileCount: 1, sha256: hash },
      dependencyLock: { type: "synthetic", path: "/synthetic/package-lock.json", sha256: hash } },
    health: { payload: { version: "synthetic", node_version: "synthetic", bridge_connected: true,
      easyeda_version: "synthetic", extension_version: "synthetic", extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: "synthetic", diagnostics: { method_registry_hash: "synthetic" } } },
    bridgeDispatcher: { payload: { source: "loader_status", dispatcher_build_id: "synthetic", total: 1 } },
    installedBundles: { available: true, assetsRoot: "/synthetic/assets",
      pcbEditor: { version: "3.2.193.682ed44e", implementationPath: "/synthetic/pcb.js", implementationSha256: hash },
      publicApi: { version: "0.3.50.ab46409c", implementationPath: "/synthetic/api.js", implementationSha256: hash,
        adapterPath: "/synthetic/adapter.js", adapterSha256: hash, declarationsPath: "/synthetic/api.d.ts", declarationsSha256: hash } },
  };
}

void test("actual SDK ordinary metadata rejects replacement authority then permits only unchanged historical inspection", { timeout: 60_000 }, async context => {
  const f = await fixture(context, "ordinary-history"), name = "easyeda_control_project_symbol_metadata";
  const operationId = "easyeda-index-original-unfinished", request = { action: "metadata-inspect", operationId };
  const listed = await f.listTools(); const entry = listed.tools.find(item => item.name === name);
  assert.equal(listed.tools.length, 26); assert.ok(entry !== undefined);
  const schematicName = "easyeda_control_disposable_schematic_rename";
  const schematicEntry = listed.tools.find(item => item.name === schematicName); assert.ok(schematicEntry !== undefined);
  assert.equal(schematicEntry.inputSchema["additionalProperties"], false);
  assert.deepEqual(schematicEntry.annotations, { readOnlyHint: false, destructiveHint: true, idempotentHint: false });
  assert.ok(schematicEntry.outputSchema !== undefined && isRecord(schematicEntry.outputSchema.properties));
  assert.ok(Object.hasOwn(schematicEntry.outputSchema.properties, "result"));
  assert.equal(schematicEntry.outputSchema["additionalProperties"], false);
  for (const malformed of [{ request: { action: "inspect", operationId }, runtime: {} },
    { request: { action: "inspect", operationId, schematicUuid: "d".repeat(16) } },
    { request: { action: "advance", operationId, step: { expectedPhase: "rename-write", confirmWrite: true, acceptSchematicRename: true } } }]) {
    const response = await f.call(schematicName, malformed); assert.equal(response.isError, true);
    assert.match(JSON.stringify(response.content), /Input validation error/u); await f.unchangedAndOffline();
  }
  assert.equal(entry.inputSchema["additionalProperties"], false);
  assert.equal(entry.annotations?.readOnlyHint, false); assert.equal(entry.annotations?.destructiveHint, true);
  assert.equal(entry.annotations?.idempotentHint, false);
  assert.ok(entry.outputSchema !== undefined && isRecord(entry.outputSchema.properties));
  assert.ok(Object.hasOwn(entry.outputSchema.properties, "result")); assert.equal(entry.outputSchema["additionalProperties"], false);
  await f.unchangedAndOffline();
  for (const malformed of [{ request, unexpectedOuter: true }, { request: { ...request, unexpectedInner: true } },
    { request: { ...request, patch: { name: "Replacement" } } },
    { request: { action: "metadata-advance", operationId, step: { expectedPhase: "forward-verification-read", unexpectedInner: true } } },
    { request: { action: "metadata-advance", operationId, step: { expectedPhase: "inverse-write", confirmWrite: true, acceptMetadataMutation: true } } }]) {
    const response = await f.call(name, malformed);
    assert.equal(response.isError, true); assert.match(JSON.stringify(response.content), /Input validation error/u);
    await f.unchangedAndOffline();
  }
  const replacement = await f.call(name, { request, expectedFingerprint: replacementFingerprint() });
  assert.equal(replacement.isError, true);
  assert.match(JSON.stringify(replacement.content), /Ordinary continuation cannot replace/u);
  assert.doesNotMatch(JSON.stringify(replacement.content), /Input validation error/u);
  await f.unchangedAndOffline();
  const inspected = await f.call(name, { request });
  assert.notEqual(inspected.isError, true, JSON.stringify(inspected)); assert.ok(isRecord(inspected.structuredContent));
  const result = inspected.structuredContent["result"]; assert.ok(isRecord(result));
  assert.equal(result["purpose"], "ordinary-symbol-metadata"); assert.equal(result["historicalEvidenceOnly"], true);
  for (const flag of ["originalOwnerRetained", "continuationAuthorized", "executionAuthorized", "replayAllowed"]) {
    assert.equal(result[flag], false);
  }
  await f.unchangedAndOffline();
});

void test("actual SDK copy route has strict disposable schema and permits only nonauthorizing historical inspection after restart", { timeout: 60_000 }, async context => {
  const f = await fixture(context, "copy-history"), name = "easyeda_control_disposable_symbol_copy";
  const operationId = "easyeda-index-original-unfinished", request = { action: "copy-inspect", operationId };
  const listed = await f.listTools(); const entry = listed.tools.find(item => item.name === name); assert.ok(entry);
  assert.equal(listed.tools.length, 26); assert.equal(entry.inputSchema["additionalProperties"], false);
  assert.equal(entry.annotations?.readOnlyHint, false); assert.equal(entry.annotations?.destructiveHint, true); assert.equal(entry.annotations?.idempotentHint, false);
  for (const malformed of [{ request, expectedFingerprint: replacementFingerprint() }, { request, extra: true },
    { request: { ...request, destinationUuid: "a".repeat(16) } },
    { request: { action: "copy-advance", operationId, step: { expectedPhase: "copy-write", confirmWrite: true, acceptSymbolCopy: true } } },
    { request: { action: "copy-advance", operationId, step: { expectedPhase: "inverse-write", confirmDisposableProject: true } } }]) {
    const response = await f.call(name, malformed); assert.equal(response.isError, true);
    assert.match(JSON.stringify(response.content), /Input validation error/u); await f.unchangedAndOffline();
  }
  const response = await f.call(name, { request }); assert.notEqual(response.isError, true, JSON.stringify(response));
  assert.ok(isRecord(response.structuredContent)); const result = response.structuredContent["result"]; assert.ok(isRecord(result));
  assert.equal(result["historicalOnly"], true);
  for (const flag of ["originalOwnerRetained", "continuationAvailable", "copyVerified", "executionAuthorized", "replayAllowed"]) { assert.equal(result[flag], false); }
  const cannotResume = await f.call(name, { request: { action: "copy-advance", operationId, step: { expectedPhase: "verification-read" } } });
  assert.equal(cannotResume.isError, true); assert.doesNotMatch(JSON.stringify(cannotResume.content), /Input validation error/u);
  const crossPurpose = await f.call("easyeda_control_project_symbol_metadata", { request: { action: "metadata-inspect", operationId } });
  assert.equal(crossPurpose.isError, true); await f.unchangedAndOffline();
});
