#!/usr/bin/env node
/* oxlint-disable import/max-dependencies -- Keep selection, the owned transport and exact MCP identity parsing visible at this manager boundary. */
/* oxlint-disable eslint/max-classes-per-file -- Keep the private final-attempt budget latch beside the manager that exclusively owns its live instance. */
import { once } from "node:events";
import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import type { Writable } from "node:stream";
import { pathToFileURL } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { z } from "zod";

import {
  MAXIMUM_REQUEST_BYTES, SESSION_CALL_TIMEOUT_MS, parseSessionRequest, publishSessionResult,
  selectSessionLaunch, sessionFailureDiagnostic, sessionTransportEnvironment,
} from "./control-session.ts";
import type { CallRequest } from "./control-session.ts";
import { captureOriginalSpatialManagerRequest, consumeOriginalSpatialManagerControl, createOriginalSpatialManagerRecovery, isOriginalSpatialManagerControl,
  learnOriginalSpatialManagerInspection, learnOriginalSpatialManagerWindow, originalSpatialManagerControl } from "./control-session-spatial-adapter.ts";
import type { OriginalSpatialManagerRecovery, OriginalSpatialManagerRequest } from "./control-session-spatial-adapter.ts";
import { captureOriginalViaManagerRequest, isOriginalViaManagerControl, originalViaManagerControl } from "./control-session-via-adapter.ts";
import type { OriginalViaManagerRequest } from "./control-session-via-adapter.ts";
import { captureOriginalSchematicDisplayManagerRequest, isOriginalSchematicDisplayManagerControl, originalSchematicDisplayManagerControl } from "./control-session-schematic-display-adapter.ts";
import type { OriginalSchematicDisplayManagerRequest } from "./control-session-schematic-display-adapter.ts";
import { ForegroundSessionTransport } from "./control-session-transport.ts";
import { createPrivateTemporaryDirectory } from "./private-temporary-directory.ts";
import type { PrivateTemporaryDirectory } from "./private-temporary-directory.ts";
import { sessionRetirementOutputSchema } from "../server/src/session-retirement.ts";
import { currentFootprintForwardPrewriteValidationRequestSchema } from "../server/src/current-footprint-forward-prewrite-validation.ts";
import { currentFootprintForwardSourceValidationInspectionSchema, currentFootprintForwardSourceValidationRequestSchema } from "../server/src/current-footprint-forward-source-validation-schema.ts";
import { currentFootprintForwardSourceRelinquishmentRequestSchema, currentFootprintForwardSourceRelinquishmentResultSchema } from "../server/src/current-footprint-forward-source-relinquishment-contract.ts";
import { diagnosticLifecycleBindingSchema } from "../server/src/current-pcb-diagnostic-binding-schema.ts";

const requestId = z.union([z.string().min(1).max(128), z.number().int()]);
const generationSchema = z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
// These selectors deliberately accept no tool, operation, binding or intent
// Override. The manager supplies those from its private interrupted connection.
const originalCleanupSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("observe-window") }),
  z.strictObject({ action: z.literal("normal-close"), confirmNormalClose: z.literal(true) }),
  z.strictObject({ action: z.literal("abort-component"), confirmAbortOriginalComponentJob: z.literal(true) }),
  z.strictObject({ action: z.literal("inspect") }),
  z.strictObject({ action: z.literal("abort-generation"), confirmAbortOriginalForwardJob: z.literal(true) }),
  z.strictObject({ action: z.literal("observe-termination") }),
  z.strictObject({ action: z.literal("release-closed") }),
  z.strictObject({ action: z.literal("observe-release") }),
  z.strictObject({ action: z.literal("settle-records") }),
  z.strictObject({ action: z.literal("cleanup-before-launch") }),
  z.strictObject({ action: z.literal("cleanup-no-process") }),
  z.strictObject({ action: z.literal("settle-historical-metadata") }),
  z.strictObject({ action: z.literal("abort") }),
  z.strictObject({ action: z.literal("release") }),
  z.strictObject({ action: z.literal("settle-publication") }),
]);
const inFlightControlSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("abort-component"), confirmAbortOriginalComponentJob: z.literal(true) }),
  z.strictObject({ action: z.literal("inspect") }),
  z.strictObject({ action: z.literal("abort") }),
  z.strictObject({ action: z.literal("abort-generation"), confirmAbortOriginalForwardJob: z.literal(true) }),
]);
const commandSchema = z.discriminatedUnion("action", [
  z.strictObject({ id: requestId, action: z.literal("inspect") }),
  z.strictObject({ id: requestId, action: z.literal("retire"), generation: generationSchema, confirmRetire: z.literal(true) }),
  z.strictObject({ id: requestId, action: z.literal("start"), afterGeneration: generationSchema,
    pluginRoot: z.string().refine(root => isAbsolute(root) && resolve(root) === root) }),
  z.strictObject({ id: requestId, action: z.literal("shutdown") }),
  z.strictObject({ id: requestId, action: z.literal("cleanup-startup"), confirmCloseOriginalStartup: z.literal(true) }),
  z.strictObject({ id: requestId, action: z.literal("cleanup-original"), generation: generationSchema,
    interruptedRequestId: requestId, request: originalCleanupSchema,
    responseFile: z.string().refine(isAbsolute).optional() }),
  z.strictObject({ id: requestId, action: z.literal("in-flight-original"), generation: generationSchema,
    originalRequestId: requestId, request: inFlightControlSchema,
    responseFile: z.string().refine(isAbsolute).optional() }),
]);
type ManagerCallRequest = CallRequest & { readonly cleanup?: true };
type ManagerRequest = z.infer<typeof commandSchema> | ManagerCallRequest;
type OriginalCleanupRequest = Extract<z.infer<typeof commandSchema>, { action: "cleanup-original" }>;
type InFlightControlRequest = Extract<z.infer<typeof commandSchema>, { action: "in-flight-original" }>;
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
const inputRejectionSchema = z.strictObject({ reason: z.enum(["request-too-large", "invalid-utf8", "incomplete-request-line"]) });
type InputRejection = z.infer<typeof inputRejectionSchema>;

/** Decode one complete bounded frame without replacement characters or BOM
 * removal. A malformed frame supplies no request text or caller arguments. */
function decodeManagerInput(bytes: Uint8Array): string | InputRejection {
  try { return new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes); }
  catch { return { reason: "invalid-utf8" }; }
}

/** Keep one bounded frame buffer while draining oversized input to its newline.
 * Only complete, strictly decoded UTF-8 frames become request strings. EOF can
 * report a rejected tail, but never reopens the caller's closed input channel. */
