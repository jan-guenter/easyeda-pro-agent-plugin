#!/usr/bin/env node
/* oxlint-disable import/max-dependencies -- Keep selection, the owned transport and exact MCP identity parsing visible at this manager boundary. */
/* oxlint-disable eslint/max-classes-per-file -- Keep the private final-attempt budget latch beside the manager that exclusively owns its live instance. */
import { once } from "node:events";
import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

import {
  MAXIMUM_REQUEST_BYTES, boundedLines, parseSessionRequest, publishSessionResult,
  selectSessionLaunch, sessionFailureDiagnostic, sessionTransportEnvironment,
} from "./control-session.ts";
import type { CallRequest } from "./control-session.ts";
import { ForegroundSessionTransport } from "./control-session-transport.ts";
import { createPrivateTemporaryDirectory } from "./private-temporary-directory.ts";
import type { PrivateTemporaryDirectory } from "./private-temporary-directory.ts";
import { sessionRetirementOutputSchema } from "../server/src/session-retirement.ts";

const requestId = z.union([z.string().min(1).max(128), z.number().int()]);
const generationSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const commandSchema = z.discriminatedUnion("action", [
  z.strictObject({ id: requestId, action: z.literal("inspect") }),
  z.strictObject({ id: requestId, action: z.literal("retire"), generation: generationSchema, confirmRetire: z.literal(true) }),
  z.strictObject({ id: requestId, action: z.literal("start"), afterGeneration: generationSchema,
    pluginRoot: z.string().refine(root => isAbsolute(root) && resolve(root) === root) }),
  z.strictObject({ id: requestId, action: z.literal("shutdown") }),
  z.strictObject({ id: requestId, action: z.literal("cleanup-startup"), confirmCloseOriginalStartup: z.literal(true) }),
]);
type ManagerCallRequest = CallRequest & { readonly cleanup?: true };
type ManagerRequest = z.infer<typeof commandSchema> | ManagerCallRequest;
type Emitter = (value: unknown) => Promise<void>;
type Stage = "new" | "starting" | "active" | "retiring" | "closing" | "between-facades" | "blocked" | "closed";
const toolResultSchema = z.looseObject({ isError: z.boolean().optional(), structuredContent: z.unknown().optional() });
const loadedFacadeSchema = z.strictObject({ schema: z.literal("easyeda-pro-control.loaded-facade.v1"),
  pid: z.number().int().positive(), moduleUrl: z.string(), nodeVersion: z.literal("v24.18.0"), admissionGranted: z.literal(false) });
const loadedEnvelopeSchema = z.strictObject({ offline: z.literal(true), result: loadedFacadeSchema });
const retirementEnvelopeSchema = z.strictObject({ result: sessionRetirementOutputSchema });
const MAXIMUM_RECORD_BYTES = 67_108_864;
const RECORD_BUDGETS = Object.freeze({ normal: 4096, cleanup: 128, control: 128 });
const BYTE_BUDGETS = Object.freeze({ normal: 1_073_741_824, cleanup: 134_217_728, control: 4_194_304 });
type RecordBudget = keyof typeof RECORD_BUDGETS;

/** Cleanup is a bounded bookkeeping reserve. It grants no tool admission and
 * cannot consume the distinct retirement/startup control budget. */
export function sessionManagerCallBudgetAvailable(cleanup: boolean, records: number, bytes: number): boolean {
  const budget = cleanup ? "cleanup" : "normal";
  return Number.isSafeInteger(records) && records >= 0 && Number.isSafeInteger(bytes) && bytes >= 0 &&
    records + 2 <= RECORD_BUDGETS[budget] && bytes + MAXIMUM_RECORD_BYTES + 65_536 <= BYTE_BUDGETS[budget];
}

/** Reserve final closure proof before dispatch. A verified active refusal is
 * charged to cleanup afterwards; its immutable evidence bytes stay unchanged. */
export function sessionManagerRetirementBudgetAvailable(controlRecords: number, controlBytes: number): boolean {
  return [controlRecords, controlBytes].every(value => Number.isSafeInteger(value) && value >= 0) &&
    controlRecords + 8 <= RECORD_BUDGETS.control && controlBytes + 131_072 <= BYTE_BUDGETS.control;
}

