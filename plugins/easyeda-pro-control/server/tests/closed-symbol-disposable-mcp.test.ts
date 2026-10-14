import assert from "node:assert/strict";
import childProcess from "node:child_process";
import type { ChildProcess, SpawnOptions } from "node:child_process";
import { lstat, mkdtemp, readFile, readdir, readlink, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename, join, resolve } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { isRecord, sha256Text } from "../src/core.ts";
import { closedSymbolDisposableOutputSchema } from "../src/closed-symbol-disposable-tool.ts";
// eslint-disable-next-line import/max-dependencies -- Reuse the exact ordinary result parser in the existing SDK boundary test.
import { closedSymbolOperationOutputSchema } from "../src/closed-symbol-operation-tool.ts";
import { requestData } from "./helpers/disposable-tool-data.ts";

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
async function fixture(context: TestContext, scenario: "seeded" | "missing-assets" | "invalid-assets",
  catalogOverflowControl = false): Promise<OfflineFixture> {
  assert.equal(process.versions.node, "24.18.0");
  const parentRoot = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(parentRoot !== undefined && basename(parentRoot).startsWith(`easyeda-test-control-${String(process.pid)}-`));
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
    env: { NODE_NO_WARNINGS: "1", EASYEDA_INDEX_TEST_REPORT_DIRECTORY: reports }, stderr: "pipe", maxBufferSize: catalogCapBytes });
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
      completeLines, largestLineBytes, pendingLineBytes, stdoutBytes, outcome, cleanupFailures: cleanupErrors.length };
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
  assert.equal(listed.tools.length, 37); assert.equal(entry.inputSchema["additionalProperties"], false);
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