export async function* managerInputLines(chunks: AsyncIterable<Buffer>): AsyncGenerator<string | InputRejection> {
  const pending = Buffer.alloc(MAXIMUM_REQUEST_BYTES);
  let discarding = false, length = 0;
  for await (const chunk of chunks) {
    let offset = 0;
    while (offset < chunk.length) {
      const newline = chunk.indexOf(10, offset);
      const end = newline === -1 ? chunk.length : newline;
      const bytes = end - offset;
      if (!discarding) {
        if (bytes > MAXIMUM_REQUEST_BYTES - length) { discarding = true; length = 0; }
        else { chunk.copy(pending, length, offset, end); length += bytes; }
      }
      offset = newline === -1 ? chunk.length : newline + 1;
      if (newline !== -1) {
        const input: string | InputRejection = discarding ? { reason: "request-too-large" } : decodeManagerInput(pending.subarray(0, length));
        discarding = false; length = 0;
        yield input;
      }
    }
  }
  if (discarding) { yield { reason: "request-too-large" }; }
  else if (length > 0) { yield { reason: "incomplete-request-line" }; }
}

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
type ForwardCleanupBinding = Readonly<{ operationId: string; bindingSha256: string }>;
type SourceHistoricalRequest = Readonly<z.infer<typeof currentFootprintForwardSourceRelinquishmentRequestSchema>>;
interface InterruptedCall {
  readonly connection: Connection;
  readonly generation: number;
  readonly requestId: string | number;
  readonly tool: string;
  readonly via: OriginalViaManagerRequest | null;
  readonly schematicDisplay: OriginalSchematicDisplayManagerRequest | null;
  readonly spatial: OriginalSpatialManagerRequest | null;
  readonly spatialRecovery: OriginalSpatialManagerRecovery;
  readonly forwardFamily: "footprint-forward-prewrite" | "footprint-forward-source-validation" | null;
  readonly forward: ForwardCleanupBinding | null;
  readonly forwardLaunchOperationId: string | null;
  readonly forwardSourceOperationId: string | null;
  readonly forwardCapture: boolean;
  readonly sourceHistoricalRequest: SourceHistoricalRequest | null;
  inspectedLaunchBinding?: ForwardCleanupBinding;
  prelaunchCleanupAcknowledged?: true;
  intentSha256?: string;
  readonly forwardAction: string | null;
  readonly originalCaptureRequestId?: string | number;
  readonly abortReservation: { attempted: boolean };
}
/** Fixed tool selection comes only from the retained original strict request. */
function originalManagerTool(original: InterruptedCall): string {
  if (original.spatial !== null) { return "easyeda_control_pcb209_opening"; }
  if (original.schematicDisplay !== null) { return "easyeda_control_current_schematic_relevance_display_write"; }
  return original.via === null ? "easyeda_control_pcb209_worker_startup" : "easyeda_control_current_pcb_via_write";
}
function originalManagerInFlightAllowed(original: InterruptedCall, action: string): boolean {
  if (original.spatial !== null) { return isOriginalSpatialManagerControl(action, true, original.spatial.family); }
  if (original.via !== null) { return original.via.action === "execute" && isOriginalViaManagerControl(action, true); }
  if (original.schematicDisplay !== null) { return original.schematicDisplay.action === "execute" && isOriginalSchematicDisplayManagerControl(action, true); }
  return original.forward !== null && original.forwardCapture && (action === "inspect" || action === "abort-generation");
}
interface InFlightCapture {
  readonly original: InterruptedCall;
  readonly controls: Set<string | number>;
  rpcPending: boolean;
  parentOutcome: "pending" | "returned" | "unknown";
  sidePending: boolean;
  sideIdle: Promise<null>;
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

/** The private original family selects one fixed registered grammar. Caller
 * cleanup JSON supplies no wrapper, tool, operation or binding override. */
function originalForwardArguments(interrupted: InterruptedCall, input: Record<string, unknown>): CallRequest["arguments"] {
  if (interrupted.forwardFamily === "footprint-forward-source-validation") {
    return { request: { action: interrupted.forwardFamily, request: currentFootprintForwardSourceValidationRequestSchema.parse(input) } };
  }
  if (interrupted.forwardFamily !== "footprint-forward-prewrite") { throw new Error("manager-original-family-required"); }
  return { request: { action: interrupted.forwardFamily, request: currentFootprintForwardPrewriteValidationRequestSchema.parse(input) } };
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
  private interrupted: InterruptedCall | undefined;
  private inFlight: InFlightCapture | undefined;
  private controlledCapture: InFlightCapture | undefined;
  private evidenceTail: Promise<null> = Promise.resolve(null);
  private publicationTail: Promise<null> = Promise.resolve(null);
  private retirementUncertain = false;
  private evidence: PrivateTemporaryDirectory | undefined;
  private evidenceBytes = 0;
  private readonly recordCounts = { normal: 0, cleanup: 0, control: 0 };
  private readonly byteCounts = { normal: 0, cleanup: 0, control: 0 };
  private evidenceFault = false;
  private publicationFault = false;
  private readonly retirementReservation = new SessionManagerRetirementReservation();
  private readonly emit: Emitter;

  /** Publication may be a pipe or a test-controlled recorder. No callback can
   * supply a launch command or substitute process termination evidence. */
  public constructor(emit: Emitter) { this.emit = emit; }

  /** Publish immutable evidence through the retained private directory handle.
   * Keep the full value in memory until file and directory sync complete, then
   * retain only its bounded path, size and hash summary. */
  private async retain(kind: string, value: unknown, budget: RecordBudget = "control"): Promise<RetainedRecord> {
    const previous = this.evidenceTail; const done = Promise.withResolvers<null>(); this.evidenceTail = done.promise;
    await previous;
    try { return await this.retainRecord(kind, value, budget); }
    finally { done.resolve(null); }
  }

  /** Serialize exclusive files, sequence numbers and byte accounting across
   * the parent result and its one bounded original side-control lane. */
  private async retainRecord(kind: string, value: unknown, budget: RecordBudget): Promise<RetainedRecord> {
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
    const receipt = Object.freeze({ sequence: record.sequence, generation: record.generation, kind, budget,
      evidenceFile: join(evidence.path, name), bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
    this.records[record.sequence - 1] = receipt; return receipt;
  }

  /** Keep the original owner inspectable when evidence writing itself fails.
   * A fault blocks handoff without escaping and abandoning the request loop. */
  private async retainFailure(kind: string, value: unknown, budget: RecordBudget = "control"): Promise<void> {
    try { await this.retain(kind, value, budget); }
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
      publicationFault: this.publicationFault,
      finalRetirementAttemptConsumed: this.retirementReservation.finalAttemptConsumed(),
      startupCleanupAttempted: this.startupCleanupAttempted,
      callerToolDispatchStarted: observed === undefined ? false : this.callerToolDispatches.has(observed.transport),
      inFlightRequest: this.inFlight === undefined ? null : { id: this.inFlight.original.requestId,
        generation: this.inFlight.original.generation, tool: this.inFlight.original.tool, forward: this.inFlight.original.forward, via: this.inFlight.original.via, schematicDisplay: this.inFlight.original.schematicDisplay, spatial: this.inFlight.original.spatial,
        rpcPending: this.inFlight.rpcPending, sidePending: this.inFlight.sidePending, controlCalls: this.inFlight.controls.size,
        abortAttempted: this.inFlight.original.abortReservation.attempted },
      controlledCapture: this.controlledCapture === undefined ? null : { id: this.controlledCapture.original.requestId,
        generation: this.controlledCapture.original.generation, forward: this.controlledCapture.original.forward, parentOutcome: this.controlledCapture.parentOutcome },
      interruptedRequest: this.interrupted === undefined ? null : { id: this.interrupted.requestId,
        generation: this.interrupted.generation, tool: this.interrupted.tool, action: this.interrupted.spatial?.action ?? this.interrupted.via?.action ?? this.interrupted.schematicDisplay?.action ?? this.interrupted.forwardAction, via: this.interrupted.via, schematicDisplay: this.interrupted.schematicDisplay, spatial: this.interrupted.spatial,
        ...(this.interrupted.originalCaptureRequestId === undefined ? {} : { originalCaptureRequestId: this.interrupted.originalCaptureRequestId }),
        forward: this.interrupted.forward ?? this.interrupted.inspectedLaunchBinding ?? null, outcome: "unknown", cleanupAvailable: this.stage === "blocked" &&
          !this.retirementUncertain && (this.interrupted.forward !== null || this.interrupted.forwardLaunchOperationId !== null || this.interrupted.forwardSourceOperationId !== null || this.interrupted.sourceHistoricalRequest !== null || this.interrupted.via !== null || this.interrupted.schematicDisplay !== null || this.interrupted.spatial !== null) &&
          this.interrupted.connection === this.connection && this.connection.client.transport === this.connection.transport &&
          this.connection.transport.hasUnclosedChild() && !this.evidenceFault && !this.publicationFault &&
          !this.records.some(row => Object.hasOwn(row, "unpublishedValue")) },
      retirementUncertain: this.retirementUncertain,
      budgets: { recordLimits: RECORD_BUDGETS, byteLimits: BYTE_BUDGETS, records: { ...this.recordCounts }, bytes: { ...this.byteCounts } },
      records: this.records.slice(-32).map(({ unpublishedValue: withheld, ...summary }) => Object.assign(summary, { unpublished: withheld !== undefined })),
      admissionGranted: false };
  }

  /** Include response publication in request settlement. An output failure
   * blocks replacement and retains a fixed diagnostic before propagating. */
  private async publish(value: unknown): Promise<void> {
    const previous = this.publicationTail; const done = Promise.withResolvers<null>(); this.publicationTail = done.promise;
    await previous;
    try { await this.emit(value); }
    catch (error) { this.publicationFault = true; this.stage = "blocked"; await this.retainFailure("publication-failed", { privateDiagnosticsWithheld: true }); throw error; }
    finally { done.resolve(null); }
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
    this.interrupted = undefined; this.controlledCapture = undefined;
    this.retirementUncertain = false;
    this.startingConnection = undefined;
    this.stage = "active";
  }

  /** Return only the fully published current connection. Failed startup and
   * retired generations cannot admit caller tools or supply a replacement. */
  private requireActive(): Connection {
    if (this.stage !== "active" || this.connection === undefined) { throw new Error("manager-active-connection-required"); }
    return this.connection;
  }

  /** Timeout leaves the original SDK client and native owner in custody. Only
   * that private interrupted connection may reach fresh retirement preflight;
   * an ambiguous retirement itself never authorizes another attempt. */
  private requireRetirable(): Connection {
    if (this.retirementUncertain) { throw new Error("manager-retirement-outcome-unknown"); }
    if (this.evidenceFault || this.publicationFault || this.records.some(row => Object.hasOwn(row, "unpublishedValue"))) { throw new Error("manager-evidence-unsettled"); }
    if (this.stage === "active") { return this.requireActive(); }
    const connection = this.connection, interrupted = this.interrupted ?? this.controlledCapture?.original;
    if (this.stage !== "blocked" || interrupted === undefined || interrupted.forward === null && interrupted.inspectedLaunchBinding === undefined && interrupted.prelaunchCleanupAcknowledged !== true && interrupted.forwardSourceOperationId === null && interrupted.sourceHistoricalRequest === null && interrupted.via === null && interrupted.schematicDisplay === null && interrupted.spatial === null || connection === undefined ||
        interrupted.connection !== connection || interrupted.generation !== this.generation ||
        connection.client.transport !== connection.transport || !connection.transport.hasUnclosedChild()) {
      throw new Error("manager-original-connection-required");
    }
    return connection;
  }

  /** Capture only strict registered forward arguments before caller dispatch.
   * Reparsed JSON is comparison data; the retained Connection supplies custody. */
  private interruptedCall(connection: Connection, request: ManagerCallRequest): InterruptedCall {
    const family = z.discriminatedUnion("action", [
      z.strictObject({ action: z.literal("footprint-forward-prewrite"), request: currentFootprintForwardPrewriteValidationRequestSchema }),
      z.strictObject({ action: z.literal("footprint-forward-source-validation"), request: currentFootprintForwardSourceValidationRequestSchema }),
    ]);
    const outer = z.strictObject({ request: family }).safeParse(request.arguments);
    const selected = outer.success ? outer.data.request.request : null;
    const forward = request.tool === "easyeda_control_pcb209_worker_startup" && selected !== null &&
      "expectedBindingSha256" in selected ? Object.freeze({ operationId: selected.operationId, bindingSha256: selected.expectedBindingSha256 }) : null;
    const forwardLaunchOperationId = request.tool === "easyeda_control_pcb209_worker_startup" && selected?.action === "launch" ? selected.operationId : null;
    // Retain strict Source operation-only custody without a native binding.
    // Only this original facade can authorize cleanup or retirement.
    const sourceOperationOnly = selected?.action === "inspect" || selected?.action === "settle-records" ||
      selected?.action === "cleanup-before-launch" || selected?.action === "cleanup-no-process";
    const forwardSourceOperationId = request.tool === "easyeda_control_pcb209_worker_startup" && outer.success &&
      outer.data.request.action === "footprint-forward-source-validation" && sourceOperationOnly && selected !== null ? selected.operationId : null;
    const historical = z.strictObject({ request: z.strictObject({ action: z.literal("footprint-forward-source-relinquishment"),
      request: currentFootprintForwardSourceRelinquishmentRequestSchema }) }).safeParse(request.arguments);
    const sourceHistoricalRequest = request.tool === "easyeda_control_pcb209_worker_startup" && historical.success ? Object.freeze(historical.data.request.request) : null;
    const spatial = captureOriginalSpatialManagerRequest(request.tool, request.arguments);
    return { connection, generation: this.generation, requestId: request.id, tool: request.tool, via: captureOriginalViaManagerRequest(request.tool, request.arguments), schematicDisplay: captureOriginalSchematicDisplayManagerRequest(request.tool, request.arguments), spatial, spatialRecovery: createOriginalSpatialManagerRecovery(spatial),
      forwardFamily: outer.success && request.tool === "easyeda_control_pcb209_worker_startup" ? outer.data.request.action : null,
      forward, forwardLaunchOperationId, forwardSourceOperationId, forwardCapture: selected?.action === "capture-project" || selected?.action === "capture-source", sourceHistoricalRequest,
      forwardAction: selected?.action ?? null, abortReservation: { attempted: false } };
  }

  /** This is a private in-process scheduling fact, never caller JSON or a
   * status-derived owner. Only the CLI driver uses it to retain one parent task. */
  public hasInFlightCapture(): boolean { return this.requestPending && this.inFlight !== undefined; }

  /** Admit only this exact original capture while its SDK request is pending.
   * Every other action remains on the existing serial owner path. */
  private requireInFlightControl(request: InFlightControlRequest, held?: InFlightCapture): InFlightCapture {
    const current = this.inFlight; const connection = this.connection;
    const supported = current !== undefined && originalManagerInFlightAllowed(current.original, request.request.action);
    const tool = current === undefined ? "" : originalManagerTool(current.original);
    if (!this.requestPending || current === undefined || !current.rpcPending || current.sidePending && current !== held || connection === undefined ||
        current.original.connection !== connection || current.original.generation !== this.generation || request.generation !== this.generation ||
        request.originalRequestId !== current.original.requestId || request.id === current.original.requestId || current.controls.has(request.id) ||
        current.controls.size >= 16 || !supported ||
        connection.client.transport !== connection.transport || !connection.transport.hasUnclosedChild() ||
        !connection.tools.has(tool) || this.retirementUncertain || this.evidenceFault || this.publicationFault ||
        this.records.some(row => Object.hasOwn(row, "unpublishedValue")) ||
        (request.request.action === "abort-component" || request.request.action === "abort-generation" || request.request.action === "abort") && current.original.abortReservation.attempted) {
      throw new Error("manager-in-flight-original-not-authorized");
    }
    return current;
  }

  /** Generate one fixed inspect/confirmed-abort call on the original client.
   * A side result never resolves the parent capture or grants replacement. */
  public async handleInFlight(line: string | InputRejection): Promise<void> {
    const current = this.inFlight;
    if (!this.requestPending || current === undefined || current.sidePending) { throw new Error("manager-in-flight-side-pending"); }
    // Claim the one side slot synchronously, including local inspection and
    // Refusal publication. The parent cannot settle around backpressured output.
    const idle = Promise.withResolvers<null>(); current.sidePending = true; current.sideIdle = idle.promise;
    let id: string | number | undefined;
    let dispatched = false;
    let reservation = false;
    try {
      if (typeof line !== "string") { throw new TypeError("manager-input-rejected"); }
      if (Buffer.byteLength(line) > MAXIMUM_REQUEST_BYTES) { throw new Error("request-too-large"); }
      // Correlation is data only; the complete strict selector below still
      // Decides admission, and no caller field supplies resource ownership.
      const correlation = z.looseObject({ id: requestId }).safeParse(JSON.parse(line));
      if (correlation.success) { id = correlation.data.id; }
      const request = parseSessionManagerRequest(line); id = request.id;
      if (!("tool" in request) && request.action === "inspect") { await this.publish({ id, manager: this.inspect() }); return; }
      if ("tool" in request || request.action !== "in-flight-original") { throw new Error("manager-in-flight-command-required"); }
      if (this.requireInFlightControl(request, current) !== current) { throw new Error("manager-in-flight-original-not-authorized"); }
      if (!sessionManagerCallBudgetAvailable(true, this.recordCounts.cleanup + 1, this.byteCounts.cleanup)) { throw new Error("manager-cleanup-reserve-required"); }
      const binding = current.original.forward, schematicDisplay = current.original.schematicDisplay, spatial = current.original.spatial, via = current.original.via;
      if (binding === null && via === null && schematicDisplay === null && spatial === null) { throw new Error("manager-in-flight-original-not-authorized"); }
      const selectedVia = via === null ? null : originalViaManagerControl(via, request.request.action);
      const selectedSchematicDisplay = schematicDisplay === null ? null : originalSchematicDisplayManagerControl(schematicDisplay, request.request.action);
      const selectedSpatial = spatial === null ? null : originalSpatialManagerControl(spatial, current.original.spatialRecovery, request.request);
      const input = selectedSpatial?.arguments.request ?? selectedVia?.arguments.request ?? selectedSchematicDisplay?.arguments.request ?? (request.request.action === "inspect" ? { action: "inspect" as const, operationId: binding?.operationId } : {
        action: "abort-generation" as const, operationId: binding?.operationId, expectedBindingSha256: binding?.bindingSha256, confirmAbortOriginalForwardJob: true as const });
      const call: CallRequest = { id, tool: selectedSpatial?.tool ?? selectedVia?.tool ?? selectedSchematicDisplay?.tool ?? "easyeda_control_pcb209_worker_startup", timeoutMs: 120_000,
        arguments: selectedSpatial?.arguments ?? selectedVia?.arguments ?? selectedSchematicDisplay?.arguments ?? originalForwardArguments(current.original, input),
        ...(request.responseFile === undefined ? {} : { responseFile: request.responseFile }) };
      reservation = true;
      await this.retain("in-flight-control-intent", { id, originalRequestId: current.original.requestId,
        generation: current.original.generation, tool: call.tool, request: input, wrapperAction: current.original.spatial?.family ?? current.original.forwardFamily }, "cleanup");
      // Publication may outlast the parent SDK request. A no-longer-pending
      // Parent refuses before dispatch and consumes no abort attempt.
      if (this.requireInFlightControl(request, current) !== current) { throw new Error("manager-in-flight-original-not-authorized"); }
      current.controls.add(id);
      if (request.request.action === "abort-component" || request.request.action === "abort-generation" || request.request.action === "abort") {
        current.original.abortReservation.attempted = true; this.controlledCapture = current; this.stage = "blocked";
      }
      if (spatial !== null) { consumeOriginalSpatialManagerControl(current.original.spatialRecovery, request.request.action); }
      let result: unknown;
      dispatched = true;
      try { result = await current.original.connection.client.callTool({ name: call.tool, arguments: call.arguments }, undefined, { timeout: call.timeoutMs }); }
      catch (error) {
        // This is the actual rejected side request, not an invented timeout of
        // The parent. Its same-owner binding remains available after settlement.
        this.interrupted = { ...this.interruptedCall(current.original.connection, call), forward: binding,
          originalCaptureRequestId: current.original.requestId, abortReservation: current.original.abortReservation, via: current.original.via, schematicDisplay: current.original.schematicDisplay, spatial, spatialRecovery: current.original.spatialRecovery };
        this.stage = "blocked"; throw error;
      }
      const evidence = await this.retain("in-flight-control-result", { id, originalRequestId: current.original.requestId, result }, "cleanup");
      toolResultSchema.parse(result);
      if (spatial !== null) {
        if (this.inFlight !== current || this.connection !== current.original.connection || this.generation !== current.original.generation) { throw new Error("manager-spatial-original-connection-changed"); }
        if (request.request.action === "inspect") { learnOriginalSpatialManagerInspection(spatial, current.original.spatialRecovery, result); }
      }
      await this.publishCallResult(call, result, evidence);
    } catch (error) {
      if (dispatched || this.evidenceFault || this.publicationFault) { this.stage = "blocked"; this.replacementFrom = undefined; }
      const failure = { ...(id === undefined ? {} : { id }), error: dispatched ? "manager-blocked" : "manager-request-rejected", generation: this.generation,
        diagnostic: sessionFailureDiagnostic("requests", error), retryAllowed: false, dispatched, originalOwnerRetained: true };
      if (reservation) { await this.retainFailure("in-flight-control-failure", failure, "cleanup"); }
      await this.publish(failure);
    } finally {
      // The parent holds normal admission until both native requests and their
      // Exact evidence/output publications have settled.
      current.sidePending = false; idle.resolve(null);
    }
  }

  /** Reject foreign, disconnected or unpublished original state before any
   * reservation. Invalid cleanup input cannot freeze a healthy active owner. */
  private requireOriginalCleanup(request: OriginalCleanupRequest): Readonly<{
    connection: Connection; interrupted: InterruptedCall; operationId: string; binding: ForwardCleanupBinding | undefined;
  }> {
    if (request.request.action === "settle-historical-metadata") { throw new Error("manager-original-family-required"); }
    const connection = this.connection, interrupted = this.interrupted ?? this.controlledCapture?.original;
    if (this.stage !== "blocked" || interrupted === undefined || interrupted.forward === null && interrupted.forwardLaunchOperationId === null && interrupted.forwardSourceOperationId === null && interrupted.via === null && interrupted.schematicDisplay === null && interrupted.spatial === null || connection === undefined ||
        this.retirementUncertain || this.evidenceFault || this.publicationFault || this.records.some(row => Object.hasOwn(row, "unpublishedValue")) ||
        interrupted.connection !== connection || interrupted.generation !== this.generation || request.generation !== this.generation ||
        request.interruptedRequestId !== interrupted.requestId || connection.client.transport !== connection.transport ||
        !connection.transport.hasUnclosedChild() || !connection.tools.has(originalManagerTool(interrupted))) {
      throw new Error("manager-original-cleanup-not-authorized");
    }
    if (interrupted.spatial !== null) {
      originalSpatialManagerControl(interrupted.spatial, interrupted.spatialRecovery, request.request);
      return { connection, interrupted, operationId: interrupted.spatial.operationId, binding: undefined };
    }
    if (request.request.action === "observe-window" || request.request.action === "normal-close") { throw new Error("manager-original-spatial-control-required"); }
    if (interrupted.via !== null) {
      if (!isOriginalViaManagerControl(request.request.action) || request.request.action === "abort" && interrupted.abortReservation.attempted) { throw new Error("manager-original-via-control-refused"); }
      return { connection, interrupted, operationId: interrupted.via.operationId, binding: undefined };
    }
    if (interrupted.schematicDisplay !== null) {
      if (!isOriginalSchematicDisplayManagerControl(request.request.action) || request.request.action === "abort" && interrupted.abortReservation.attempted) { throw new Error("manager-original-schematic-display-control-refused"); }
      return { connection, interrupted, operationId: interrupted.schematicDisplay.operationId, binding: undefined };
    }
    if (request.request.action === "abort" || request.request.action === "release" || request.request.action === "settle-publication") { throw new Error("manager-original-family-required"); }
    const binding = interrupted.forward ?? interrupted.inspectedLaunchBinding;
    const operationId = binding?.operationId ?? interrupted.forwardLaunchOperationId ?? interrupted.forwardSourceOperationId;
    const unboundSource = interrupted.forwardFamily === "footprint-forward-source-validation" &&
      (interrupted.forwardLaunchOperationId !== null || interrupted.forwardSourceOperationId !== null);
    if (request.request.action === "observe-release" && interrupted.forwardFamily !== "footprint-forward-source-validation") {
      throw new Error("manager-original-family-required");
    }
    const localSourceCleanup = interrupted.forwardFamily === "footprint-forward-source-validation" && request.request.action === "settle-records" ||
      unboundSource && (request.request.action === "cleanup-before-launch" || request.request.action === "cleanup-no-process");
    if ((request.request.action === "cleanup-before-launch" || request.request.action === "cleanup-no-process") && !unboundSource) {
      throw new Error("manager-original-family-required");
    }
    if (operationId === null || binding === undefined && request.request.action !== "inspect" && !localSourceCleanup) {
      throw new Error("manager-original-launch-inspection-required");
    }
    if (request.request.action === "settle-records" && interrupted.forwardFamily !== "footprint-forward-source-validation" && interrupted.intentSha256 === undefined) {
      throw new Error("manager-original-intent-inspection-required");
    }
    if (request.request.action === "abort-generation" && interrupted.abortReservation.attempted) {
      throw new Error("manager-original-abort-consumed");
    }
    return { connection, interrupted, operationId, binding };
  }

  /** Historical custody retains only the strict original metadata request.
   * It grants no live Forward family, native binding or reconstructed owner. */
  private requireHistoricalSettlement(request: OriginalCleanupRequest): Readonly<{
    connection: Connection; interrupted: InterruptedCall; original: SourceHistoricalRequest;
  }> {
    const connection = this.connection, interrupted = this.interrupted;
    if (request.request.action !== "settle-historical-metadata" || this.stage !== "blocked" || interrupted === undefined ||
        interrupted.sourceHistoricalRequest === null || connection === undefined || this.retirementUncertain || this.evidenceFault || this.publicationFault ||
        this.records.some(row => Object.hasOwn(row, "unpublishedValue")) || interrupted.connection !== connection ||
        interrupted.generation !== this.generation || request.generation !== this.generation || request.interruptedRequestId !== interrupted.requestId ||
        interrupted.tool !== "easyeda_control_pcb209_worker_startup" || connection.client.transport !== connection.transport ||
        !connection.transport.hasUnclosedChild() || !connection.tools.has("easyeda_control_pcb209_worker_startup")) {
      throw new Error("manager-historical-settlement-not-authorized");
    }
    return { connection, interrupted, original: interrupted.sourceHistoricalRequest };
  }

  /** Settle only this original facade's pending or already-complete metadata.
   * A strict matching receipt acknowledges no capture or native outcome. */
  private async settleHistoricalMetadata(request: OriginalCleanupRequest): Promise<void> {
    const { connection, interrupted, original } = this.requireHistoricalSettlement(request);
    const input = currentFootprintForwardSourceRelinquishmentRequestSchema.parse({ ...original, action: "settle-unknown-source-opening" });
    const call: CallRequest = { id: request.id, tool: "easyeda_control_pcb209_worker_startup", timeoutMs: SESSION_CALL_TIMEOUT_MS,
      arguments: { request: { action: "footprint-forward-source-relinquishment", request: input } },
      ...(request.responseFile === undefined ? {} : { responseFile: request.responseFile }) };
    await this.retain("original-cleanup-intent", { id: request.id, interruptedRequestId: interrupted.requestId,
      generation: this.generation, tool: call.tool, request: input, wrapperAction: "footprint-forward-source-relinquishment" }, "cleanup");
    this.requireHistoricalSettlement(request);
    const result = await connection.client.callTool({ name: call.tool, arguments: call.arguments }, undefined, { timeout: call.timeoutMs });
    const evidence = await this.retain("original-cleanup-result", { id: request.id, result }, "cleanup");
    this.requireHistoricalSettlement(request);
    const envelope = toolResultSchema.parse(result);
    const acknowledged = z.strictObject({ result: currentFootprintForwardSourceRelinquishmentResultSchema }).safeParse(envelope.structuredContent);
    if (envelope.isError === true || envelope["ok"] === false || !acknowledged.success) { throw new Error("manager-historical-settlement-receipt-required"); }
    const receipt = acknowledged.data.result;
    if (receipt.operationId !== original.operationId || receipt.originalManifestSha256 !== original.expectedManifestSha256 ||
        receipt.originalRosterSha256 !== original.expectedRosterSha256 || receipt.originalIntentSha256 !== original.expectedIntentSha256 ||
        receipt.originalBindingSha256 !== original.expectedBindingSha256) { throw new Error("manager-historical-settlement-receipt-mismatch"); }
    await this.publishCallResult(call, result, evidence);
  }

  /** A historical binding alone cannot identify this interrupted operation. The
   * facade emits the settlement marker only for its matching private attempt
   * and held launch lease. This same-client observation supplies cleanup data;
   * the original facade's private native guards still authorize every action.
   */
  private learnOriginalLaunchBinding(interrupted: InterruptedCall, operationId: string, envelope: z.infer<typeof toolResultSchema>): void {
    if (this.interrupted !== interrupted || this.connection !== interrupted.connection || this.generation !== interrupted.generation) {
      throw new Error("manager-original-launch-inspection-required");
    }
    const originalSourceOperation = interrupted.forwardFamily === "footprint-forward-source-validation" && interrupted.forwardSourceOperationId === operationId;
    if (interrupted.forwardLaunchOperationId !== operationId && !originalSourceOperation || interrupted.inspectedLaunchBinding !== undefined) { return; }
    if (interrupted.forwardFamily === "footprint-forward-source-validation") {
      const captured = z.looseObject({ ok: z.literal(true).optional(), result: currentFootprintForwardSourceValidationInspectionSchema }).safeParse(envelope.structuredContent);
      if (!captured.success) { return; }
      const inspected = captured.data.result;
      if (inspected.operationId !== operationId || !inspected.originalBindingRetained || !inspected.publicationSettlementAvailable ||
        inspected.publicationPending || inspected.binding === null || inspected.binding.rootCreated === "0" || inspected.bindingSha256 === null) { return; }
      interrupted.inspectedLaunchBinding = Object.freeze({ operationId, bindingSha256: inspected.bindingSha256 });
      if (inspected.intentSha256 !== null) { interrupted.intentSha256 = inspected.intentSha256; }
      return;
    }
    const inspected = z.looseObject({ ok: z.literal(true).optional(), result: z.looseObject({ ok: z.literal(true).optional(),
      operationId: z.literal(operationId), state: z.literal("launched"),
      launchAcknowledged: z.literal(true), publicationSettlementAvailable: z.literal(true),
      binding: diagnosticLifecycleBindingSchema.refine(value => value.rootCreated !== "0"),
      bindingSha256: z.string().regex(/^[a-f0-9]{64}$/u), intentSha256: z.string().regex(/^[a-f0-9]{64}$/u) }) }).safeParse(envelope.structuredContent);
    if (!inspected.success) { return; }
    const result = inspected.data.result;
    interrupted.inspectedLaunchBinding = Object.freeze({ operationId, bindingSha256: result.bindingSha256 });
    interrupted.intentSha256 = result.intentSha256;
  }

  /** Generate one allowlisted original-owner cleanup call. Normal/replay routes
   * remain blocked, and no cleanup result settles the interrupted call's unknown
   * outcome. Only the facade's own final retirement can release that custody. */
  private async cleanupOriginal(request: OriginalCleanupRequest): Promise<void> {
    const { binding, connection, interrupted, operationId } = this.requireOriginalCleanup(request);
    const selected = request.request;
    if (interrupted.spatial !== null) {
      const command = originalSpatialManagerControl(interrupted.spatial, interrupted.spatialRecovery, selected);
      const call: CallRequest = { id: request.id, tool: command.tool, arguments: command.arguments, timeoutMs: SESSION_CALL_TIMEOUT_MS,
        ...(request.responseFile === undefined ? {} : { responseFile: request.responseFile }) };
      await this.retain("original-cleanup-intent", { id: request.id, interruptedRequestId: interrupted.requestId,
        generation: this.generation, tool: call.tool, request: command.arguments.request, wrapperAction: interrupted.spatial.family }, "cleanup");
      this.requireOriginalCleanup(request); consumeOriginalSpatialManagerControl(interrupted.spatialRecovery, selected.action);
      const result = await connection.client.callTool({ name: call.tool, arguments: call.arguments }, undefined, { timeout: call.timeoutMs });
      const evidence = await this.retain("original-cleanup-result", { id: request.id, result }, "cleanup"); toolResultSchema.parse(result);
      if (selected.action === "inspect") { learnOriginalSpatialManagerInspection(interrupted.spatial, interrupted.spatialRecovery, result); }
      if (selected.action === "observe-window") { learnOriginalSpatialManagerWindow(interrupted.spatial, interrupted.spatialRecovery, result); }
      await this.publishCallResult(call, result, evidence); return;
    }
    if (interrupted.via !== null) {
      const command = originalViaManagerControl(interrupted.via, selected.action);
      const call: CallRequest = { id: request.id, tool: command.tool, arguments: command.arguments, timeoutMs: SESSION_CALL_TIMEOUT_MS,
        ...(request.responseFile === undefined ? {} : { responseFile: request.responseFile }) };
      await this.retain("original-cleanup-intent", { id: request.id, interruptedRequestId: interrupted.requestId,
        generation: this.generation, tool: call.tool, request: command.arguments.request }, "cleanup");
      this.requireOriginalCleanup(request);
      if (selected.action === "abort") { interrupted.abortReservation.attempted = true; }
      const result = await connection.client.callTool({ name: call.tool, arguments: call.arguments }, undefined, { timeout: call.timeoutMs });
      const evidence = await this.retain("original-cleanup-result", { id: request.id, result }, "cleanup");
      toolResultSchema.parse(result); await this.publishCallResult(call, result, evidence); return;
    }
    if (interrupted.schematicDisplay !== null) {
      const command = originalSchematicDisplayManagerControl(interrupted.schematicDisplay, selected.action);
      const call: CallRequest = { id: request.id, tool: command.tool, arguments: command.arguments, timeoutMs: SESSION_CALL_TIMEOUT_MS,
        ...(request.responseFile === undefined ? {} : { responseFile: request.responseFile }) };
      await this.retain("original-cleanup-intent", { id: request.id, interruptedRequestId: interrupted.requestId,
        generation: this.generation, tool: call.tool, request: command.arguments.request }, "cleanup");
      this.requireOriginalCleanup(request);
      if (selected.action === "abort") { interrupted.abortReservation.attempted = true; }
      const result = await connection.client.callTool({ name: call.tool, arguments: call.arguments }, undefined, { timeout: call.timeoutMs });
      const evidence = await this.retain("original-cleanup-result", { id: request.id, result }, "cleanup");
      toolResultSchema.parse(result); await this.publishCallResult(call, result, evidence); return;
    }
    const input: Record<string, unknown> = { ...selected, operationId };
    if (selected.action === "settle-records" && interrupted.forwardFamily !== "footprint-forward-source-validation") { input["expectedIntentSha256"] = interrupted.intentSha256; }
    else if (selected.action !== "inspect" && selected.action !== "settle-records" && selected.action !== "cleanup-before-launch" && selected.action !== "cleanup-no-process") {
      if (binding === undefined) { throw new Error("manager-original-launch-inspection-required"); }
      input["expectedBindingSha256"] = binding.bindingSha256;
    }
    const call: CallRequest = { id: request.id, tool: "easyeda_control_pcb209_worker_startup", timeoutMs: SESSION_CALL_TIMEOUT_MS,
      arguments: originalForwardArguments(interrupted, input),
      ...(request.responseFile === undefined ? {} : { responseFile: request.responseFile }) };
    await this.retain("original-cleanup-intent", { id: request.id, interruptedRequestId: interrupted.requestId,
      generation: this.generation, tool: call.tool, request: input, wrapperAction: interrupted.forwardFamily }, "cleanup");
    if (selected.action === "abort-generation") { interrupted.abortReservation.attempted = true; }
    const result = await connection.client.callTool({ name: call.tool, arguments: call.arguments }, undefined, { timeout: call.timeoutMs });
    const evidence = await this.retain("original-cleanup-result", { id: request.id, result }, "cleanup");
    const envelope = toolResultSchema.parse(result);
    if ((selected.action === "cleanup-before-launch" || selected.action === "cleanup-no-process") &&
        interrupted.forwardFamily === "footprint-forward-source-validation" && envelope.isError !== true && envelope["ok"] !== false) {
      const cleanupResult = z.strictObject({ cleanupCompleted: z.literal(true) });
      const acknowledged = z.looseObject({ ok: z.literal(true).optional(), result: z.strictObject({
        schema: z.literal("easyeda-pro-control.footprint-forward-source-validation-step.v1"), operationId: z.literal(operationId),
        action: z.literal(selected.action), result: cleanupResult,
        executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
      }) }).safeParse(envelope.structuredContent);
      if (acknowledged.success) { interrupted.prelaunchCleanupAcknowledged = true; }
    }
    if (selected.action === "inspect" && envelope.isError !== true && envelope["ok"] !== false) {
      this.requireOriginalCleanup(request);
      if (binding === undefined) { this.learnOriginalLaunchBinding(interrupted, operationId, envelope); }
      const currentBinding = interrupted.forward ?? interrupted.inspectedLaunchBinding;
      const inspected = currentBinding === undefined ? null : z.looseObject({ ok: z.literal(true).optional(), result: z.looseObject({
        ok: z.literal(true).optional(), operationId: z.literal(currentBinding.operationId),
        bindingSha256: z.literal(currentBinding.bindingSha256), intentSha256: z.string().regex(/^[a-f0-9]{64}$/u).optional() }) }).safeParse(envelope.structuredContent);
      if (inspected?.success === true && inspected.data.result.intentSha256 !== undefined) {
        if (interrupted.intentSha256 !== undefined && interrupted.intentSha256 !== inspected.data.result.intentSha256) {
          throw new Error("manager-original-intent-changed");
        }
        interrupted.intentSha256 = inspected.data.result.intentSha256;
      }
    }
    await this.publishCallResult(call, result, evidence);
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
    const connection = this.requireRetirable();
    const interrupted = this.interrupted ?? this.controlledCapture?.original;
    if (generation !== this.generation) { throw new Error("manager-generation-mismatch"); }
    const firstRecord = this.records.length;
    this.stage = "retiring";
    this.retirementUncertain = true;
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
        state.replacementConnectionRequired || interrupted === undefined && state.activeCalls !== 0) { throw new TypeError("retirement-refusal-unproven"); }
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
      this.stage = interrupted === undefined ? "active" : "blocked";
      await this.publish({ id, retirementRefused: true, generation, result, inspection, replacementAllowed: false,
        finalRetirementAttemptConsumed: this.retirementReservation.finalAttemptConsumed() });
      this.retirementUncertain = false;
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
    this.retirementUncertain = false;
  }

  /** Mark the exact child before caller dispatch and retain its result before
   * output publication. The cleanup marker selects bookkeeping capacity only;
   * facade admission and operation guards still govern the call. */
  private async call(request: ManagerCallRequest, interrupted: InterruptedCall): Promise<void> {
    const connection = this.requireActive();
    if (!connection.tools.has(request.tool)) { throw new Error("manager-tool-not-admitted"); }
    // Settlement includes the original call result and durable response/evidence
    // Publication. Retirement is unavailable throughout both boundaries.
    const budget = request.cleanup === true ? "cleanup" : "normal";
    await this.retain("call-intent", { id: request.id, tool: request.tool }, budget);
    this.callerToolDispatches.add(connection.transport);
    let result: unknown;
    const current = this.inFlight?.original === interrupted ? this.inFlight : undefined;
    if (current !== undefined) { current.rpcPending = true; }
    try {
      result = await connection.client.callTool({ name: request.tool, arguments: request.arguments }, undefined, { timeout: request.timeoutMs });
      if (current !== undefined) { current.parentOutcome = "returned"; }
    }
    catch (error) {
      if (current !== undefined) { current.parentOutcome = "unknown"; }
      this.interrupted = interrupted; this.stage = "blocked"; throw error;
    }
    finally { if (current !== undefined) { current.rpcPending = false; } }
    // A returned result with failed retention/publication keeps the earlier
    // Strict evidence freeze. It cannot mint timeout-cleanup authority.
    const evidence = await this.retain("call-result", { id: request.id, result }, budget);
    toolResultSchema.parse(result);
    await this.publishCallResult(request, result, evidence);
  }

  /** A complete retained result can refuse delivery before any file or output
   * write. Report its exact evidence without replaying the facade operation;
   * actual publication failures preserve the existing custody freeze. */
  private async publishCallResult(request: CallRequest, result: unknown, evidence: RetainedRecord): Promise<void> {
    try {
      const outcome = await publishSessionResult(request, result, value => this.publish(value));
      if (outcome === "published") { return; }
      if (evidence?.generation !== this.generation ||
          !["call-result", "original-cleanup-result", "in-flight-control-result"].includes(evidence.kind) ||
          evidence.evidenceFile === undefined || evidence.sha256 === undefined || evidence.bytes === undefined ||
          Object.hasOwn(evidence, "unpublishedValue")) { throw new Error("manager-result-evidence-unsettled"); }
      await this.publish({ id: request.id, error: "result-publication-refused", dispatched: true, reason: outcome,
        resultRetainedInEvidence: true, evidenceFile: evidence.evidenceFile, bytes: evidence.bytes,
        sha256: evidence.sha256, retryAllowed: false });
    } catch (error) { this.publicationFault = true; throw error; }
  }

  /** Serial admission covers invocation and publication. A concurrent request
   * cannot retire a call whose response file or output has not settled. */
  public async handle(line: string | InputRejection): Promise<void> {
    if (this.requestPending) { throw new Error("manager-request-pending"); }
    this.requestPending = true;
    let id: string | number | undefined;
    let reserved = false;
    let failureBudget: RecordBudget = "control";
    let framingReason: InputRejection["reason"] | undefined;
    try {
      if (typeof line !== "string") {
        framingReason = inputRejectionSchema.parse(line).reason;
        throw new Error("manager-input-rejected");
      }
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
        const interrupted = this.interruptedCall(connection, request);
        if (request.cleanup !== true && (interrupted.forwardCapture && interrupted.forward !== null || interrupted.via?.action === "execute" || interrupted.schematicDisplay?.action === "execute" || interrupted.spatial !== null)) {
          this.inFlight = { original: interrupted, controls: new Set(), rpcPending: false, parentOutcome: "pending", sidePending: false, sideIdle: Promise.resolve(null) };
        }
        await this.call(request, interrupted); return;
      }
      if (request.action === "inspect") { await this.publish({ id, manager: this.inspect() }); return; }
      if (request.action === "in-flight-original") { throw new Error("manager-in-flight-original-not-authorized"); }
      if (request.action === "cleanup-original") {
        void (request.request.action === "settle-historical-metadata" ? this.requireHistoricalSettlement(request) : this.requireOriginalCleanup(request));
        // Reserve intent, largest possible result and a failure record without
        // Spending the separate terminal retirement/control capacity.
        if (!sessionManagerCallBudgetAvailable(true, this.recordCounts.cleanup + 1, this.byteCounts.cleanup)) {
          throw new Error("manager-cleanup-reserve-required");
        }
        failureBudget = "cleanup";
        reserved = true;
        await (request.request.action === "settle-historical-metadata" ? this.settleHistoricalMetadata(request) : this.cleanupOriginal(request));
        return;
      }
      if (request.action === "cleanup-startup") {
        const starting = this.startingConnection;
        if (this.stage !== "blocked" || starting === undefined || this.callerToolDispatches.has(starting.transport) || this.startupCleanupAttempted) {
          throw new Error("manager-startup-cleanup-not-authorized");
        }
        reserved = true;
        await this.cleanupStartup(id); return;
      }
      if (request.action === "retire") {
        this.requireRetirable();
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
        diagnostic: { ...sessionFailureDiagnostic("requests", error), ...(framingReason === undefined ? {} : { reason: framingReason }) }, retryAllowed: false,
        dispatched: reserved, originalOwnerRetained: true };
      if (reserved) { await this.retainFailure("failure", failure, failureBudget); }
      await this.publish(failure);
    } finally {
      const current = this.inFlight;
      if (current !== undefined) { while (current.sidePending) { await current.sideIdle; } this.inFlight = undefined; }
      this.requestPending = false;
    }
  }
}