/** This private owner latch permits one final original retirement when cleanup
 * bookkeeping is full. A refusal consumes it; JSON cannot reconstruct it. */
export class SessionManagerRetirementReservation {
  private finalAttempt = false;
  public finalAttemptConsumed(): boolean { return this.finalAttempt; }
  /** Select proof capacity before dispatch. Exhausted cleanup bookkeeping
   * consumes one final attempt whose latch survives refusal and RPC failure. */
  public reserve(controlRecords: number, controlBytes: number, cleanupRecords: number, cleanupBytes: number): "ordinary" | "final" {
    if (this.finalAttempt || !sessionManagerRetirementBudgetAvailable(controlRecords, controlBytes)) {
      throw new Error("manager-control-budget-exhausted");
    }
    if (Number.isSafeInteger(cleanupRecords) && cleanupRecords >= 0 && Number.isSafeInteger(cleanupBytes) && cleanupBytes >= 0 &&
      cleanupRecords + 3 <= RECORD_BUDGETS.cleanup && cleanupBytes + BYTE_BUDGETS.control <= BYTE_BUDGETS.cleanup) { return "ordinary"; }
    this.finalAttempt = true;
    return "final";
  }
}

/** A replacement is admitted only with ready publication and final retirement
 * capacity still reserved. Exhaustion between facades never creates an owner. */
export function sessionManagerStartBudgetAvailable(controlRecords: number, controlBytes: number): boolean {
  return Number.isSafeInteger(controlRecords) && controlRecords >= 0 && Number.isSafeInteger(controlBytes) && controlBytes >= 0 &&
    controlRecords + 11 <= RECORD_BUDGETS.control && controlBytes + 131_072 <= BYTE_BUDGETS.control;
}

/** Manager grammar offers no command, hook, install operation or caller JS. */
export function parseSessionManagerRequest(line: string): ManagerRequest {
  if (Buffer.byteLength(line) > MAXIMUM_REQUEST_BYTES) { throw new Error("request-too-large"); }
  const value: unknown = JSON.parse(line);
  const command = commandSchema.safeParse(value);
  if (command.success) { return command.data; }
  const cleanup = z.looseObject({ cleanup: z.literal(true) }).safeParse(value);
  let call;
  if (cleanup.success) {
    const { cleanup: marker, ...ordinary } = cleanup.data;
    call = { ...parseSessionRequest(JSON.stringify(ordinary)), cleanup: marker };
  } else { call = parseSessionRequest(line); }
  if ("shutdown" in call) { throw new Error("manager-shutdown-command-required"); }
  // Retirement is manager-owned so a generic call cannot release the lease
  // Without settling the original connection and process observations.
  if (call.tool === "easyeda_control_session") { throw new Error("manager-session-command-required"); }
  return call;
}

interface Connection {
  readonly pluginRoot: string;
  readonly transport: ForegroundSessionTransport;
  readonly client: Client;
  readonly tools: Set<string>;
  readonly loadedFacade: z.infer<typeof loadedFacadeSchema>;
}
interface RetainedRecord {
  readonly sequence: number;
  readonly generation: number;
  readonly kind: string;
  readonly budget: RecordBudget;
  readonly evidenceFile?: string;
  readonly bytes?: number;
  readonly sha256?: string;
  readonly unpublishedValue?: unknown;
}

/** One in-memory owner, never reconstructible from caller JSON. Generation is
 * a freshness check only; replacement requires the exact retained retired child
 * and observed closure. Keep this process and its original evidence through an
 * official marketplace upgrade, then explicitly select the replacement root. */
export class ForegroundSessionManager {
  private stage: Stage = "new";
  private generation = 0;
  private connection: Connection | undefined;
  private startingConnection: { client: Client; transport: ForegroundSessionTransport; pluginRoot: string } | undefined;
  private startupCleanupAttempted = false;
  private readonly callerToolDispatches = new WeakSet<ForegroundSessionTransport>();
  private readonly records: RetainedRecord[] = [];
  private requestPending = false;
  private replacementFrom: Connection | undefined;
  private evidence: PrivateTemporaryDirectory | undefined;
  private evidenceBytes = 0;
  private readonly recordCounts = { normal: 0, cleanup: 0, control: 0 };
  private readonly byteCounts = { normal: 0, cleanup: 0, control: 0 };
  private evidenceFault = false;
  private readonly retirementReservation = new SessionManagerRetirementReservation();
  private readonly emit: Emitter;

