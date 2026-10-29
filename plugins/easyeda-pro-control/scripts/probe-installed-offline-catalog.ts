#!/usr/bin/env node
/**
 * Dependency-free package smoke check, not admission of a host-owned facade.
 * Only the newly created synthetic profile/control directory is used. No live
 * tool, existing profile, upstream implementation or application is invoked.
 */
import { spawn } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { Stats } from "node:fs";
import { lstat, mkdir, open, readFile, readdir, readlink, realpath, writeFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

import { createPrivateTemporaryDirectory } from "./private-temporary-directory.ts";

const NODE_VERSION = "24.18.0";
const MAX_REPLY_BYTES = 8 * 1024 * 1024;
const MAX_OUTPUT_BYTES = 16 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;
const CATALOG_QUERY_COUNT = 46;
// Initialize and tool discovery plus the fixed catalog requests below.
const REQUEST_LIMIT = 2 + CATALOG_QUERY_COUNT;
const EXPECTED_TOOLS = [
  "api", "calculate", "discover", "disposable_pcb_rename", "disposable_schematic_rename", "disposable_symbol_copy",
  "editor_context", "editor_shell", "extensions", "history", "launch", "library_files", "pcb_diagnostic_validation", "pcb_geometry",
  "pcb_identities", "pcb_layers", "pcb_string_precreate_validation", "project_board", "project_open", "project_pcb", "project_schematic",
  "project_schematic_rename", "project_symbol", "project_symbol_metadata", "shortcuts", "status", "system",
].map(name => `easyeda_control_${name}`).toSorted();

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) { throw new Error("Expected a JSON object."); }
  return value;
}

function requireCheck(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(message); }
}

function sameFile(a: Stats, b: Stats): boolean {
  return a.dev === b.dev && a.ino === b.ino && a.size === b.size && a.mode === b.mode &&
    a.uid === b.uid && a.gid === b.gid && a.nlink === b.nlink && a.mtimeMs === b.mtimeMs && a.ctimeMs === b.ctimeMs;
}

interface RetainedFile {
  readonly handle: FileHandle;
  readonly sha256: string;
  readonly bytes: number;
  readonly assertCurrent: () => Promise<void>;
}

async function retainFile(path: string, maximum: number): Promise<RetainedFile> {
  const before = await lstat(path);
  requireCheck(before.isFile() && !before.isSymbolicLink() && before.size > 0 && before.size <= maximum &&
    await realpath(path) === path, "Package input must be a bounded canonical regular file.");
  const handle = await open(path, constants.O_RDONLY + constants.O_NOFOLLOW);
  const hash = async (): Promise<string> => {
    requireCheck(sameFile(before, await handle.stat()), "Retained package input changed.");
    const chunk = Buffer.alloc(1024 * 1024), digest = createHash("sha256");
    let offset = 0;
    for (;;) {
      const { bytesRead } = await handle.read(chunk, 0, chunk.length, offset);
      if (bytesRead === 0) { break; }
      offset += bytesRead;
      requireCheck(offset <= maximum, "Package input grew beyond its bound.");
      digest.update(chunk.subarray(0, bytesRead));
    }
    requireCheck(offset === before.size && sameFile(before, await handle.stat()) &&
      sameFile(before, await lstat(path)), "Package input changed during its read.");
    return digest.digest("hex");
  };
  try {
    const sha256 = await hash();
    return { handle, sha256, bytes: before.size, assertCurrent: async () => {
      requireCheck(await realpath(path) === path && await hash() === sha256, "Package input identity or content changed.");
    } };
  } catch (error) { await handle.close(); throw error; }
}

async function jsonFile(file: RetainedFile): Promise<Record<string, unknown>> {
  const bytes = Buffer.alloc(file.bytes);
  const { bytesRead } = await file.handle.read(bytes, 0, bytes.length, 0);
  requireCheck(bytesRead === file.bytes, "Incomplete package configuration.");
  await file.assertCurrent();
  return record(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)));
}

async function assertDetachedPackage(root: string): Promise<void> {
  requireCheck(isAbsolute(root) && root !== "/" && resolvePath(root) === root, "An exact canonical absolute package root is required.");
  const information = await lstat(root);
  requireCheck(information.isDirectory() && await realpath(root) === root, "Package root is linked or noncanonical.");
  const entrypointDirectory = join(root, "server/dist");
  requireCheck(await realpath(entrypointDirectory) === entrypointDirectory, "Package entrypoint directory is linked or noncanonical.");
  for (let path = entrypointDirectory;; path = dirname(path)) {
    try { await lstat(join(path, "node_modules")); }
    catch (error) {
      if (record(error)["code"] === "ENOENT") {
        if (dirname(path) === path) { return; }
        // Missing dependencies at this ancestor are the required state.
        // oxlint-disable-next-line eslint/no-continue -- Check each ancestor without accepting an existing dependency directory.
        continue;
      }
      throw error;
    }
    throw new Error("Package probe requires no node_modules directory at the package root or any ancestor.");
  }
}