/** Retain one original capture task while reading only its fixed bounded
 * side-control lane. Every other owner operation keeps serial CLI admission;
 * returning at EOF never closes, retires or replaces the retained child. */
export async function runManagerInput(manager: ForegroundSessionManager, chunks: AsyncIterable<Buffer>): Promise<"closed" | "input-closed"> {
  let parent: Promise<void> | undefined;
  let parentFailed = false;
  let parentError: unknown;
  /** Observe only the original task; this watcher never admits another call. */
  const observeParent = async (pending: Promise<void>): Promise<void> => {
    try { await pending; }
    catch (error) { parentFailed = true; parentError = error; }
    finally { if (parent === pending) { parent = undefined; } }
  };
  for await (const line of managerInputLines(chunks)) {
    if (parentFailed) { throw parentError; }
    if (parent !== undefined && !manager.hasInFlightCapture()) { await parent; parent = undefined; }
    if (parent === undefined) {
      const pending = manager.handle(line);
      if (manager.hasInFlightCapture()) { parent = pending; void observeParent(pending); }
      else { await pending; }
    } else { await manager.handleInFlight(line); }
    if (manager.inspect()["stage"] === "closed") { return "closed"; }
  }
  await parent;
  if (parentFailed) { throw parentError; }
  return "input-closed";
}