  /** Publication may be a pipe or a test-controlled recorder. No callback can
   * supply a launch command or substitute process termination evidence. */
  public constructor(emit: Emitter) { this.emit = emit; }

  /** Publish immutable evidence through the retained private directory handle.
   * Keep the full value in memory until file and directory sync complete, then
   * retain only its bounded path, size and hash summary. */
  private async retain(kind: string, value: unknown, budget: RecordBudget = "control"): Promise<void> {
    if (this.evidenceFault) { throw new Error("manager-evidence-unavailable"); }
    const record = Object.freeze({ sequence: this.records.length + 1, generation: this.generation, kind, budget, value });
    // Keep the original in memory before any evidence/publication await. A failed
    // Exclusive write consumes handoff admission and never loses that result.
    if (this.recordCounts[budget] >= RECORD_BUDGETS[budget]) { throw new Error("manager-record-budget-exhausted"); }
    this.recordCounts[budget] += 1;
    this.records.push({ sequence: record.sequence, generation: record.generation, kind, budget, unpublishedValue: value });
    const evidence = this.evidence;
    if (evidence === undefined) { throw new Error("manager-evidence-unavailable"); }
    const bytes = Buffer.from(`${JSON.stringify(record)}\n`);
    if (bytes.length > MAXIMUM_RECORD_BYTES || this.byteCounts[budget] + bytes.length > BYTE_BUDGETS[budget]) {
      throw new Error("manager-evidence-budget-exhausted");
    }
    const name = `${String(record.sequence).padStart(8, "0")}.json`;
    try {
      const file = await open(join(evidence.descriptorPath, name), "wx", 0o600);
      try { await file.writeFile(bytes); await file.sync(); }
      finally { await file.close(); }
      await evidence.handle.sync();
    } catch (error) { this.evidenceFault = true; this.stage = "blocked"; throw error; }
    this.evidenceBytes += bytes.length;
    this.byteCounts[budget] += bytes.length;
    this.records[record.sequence - 1] = Object.freeze({ sequence: record.sequence, generation: record.generation, kind, budget,
      evidenceFile: join(evidence.path, name), bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
  }

  /** Keep the original owner inspectable when evidence writing itself fails.
   * A fault blocks handoff without escaping and abandoning the request loop. */
  private async retainFailure(kind: string, value: unknown): Promise<void> {
    try { await this.retain(kind, value); }
    catch { this.evidenceFault = true; this.stage = "blocked"; }
  }

  /** Retains all results in memory when their external publication fails. */
  public inspect(): Readonly<Record<string, unknown>> {
    const observed = this.startingConnection ?? this.connection;
    return { schema: "easyeda-pro-control.foreground-manager.v1", managerPid: process.pid,
      stage: this.stage, generation: this.generation, requestPending: this.requestPending,
      facadePid: observed?.transport.pid ?? null,
      pluginRoot: observed?.pluginRoot ?? null,
      previousFacade: this.startingConnection === undefined ? null : {
        facadePid: this.connection?.transport.pid ?? null, pluginRoot: this.connection?.pluginRoot ?? null,
        closure: this.connection?.transport.inspectClosure() ?? null },
      evidenceDirectory: this.evidence?.path ?? null,
      closure: observed?.transport.inspectClosure() ?? null,
      recordCount: this.records.length, evidenceBytes: this.evidenceBytes,
      evidenceFault: this.evidenceFault,
      finalRetirementAttemptConsumed: this.retirementReservation.finalAttemptConsumed(),
      startupCleanupAttempted: this.startupCleanupAttempted,
      callerToolDispatchStarted: observed === undefined ? false : this.callerToolDispatches.has(observed.transport),
      budgets: { recordLimits: RECORD_BUDGETS, byteLimits: BYTE_BUDGETS, records: { ...this.recordCounts }, bytes: { ...this.byteCounts } },
      records: this.records.slice(-32).map(({ unpublishedValue: withheld, ...summary }) => Object.assign(summary, { unpublished: withheld !== undefined })),
      admissionGranted: false };
  }

  /** Include response publication in request settlement. An output failure
   * blocks replacement and retains a fixed diagnostic before propagating. */
  private async publish(value: unknown): Promise<void> {
    try { await this.emit(value); }
    catch (error) { this.stage = "blocked"; await this.retainFailure("publication-failed", { privateDiagnosticsWithheld: true }); throw error; }
  }

  /** Initial selection is separate from replacements and is reserved once. */
  public async initialize(pluginRoot: string): Promise<void> {
    if (this.stage !== "new") { throw new Error("manager-initialization-consumed"); }
    this.stage = "starting";
    try {
      this.evidence = await createPrivateTemporaryDirectory(join(tmpdir(), "easyeda-foreground-manager-"), "Foreground manager evidence");
      await this.start(pluginRoot);
    }
    catch (error) { this.stage = "blocked"; await this.retainFailure("start-failed", sessionFailureDiagnostic("connect", error)); throw error; }
  }

  /** Start one verified child and bind its catalog and serving identity before
   * publishing ready. Reserve final retirement proof using actual evidence bytes;
   * any startup failure retains this child for explicit startup cleanup. */
  private async start(pluginRoot: string, id?: string | number): Promise<void> {
    this.stage = "starting";
    // Every newly admitted child needs its own ready records plus a reserved
    // Terminal retirement even when preceding generations filled the log.
    if (!sessionManagerStartBudgetAvailable(this.recordCounts.control, this.byteCounts.control)) {
      throw new Error("manager-control-budget-exhausted");
    }
    if (!isAbsolute(pluginRoot) || resolve(pluginRoot) !== pluginRoot) { throw new Error("plugin-root-not-canonical"); }
    const definition = await selectSessionLaunch(pluginRoot);
    const transport = new ForegroundSessionTransport({ ...definition, env: sessionTransportEnvironment(definition.env) });
    const client = new Client({ name: "easyeda-control-session-manager", version: "0.3.0" });
    // Retain before connecting. Startup errors may still leave a live process;
    // No finally block silently closes an owner with unsettled native work.
    this.startingConnection = { client, transport, pluginRoot };
    await client.connect(transport, { timeout: 30_000 });
    const catalog = await client.listTools({}, { timeout: 30_000 });
    await this.retain("startup-catalog", catalog);
    const names = catalog.tools.map(tool => tool.name);
    if (catalog.nextCursor !== undefined || names.length === 0 || names.length > 256 ||
      new Set(names).size !== names.length || names.some(name => !/^easyeda_control_[a-z][a-z0-9_]*$/u.test(name)) ||
      !names.includes("easyeda_control_api") || !names.includes("easyeda_control_session")) {
      throw new Error("unexpected-facade-catalog");
    }
    const identityResult = await client.callTool({ name: "easyeda_control_api", arguments: { request: { action: "loaded-facade" } } }, undefined, { timeout: 30_000 });
    await this.retain("loaded-facade-result", identityResult);
    const identityEnvelope = toolResultSchema.parse(identityResult);
    if (identityEnvelope.isError === true) { throw new TypeError("loaded-facade-refused"); }
    const loadedFacade = loadedEnvelopeSchema.parse(identityEnvelope.structuredContent).result;
    if (loadedFacade.pid !== transport.pid || loadedFacade.moduleUrl !== pathToFileURL(join(pluginRoot, "server/dist/server.mjs")).href) {
      throw new Error("loaded-facade-identity-mismatch");
    }
    this.generation += 1;
    this.replacementFrom = undefined;
    const ready = { ...(id === undefined ? {} : { id }), ready: true, managerPid: process.pid,
      generation: this.generation, pluginRoot, facadePid: transport.pid, tools: names, loadedFacade,
      evidenceDirectory: this.evidence?.path,
      admissionGranted: false };
    const readyBytes = Buffer.byteLength(`${JSON.stringify({ sequence: this.records.length + 1, generation: this.generation,
      kind: "ready", budget: "control", value: ready })}\n`);
    // The raw catalog's actual bytes are now charged. Reserve the forthcoming
    // Ready record and final retirement before publishing an admitted child.
    if (!sessionManagerRetirementBudgetAvailable(this.recordCounts.control + 1, this.byteCounts.control + readyBytes)) {
      throw new Error("manager-control-budget-exhausted");
    }
    await this.retain("ready", ready);
    await this.publish(ready);
    this.connection = { pluginRoot, transport, client, tools: new Set(names), loadedFacade };
    this.startingConnection = undefined;
    this.stage = "active";
  }

  /** Return only the fully published current connection. Failed startup and
   * retired generations cannot admit caller tools or supply a replacement. */
  private requireActive(): Connection {
    if (this.stage !== "active" || this.connection === undefined) { throw new Error("manager-active-connection-required"); }
    return this.connection;
  }

  /** Consume explicit cleanup before this startup child has served caller tools.
   * EOF and observed exit/close dispose only that child; its connection stays
   * blocked and acquires no retry or replacement permission. */
  private async cleanupStartup(id: string | number): Promise<void> {
    const starting = this.startingConnection;
    if (this.stage !== "blocked" || starting === undefined || this.callerToolDispatches.has(starting.transport) || this.startupCleanupAttempted) {
      throw new Error("manager-startup-cleanup-not-authorized");
    }
    this.startupCleanupAttempted = true;
    await this.retainFailure("startup-cleanup-intent", { id, facadePid: starting.transport.pid, generation: this.generation,
      callerToolDispatchStarted: false, retryAllowed: false, replacementAllowed: false });
    await starting.client.close();
    try { await starting.transport.awaitOwnedClosure(); }
    catch {
      // Failed startup framing remains failed. Cleanup may still establish the
      // Exact original child exit and close without promoting its connection.
      if (starting.transport.inspectClosure() === null) { throw new Error("manager-startup-child-closure-unproven"); }
    }
    const closure = starting.transport.inspectClosure();
    if (closure === null || closure.pid !== starting.transport.pid || !closure.stdinEof || this.startingConnection !== starting) {
      throw new Error("manager-startup-child-closure-unproven");
    }
    await this.retainFailure("startup-child-closure", closure);
    await this.publish({ id, startupClosed: true, generation: this.generation, closure, retryAllowed: false,
      replacementAllowed: false, managerPid: process.pid, evidenceFault: this.evidenceFault });
  }

  /** Retire the exact original facade, then require acknowledged lease release
   * and observed child closure. Only an exact active-state refusal preserves
   * cleanup access; uncertain results never authorize a replacement. */
  private async retire(id: string | number, generation: number, reservation: "ordinary" | "final"): Promise<void> {
    const connection = this.requireActive();
    if (generation !== this.generation) { throw new Error("manager-generation-mismatch"); }
    const firstRecord = this.records.length;
    this.stage = "retiring";
    await this.retain("retirement-intent", { id, generation, facadePid: connection.loadedFacade.pid });
    const result = await connection.client.callTool({ name: "easyeda_control_session",
      arguments: { request: { action: "retire", confirmRetire: true } } }, undefined, { timeout: 600_000 });
    await this.retain("retirement-result", result);
    const envelope = toolResultSchema.parse(result);
    if (envelope.isError === true) {
      // An acknowledged tool refusal can be inspected on its ORIGINAL client.
      // Only exact active state proves preflight refused before cleanup, allowing
      // Original cleanup tools. Transport rejection never enters this branch.
      const inspection = await connection.client.callTool({ name: "easyeda_control_session",
        arguments: { request: { action: "inspect" } } }, undefined, { timeout: 600_000 });
      await this.retain("retirement-refusal-inspection", inspection);
      const inspected = toolResultSchema.parse(inspection);
      if (inspected.isError === true) { throw new TypeError("retirement-refusal-unproven"); }
      const state = retirementEnvelopeSchema.parse(inspected.structuredContent).result;
      if (state.state !== "active" || !state.liveAdmissionOpen || state.leaseReleaseAcknowledged ||
        state.replacementConnectionRequired || state.activeCalls !== 0) { throw new TypeError("retirement-refusal-unproven"); }
      // Only these exact same-owner active observations permit reclassification.
      // The three on-disk records retain their original bytes and hashes; their
      // Current accounting labels move to the reserved cleanup bucket so an
      // Acknowledged final retirement still has its untouched control capacity.
      if (reservation === "ordinary") {
        const refusalRecords = this.records.slice(firstRecord);
        const refusalBytes = refusalRecords.reduce((total, row) => total + (row.bytes ?? 0), 0);
        if (refusalRecords.length !== 3 || refusalRecords.some(row => row.budget !== "control" || row.bytes === undefined) ||
          this.recordCounts.cleanup + 3 > RECORD_BUDGETS.cleanup || this.byteCounts.cleanup + refusalBytes > BYTE_BUDGETS.cleanup) {
          throw new Error("manager-refusal-accounting-unproven");
        }
        this.recordCounts.control -= 3; this.byteCounts.control -= refusalBytes;
        this.recordCounts.cleanup += 3; this.byteCounts.cleanup += refusalBytes;
        for (const [offset, row] of refusalRecords.entries()) {
          this.records[firstRecord + offset] = Object.freeze({ ...row, budget: "cleanup" });
        }
      }
      this.stage = "active";
      await this.publish({ id, retirementRefused: true, generation, result, inspection, replacementAllowed: false,
        finalRetirementAttemptConsumed: this.retirementReservation.finalAttemptConsumed() });
      return;
    }
    const state = retirementEnvelopeSchema.parse(envelope.structuredContent).result;
    if (state.state !== "retired" || state.liveAdmissionOpen || !state.leaseReleaseAcknowledged ||
      !state.replacementConnectionRequired || state.activeCalls !== 0) { throw new Error("retirement-acknowledgement-invalid"); }
    this.stage = "closing";
    await connection.client.close();
    const closure = await connection.transport.awaitOwnedClosure();
    await this.retain("original-child-closure", closure);
    if (closure.pid !== connection.loadedFacade.pid || closure.exitCode !== 0 ||
      closure.signal !== null || !closure.stdinEof) { throw new Error("retired-child-closure-invalid"); }
    this.replacementFrom = connection;
    this.stage = "between-facades";
    await this.publish({ id, retired: true, generation, retirement: state, closure,
      replacementAllowed: true, managerPid: process.pid });
  }

  /** Mark the exact child before caller dispatch and retain its result before
   * output publication. The cleanup marker selects bookkeeping capacity only;
   * facade admission and operation guards still govern the call. */
  private async call(request: ManagerCallRequest): Promise<void> {
    const connection = this.requireActive();
    if (!connection.tools.has(request.tool)) { throw new Error("manager-tool-not-admitted"); }
    // Settlement includes the original call result and durable response/evidence
    // Publication. Retirement is unavailable throughout both boundaries.
    const budget = request.cleanup === true ? "cleanup" : "normal";
    await this.retain("call-intent", { id: request.id, tool: request.tool }, budget);
    this.callerToolDispatches.add(connection.transport);
    const result = await connection.client.callTool({ name: request.tool, arguments: request.arguments }, undefined, { timeout: request.timeoutMs });
    await this.retain("call-result", { id: request.id, result }, budget);
    toolResultSchema.parse(result);
    try { await publishSessionResult(request, result, value => this.publish(value)); }
    catch (error) { this.stage = "blocked"; throw error; }
  }

  /** Serial admission covers invocation and publication. A concurrent request
   * cannot retire a call whose response file or output has not settled. */
  public async handle(line: string): Promise<void> {
    if (this.requestPending) { throw new Error("manager-request-pending"); }
    this.requestPending = true;
    let id: string | number | undefined;
    let reserved = false;
    try {
      const request = parseSessionManagerRequest(line);
      id = request.id;
      if ("tool" in request) {
        const connection = this.requireActive();
        if (!connection.tools.has(request.tool)) { throw new Error("manager-tool-not-admitted"); }
        const budget = request.cleanup === true ? "cleanup" : "normal";
        if (!sessionManagerCallBudgetAvailable(request.cleanup === true, this.recordCounts[budget], this.byteCounts[budget])) {
          throw new Error("manager-cleanup-reserve-required");
        }
        reserved = true;
        await this.call(request); return;
      }
      if (request.action === "inspect") { await this.publish({ id, manager: this.inspect() }); return; }
      if (request.action === "cleanup-startup") {
        const starting = this.startingConnection;
        if (this.stage !== "blocked" || starting === undefined || this.callerToolDispatches.has(starting.transport) || this.startupCleanupAttempted) {
          throw new Error("manager-startup-cleanup-not-authorized");
        }
        reserved = true;
        await this.cleanupStartup(id); return;
      }
      if (request.action === "retire") {
        this.requireActive();
        if (request.generation !== this.generation) { throw new Error("manager-generation-mismatch"); }
        const reservation = this.retirementReservation.reserve(this.recordCounts.control, this.byteCounts.control,
          this.recordCounts.cleanup, this.byteCounts.cleanup);
        reserved = true;
        await this.retire(id, request.generation, reservation); return;
      }
      if (request.action === "start") {
        if (this.stage !== "between-facades" || this.replacementFrom !== this.connection ||
          this.replacementFrom === undefined || request.afterGeneration !== this.generation) {
          throw new Error("manager-replacement-not-authorized");
        }
        if (this.retirementReservation.finalAttemptConsumed()) { throw new Error("manager-control-budget-exhausted"); }
        // Consume the retained permit BEFORE any selector, process or publication
        // Await. Failure never restores it and cannot retry a conflict child.
        this.replacementFrom = undefined;
        reserved = true;
        await this.start(request.pluginRoot, id);
        return;
      }
      const noOwnedProcess = this.connection?.transport.hasUnclosedChild() !== true &&
        this.startingConnection?.transport.hasUnclosedChild() !== true;
      if (this.stage !== "between-facades" && this.stage !== "closed" && !(this.stage === "blocked" && noOwnedProcess)) {
        throw new Error("manager-retirement-required-before-shutdown");
      }
      this.replacementFrom = undefined;
      await this.publish({ id, closing: true });
      await this.evidence?.handle.close();
      this.stage = "closed";
    } catch (error) {
      if (reserved || this.stage === "blocked") { this.stage = "blocked"; this.replacementFrom = undefined; }
      const failure = { ...(id === undefined ? {} : { id }), error: reserved ? "manager-blocked" : "manager-request-rejected", generation: this.generation,
        diagnostic: sessionFailureDiagnostic("requests", error), retryAllowed: false,
        dispatched: reserved, originalOwnerRetained: true };
      if (reserved) { await this.retainFailure("failure", failure); }
      await this.publish(failure);
    } finally { this.requestPending = false; }
  }
}

/** Write one protocol response line while honoring stdout backpressure, so
 * callers await publication before advancing ownership or request state. */
async function emitJson(value: unknown): Promise<void> {
  if (!process.stdout.write(`${JSON.stringify(value)}\n`)) { await once(process.stdout, "drain"); }
}

/** Keep one foreground request loop through startup refusal and explicit cleanup.
 * Closing input cannot silently release an active or ambiguous original owner. */
async function main(): Promise<void> {
  const pluginRoot = process.argv[3];
  if (process.argv.length !== 4 || process.argv[2] !== "--plugin-root" || pluginRoot === undefined) {
    throw new Error("usage-control-session--plugin-root-absolute-path");
  }
  const manager = new ForegroundSessionManager(emitJson);
  try { await manager.initialize(pluginRoot); }
  catch (error) {
    await emitJson({ error: "manager-initialization-failed", diagnostic: sessionFailureDiagnostic("connect", error), manager: manager.inspect() });
  }
  for await (const line of boundedLines(process.stdin)) {
    await manager.handle(line);
    if (manager.inspect()["stage"] === "closed") { return; }
  }
  // EOF during active/ambiguous ownership does not close or release the facade.
  // The referenced original child keeps this manager alive for investigation.
  if (manager.inspect()["stage"] !== "between-facades") {
    await emitJson({ error: "manager-input-closed-with-retained-owner", manager: manager.inspect() });
    process.exitCode = 1;
  }
}

if (import.meta.main) {
  try {
    // oxlint-disable-next-line node/no-top-level-await -- This executable owns one foreground manager; imports never enter its main loop.
    await main();
  } catch (error) {
    process.exitCode = 1;
    process.stdout.write(`${JSON.stringify(sessionFailureDiagnostic("requests", error))}\n`);
  }
}