/** One owned child, bounded replies, EOF only. Uncertain closure keeps child
 * observation and stdio referenced, but offers no resumable recovery owner. */
class OfflineChild {
  readonly #child: ChildProcessWithoutNullStreams;
  readonly #closed: Promise<void>;
  readonly #repliesHash = createHash("sha256");
  readonly #stderrHash = createHash("sha256");
  #pending: { id: number; resolve: (value: Record<string, unknown>) => void; reject: (error: Error) => void } | undefined;
  #failure: Error | undefined;
  #buffer = Buffer.alloc(0);
  #id = 0;
  #stdoutBytes = 0;
  #stderrBytes = 0;
  #ended = false;

  public constructor(executable: string, root: string, environment: Record<string, string>) {
    this.#child = spawn(executable, ["server/dist/server.mjs", "--machine-launch"], {
      cwd: root, env: environment, stdio: ["pipe", "pipe", "pipe"], shell: false, windowsHide: true,
    });
    // oxlint-disable-next-line promise/avoid-new -- Original child close is an event, not a request acknowledgment.
    this.#closed = new Promise<void>(resolve => {
      this.#child.once("close", () => {
        this.#ended = true;
        if (this.#pending !== undefined) { this.#fail(new Error("Offline child closed before its reply.")); }
        resolve();
      });
    });
    for (const stream of [this.#child, this.#child.stdin, this.#child.stdout, this.#child.stderr]) {
      stream.on("error", () => { this.#fail(new Error("Offline child transport failed.")); });
    }
    this.#child.stdout.on("data", (chunk: Buffer) => { this.#receive(chunk); });
    this.#child.stderr.on("data", (chunk: Buffer) => {
      this.#stderrBytes += chunk.length;
      if (this.#stderrBytes <= 64 * 1024) { this.#stderrHash.update(chunk); }
      if (this.#stderrBytes > 64 * 1024) { this.#fail(new Error("Offline child stderr exceeded its bound.")); }
    });
  }

  #fail(error: Error): void {
    this.#failure ??= error;
    this.#pending?.reject(this.#failure);
    this.#pending = undefined;
    this.#buffer = Buffer.alloc(0);
  }

  #receive(chunk: Buffer): void {
    this.#stdoutBytes += chunk.length;
    if (this.#failure !== undefined) { return; }
    try {
      requireCheck(this.#stdoutBytes <= MAX_OUTPUT_BYTES && this.#buffer.length + chunk.length <= MAX_REPLY_BYTES,
        "Offline child output exceeded its bound.");
      this.#buffer = Buffer.concat([this.#buffer, chunk]);
      for (;;) {
        const newline = this.#buffer.indexOf(10);
        if (newline === -1) { return; }
        const line = this.#buffer.subarray(0, newline);
        this.#buffer = this.#buffer.subarray(newline + 1);
        const reply = record(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(line)));
        const pending = this.#pending;
        requireCheck(reply["jsonrpc"] === "2.0" && pending !== undefined && reply["id"] === pending.id &&
          !Object.hasOwn(reply, "error") && Object.keys(reply).toSorted().join(",") === "id,jsonrpc,result",
        "Unexpected, duplicate or failed offline JSON-RPC reply.");
        const result = record(reply["result"]);
        this.#repliesHash.update(line).update("\n");
        this.#pending = undefined;
        pending.resolve(result);
      }
    } catch (error) {
      this.#fail(error instanceof Error ? error : new Error("Invalid offline reply."));
    }
  }

  public async request(method: "initialize" | "tools/list" | "tools/call", params: Record<string, unknown>): Promise<Record<string, unknown>> {
    if (this.#failure !== undefined) { throw this.#failure; }
    requireCheck(!this.#ended && this.#pending === undefined && this.#id < REQUEST_LIMIT, "Offline child is unavailable or exceeded its request bound.");
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // oxlint-disable-next-line promise/avoid-new -- Match this request's single original JSON-RPC reply or bounded timeout.
      return await new Promise<Record<string, unknown>>((resolve, reject) => {
        this.#id += 1;
        this.#pending = { id: this.#id, resolve, reject };
        timer = setTimeout(() => { this.#fail(new Error("Offline request timed out; it will not be retried.")); }, REQUEST_TIMEOUT_MS);
        this.#child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: this.#id, method, params })}\n`);
      });
    } finally { clearTimeout(timer); }
  }

  public initialized(): void {
    if (this.#failure !== undefined) { throw this.#failure; }
    this.#child.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');
  }

  public assertLoadedFacade(value: Record<string, unknown>, root: string): void {
    requireCheck(!this.#ended && this.#child.pid !== undefined && value["schema"] === "easyeda-pro-control.loaded-facade.v1" &&
      value["pid"] === this.#child.pid && value["moduleUrl"] === pathToFileURL(join(root, "server/dist/server.mjs")).href &&
      value["nodeVersion"] === `v${NODE_VERSION}` && value["admissionGranted"] === false,
    "Loaded facade report does not identify the original offline child and bundle.");
  }

  public async sample(controlDirectory: string, upstreamMarker: string, nodeExecutable: string): Promise<void> {
    const pid = this.#child.pid;
    requireCheck(pid !== undefined && !this.#ended, "Original offline child is not running.");
    const proc = `/proc/${pid}`;
    requireCheck(await realpath(`${proc}/exe`) === nodeExecutable, "Offline child is not the pinned Node executable.");
    const children = await readFile(`${proc}/task/${pid}/children`, "utf8");
    requireCheck(children.trim() === "", "Offline child started a descendant.");
    requireCheck(/^Max core file size\s+0\s+/mu.test(await readFile(`${proc}/limits`, "utf8")), "Offline child core limit is not zero.");
    for (const fd of await readdir(`${proc}/fd`)) {
      if (!["0", "1", "2"].includes(fd)) {
        let target: string;
        try { target = await readlink(`${proc}/fd/${fd}`); }
        catch (error) { if (record(error)["code"] === "ENOENT") { target = ""; } else { throw error; } }
        requireCheck(!target.startsWith("socket:"), "Offline child has a non-stdio socket.");
      }
    }
    const entries = await readdir(controlDirectory);
    requireCheck(entries.toSorted().join(",") === "facade.lock,machine-profile.json",
      "Offline child created unexpected control data.");
    const leaseText = await readFile(join(controlDirectory, "facade.lock"), "utf8");
    const lease = record(JSON.parse(leaseText));
    requireCheck(lease["pid"] === pid && !Object.hasOwn(lease, "childPid"), "Offline lease does not belong solely to the original child.");
    try { await lstat(upstreamMarker); }
    catch (error) { if (record(error)["code"] === "ENOENT") { return; } throw error; }
    throw new Error("Synthetic upstream unexpectedly executed.");
  }

  public async close(): Promise<Record<string, unknown>> {
    if (!this.#ended) { this.#child.stdin.end(); }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      // oxlint-disable-next-line promise/avoid-new -- Never turn an EOF timeout into a signal or discard the child observation.
      const deadline = new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => { reject(new Error("Original offline child has not closed after EOF; no signal sent. Child observation and stdio remain referenced, file leases are released, and no retry or recovery endpoint is offered. Retain the evidence.")); }, 10_000);
      });
      await Promise.race([this.#closed, deadline]);
    } finally { clearTimeout(timer); }
    requireCheck(this.#child.exitCode === 0 && this.#child.signalCode === null, "Offline child exited unsuccessfully.");
    if (this.#failure !== undefined) { throw this.#failure; }
    requireCheck(this.#buffer.length === 0 && this.#stderrBytes === 0, "Offline child left incomplete output or nonempty stderr.");
    return { pid: this.#child.pid, exitCode: 0, signal: null, stdinEof: true, closeObserved: true,
      stdoutBytes: this.#stdoutBytes, stderrBytes: this.#stderrBytes, stderrSha256: this.#stderrHash.digest("hex"),
      requests: this.#id, repliesSha256: this.#repliesHash.digest("hex") };
  }
}

async function assertClosedOfflineState(controlDirectory: string, upstreamMarker: string): Promise<void> {
  const entries = await readdir(controlDirectory);
  requireCheck(entries.toSorted().join(",") === "machine-profile.json", "Offline shutdown left unexpected control data.");
  try { await lstat(upstreamMarker); }
  catch (error) { if (record(error)["code"] === "ENOENT") { return; } throw error; }
  throw new Error("Synthetic upstream marker appeared during offline shutdown.");
}

async function offlineApi(child: OfflineChild, request: Record<string, unknown>): Promise<Record<string, unknown>> {
  const reply = await child.request("tools/call", { name: "easyeda_control_api", arguments: { request } });
  requireCheck(reply["isError"] !== true, "Offline API returned an error.");
  const content = record(reply["structuredContent"]);
  requireCheck(content["offline"] === true, "API reply was not explicitly offline.");
  return record(content["result"]);
}

async function catalogChecks(child: OfflineChild, root: string, sample: () => Promise<void>): Promise<{ readonly tools: number; readonly queries: number; readonly loadedFacadeChecked: true; readonly ratlineContinuationDiscoveryChecked: true; readonly footprintCopyPreparationDiscoveryChecked: true; readonly footprintCopyRoutePreparationDiscoveryChecked: true; readonly footprintMainDiscoveryChecked: true; readonly footprintCombinedDiscoveryChecked: true; readonly footprintCombinedUnknownAbandonmentDiscoveryChecked: true }> {
  const initialized = await child.request("initialize", {
    protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "easyeda-installed-offline-probe", version: "1.0.0" },
  });
  requireCheck(initialized["protocolVersion"] === "2024-11-05" && typeof record(initialized["serverInfo"])["name"] === "string",
    "Offline initialization contract changed.");
  child.initialized();
  const listed = await child.request("tools/list", {});
  const tools = listed["tools"];
  requireCheck(Array.isArray(tools) && !Object.hasOwn(listed, "nextCursor") && tools.length === EXPECTED_TOOLS.length,
    "Offline tool catalog is incomplete or changed.");
  const names = tools.map((value: unknown) => {
    const tool = record(value);
    requireCheck(typeof tool["name"] === "string" && record(tool["inputSchema"])["type"] === "object" &&
      record(tool["outputSchema"])["type"] === "object", "Offline tool schema is missing.");
    return tool["name"];
  }).toSorted();
  requireCheck(JSON.stringify(names) === JSON.stringify(EXPECTED_TOOLS), "Offline tool names changed.");
  await sample();
  child.assertLoadedFacade(await offlineApi(child, { action: "loaded-facade" }), root);
  for (const [action, total] of [["calculations", 16], ["system", 18], ["pcb-geometry", 20], ["project-schematic", 4]] as const) {
    const result = await offlineApi(child, { action, query: { includeSchemas: true } });
    requireCheck(result["total"] === total && result["invocationEnabledByDiscovery"] === false,
      "Offline operation discovery changed or implies invocation authority.");
  }
  const diagnostic = await offlineApi(child, { action: "pcb-diagnostic-validation", query: { includeSchemas: true } });
  requireCheck(diagnostic["tool"] === "easyeda_control_pcb_diagnostic_validation" && diagnostic["executionAuthorized"] === false &&
    diagnostic["invocationEnabledByDiscovery"] === false && Array.isArray(record(diagnostic["inputSchema"])["oneOf"]),
  "Diagnostic discovery or its schema changed.");
  const launch = { action: "launch", operationId: "offline-catalog-validation", confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  for (const [request, valid] of [[launch, true], [{ ...launch, callerCode: "not accepted" }, false]] as const) {
    const result = await offlineApi(child, { action: "pcb-diagnostic-validation-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["executionAuthorized"] === false,
      "Offline exact-argument validation changed or implies execution authority.");
  }
  const precreate = await offlineApi(child, { action: "pcb-string-precreate-validation", query: { includeSchemas: true } });
  requireCheck(precreate["tool"] === "easyeda_control_pcb_string_precreate_validation" &&
    precreate["executionAuthorized"] === false && precreate["saveAuthorized"] === false &&
    precreate["invocationEnabledByDiscovery"] === false && Array.isArray(record(precreate["inputSchema"])["oneOf"]),
  "String precreate discovery or its schema changed.");
  const stringLaunch = { ...launch, operationId: "string-precreate-offline-catalog" };
  for (const [request, valid] of [[stringLaunch, true], [{ ...stringLaunch, callerCode: "not accepted" }, false]] as const) {
    const result = await offlineApi(child, { action: "pcb-string-precreate-validation-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["executionAuthorized"] === false,
      "String precreate exact-argument validation changed or implies execution authority.");
  }
  const empty = await offlineApi(child, { action: "pcb209-empty-baseline", query: { includeSchemas: true } });
  requireCheck(empty["toolWrapperAction"] === "empty-baseline" && empty["executionAuthorized"] === false &&
    empty["saveAuthorized"] === false && empty["connectedValidation"] === false && Array.isArray(record(empty["inputSchema"])["oneOf"]),
  "Empty baseline discovery or its schema changed.");
  const emptyLaunch = { ...launch, operationId: "pcb209-empty-offline-catalog" };
  for (const [request, valid] of [[emptyLaunch, true], [{ ...emptyLaunch, requestLimit: 9999 }, false]] as const) {
    const result = await offlineApi(child, { action: "pcb209-empty-baseline-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["executionAuthorized"] === false,
      "Empty baseline validation accepted a caller budget or implied execution authority.");
  }
  const ratline = await offlineApi(child, { action: "pcb209-ratline-held-import", query: { includeSchemas: true } });
  requireCheck(ratline["toolWrapperAction"] === "ratline-held-import" && ratline["executionAuthorized"] === false &&
    ratline["saveAuthorized"] === false && ratline["connectedValidation"] === false && Array.isArray(record(ratline["inputSchema"])["oneOf"]),
  "Ratline held-import discovery or its schema changed.");
  const ratlineLaunch = { ...launch, operationId: "pcb209-ratline-offline-catalog" };
  for (const [request, valid] of [[ratlineLaunch, true], [{ ...ratlineLaunch, requestLimit: 9999 }, false]] as const) {
    const result = await offlineApi(child, { action: "pcb209-ratline-held-import-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["executionAuthorized"] === false,
      "Ratline held-import validation accepted a caller budget or implied execution authority.");
  }
  const continuation = await offlineApi(child, { action: "pcb209-ratline-continuation", query: { includeSchemas: true } });
  const continuationActions = continuation["actions"];
  requireCheck(continuation["wrapperAction"] === "pcb209-ratline-continuation" &&
    continuation["toolWrapperAction"] === "ratline-continuation" && continuation["validationOnly"] === true &&
    continuation["executionAuthorized"] === false && continuation["saveAuthorized"] === false &&
    continuation["connectedValidation"] === false && Array.isArray(continuationActions) &&
    continuationActions.includes("observe-ratline-continuation") && Array.isArray(record(continuation["inputSchema"])["oneOf"]),
  "Ratline continuation discovery or its schema changed.");
  const continuationRequest = { action: "observe-ratline-continuation", operationId: "pcb209-continuation-offline-catalog",
    expectedBindingSha256: "a".repeat(64), acceptNormalOpenEffects: true, acceptDebuggerPause: true };
  for (const [request, valid] of [[continuationRequest, true], [{ ...continuationRequest, requestLimit: 9999 }, false]] as const) {
    const result = await offlineApi(child, { action: "pcb209-ratline-continuation-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["validationOnly"] === true && result["executionAuthorized"] === false,
      "Ratline continuation validation accepted a caller budget or implied execution authority.");
  }
  const footprint = await offlineApi(child, { action: "footprint-copy-preparation", query: { includeSchemas: true } });
  const footprintActions = footprint["actions"];
  requireCheck(footprint["toolWrapperAction"] === "footprint-copy-preparation" && footprint["validationOnly"] === true &&
    footprint["executionAuthorized"] === false && footprint["saveAuthorized"] === false && footprint["connectedValidation"] === false &&
    Array.isArray(footprintActions) && ["prepare-footprint-bindings", "observe-footprint-ui", "prepare-footprint-dependencies", "observe-footprint-manager-route"]
      .every(action => footprintActions.includes(action)) && Array.isArray(record(footprint["inputSchema"])["oneOf"]),
  "Footprint preparation discovery or its original-owner stages changed.");
  const footprintRequest = { operationId: "footprint-preparation-offline-catalog", expectedBindingSha256: "a".repeat(64) };
  const footprintValidation = [
    ...["prepare-footprint-bindings", "observe-footprint-ui", "prepare-footprint-dependencies", "observe-footprint-manager-route"].map(action => ({ request: { ...footprintRequest, action }, valid: true })),
    { request: { ...footprintRequest, action: "prepare-footprint-bindings", requestLimit: 9999 }, valid: false },
    { request: { ...footprintRequest, action: "prepare-footprint-bindings", operationId: "pcb209-startup-cannot-upgrade" }, valid: false },
  ];
  for (const { request, valid } of footprintValidation) {
    const result = await offlineApi(child, { action: "footprint-copy-preparation-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["validationOnly"] === true && result["executionAuthorized"] === false,
      "Footprint preparation validation accepted a foreign purpose, caller budget or execution authority.");
  }
  const footprintRoute = await offlineApi(child, { action: "footprint-copy-route-preparation", query: { includeSchemas: true } });
  requireCheck(footprintRoute["toolWrapperAction"] === "footprint-copy-route-preparation" && footprintRoute["executionAuthorized"] === false &&
    footprintRoute["saveAuthorized"] === false && footprintRoute["connectedValidation"] === false &&
    Array.isArray(footprintRoute["actions"]) && footprintRoute["actions"].includes("observe-footprint-route"),
  "Footprint route preparation discovery changed or implied writer authority.");
  const routeRequest = { action: "observe-footprint-route", operationId: "footprint-route-offline-catalog", expectedBindingSha256: "a".repeat(64) };
  for (const { request, valid } of [{ request: routeRequest, valid: true },
    { request: { ...routeRequest, operationId: "footprint-preparation-cannot-upgrade" }, valid: false },
    { request: { ...routeRequest, requestLimit: 9999 }, valid: false }]) {
    const result = await offlineApi(child, { action: "footprint-copy-route-preparation-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["executionAuthorized"] === false,
      "Footprint route validation accepted a foreign purpose, caller budget or execution authority.");
  }
  const footprintMain = await offlineApi(child, { action: "footprint-main", query: { includeSchemas: true } });
  requireCheck(footprintMain["toolWrapperAction"] === "footprint-main" && footprintMain["executionAuthorized"] === false &&
    footprintMain["saveAuthorized"] === false && footprintMain["connectedValidation"] === false &&
    Array.isArray(footprintMain["actions"]) && footprintMain["actions"].includes("observe-main-construction"),
  "Original main discovery changed or implied writer authority.");
  const mainRequest = { action: "terminate-main", operationId: "footprint-main-offline-catalog",
    expectedBindingSha256: "a".repeat(64), confirmTerminateOriginalDiagnosticJob: true };
  for (const { request, valid } of [{ request: mainRequest, valid: true },
    { request: { ...mainRequest, confirmTerminateOriginalDiagnosticJob: false }, valid: false },
    { request: { ...mainRequest, inspectorUrl: "ws://127.0.0.1:1/caller" }, valid: false }]) {
    const result = await offlineApi(child, { action: "footprint-main-validate", query: { request } });
    requireCheck(result["valid"] === valid && result["executionAuthorized"] === false,
      "Original main validation accepted unconfirmed termination or caller transport.");
  }
  const combined = await offlineApi(child, { action: "footprint-combined", query: { includeSchemas: true } });
  requireCheck(combined["toolWrapperAction"] === "footprint-combined" && combined["executionAuthorized"] === false &&
    combined["saveAuthorized"] === false && combined["connectedValidation"] === false &&
    Array.isArray(combined["actions"]) && combined["actions"].includes("abort-generation") && combined["actions"].includes("abandon-unknown-launch"),
  "Combined main/renderer discovery changed or implied writer authority.");
  const combinedAbort = await offlineApi(child, { action: "footprint-combined-validate", query: { request: {
    action: "abort-generation", operationId: "footprint-combined-offline-catalog", expectedBindingSha256: "a".repeat(64),
    confirmAbortOriginalCombinedJob: true,
  } } });
  requireCheck(combinedAbort["valid"] === true && combinedAbort["executionAuthorized"] === false,
    "Combined validation refused its exact confirmed original-generation abort.");
  const combinedAbandonment = await offlineApi(child, { action: "footprint-combined-validate", query: { request: {
    action: "abandon-unknown-launch", operationId: "footprint-combined-offline-catalog", expectedIntentSha256: "a".repeat(64),
    confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true, acceptUnknownProfileEffects: true,
  } } });
  requireCheck(combinedAbandonment["valid"] === true && combinedAbandonment["executionAuthorized"] === false,
    "Combined validation refused its exact historical relinquishment schema.");
  const netlist = await offlineApi(child, { action: "netlist-files", query: { includeSchemas: true } });
  requireCheck(netlist["method"] === "eda.sys_Tool.netlistComparison" && netlist["executionAuthorized"] === false &&
    netlist["invocationEnabledByDiscovery"] === false && Array.isArray(record(netlist["inputSchema"])["oneOf"]),
  "Netlist file discovery or its bounded action schema changed.");
  const readers = await offlineApi(child, { action: "public-readers", query: { includeSchemas: true } });
  const readerEntries = readers["entries"];
  requireCheck(readers["total"] === 7 && Array.isArray(readerEntries) && readerEntries.length === 7 &&
    readerEntries.every((entry: unknown) => isRecord(entry) && isRecord(entry["inputSchema"]) && entry["invocationEnabledByDiscovery"] === false),
  "Public utility discovery differs from its seven bounded readers.");
  const readerBatch = record(readers["batch"]);
  requireCheck(readerBatch["maximumMethods"] === 7 && readerBatch["uniqueMethods"] === true &&
    readerBatch["completeOrderedPasses"] === 2 && readerBatch["sharedDeadlineMilliseconds"] === 10_000 &&
    readerBatch["maximumResponseBytes"] === 65_536 && readerBatch["maximumMemberBytes"] === 8192 &&
    readerBatch["atomicSnapshot"] === false && readerBatch["partialSuccess"] === false &&
    readerBatch["invocationEnabledByDiscovery"] === false && isRecord(readerBatch["inputSchema"]),
  "Public utility batch lost its bounds or implies execution authority.");
  const languageReader = { method: "eda.sys_I18n.getCurrentLanguage", arguments: {} };
  for (const [requests, valid] of [[[languageReader], true], [[], false], [[languageReader, languageReader], false]] as const) {
    const result = await offlineApi(child, { action: "public-readers-validate", query: { request: { action: "batch", requests } } });
    requireCheck(result["valid"] === valid && result["executionAuthorized"] === false,
      "Public utility batch validation accepted empty/duplicate methods or implied execution authority.");
  }
  const catalog = await offlineApi(child, { action: "catalog-components", query: { includeSchemas: true } });
  const catalogEntries = catalog["entries"];
  requireCheck(catalog["total"] === 8 && Array.isArray(catalogEntries) && catalogEntries.length === 8 &&
    catalogEntries.some((entry: unknown) => isRecord(entry) && entry["action"] === "search-symbols-by-name" &&
      entry["publicSdkMethodExecuted"] === false && entry["installedRuntimeAdmission"] === false && isRecord(entry["inputSchema"])),
  "Catalog discovery lost its separate symbol-name HTTP equivalent.");
  for (const action of ["search-footprints-by-name", "get-devices-by-lcsc-ids"]) {
    requireCheck(catalogEntries.some((entry: unknown) => isRecord(entry) && entry["action"] === action &&
      entry["publicSdkMethodExecuted"] === false && entry["installedRuntimeAdmission"] === false && isRecord(entry["inputSchema"])),
    "Catalog discovery lost an enriched metadata HTTP equivalent.");
  }
  const libraryFiles = await offlineApi(child, { action: "library-files", query: { includeSchemas: true } });
  requireCheck(libraryFiles["offline"] === true && libraryFiles["publicSdkMethodExecuted"] === false &&
    libraryFiles["installedRuntimeAdmission"] === false && libraryFiles["executionAuthorized"] === false &&
    Array.isArray(record(libraryFiles["inputSchema"])["oneOf"]), "Managed library-file discovery lost offline scope or exact schemas.");
  const fileValidation = await offlineApi(child, { action: "library-files-validate", query: { request: {
    action: "prepare-file", name: "probe.efoo", base64: Buffer.from('["DOCTYPE","FOOTPRINT","1.0"]\n["HEAD",{}]\n').toString("base64"), confirmLocalArtifact: true,
  } } });
  requireCheck(fileValidation["valid"] === true && fileValidation["executionAuthorized"] === false &&
    record(fileValidation["requestSummary"])["base64Echoed"] === false && !Object.hasOwn(fileValidation, "request"),
  "Managed library-file validation echoed source or implied execution authority.");
  return { tools: tools.length, queries: CATALOG_QUERY_COUNT, loadedFacadeChecked: true, footprintMainDiscoveryChecked: true, footprintCombinedDiscoveryChecked: true, footprintCombinedUnknownAbandonmentDiscoveryChecked: true, ratlineContinuationDiscoveryChecked: true, footprintCopyPreparationDiscoveryChecked: true, footprintCopyRoutePreparationDiscoveryChecked: true };
}

export async function probeInstalledOfflineCatalog(installedRoot: string): Promise<Record<string, unknown>> {
  requireCheck(process.platform === "linux" && process.arch === "x64" && process.versions.node === NODE_VERSION,
    "Offline package probe requires Linux x64 and Node exactly 24.18.0.");
  requireCheck(/^Max core file size\s+0\s+/mu.test(await readFile("/proc/self/limits", "utf8")), "Set soft RLIMIT_CORE to zero before probing.");
  await assertDetachedPackage(installedRoot);
  const retained: RetainedFile[] = [];
  let kernelNode: FileHandle | undefined;
  let child: OfflineChild | undefined;
  let closeAttempted = false;
  let evidencePath: string | undefined;
  try {
    kernelNode = await open("/proc/self/exe", constants.O_RDONLY);
    const nodeExecutable = await realpath("/proc/self/exe");
    const node = await retainFile(nodeExecutable, 256 * 1024 * 1024); retained.push(node);
    requireCheck(sameFile(await kernelNode.stat(), await node.handle.stat()), "Node pathname no longer identifies this running Node 24 executable.");
    const configuration = await retainFile(join(installedRoot, ".mcp.json"), 64 * 1024); retained.push(configuration);
    const bundle = await retainFile(join(installedRoot, "server/dist/server.mjs"), 64 * 1024 * 1024); retained.push(bundle);
    const configurationJson = await jsonFile(configuration);
    const servers = record(configurationJson["mcpServers"]);
    const config = record(servers["easyeda_pro_control"]);
    const configuredTools = record(config["tools"]);
    requireCheck(config["command"] === "node" && config["type"] === "stdio" && config["cwd"] === "." && config["enabled"] === true &&
      JSON.stringify(config["args"]) === '["server/dist/server.mjs","--machine-launch"]' &&
      Object.keys(record(config["env"])).length === 0 && EXPECTED_TOOLS.every(name => Object.hasOwn(configuredTools, name)),
    "Package does not use the supported configured startup.");
    requireCheck(record(configuredTools["easyeda_control_pcb_string_precreate_validation"])["approval_mode"] === "prompt",
      "String precreate validation must retain prompt approval.");
    const temporaryRoot = await realpath(tmpdir());
    const directory = await createPrivateTemporaryDirectory(join(temporaryRoot, "easyeda-installed-offline-probe-"), "Offline probe evidence");
    evidencePath = directory.path;
    await directory.handle.close();
    const assetsRoot = join(evidencePath, "assets"), controlDirectory = join(evidencePath, "control"), upstreamRoot = join(evidencePath, "upstream");
    const upstreamMarker = join(evidencePath, "upstream-must-not-execute");
    const apiVersion = "0.3.50.ab46409c", pcbVersion = "3.2.193.682ed44e";
    for (const path of [controlDirectory, join(upstreamRoot, "dist"), join(assetsRoot, "pro-pcb", pcbVersion, "js"),
      join(assetsRoot, "pro-api", apiVersion)]) { await mkdir(path, { recursive: true, mode: 0o700 }); }
    await writeFile(join(upstreamRoot, "package.json"), JSON.stringify({ name: "easyeda-mcp-pro", version: "1.0.0-rc.1" }), { flag: "wx", mode: 0o600 });
    await writeFile(join(upstreamRoot, "dist/index.js"),
      `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(upstreamMarker)}, "unexpected"); throw new Error("Offline upstream must not execute.");\n`,
      { flag: "wx", mode: 0o600 });
    for (const path of [join(assetsRoot, "pro-pcb", pcbVersion, "js/pcb.js"),
      ...["api.js", "api-types.js", "api-types.d.ts"].map(name => join(assetsRoot, "pro-api", apiVersion, name))]) {
      await writeFile(path, "Synthetic installation metadata; never execute.\n", { flag: "wx", mode: 0o600 });
    }
    const profilePath = join(controlDirectory, "machine-profile.json");
    await writeFile(profilePath, JSON.stringify({
      schema: "easyeda-pro-control.machine-profile.v1", platform: "linux-x64",
      runtime: { nodeExecutable, nodeVersion: NODE_VERSION, nodeSha256: node.sha256 },
      upstream: { root: upstreamRoot, entrypoint: join(upstreamRoot, "dist/index.js"), serverVersion: "1.0.0-rc.1" },
      easyeda: { assetsRoot, pcbBundleVersion: pcbVersion, publicApiBundleVersion: apiVersion }, controlDirectory,
    }), { flag: "wx", mode: 0o600 });
    for (const file of retained) { await file.assertCurrent(); }
    requireCheck(sameFile(await kernelNode.stat(), await node.handle.stat()), "Original Node kernel identity changed before launch.");
    child = new OfflineChild(`/proc/${process.pid}/fd/${node.handle.fd}`, installedRoot, {
      EASYEDA_MACHINE_PROFILE: profilePath, EASYEDA_CONTROL_DATA_DIR: controlDirectory, LANG: "C", LC_ALL: "C",
    });
    const owned = child;
    const result = await catalogChecks(child, installedRoot, async () => { await owned.sample(controlDirectory, upstreamMarker, nodeExecutable); });
    await child.sample(controlDirectory, upstreamMarker, nodeExecutable);
    closeAttempted = true;
    const closed = await child.close(); child = undefined;
    requireCheck(closed["requests"] === REQUEST_LIMIT, "Offline catalog did not consume its complete fixed request count.");
    await assertClosedOfflineState(controlDirectory, upstreamMarker);
    for (const file of retained) { await file.assertCurrent(); }
    const report = { ok: true, scope: "synthetic-profile-installed-package-offline-catalog;not-runtime-admission",
      installedRoot, evidencePath, nodeVersion: NODE_VERSION, nodeSha256: node.sha256, bundleSha256: bundle.sha256,
      configurationSha256: configuration.sha256, configuredTools: Object.keys(configuredTools).length,
      ...result, closed, postCloseMarkerAbsentAndControlRosterVerified: true, sampledNoDescendantsOrNonStdioSockets: true,
      continuousIsolationVerified: false, liveControlRootSelected: false, connectedValidation: false, executionAuthorized: false };
    await writeFile(join(evidencePath, "result.json"), `${JSON.stringify(report)}\n`, { flag: "wx", mode: 0o600 });
    return report;
  } catch (error) {
    const failures: unknown[] = [error];
    if (child !== undefined && !closeAttempted) { try { await child.close(); } catch (closeError) { failures.push(closeError); } }
    if (evidencePath !== undefined) {
      try {
        await writeFile(join(evidencePath, "failure.json"), `${JSON.stringify({ ok: false,
          scope: "synthetic-profile-installed-package-offline-catalog;not-runtime-admission",
          errors: failures.map(failure => failure instanceof Error ? failure.message.slice(0, 1024) : "Unknown failure"),
          noSignalSent: true, evidenceRetained: true })}\n`, { flag: "wx", mode: 0o600 });
      } catch (publicationError) { failures.push(publicationError); }
    }
    throw new AggregateError(failures, `Offline package probe failed; evidence retained at ${evidencePath ?? "(not created)"}.`, { cause: error });
  } finally {
    await Promise.all([kernelNode?.close(), ...retained.map(async file => { await file.handle.close(); })]);
  }
}

if (import.meta.main) {
  try {
    const [root, ...extra] = process.argv.slice(2);
    requireCheck(root !== undefined && extra.length === 0, "Usage: probe-installed-offline-catalog.ts /absolute/installed/plugin");
    // oxlint-disable-next-line node/no-top-level-await -- This CLI is inert when imported by its focused tests.
    process.stdout.write(`${JSON.stringify(await probeInstalledOfflineCatalog(root))}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : "Offline package probe failed."}\n`);
    process.exitCode = 1;
  }
}