/** Install permanent output-error custody before the first publication. A
 * successful write admission alone proves no delivery; await its callback and
 * backpressure before the manager can advance its original ownership state. */
export function createManagerOutputPublisher(output: Writable): Emitter {
  let failed = false;
  // Resolving this latch also handles an idle failure before the next write.
  const failure = Promise.withResolvers<null>();
  const fail = (): void => { if (!failed) { failed = true; failure.resolve(null); } };
  output.on("error", fail);
  output.on("close", fail);
  return async (value: unknown): Promise<void> => {
    if (failed) { throw new Error("manager-output-unavailable"); }
    const drainAbort = new AbortController();
    const written = Promise.withResolvers<null>();
    let drained: Promise<unknown> = Promise.resolve();
    try {
      // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Writable admission and drain do not prove completion; await its original write callback too.
      if (!output.write(`${JSON.stringify(value)}\n`, error => {
        if (error) { fail(); written.reject(new Error("manager-output-unavailable")); }
        else { written.resolve(null); }
      })) { drained = once(output, "drain", { signal: drainAbort.signal }); }
    } catch { fail(); written.reject(new Error("manager-output-unavailable")); }
    try { await Promise.race([Promise.all([written.promise, drained]), failure.promise]); }
    catch { throw new Error("manager-output-unavailable"); }
    finally { drainAbort.abort(); }
    if (failed) { throw new Error("manager-output-unavailable"); }
  };
}

/** Keep one foreground request loop through startup refusal and explicit cleanup.
 * Closing input cannot silently release an active or ambiguous original owner. */
async function main(emitJson: Emitter): Promise<void> {
  const pluginRoot = process.argv[3];
  if (process.argv.length !== 4 || process.argv[2] !== "--plugin-root" || pluginRoot === undefined) {
    throw new Error("usage-control-session--plugin-root-absolute-path");
  }
  const manager = new ForegroundSessionManager(emitJson);
  try { await manager.initialize(pluginRoot); }
  catch (error) {
    await emitJson({ error: "manager-initialization-failed", diagnostic: sessionFailureDiagnostic("connect", error), manager: manager.inspect() });
  }
  if (await runManagerInput(manager, process.stdin) === "closed") { return; }
  // EOF during active/ambiguous ownership does not close or release the facade.
  // The referenced original child keeps this manager alive for investigation.
  if (manager.inspect()["stage"] !== "between-facades") {
    await emitJson({ error: "manager-input-closed-with-retained-owner", manager: manager.inspect() });
    process.exitCode = 1;
  }
}

/** The source CLI and standalone frontend enter this same original manager
 * runner. Bundling disables imported main guards before calling it explicitly. */
export async function runForegroundManagerCli(): Promise<void> {
  const emitJson = createManagerOutputPublisher(process.stdout);
  try {
    await main(emitJson);
  } catch (error) {
    process.exitCode = 1;
    // The original child remains referenced when output has become unusable.
    // The same failed channel cannot publish another diagnostic or recover.
    try {
      await emitJson(sessionFailureDiagnostic("requests", error));
    } catch {
      // The persistent output failure is already retained.
    }
  }
}

if (import.meta.main) {
  // oxlint-disable-next-line node/no-top-level-await -- The executable owns the original frontend; importing its class or runner starts no connection.
  await runForegroundManagerCli();
}
