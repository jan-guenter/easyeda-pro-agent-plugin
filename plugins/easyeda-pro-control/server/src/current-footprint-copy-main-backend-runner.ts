/** One original-main startup continuation and construction capture. This runner
 * never opens a project, invokes an application callback, samples a clock or
 * grants a writer. The native transport retains root/Job/socket ownership. */
/* oxlint-disable import/max-dependencies -- The sole main scheduler directly joins its fixed grammars, source issuers and genuine native-owner capability; separating them would obscure the original lease boundary. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { types } from "node:util";
import { z } from "zod";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REGISTRATION_BREAKPOINT_ID as REGISTRATION_ID, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_APP_URL_PATTERN as URL_PATTERN, decodeCurrentFootprintCopyMainBackendArray,
  decodeCurrentFootprintCopyMainBackendFunction, decodeCurrentFootprintCopyMainBackendNative, validateCurrentFootprintCopyMainBackendCommand } from "./current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendCommand as Command } from "./current-footprint-copy-main-backend-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_EXPRESSION as EXPRESSION,
  CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_GROUP as GROUP } from "./current-footprint-copy-main-backend-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE as SOURCE, captureCurrentFootprintCopyMainBackendSourceReply,
  qualifyCurrentFootprintCopyMainBackendSource, requireCurrentFootprintCopyMainBackendSource } from "./current-footprint-copy-main-backend-source.ts";
import type { CurrentFootprintCopyMainBackendSource as QualifiedSource, CurrentFootprintCopyMainBackendRole as Role } from "./current-footprint-copy-main-backend-source.ts";
import { currentFootprintCopyMainBackendObservationSchema } from "./current-footprint-copy-main-backend-observation.ts";
import type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-observation.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as PROFILE } from "./current-footprint-copy-main-transport-contract.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS } from "./current-footprint-copy-main-backend-budget.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES, CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS,
  currentFootprintCopyMainRequestAllocatedId, validateCurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "./current-footprint-copy-main-request-protocol.ts";
import { qualifyCurrentFootprintCopyMainRequestSource, requireCurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import type { CurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import { qualifyCurrentFootprintCopyMainCompletionSource, requireCurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS, currentFootprintCopyMainCompletionAllocatedId, validateCurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionOrigin, CurrentFootprintCopyMainCompletionOriginBindings } from "./current-footprint-copy-main-completion-origin.ts";
// oxlint-disable-next-line import/no-cycle -- The collector's issuer getter returns here; transfer is invoked only after both original owners exist, never during initialization.
import { requireCurrentFootprintCopyMainRequestHeldFinalPb, transferCurrentFootprintCopyMainRequestHeldFinalPb, transferCurrentFootprintForwardMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
// oxlint-disable-next-line import/no-cycle -- The native owner constructs this runner; its original private-factory guards are invoked only after that construction, never at module initialization. A callback registration seam would weaken this authority check.
import { assertCurrentFootprintCombinedMainCompletionCapacity, beginCurrentFootprintCombinedMainCompletion, currentFootprintCombinedMainGenerationExited, failCurrentFootprintCombinedMainCompletion, requireCurrentFootprintCombinedMainCapability, requireCurrentFootprintCombinedMainCleanup, requireCurrentFootprintCombinedPairedSchedule, requireCurrentFootprintHeadAgeBootstrapCapability, retireCurrentFootprintCombinedMainCompletion, sendCurrentFootprintCombinedMainCommand, sendCurrentFootprintCombinedMainCompletion } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCombinedMainCapability } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM, decodeCurrentFootprintHeadAgeContextAccessor, decodeCurrentFootprintHeadAgeContextArray, decodeCurrentFootprintHeadAgeContextScopes, qualifyCurrentFootprintHeadAgeContextSource, requireCurrentFootprintHeadAgeContextSource } from "./current-footprint-head-age-context.ts";
import type { CurrentFootprintHeadAgeBootstrapCapability, CurrentFootprintHeadAgeContextSource } from "./current-footprint-head-age-context.ts";
import { CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM, CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS, CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM,
  decodeCurrentFootprintHeadAgeArray, decodeCurrentFootprintHeadAgeMainObservation, decodeCurrentFootprintHeadAgeNativeMethod } from "./current-footprint-head-age-main.ts";
import type { CurrentFootprintHeadAgeMainObservation } from "./current-footprint-head-age-main.ts";
import { validateClockControlScope } from "./symbol-clock-controls.ts";
import { decodeCurrentFootprintHeadAgeCdpReply, isCurrentFootprintHeadAgeCdpPhase, rejectCurrentFootprintHeadAgeCdpException } from "./current-footprint-head-age-cdp-exception.ts";
import { qualifyCurrentProjectStructureMainSource, requireCurrentProjectStructureMainSource } from "./current-project-structure-main-source.ts";
import { CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS, validateCurrentProjectStructureMainCommand } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainCommand } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainBinding, CurrentProjectStructureMainLease } from "./current-project-structure-main-lease.ts";
import type { CurrentFootprintForwardMainCursor, CurrentFootprintForwardMainCursorSnapshot } from "./current-footprint-forward-main-cursor.ts";

/* oxlint-disable import/no-cycle -- Both issuers resolve original private registries only after construction; initialization issues no capability or native request. */
import { assertCurrentFootprintForwardExecutionMainCompletionCapacity, beginCurrentFootprintForwardExecutionMainCompletion,
  currentFootprintForwardExecutionMainGenerationExited, failCurrentFootprintForwardExecutionMainCompletion,
  isCurrentFootprintForwardExecutionMainCapability, pollCurrentFootprintForwardExecutionMain,
  reproveCurrentFootprintForwardExecutionMainPublication,
  requireCurrentFootprintForwardExecutionMainCapability, requireCurrentFootprintForwardExecutionMainCleanup,
  retireCurrentFootprintForwardExecutionMainCompletion, sendCurrentFootprintForwardExecutionMainCommand,
  sendCurrentFootprintForwardExecutionMainCompletion } from "./current-footprint-forward-execution-main-capability.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentFootprintForwardExecutionMainCapability } from "./current-footprint-forward-execution-main-capability.ts";

import { captureCurrentFootprintForwardExecutionPrototypes, requireCurrentFootprintForwardExecutionPrototypes } from "./current-footprint-forward-execution-opening-identity.ts";
/* oxlint-disable import/no-cycle -- Only the original dedicated native factory issues this capability after both constructors exist; an injectable registration hook would lose original-owner authority. */
import { currentProjectStructureMainGenerationExited, isCurrentProjectStructureMainCapability, requireCurrentProjectStructureMainCapability,
  requireCurrentProjectStructureMainCleanup, sendCurrentProjectStructureMainCommand } from "./current-project-structure-main-capability.ts";
/* oxlint-enable import/no-cycle */
import type { CurrentProjectStructureMainCapability } from "./current-project-structure-main-capability.ts";

// oxlint-disable-next-line import/no-cycle -- The actual selected-file native factory creates this runner; no capability issues during module initialization.
import { requireCurrentSelectedFileMainSqlFenceBootstrap, sendCurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-bootstrap.ts";
import type { CurrentSelectedFileMainSqlFenceBootstrap } from "./current-selected-file-main-sql-fence-bootstrap.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SOURCE as SQL_SOURCE, qualifyCurrentSelectedFileMainSqlFenceSource } from "./current-selected-file-main-sql-fence-source.ts";
import type { CurrentSelectedFileMainSqlFenceSite } from "./current-selected-file-main-sql-fence-source.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CAPTURE_PROGRAM as SQL_CAPTURE, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONDITIONS as SQL_CONDITIONS, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CONFIGURATION_PROGRAM as SQL_CONFIGURATION,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as SQL_REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as SQL_CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_EARLY_ID as SQL_EARLY_ID,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as SQL_FRAME, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_NATIVE_EXPRESSION as SQL_NATIVE_EXPRESSION,
  CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUESTS as SQL_REQUESTS, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_SITES as SQL_SITES,
  validateCurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import type { CurrentSelectedFileMainSqlFenceCommand } from "./current-selected-file-main-sql-fence-protocol.ts";
import { decodeCurrentSelectedFileMainSqlFenceNative, decodeCurrentSelectedFileMainSqlFenceNativeArray } from "./current-selected-file-main-sql-fence-replies.ts";

type MainCapability = CurrentFootprintCombinedMainCapability | CurrentFootprintForwardExecutionMainCapability | CurrentProjectStructureMainCapability;
function mainCapability(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  if (isCurrentProjectStructureMainCapability(capability)) { requireCurrentProjectStructureMainCapability(capability, runner); }
  else if (isCurrentFootprintForwardExecutionMainCapability(capability)) { requireCurrentFootprintForwardExecutionMainCapability(capability, runner); }
  else { requireCurrentFootprintCombinedMainCapability(capability, runner); }
}
function mainCleanup(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  if (isCurrentProjectStructureMainCapability(capability)) { requireCurrentProjectStructureMainCleanup(capability, runner); }
  else if (isCurrentFootprintForwardExecutionMainCapability(capability)) { requireCurrentFootprintForwardExecutionMainCleanup(capability, runner); }
  else { requireCurrentFootprintCombinedMainCleanup(capability, runner); }
}
function mainExited(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): boolean {
  if (isCurrentProjectStructureMainCapability(capability)) { return currentProjectStructureMainGenerationExited(capability, runner); }
  return isCurrentFootprintForwardExecutionMainCapability(capability) ? currentFootprintForwardExecutionMainGenerationExited(capability, runner) : currentFootprintCombinedMainGenerationExited(capability, runner);
}
async function mainCommand(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner,
  command: CurrentFootprintCopyMainRequestCollectCommand | CurrentProjectStructureMainCommand, id: number): Promise<void> {
  if (isCurrentProjectStructureMainCapability(capability)) { await sendCurrentProjectStructureMainCommand(capability, runner, validateCurrentProjectStructureMainCommand(command), id); return; }
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? sendCurrentFootprintForwardExecutionMainCommand(capability, runner, validateCurrentFootprintCopyMainRequestCollectCommand(command), id) : sendCurrentFootprintCombinedMainCommand(capability, runner, command, id));
}
function mainCompletionCapacity(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner, first: number): void {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  if (isCurrentFootprintForwardExecutionMainCapability(capability)) { assertCurrentFootprintForwardExecutionMainCompletionCapacity(capability, runner, first); }
  else { assertCurrentFootprintCombinedMainCompletionCapacity(capability, runner, first); }
}
async function mainCompletionBegin(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner, first: number): Promise<void> {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? beginCurrentFootprintForwardExecutionMainCompletion(capability, runner, first) : beginCurrentFootprintCombinedMainCompletion(capability, runner, first));
}
async function mainCompletionCommand(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner,
  command: CurrentFootprintCopyMainCompletionCommand, id: number): Promise<void> {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? sendCurrentFootprintForwardExecutionMainCompletion(capability, runner, command, id) : sendCurrentFootprintCombinedMainCompletion(capability, runner, command, id));
}
async function mainCompletionRetire(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): Promise<void> {
  need(!isCurrentProjectStructureMainCapability(capability), "STRUCTURE_COMPLETION_ROLE_UNAVAILABLE");
  await (isCurrentFootprintForwardExecutionMainCapability(capability) ? retireCurrentFootprintForwardExecutionMainCompletion(capability, runner) : retireCurrentFootprintCombinedMainCompletion(capability, runner));
}
function mainCompletionFail(capability: MainCapability, runner: CurrentFootprintCopyMainBackendRunner): void {
  if (isCurrentProjectStructureMainCapability(capability)) { return; }
  if (isCurrentFootprintForwardExecutionMainCapability(capability)) { failCurrentFootprintForwardExecutionMainCompletion(capability, runner); }
  else { failCurrentFootprintCombinedMainCompletion(capability, runner); }
}

export { currentFootprintCopyMainBackendObservationSchema } from "./current-footprint-copy-main-backend-observation.ts";
export type { CurrentFootprintCopyMainBackendObservation } from "./current-footprint-copy-main-backend-observation.ts";
export { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS } from "./current-footprint-copy-main-backend-budget.ts";

export interface CurrentFootprintCopyMainBackendTransport {
  readonly assertCurrent: () => Promise<void>;
  readonly send: (command: Command, id: number) => Promise<void>;
  /** Canonical base64 chunks of NUL-separated UTF-8 inspector messages. */
  readonly poll: (cleanup: boolean) => Promise<string>;
}
export interface CurrentFootprintCopyMainRequestOrigin {
  readonly profile: "private.current-footprint-copy-main-request-origin.v1"; readonly executionAuthorized: false;
}
export interface CurrentFootprintCopyMainRequestOriginEvent {
  readonly method: "Debugger.paused" | "Debugger.resumed"; readonly params: unknown;
}
export interface CurrentFootprintCopyMainRequestOriginBindings {
  readonly scriptId: string; readonly retainedArrayObjectId: string; readonly driverCallbackObjectId: string;
  readonly qualifiedSource: CurrentFootprintCopyMainRequestSource;
  readonly assertOriginal: () => Promise<void>; readonly assertCleanup: () => Promise<void>;
  readonly assertOriginalGenerationExited: () => Promise<void>;
  readonly request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean) => Promise<unknown>;
  readonly pump: (cleanup: boolean) => Promise<void>;
  readonly takeEvent: () => CurrentFootprintCopyMainRequestOriginEvent | null;
  readonly retire: () => Promise<void>;
}
export interface CurrentFootprintForwardMainRequestOrigin {
  readonly profile: "private.current-footprint-forward-main-request-origin.v2"; readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardMainCompletionOrigin {
  readonly profile: "private.current-footprint-forward-main-completion-origin.v2"; readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardMainRequestOriginBindings extends CurrentFootprintCopyMainRequestOriginBindings {
  readonly fail: (error: unknown) => void;
  readonly request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void) => Promise<unknown>;
  readonly settleAllocation: () => Promise<void>;
}
export interface CurrentFootprintForwardMainCompletionOriginBindings extends CurrentFootprintCopyMainCompletionOriginBindings {
  readonly request: (command: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void) => Promise<unknown>;
  readonly settleAllocation: () => Promise<void>;
}
type MainRequestOrigin = CurrentFootprintCopyMainRequestOrigin | CurrentFootprintForwardMainRequestOrigin;
type MainCompletionOrigin = CurrentFootprintCopyMainCompletionOrigin | CurrentFootprintForwardMainCompletionOrigin;
interface OriginEntry { readonly kind: "combined" | "forward"; readonly assertOriginalEntry: () => void; readonly bindings: CurrentFootprintForwardMainRequestOriginBindings;
  readonly capability: MainCapability; readonly runner: CurrentFootprintCopyMainBackendRunner }
const requestOrigins = new WeakMap<object, OriginEntry>();
const completionOrigins = new WeakMap<object, Readonly<{
  kind: "combined" | "forward"; assertOriginalEntry: () => void; bindings: CurrentFootprintForwardMainCompletionOriginBindings;
}>>();
const structureLeases = new WeakMap<CurrentProjectStructureMainLease, Readonly<{
  assertOriginalEntry: () => void; binding: CurrentProjectStructureMainBinding;
}>>();
const forwardMainCursors = new WeakMap<CurrentFootprintForwardMainCursor, Readonly<{
  runner: CurrentFootprintCopyMainBackendRunner;
  snapshot: () => CurrentFootprintForwardMainCursorSnapshot;
}>>();
/** Original cursor observations carry no send permission. The future writer
 * issuer must independently bind this exact runner to its own v2 generation. */
export function requireCurrentFootprintForwardMainCursor(token: CurrentFootprintForwardMainCursor,
  runner: CurrentFootprintCopyMainBackendRunner): CurrentFootprintForwardMainCursorSnapshot {
  const held = forwardMainCursors.get(token); need(held !== undefined && held.runner === runner, "FORWARD_CURSOR_ORIGINAL"); return held.snapshot();
}
/** Sequential handoff requires an acknowledged original upload retirement,
 * with every reply, event, pause and capture settled. This proof neither
 * issues a structure lease nor relaxes the old mutually exclusive purposes. */
export function requireCurrentFootprintForwardMainUploadSettlement(token: CurrentFootprintForwardMainCursor,
  runner: CurrentFootprintCopyMainBackendRunner): CurrentFootprintForwardMainCursorSnapshot {
  const snapshot = requireCurrentFootprintForwardMainCursor(token, runner);
  need(snapshot.phase === "upload-settled" && !snapshot.busy && !snapshot.incompleteFrame && snapshot.pendingReplies === 0 && snapshot.pendingEvents === 0 &&
    !snapshot.paused, "FORWARD_CURSOR_UPLOAD_UNSETTLED"); return snapshot;
}
/** Require the construction runner's exact token; caller JSON cannot issue a
 * structure request lease or replace its original transport and event cursor. */
export function requireCurrentProjectStructureMainLease(token: CurrentProjectStructureMainLease): CurrentProjectStructureMainBinding {
  const entry = structureLeases.get(token); need(entry !== undefined, "STRUCTURE_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.binding;
}
export function requireCurrentFootprintCopyMainCompletionOrigin(token: CurrentFootprintCopyMainCompletionOrigin): CurrentFootprintCopyMainCompletionOriginBindings {
  const entry = completionOrigins.get(token); need(entry !== undefined && entry.kind === "combined", "COMPLETION_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
export function requireCurrentFootprintCopyMainRequestOrigin(token: CurrentFootprintCopyMainRequestOrigin): CurrentFootprintCopyMainRequestOriginBindings {
  const entry = requestOrigins.get(token); need(entry !== undefined && entry.kind === "combined", "REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
/** The actual native issuer joins both origins through the same retained
 * combined core. Equal plan bytes or a foreign genuine clock packet fail. */
export function requireCurrentFootprintCopyMainRequestClockOrigin(token: CurrentFootprintCopyMainRequestOrigin,
  clock: CurrentFootprintCopyClockRpcOrigin): void {
  const entry = requestOrigins.get(token); need(entry !== undefined && entry.kind === "combined", "REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); need(!isCurrentFootprintForwardExecutionMainCapability(entry.capability) && !isCurrentProjectStructureMainCapability(entry.capability), "REQUEST_ORIGINAL_LEASE_REQUIRED");
  requireCurrentFootprintCombinedPairedSchedule(entry.capability, entry.runner, clock);
}

export function isCurrentFootprintForwardMainRequestOrigin(value: unknown): value is CurrentFootprintForwardMainRequestOrigin {
  return value !== null && typeof value === "object" && !types.isProxy(value) && requestOrigins.get(value)?.kind === "forward";
}
export function isCurrentFootprintForwardMainCompletionOrigin(value: unknown): value is CurrentFootprintForwardMainCompletionOrigin {
  return value !== null && typeof value === "object" && !types.isProxy(value) && completionOrigins.get(value)?.kind === "forward";
}
/** Separate genuine-v2 getters never accept the legacy Combined origins. */
export function requireCurrentFootprintForwardMainRequestOrigin(token: CurrentFootprintForwardMainRequestOrigin): CurrentFootprintForwardMainRequestOriginBindings {
  const entry = requestOrigins.get(token); need(entry !== undefined && entry.kind === "forward", "FORWARD_REQUEST_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}
export function requireCurrentFootprintForwardMainCompletionOrigin(token: CurrentFootprintForwardMainCompletionOrigin): CurrentFootprintForwardMainCompletionOriginBindings {
  const entry = completionOrigins.get(token); need(entry !== undefined && entry.kind === "forward", "FORWARD_COMPLETION_ORIGINAL_LEASE_REQUIRED");
  entry.assertOriginalEntry(); return entry.bindings;
}

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: handle, location });
const registrationId = z.literal(REGISTRATION_ID);
const pauseSchema = z.looseObject({ reason: z.string().max(128), callFrames: z.array(frame).min(1).max(64), hitBreakpoints: z.array(z.string().min(1).max(512)).max(2).optional() });
const empty = z.object({}).strict();
const sqlTrueValue = z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict();
const sqlTrueReply = z.object({ result: sqlTrueValue }).strict();
const sqlConfigurationValue = z.object({ schema: z.literal("private.selected-file-main-sql-initializer-config.v1"), stage: z.enum(["serialize", "pragma"]),
  path: z.string().min(1).max(4096), selectedFile: z.boolean(), readonlySql: z.literal(false), nativeCompletionProven: z.literal(false), designWriteGrant: z.literal(false) }).strict();
const sqlConfigurationRemote = z.object({ type: z.literal("object"), value: sqlConfigurationValue }).strict();
const sqlConfigurationReply = z.object({ result: sqlConfigurationRemote }).strict();
const objectReply = z.object({ result: z.object({ type: z.literal("object"), subtype: z.literal("array"), className: z.literal("Array"),
  description: z.string().max(32), objectId: handle }).strict() }).strict();
interface Pause { readonly frameId: string; readonly location: z.infer<typeof location>; readonly registration: boolean; readonly sqlSite?: CurrentSelectedFileMainSqlFenceSite; resumeAttempted: boolean; resumed: boolean }
interface Resolved { readonly breakpointId: string; readonly location: z.infer<typeof location> }
interface StructureAllocation { readonly id: number; readonly retain: (reply: unknown) => void; seen: boolean; stopped: boolean }
interface ForwardPoll {
  readonly allocation: StructureAllocation;
  readonly retain: (chunk: string) => void;
  delivered: boolean;
  settled: boolean;
  chunk: string | null;
}
interface RegistrationLocationFailure {
  readonly lineNumber: number;
  readonly columnNumber: number;
  readonly scriptObserved: boolean;
}
type MetadataRole = "head-age-context-array" | "head-age-context-getter" | "head-age-context-setter" | "head-age-context-getter-scopes" | "head-age-context-setter-scopes" | Role | "Date" | "now" | "retained-array" | "head-age-array" | typeof CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS[number];
interface SchemaIssue { readonly code: string; readonly path: readonly (string | number)[] }
const schemaPathKeys = new Set(["args", "breakpointId", "callFrameId", "callFrames", "className", "columnNumber", "configurable", "context", "debuggerId",
  "description", "enumerable", "executionContextId", "hitBreakpoints", "id", "internalProperties", "isOwn", "lineNumber", "location", "locations", "name",
  "objectId", "reason", "result", "scriptId", "scriptSource", "subtype", "type", "url", "value", "writable"]);
const schemaIssueCodes = new Set(["custom", "invalid_element", "invalid_format", "invalid_key", "invalid_type", "invalid_union", "invalid_value",
  "not_multiple_of", "too_big", "too_small", "unrecognized_keys"]);
const issuedFailures = new WeakMap<Error, string>();
const methodNames = ["assertCurrent", "send", "poll"] as const;
function need(value: boolean, detail: string): asserts value {
  if (!value) { const error = new Error(`FOOTPRINT_MAIN_CONSTRUCTION_${detail}`); issuedFailures.set(error, detail); throw error; }
}
function schemaIssues(error: z.ZodError): readonly SchemaIssue[] {
  return Object.freeze(error.issues.slice(0, 6).map(issue => Object.freeze({ code: schemaIssueCodes.has(issue.code) ? issue.code : "other",
    path: Object.freeze(issue.path.slice(0, 8).map(segment => schemaPathSegment(segment))) })));
}
function schemaPathSegment(segment: PropertyKey): string | number {
  if (typeof segment === "number" && Number.isSafeInteger(segment) && segment >= 0 && segment <= 256) { return segment; }
  if (typeof segment === "string" && schemaPathKeys.has(segment)) { return segment; }
  return "$unknown";
}
function methods(transport: CurrentFootprintCopyMainBackendTransport): readonly unknown[] {
  need(!types.isProxy(transport) && Object.isFrozen(transport) && Object.getPrototypeOf(transport) === Object.prototype && Reflect.ownKeys(transport).length === methodNames.length, "TRANSPORT");
  return methodNames.map(name => { const entry = Object.getOwnPropertyDescriptor(transport, name); need(entry !== undefined && Object.hasOwn(entry, "value") && typeof entry.value === "function", "TRANSPORT"); return entry.value as unknown; });
}
const issued = new WeakMap<CurrentFootprintCopyMainBackendObservation, CurrentFootprintCopyMainBackendRunner>();
const forwardPollRetainers = new WeakMap<(chunk: string) => void, Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; requireOriginal: () => void }>>();
export class CurrentFootprintCopyMainBackendRunner {
  readonly #transport: CurrentFootprintCopyMainBackendTransport;
  readonly #methods: readonly unknown[];
  readonly #decoder = new TextDecoder("utf-8", { fatal: true });
  #decoderPendingContinuations = 0;
  readonly #scripts = new Map<string, number>();
  readonly #selectedSqlBootstrap: CurrentSelectedFileMainSqlFenceBootstrap | null;
  readonly #selectedSqlPath: string | null;
  readonly #sqlBreakpoints = new Map<string, CurrentSelectedFileMainSqlFenceSite>();
  readonly #sqlResolutions: Resolved[] = [];
  #sqlArming: CurrentSelectedFileMainSqlFenceSite | null = null;
  #sqlCapture: string | null = null;
  #sqlReady = false;
  #sqlHeld: Pause | null = null;
  #sqlMutationPauses = 0;
  readonly #sqlApprovedConfigurations = new WeakSet<Pause>();
  readonly #sqlConfigurationRecords: Readonly<Record<string, unknown>>[] = [];
  readonly #headAgeBootstrapCapture: boolean;
  readonly #headAgeBootstrapCapability: CurrentFootprintHeadAgeBootstrapCapability | null;
  #headAgeBootstrapScriptId: string | null = null;
  readonly #resolved: Resolved[] = [];
  readonly #replies: unknown[] = [];
  #text = "";
  #attempted = false;
  #busy = false;
  #failed = false;
  #releaseAttempted = false;
  #released = false;
  #normalCloseAttempted = false;
  #started = 0;
  #requests = 0;
  #normalRequests = 0;
  #cleanupRequests = 0;
  #events = 0;
  #received = 0;
  #pendingId: number | null = null;
  #reply: unknown = null;
  #replySeen = false;
  #forwardPoll: ForwardPoll | null = null;
  #breakpoint: string | null = null;
  #removeAttempted = false;
  #removed = false;
  #pause: Pause | null = null;
  #initialContinuationCount: 0 | 1 = 0;
  #registrationSeen = false;
  #source: QualifiedSource | null = null;
  #appSource: string | null = null;
  #appScriptId: string | null = null;
  #sourceArray: string | null = null;
  #retainedArray: string | null = null;
  #driverCallbackObjectId: string | null = null;
  #packet: CurrentFootprintCopyMainBackendObservation | null = null;
  #phase = "idle";
  #lastFailure: string | null = null;
  #registrationLocationFailure: RegistrationLocationFailure | null = null;
  #metadataRole: MetadataRole | null = null;
  #schemaIssues: readonly SchemaIssue[] | null = null;
  #forwardMainCursor: CurrentFootprintForwardMainCursor | null = null;
  #originAttempted = false;
  #originActive = false;
  #originCapability: MainCapability | null = null;
  #originToken: MainRequestOrigin | null = null;
  #structureAttempted = false;
  #structureActive = false;
  #structureLease: CurrentProjectStructureMainLease | null = null;
  #structureSource: ReturnType<typeof qualifyCurrentProjectStructureMainSource> | null = null;
  #structureNormal = 0;
  #structureCleanup = 0;
  #structureAllocationUncertain = false;
  #structureAllocation: StructureAllocation | null = null;
  #originSource: CurrentFootprintCopyMainRequestSource | null = null;
  readonly #originEvents: CurrentFootprintCopyMainRequestOriginEvent[] = [];
  readonly #originBreakpoints = new Set<string>();
  #originPauseActive = false;
  #originResumeExpected = false;
  #originUncertain = false;
  #originGroupReleased = false;
  #completionAttempted = false;
  #completionBeginAttempted = false;
  #completionActive = false;
  #completionFailed = false;
  #completionToken: MainCompletionOrigin | null = null;
  #completionSource: CurrentFootprintCopyMainCompletionSource | null = null;
  #completionNormal = 0;
  #completionCleanup = 0;
  #completionFinalResumeAttempted = false;
  #completionRetireAttempted = false;
  #completionRetirementAcknowledged = false;
  #headAgePreparationAttempted = false;
  #headAgeArray: string | null = null;
  #headAgeContextSource: CurrentFootprintHeadAgeContextSource | null = null;
  #headAgeAttempted = false;
  /** Retain the fixed transport and optional original-owner bootstrap token.
   * Copied tokens refuse before any inspector request is issued. */
  public constructor(transport: CurrentFootprintCopyMainBackendTransport, headAgeBootstrap?: CurrentFootprintHeadAgeBootstrapCapability, selectedSqlBootstrap?: CurrentSelectedFileMainSqlFenceBootstrap) {
    if (headAgeBootstrap !== undefined) { requireCurrentFootprintHeadAgeBootstrapCapability(headAgeBootstrap, transport); }
    need(headAgeBootstrap === undefined || selectedSqlBootstrap === undefined, "EXCLUSIVE_MAIN_BOOTSTRAP");
    this.#selectedSqlBootstrap = selectedSqlBootstrap ?? null;
    this.#selectedSqlPath = selectedSqlBootstrap === undefined ? null : requireCurrentSelectedFileMainSqlFenceBootstrap(selectedSqlBootstrap, transport);
    this.#headAgeBootstrapCapture = headAgeBootstrap !== undefined; this.#headAgeBootstrapCapability = headAgeBootstrap ?? null;
    this.#methods = methods(transport); this.#transport = transport;
  }
  /** Capture this actual construction's cursor without issuing a request or
   * transferring its native capability. Repeated reads preserve one token. */
  public issueForwardMainCursor(): CurrentFootprintForwardMainCursor {
    need(!this.#busy && this.#packet !== null && issued.get(this.#packet) === this && this.#source !== null &&
      this.#appScriptId !== null && this.#retainedArray !== null, "FORWARD_CURSOR_CONSTRUCTION_REQUIRED");
    if (this.#forwardMainCursor === null) {
      const token = Object.freeze({ profile: "private.current-footprint-forward-main-cursor.v1" as const, executionAuthorized: false as const });
      this.#forwardMainCursor = token;
      forwardMainCursors.set(token, Object.freeze({ runner: this, snapshot: (): CurrentFootprintForwardMainCursorSnapshot => this.#forwardCursorSnapshot(token) }));
    }
    this.#forwardCursorSnapshot(this.#forwardMainCursor); return this.#forwardMainCursor;
  }
  /** Derive each phase from original private transition fields. A retirement
   * attempt, matching JSON or actual generation exit alone cannot claim a
   * successful upload handoff. Historical reads grant no native freshness. */
  #forwardCursorSnapshot(token: CurrentFootprintForwardMainCursor): CurrentFootprintForwardMainCursorSnapshot {
    need(token === this.#forwardMainCursor && this.#packet !== null && issued.get(this.#packet) === this && this.#source !== null &&
      methods(this.#transport).every((value, index) => value === this.#methods[index]), "FORWARD_CURSOR_ORIGINAL");
    requireCurrentFootprintCopyMainBackendSource(this.#source);
    need(this.#requests === this.#normalRequests + this.#cleanupRequests &&
      !(this.#structureAttempted && this.#originAttempted) && (!this.#completionAttempted || this.#originAttempted), "FORWARD_CURSOR_TRANSITION");
    // Admission may retain an exact v2 allocation before its original send.
    // Observed, stopped or detached uncertainty cannot use this in-flight
    // State to revive normal work.
    const pendingForwardAllocation = isCurrentFootprintForwardExecutionMainCapability(this.#originCapability) &&
      this.#structureAllocation !== null && !this.#structureAllocation.stopped && !this.#structureAllocation.seen &&
      this.#pendingId === this.#structureAllocation.id;
    const failed = this.#failed || this.#originUncertain || this.#structureAllocationUncertain && !pendingForwardAllocation || this.#completionFailed;
    const paused = this.#originPauseActive || this.#originResumeExpected || this.#pause !== null && !this.#pause.resumed;
    const settled = this.#completionRetirementAcknowledged && !this.#completionActive && !this.#originActive && !failed &&
      this.#completionNormal === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal &&
      this.#completionCleanup === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup && this.#originGroupReleased &&
      this.#originBreakpoints.size === 0 && !paused && this.#pendingId === null && this.#originEvents.length === 0 &&
      this.#text === "" && this.#decoderPendingContinuations === 0;
    let phase: CurrentFootprintForwardMainCursorSnapshot["phase"] = "construction";
    if (this.#originAttempted) { phase = this.#completionAttempted ? "completion" : "request"; }
    if (this.#structureAttempted) { phase = "structure"; }
    if (settled) { phase = "upload-settled"; }
    if (this.#released) { phase = "released"; }
    if (failed) { phase = "failed"; }
    return Object.freeze({ issuer: this, construction: this.#packet, phase,
      normalRequests: this.#normalRequests, cleanupRequests: this.#cleanupRequests,
      pendingReplies: this.#pendingId === null ? 0 : 1, pendingEvents: this.#originEvents.length,
      incompleteFrame: this.#text !== "" || this.#decoderPendingContinuations !== 0,
      paused, busy: this.#busy, uploadRetirementAcknowledged: this.#completionRetirementAcknowledged,
      sequentialStructureAdmissionAvailable: false, executionAuthorized: false });
  }
  /** Reprove transport, bootstrap custody, source and the active deadline.
   * Cleanup retains its separate lifetime without reopening normal work. */
  #same(cleanup: boolean): void {
    if (this.#selectedSqlBootstrap !== null) { need(requireCurrentSelectedFileMainSqlFenceBootstrap(this.#selectedSqlBootstrap, this.#transport) === this.#selectedSqlPath, "SELECTED_SQL_ORIGINAL_BOOTSTRAP"); }
    if (this.#headAgeBootstrapCapability !== null) { requireCurrentFootprintHeadAgeBootstrapCapability(this.#headAgeBootstrapCapability, this.#transport); }
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released &&
      (cleanup || !this.#failed && !this.#releaseAttempted && !this.#normalCloseAttempted), "OWNER");
    if (this.#source !== null) { requireCurrentFootprintCopyMainBackendSource(this.#source); }
    need(this.#started === 0 || performance.now() - this.#started < (cleanup ? PROFILE.totalMilliseconds : PROFILE.normalMilliseconds), "TOTAL_DEADLINE");
  }
  async #current(cleanup = false): Promise<void> { this.#same(cleanup); await this.#transport.assertCurrent(); this.#same(cleanup); }
  #location(actual: z.infer<typeof location>): void {
    const scriptObserved = this.#scripts.has(actual.scriptId);
    const matches = actual.lineNumber === SOURCE.registration.https.lineNumber && actual.columnNumber === SOURCE.registration.https.breakpointColumnNumber && scriptObserved;
    if (!matches) { this.#registrationLocationFailure ??= Object.freeze({ lineNumber: actual.lineNumber, columnNumber: actual.columnNumber, scriptObserved }); }
    need(matches, "REGISTRATION_LOCATION");
  }
  #resolve(record: Resolved): void {
    if (this.#selectedSqlBootstrap !== null && record.breakpointId !== REGISTRATION_ID) {
      const site = this.#sqlBreakpoints.get(record.breakpointId) ?? this.#sqlArming;
      need(site !== null && site !== undefined, "SELECTED_SQL_FOREIGN_BREAKPOINT"); this.#sqlLocation(site, record.location);
      need(this.#sqlResolutions.length < 64, "SELECTED_SQL_RESOLUTION_BOUND"); this.#sqlResolutions.push(record); return;
    }
    need(this.#resolved.length < 8, "RESOLUTION_BOUND"); this.#resolved.push(record);
    if (this.#breakpoint !== null) { need(record.breakpointId === this.#breakpoint, "FOREIGN_BREAKPOINT"); this.#location(record.location); }
  }
  /** Account for bounded original inspector events and exact source locations.
   * Only the owner-issued head-age token admits the passive Node bootstrap. */
  #event(method: string, input: unknown): void {
    if (this.#headAgeBootstrapCapability !== null) { requireCurrentFootprintHeadAgeBootstrapCapability(this.#headAgeBootstrapCapability, this.#transport); }
    this.#events += 1; need(this.#events <= 4096, "EVENT_BOUND");
    if ((this.#originActive || this.#structureActive) && (method === "Debugger.paused" || method === "Debugger.resumed")) {
      need(this.#originEvents.length < 64, "REQUEST_EVENT_BOUND");
      if (method === "Debugger.paused") { if (this.#originPauseActive) { this.#originUncertain = true; } this.#originPauseActive = true; }
      else { empty.parse(input); if (!this.#originPauseActive || !this.#originResumeExpected) { this.#originUncertain = true; }
        this.#originPauseActive = false; this.#originResumeExpected = false; }
      this.#originEvents.push(Object.freeze({ method, params: freezeDeep(input) })); return;
    }
    if (method === "Debugger.scriptParsed") {
      if (this.#headAgeBootstrapCapture) {
        const bootstrap = z.looseObject({ scriptId: handle, url: z.literal("node:internal/bootstrap/node"), executionContextId: z.number().int().nonnegative(),
          startLine: z.literal(0), startColumn: z.literal(0), endLine: z.literal(479), endColumn: z.literal(0), length: z.literal(15_939),
          isLiveEdit: z.literal(false), hasSourceURL: z.literal(false), isModule: z.literal(false), scriptLanguage: z.literal("JavaScript"),
          embedderName: z.literal("node:internal/bootstrap/node") }).safeParse(input);
        if (bootstrap.success) {
          need(this.#headAgeBootstrapScriptId === null, "HEAD_AGE_BOOTSTRAP_CHANGED"); this.#headAgeBootstrapScriptId = bootstrap.data.scriptId; return;
        }
      }
      const script = z.looseObject({ scriptId: handle, url: z.string().max(4096), executionContextId: z.number().int().positive() }).parse(input);
      if (new RegExp(URL_PATTERN, "u").test(script.url)) { need(!this.#scripts.has(script.scriptId) && this.#scripts.size === 0, "APP_SCRIPT_CHANGED"); this.#scripts.set(script.scriptId, script.executionContextId); }
      return;
    }
    if (method === "Runtime.executionContextCreated") { z.looseObject({ context: z.looseObject({ id: z.number().int().positive() }) }).parse(input); return; }
    if (method === "Runtime.consoleAPICalled") {
      z.looseObject({ type: z.enum(["log", "debug", "info", "error", "warning", "dir", "dirxml", "table", "trace", "clear", "startGroup", "startGroupCollapsed", "endGroup", "assert", "profile", "profileEnd", "count", "timeEnd"]),
        args: z.array(z.unknown()).max(64), executionContextId: z.number().int().positive() }).parse(input); return;
    }
    if (method === "Debugger.breakpointResolved") { this.#resolve(z.object({ breakpointId: z.string().min(1).max(512), location }).strict().parse(input)); return; }
    if (method === "Debugger.paused") {
      need(this.#pause === null || this.#pause.resumed, "DUPLICATE_PAUSE"); const event = pauseSchema.parse(input), first = event.callFrames[0]; need(first !== undefined, "PAUSE_FRAME");
      const points = event.hitBreakpoints ?? [], sqlSite = points.length === 1 ? this.#sqlBreakpoints.get(points[0] ?? "") : undefined;
      if (sqlSite !== undefined) {
        need(this.#selectedSqlBootstrap !== null && event.reason === "other", "SELECTED_SQL_PAUSE"); this.#sqlLocation(sqlSite, first.location);
        this.#pause = { frameId: first.callFrameId, location: first.location, registration: false, sqlSite, resumeAttempted: false, resumed: false }; return;
      }
      const registration = points.length === 1;
      if (registration) {
        need(this.#breakpoint !== null && points[0] === this.#breakpoint && !this.#registrationSeen && event.reason === "other", "REGISTRATION_PAUSE");
        this.#location(first.location); this.#registrationSeen = true;
      } else { need(event.reason === "Break on start" && this.#initialContinuationCount === 0 && !this.#registrationSeen && this.#pause === null && this.#breakpoint !== null, "INITIAL_PAUSE"); }
      this.#pause = { frameId: first.callFrameId, location: first.location, registration, resumeAttempted: false, resumed: false }; return;
    }
    if (method === "Debugger.resumed") { empty.parse(input); need(this.#pause !== null && this.#pause.resumeAttempted && !this.#pause.resumed, "UNEXPECTED_RESUME"); this.#pause.resumed = true; return; }
    // Preserve the original process on exceptions, context replacement and
    // Unknown events. They never cause a retry or another resume.
    need(false, "UNEXPECTED_EVENT");
  }
  #message(text: string): void {
    const value: unknown = JSON.parse(text);
    const response = z.object({ id: z.number().int().positive(), result: z.unknown().optional(), error: z.unknown().optional() }).strict().safeParse(value);
    if (response.success) {
      need(this.#pendingId !== null && response.data.id === this.#pendingId && !this.#replySeen && !Object.hasOwn(response.data, "error") && Object.hasOwn(response.data, "result"), "REPLY_ID_OR_ERROR");
      this.#reply = response.data.result; this.#replySeen = true; this.#replies.push(response.data.result);
      const allocation = this.#structureAllocation;
      if (allocation !== null && allocation.id === response.data.id) {
        allocation.seen = true; allocation.retain(response.data.result);
        if (allocation.stopped) { this.#settleStructureAllocation(allocation); }
      }
      return;
    }
    const event = z.object({ method: z.string().max(128), params: z.unknown() }).strict().parse(value); this.#event(event.method, event.params);
  }
  async #pump(cleanup = false): Promise<void> {
    await this.#current(cleanup);
    if (this.#structureAllocation !== null) {
      if (isCurrentFootprintForwardExecutionMainCapability(this.#originCapability)) {
        await this.#pumpForwardAllocation(this.#originCapability, this.#structureAllocation, cleanup); return;
      }
      // Only original allocation replies gain custody before the post-poll
      // Guard. Late settlement never restores normal work or clears other
      // Pause/channel uncertainty, and no replacement request is dispatched.
      const raw = await this.#transport.poll(cleanup).then(chunk => {
        try { this.#chunk(chunk); return chunk; } catch (error) { this.#originUncertain = true; throw error; }
      }, (error: unknown) => { this.#originUncertain = true; throw error; });
      await this.#current(cleanup); if (raw === "") { await delay(10); } return;
    }
    const raw = isCurrentFootprintForwardExecutionMainCapability(this.#originCapability) ?
      await pollCurrentFootprintForwardExecutionMain(this.#originCapability, this, cleanup) : await this.#transport.poll(cleanup);
    await this.#current(cleanup); this.#chunk(raw); if (raw === "") { await delay(10); }
  }
  /** Register only this pending allocation's original byte receiver. A lost
   * native poll retains its callback until the actual late reply; another poll
   * cannot replace that custody. Native accounting still runs independently. */
  async #pumpForwardAllocation(capability: CurrentFootprintForwardExecutionMainCapability, allocation: StructureAllocation, cleanup: boolean): Promise<void> {
    const previous = this.#forwardPoll;
    need(previous === null || previous.settled && previous.delivered, "FORWARD_ORIGINAL_POLL_PENDING");
    const poll: ForwardPoll = { allocation, delivered: false, settled: false, chunk: null,
      retain: (chunk: string): void => {
        requireOriginalCurrentFootprintForwardMainPollRetainer(this, poll.retain);
        poll.delivered = true; poll.chunk = chunk;
        try { this.#chunk(chunk); }
        catch (error) { this.#originUncertain = true; throw error; }
      } };
    this.#forwardPoll = poll;
    forwardPollRetainers.set(poll.retain, Object.freeze({ runner: this, requireOriginal: (): void => {
      need(this.#forwardPoll === poll && !poll.delivered && this.#structureAllocation === allocation && this.#pendingId === allocation.id,
        "FORWARD_ORIGINAL_POLL_RETAINER");
    } }));
    try {
      const raw = await pollCurrentFootprintForwardExecutionMain(capability, this, cleanup, poll.retain);
      need(poll.delivered && poll.chunk === raw, "FORWARD_ORIGINAL_POLL_REPLY");
      await this.#current(cleanup); if (raw === "") { await delay(10); }
    } catch (error) { this.#originUncertain = true; throw error; }
    finally { poll.settled = true; }
  }
  /** Decode only original bounded transport chunks. The allocation path uses
   * this same parser and pending ID instead of accepting caller transcripts. */
  #chunk(raw: string): void {
    need(typeof raw === "string" && raw.length <= 43_692 && /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{2}==|[A-Za-z\d+/]{3}=)?$/u.test(raw), "CHUNK_GRAMMAR");
    if (raw === "") { return; }
    const bytes = Buffer.from(raw, "base64"); need(bytes.length <= 32_768 && bytes.toString("base64") === raw, "CHUNK_BOUND");
    this.#received += bytes.length; need(this.#received <= 64 * 1024 * 1024, "RECEIVED_BOUND");
    const text = this.#decoder.decode(bytes, { stream: true }); this.#trackDecoderBoundary(bytes); this.#text += text;
    let boundary = this.#text.indexOf("\0");
    while (boundary !== -1) { const message = this.#text.slice(0, boundary); need(message.length > 0 && Buffer.byteLength(message) <= 4 * 1024 * 1024, "MESSAGE_BOUND"); this.#text = this.#text.slice(boundary + 1); this.#message(message); boundary = this.#text.indexOf("\0"); }
    need(Buffer.byteLength(this.#text) <= 4 * 1024 * 1024, "PARTIAL_MESSAGE_BOUND");
  }
  /** The original fatal decoder validates bytes first. Count its remaining
   * continuation bytes without flushing or replacing that streaming decoder;
   * an empty text buffer alone cannot prove a complete inspector frame. */
  #trackDecoderBoundary(bytes: Buffer): void {
    for (const byte of bytes) {
      if (this.#decoderPendingContinuations !== 0) { this.#decoderPendingContinuations -= 1; }
      else if (byte >= 0xF0) { this.#decoderPendingContinuations = 3; }
      else if (byte >= 0xE0) { this.#decoderPendingContinuations = 2; }
      else if (byte >= 0xC2) { this.#decoderPendingContinuations = 1; }
    }
  }
  /** A stopped original request may retire its reply slot only after that
   * exact response was captured. This does not acknowledge native cleanup. */
  #settleStructureAllocation(allocation: StructureAllocation): void {
    need(this.#structureAllocation === allocation && allocation.seen && this.#pendingId === allocation.id, "STRUCTURE_ALLOCATION_PENDING");
    this.#pendingId = null; this.#reply = null; this.#replySeen = false; this.#structureAllocation = null;
  }
  async #wait(predicate: () => boolean, cleanup = false): Promise<void> {
    const started = performance.now(); while (!predicate()) { need(performance.now() - started < 20_000, "REPLY_DEADLINE"); await this.#pump(cleanup); }
  }
  /** Consume one fixed request number and retain its sole pending reply.
   * Head-age exceptions are captured before success decoding; cleanup keeps
   * its own counter and cannot repeat a consumed normal request. */
  async #request(input: Command | CurrentSelectedFileMainSqlFenceCommand | CurrentFootprintCopyMainRequestCollectCommand | CurrentFootprintCopyMainCompletionCommand | CurrentProjectStructureMainCommand,
    cleanup = false, retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    this.#phase = input.phase; await this.#current(cleanup);
    const sqlFence = input.phase.startsWith("sql-fence-");
    const collection = input.phase.startsWith("request-");
    const completion = input.phase.startsWith("completion-");
    const structure = input.phase.startsWith("structure-main-");
    const forwardAllocation = isCurrentFootprintForwardExecutionMainCapability(this.#originCapability) &&
      (collection && (input.phase === "request-driver-arm" || input.phase === "request-site-arm") ||
        completion && (input.phase === "completion-source-arm" || input.phase === "completion-callback-arm"));
    need(retainAllocationReply === undefined || !cleanup && (structure && input.phase === "structure-main-arm" || forwardAllocation), "STRUCTURE_ALLOCATION_CALLBACK");
    let cleanupCommand: boolean;
    if (completion || structure) { cleanupCommand = ["Debugger.resume", "Debugger.removeBreakpoint", "Runtime.releaseObjectGroup"].includes(input.method); }
    else if (collection) { cleanupCommand = (CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES as readonly string[]).includes(input.phase); }
    else { cleanupCommand = !sqlFence && ["resume", "remove", "release"].includes(input.phase); }
    const normalMaximum = this.#structureAttempted ? CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeNormal + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.originIssueNormal + CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.normal : CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeNormal + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.originIssueNormal + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.normal +
      (this.#completionToken === null ? 0 : CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal);
    const cleanupMaximum = this.#structureAttempted ? CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeCleanup + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.releaseCleanup + CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.cleanup : CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.observeCleanup + CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_REQUESTS.releaseCleanup + CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_REQUESTS.cleanup +
      (this.#completionToken === null ? 0 : CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup - 2);
    const initialMaximum = this.#selectedSqlBootstrap === null ? 64 : 72 + SQL_REQUESTS.normal;
    const requestMaximum = cleanup && this.#selectedSqlBootstrap === null ? 72 : initialMaximum;
    need(this.#pendingId === null && (this.#originAttempted || this.#structureAttempted ? this.#requests < normalMaximum + cleanupMaximum &&
      (cleanupCommand ? this.#cleanupRequests < cleanupMaximum : this.#normalRequests < normalMaximum) : this.#requests < requestMaximum), "REQUEST_BOUND");
    this.#requests += 1; if (cleanupCommand) { this.#cleanupRequests += 1; } else { this.#normalRequests += 1; }
    const id = this.#requests; this.#pendingId = id; this.#replySeen = false; this.#reply = null;
    const allocation = retainAllocationReply === undefined ? null : { id, retain: retainAllocationReply, seen: false, stopped: false };
    if (allocation !== null) { need(this.#structureAllocation === null, "STRUCTURE_ALLOCATION_PENDING"); this.#structureAllocation = allocation; }
    try {
    if (sqlFence) {
      need(this.#selectedSqlBootstrap !== null, "SELECTED_SQL_ORIGINAL_BOOTSTRAP");
      await sendCurrentSelectedFileMainSqlFenceCommand(this.#selectedSqlBootstrap, this, validateCurrentSelectedFileMainSqlFenceCommand(input), id);
    } else if (structure) {
      need(this.#originCapability !== null && this.#structureActive, "STRUCTURE_ORIGINAL_LEASE_REQUIRED");
      // The same native owner still rejects this new vocabulary. No native
      // Purpose, encoder or capacity is enabled by this source-only route.
      await mainCommand(this.#originCapability, this, validateCurrentProjectStructureMainCommand(input), id);
    } else if (completion) {
      need(this.#originCapability !== null && this.#completionActive, "COMPLETION_ORIGINAL_LEASE_REQUIRED");
      await mainCompletionCommand(this.#originCapability, this, validateCurrentFootprintCopyMainCompletionCommand(input), id);
    } else if (collection) {
      need(this.#originCapability !== null && this.#originActive, "REQUEST_ORIGINAL_LEASE_REQUIRED");
      await mainCommand(this.#originCapability, this, validateCurrentFootprintCopyMainRequestCollectCommand(input), id);
    } else { await this.#transport.send(validateCurrentFootprintCopyMainBackendCommand(input), id); }
    await this.#current(cleanup); await this.#wait(() => this.#replySeen, cleanup);
    const result = this.#reply;
    if (allocation === null) { this.#pendingId = null; this.#reply = null; this.#replySeen = false; }
    else { this.#settleStructureAllocation(allocation); }
    if (isCurrentFootprintHeadAgeCdpPhase(input.phase)) { rejectCurrentFootprintHeadAgeCdpException(result, input.phase); }
    return result;
    } catch (error) {
      if (allocation !== null && this.#structureAllocation === allocation) {
        allocation.stopped = true; if (allocation.seen) { this.#settleStructureAllocation(allocation); }
      }
      throw error;
    }
  }
  #properties(objectId: string, role: MetadataRole): Promise<unknown> {
    this.#metadataRole = role;
    return this.#request({ phase: "properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
  }
  async #qualify(scriptId: string): Promise<void> {
    if (this.#source !== null) { need(this.#appScriptId === scriptId, "SOURCE_CHANGED"); return; }
    need(this.#scripts.has(scriptId), "APP_SCRIPT_REQUIRED");
    const reply = captureCurrentFootprintCopyMainBackendSourceReply(await this.#request({ phase: "source", method: "Debugger.getScriptSource", params: { scriptId } }));
    this.#source = qualifyCurrentFootprintCopyMainBackendSource(reply.scriptSource); this.#appScriptId = scriptId; this.#appSource = reply.scriptSource;
  }
  async #resume(pause: Pause): Promise<void> {
    need(this.#pause === pause && !pause.resumeAttempted && !pause.resumed && this.#breakpoint !== null, "RESUME_CONSUMED");
    pause.resumeAttempted = true;
    empty.parse(await this.#request({ phase: "resume", method: "Debugger.resume", params: {} })); await this.#wait(() => pause.resumed);
  }
  async #remove(cleanup = false): Promise<void> {
    need(this.#breakpoint !== null && !this.#removeAttempted, "REMOVE_CONSUMED"); this.#removeAttempted = true;
    empty.parse(await this.#request({ phase: "remove", method: "Debugger.removeBreakpoint", params: { breakpointId: this.#breakpoint } }, cleanup)); this.#removed = true;
  }
  #fail(error: unknown): void {
    this.#failed = true;
    if (this.#lastFailure !== null) { return; }
    if (error instanceof z.ZodError) { this.#lastFailure = "REPLY_SCHEMA"; this.#schemaIssues = schemaIssues(error); }
    else { this.#lastFailure = error instanceof Error ? issuedFailures.get(error) ?? "ORIGINAL_TRANSPORT_OR_CAPTURE" : "ORIGINAL_TRANSPORT_OR_CAPTURE"; }
  }
  public async observe(): Promise<CurrentFootprintCopyMainBackendObservation> {
    need(!this.#attempted && !this.#busy, "OBSERVE_CONSUMED"); this.#attempted = true; this.#busy = true; this.#started = performance.now();
    try {
      empty.parse(await this.#request({ phase: "runtime-enable", method: "Runtime.enable", params: {} }));
      z.object({ debuggerId: handle }).strict().parse(await this.#request({ phase: "debugger-enable", method: "Debugger.enable", params: { maxScriptsCacheSize: 33_554_432 } }));
      if (this.#selectedSqlBootstrap !== null) { await this.#armSelectedSqlEarly(); }
      const armed = z.object({ breakpointId: registrationId, locations: z.array(location).max(1) }).strict().parse(await this.#request({ phase: "registration-arm", method: "Debugger.setBreakpointByUrl", params: {
        urlRegex: URL_PATTERN, lineNumber: SOURCE.registration.https.lineNumber, columnNumber: SOURCE.registration.https.breakpointColumnNumber } }));
      this.#breakpoint = armed.breakpointId;
      for (const record of this.#resolved) { need(record.breakpointId === armed.breakpointId, "FOREIGN_BREAKPOINT"); this.#location(record.location); }
      for (const actual of armed.locations) { this.#location(actual); }
      empty.parse(await this.#request({ phase: "run-waiting", method: "Runtime.runIfWaitingForDebugger", params: {} }));
      await this.#wait(() => this.#pause !== null); const first = this.#pause; need(first !== null, "INITIAL_PAUSE_REQUIRED");
      if (!first.registration && first.sqlSite === undefined) {
        if (this.#scripts.has(first.location.scriptId)) { await this.#qualify(first.location.scriptId); }
        this.#initialContinuationCount = 1; await this.#resume(first); await this.#wait(() => this.#pause !== first);
      }
      if (this.#selectedSqlBootstrap !== null) { await this.#startSelectedSqlFence(); }
      const registration = this.#pause; need(registration !== null && registration.registration && !registration.resumeAttempted, "REGISTRATION_REQUIRED");
      await this.#qualify(registration.location.scriptId);
      need(this.#resolved.some(record => record.breakpointId === this.#breakpoint && record.location.scriptId === registration.location.scriptId &&
        record.location.lineNumber === registration.location.lineNumber && record.location.columnNumber === registration.location.columnNumber) || armed.locations.some(actual => actual.scriptId === registration.location.scriptId), "REGISTRATION_RESOLUTION_REQUIRED");
      const selected = objectReply.parse(await this.#request({ phase: "frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: registration.frameId,
        expression: EXPRESSION, objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }));
      need(selected.result.description === "Array(9)", "FRAME_ARRAY"); this.#sourceArray = selected.result.objectId;
      const captured = objectReply.parse(await this.#request({ phase: "capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
        functionDeclaration: CALLS.capture.program, arguments: [], returnByValue: false } }));
      need(captured.result.description === "Array(13)", "CAPTURE_ARRAY"); this.#retainedArray = captured.result.objectId;
      const ids = decodeCurrentFootprintCopyMainBackendArray(await this.#properties(this.#retainedArray, "retained-array"));
      for (const [index, role] of [[10, "Date"], [11, "now"]] as const) {
        const id = ids[index]; need(id !== undefined, "NATIVE_MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendNative(await this.#properties(id, role), role);
      }
      for (const [index, role] of [[3, "protocolCallback"], [5, "driverIntercept"], [6, "driverCallback"], [7, "router"], [8, "actorClock"], [9, "projectSql"], [12, "dateParser"]] as readonly (readonly [number, Role])[]) {
        const id = ids[index]; need(id !== undefined && this.#appScriptId !== null, "MEMBER_REQUIRED"); decodeCurrentFootprintCopyMainBackendFunction(await this.#properties(id, role), role, this.#appScriptId);
      }
      this.#metadataRole = null;
      this.#driverCallbackObjectId = ids[6] ?? null;
      await this.#reprove(); await this.#remove(); await this.#resume(registration); await this.#current();
      this.#packet = Object.freeze(currentFootprintCopyMainBackendObservationSchema.parse({ profile: "private.current-footprint-copy-main-backend-construction.v1",
        originalMainTransportRetained: true, runtimeAppSourceQualified: true, runtimeAppSourceSha256: SOURCE.sha256, initialContinuationCount: this.#initialContinuationCount,
        registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true, originalProtocolCallbackAndBackendRetained: true,
        originalDriverCallbackAndRouterRetained: true, originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true, originalDateParserRetained: true,
        protocolRegistrationObserved: false, requestContextRetained: false, actualActorClockInvocationObserved: false, projectSqlInvocationObserved: false,
        responderExclusivityProven: false, executionAuthorized: false })); issued.set(this.#packet, this); return this.#packet;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  #sqlLocation(site: CurrentSelectedFileMainSqlFenceSite, actual: z.infer<typeof location>): void {
    const expected = SQL_SOURCE.sites[site]; need(this.#scripts.has(actual.scriptId) && actual.lineNumber === expected.lineNumber &&
      actual.columnNumber === expected.breakpointColumnNumber && (this.#appScriptId === null || actual.scriptId === this.#appScriptId), "SELECTED_SQL_LOCATION");
  }
  async #armSelectedSqlEarly(): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#sqlBreakpoints.size === 0, "SELECTED_SQL_EARLY_CONSUMED"); this.#sqlArming = "import";
    const reply = z.object({ breakpointId: z.literal(SQL_EARLY_ID), locations: z.array(location).max(1) }).strict().parse(await this.#request({ phase: "sql-fence-early-arm", method: "Debugger.setBreakpointByUrl", params: {
      urlRegex: URL_PATTERN, lineNumber: SQL_SOURCE.sites.import.lineNumber, columnNumber: SQL_SOURCE.sites.import.breakpointColumnNumber } }));
    this.#sqlBreakpoints.set(reply.breakpointId, "import"); for (const actual of reply.locations) { this.#sqlLocation("import", actual); }
    this.#sqlArming = null;
  }
  async #armSelectedSql(site: Exclude<CurrentSelectedFileMainSqlFenceSite, "import">): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#appScriptId !== null, "SELECTED_SQL_SOURCE_REQUIRED"); this.#sqlArming = site;
    const point = SQL_SOURCE.sites[site];
    const actualLocation = { scriptId: this.#appScriptId, lineNumber: point.lineNumber, columnNumber: point.breakpointColumnNumber };
    const command: CurrentSelectedFileMainSqlFenceCommand = site === "afterImports" ? { phase: "sql-fence-after-imports-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId: this.#appScriptId, lineNumber: SQL_SOURCE.sites.afterImports.lineNumber, columnNumber: SQL_SOURCE.sites.afterImports.breakpointColumnNumber } } } :
      { phase: "sql-fence-arm", site, method: "Debugger.setBreakpoint", params: { location: actualLocation, condition: SQL_CONDITIONS[site] } };
    const reply = z.object({ breakpointId: handle, actualLocation: location }).strict().parse(await this.#request(command));
    need(!this.#sqlBreakpoints.has(reply.breakpointId), "SELECTED_SQL_BREAKPOINT_REUSED"); this.#sqlLocation(site, reply.actualLocation);
    for (const record of this.#sqlResolutions.filter(item => item.breakpointId === reply.breakpointId)) { this.#sqlLocation(site, record.location); }
    this.#sqlBreakpoints.set(reply.breakpointId, site); this.#sqlArming = null;
  }
  async #sqlResume(pause: Pause): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#pause === pause && (pause.sqlSite === "import" || pause.sqlSite === "afterImports" || this.#sqlApprovedConfigurations.has(pause)) &&
      !pause.resumeAttempted && !pause.resumed, "SELECTED_SQL_NO_MUTATION_GRANT"); pause.resumeAttempted = true;
    empty.parse(await this.#request({ phase: "sql-fence-resume", method: "Debugger.resume", params: {} })); await this.#wait(() => pause.resumed);
  }
  async #startSelectedSqlFence(): Promise<void> {
    const initial = this.#pause; need(initial?.sqlSite === "import" && this.#selectedSqlPath !== null, "SELECTED_SQL_BEFORE_IMPORT_REQUIRED");
    await this.#qualify(initial.location.scriptId); need(this.#appSource !== null, "SELECTED_SQL_FULL_SOURCE"); qualifyCurrentSelectedFileMainSqlFenceSource(this.#appSource);
    await this.#armSelectedSql("afterImports"); for (const site of SQL_SITES) { await this.#armSelectedSql(site); }
    await this.#sqlResume(initial); await this.#wait(() => this.#pause !== initial);
    const after = this.#pause; need(after?.sqlSite === "afterImports", "SELECTED_SQL_AFTER_IMPORTS_REQUIRED");
    const selected = objectReply.parse(await this.#request({ phase: "sql-fence-frame", site: "afterImports", method: "Debugger.evaluateOnCallFrame", params: {
      ...SQL_FRAME, callFrameId: after.frameId, expression: SQL_SOURCE.sites.afterImports.expression } })); need(selected.result.description === "Array(4)", "SELECTED_SQL_MODULE_FRAME");
    const captured = objectReply.parse(await this.#request({ phase: "sql-fence-capture", method: "Runtime.callFunctionOn", params: {
      ...SQL_CALL, objectId: selected.result.objectId, functionDeclaration: SQL_CAPTURE, arguments: [{ value: this.#selectedSqlPath }], returnByValue: false } }));
    need(captured.result.description === "Array(9)", "SELECTED_SQL_ORIGINAL_CAPTURE"); this.#sqlCapture = captured.result.objectId;
    const natives = objectReply.parse(await this.#request({ phase: "sql-fence-native-frame", method: "Debugger.evaluateOnCallFrame", params: {
      ...SQL_FRAME, callFrameId: after.frameId, expression: SQL_NATIVE_EXPRESSION } })); need(natives.result.description === "Array(3)", "SELECTED_SQL_NATIVE_FRAME");
    const ids = decodeCurrentSelectedFileMainSqlFenceNativeArray(await this.#request({ phase: "sql-fence-properties", method: "Runtime.getProperties", params: {
      objectId: natives.result.objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
    for (const [index, role] of [[0, "Database"], [1, "Statement"], [2, "proxy"]] as const) {
      const id = ids[index]; need(id !== undefined, "SELECTED_SQL_NATIVE_REQUIRED"); decodeCurrentSelectedFileMainSqlFenceNative(await this.#request({ phase: "sql-fence-properties", method: "Runtime.getProperties", params: {
        objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }), role);
    }
    await this.#requireSelectedSqlCapture(); this.#sqlReady = true; await this.#sqlResume(after);
    await this.#wait(() => this.#pause !== after);
    while (this.#pause?.sqlSite === "initializerSerialize" || this.#pause?.sqlSite === "initializerPragma") {
      const configuration = this.#pause; await this.#configureSelectedSqlInitializer(configuration); await this.#wait(() => this.#pause !== configuration);
    }
    // Every mutation stays paused until a distinct original request/SQL issuer
    // Proves that exact current call. This bootstrap publishes no such grant.
    need(this.#pause?.registration === true, "SELECTED_SQL_MUTATION_BEFORE_REGISTRATION");
  }
  async #requireSelectedSqlCapture(): Promise<void> {
    need(this.#sqlCapture !== null, "SELECTED_SQL_CAPTURE_REQUIRED");
    sqlTrueReply.parse(await this.#request({ phase: "sql-fence-require", method: "Runtime.callFunctionOn", params: {
      ...SQL_CALL, objectId: this.#sqlCapture, functionDeclaration: SQL_REQUIRE, arguments: [], returnByValue: true } }));
  }
  async #configureSelectedSqlInitializer(pause: Pause): Promise<void> {
    const site = pause.sqlSite; need((site === "initializerSerialize" || site === "initializerPragma") && this.#sqlCapture !== null && this.#sqlReady &&
      this.#pause === pause && !pause.resumeAttempted && !pause.resumed && this.#sqlConfigurationRecords.length < 64, "SELECTED_SQL_INITIALIZER_REQUIRED");
    const selectedFrame = objectReply.parse(await this.#request({ phase: "sql-fence-frame", site, method: "Debugger.evaluateOnCallFrame", params: {
      ...SQL_FRAME, callFrameId: pause.frameId, expression: SQL_SOURCE.sites[site].expression } })); need(selectedFrame.result.description === "Array(5)", "SELECTED_SQL_INITIALIZER_FRAME");
    const stage = site === "initializerSerialize" ? "serialize" : "pragma";
    const reply = sqlConfigurationReply.parse(
      await this.#request({ phase: "sql-fence-configure", site, method: "Runtime.callFunctionOn", params: { ...SQL_CALL, throwOnSideEffect: false,
        objectId: selectedFrame.result.objectId, functionDeclaration: SQL_CONFIGURATION, arguments: [{ objectId: this.#sqlCapture }, { value: stage }], returnByValue: true } }));
    need(reply.result.value.stage === stage && reply.result.value.selectedFile === (reply.result.value.path === this.#selectedSqlPath), "SELECTED_SQL_INITIALIZER_BINDING");
    this.#sqlConfigurationRecords.push(Object.freeze(reply.result.value)); this.#sqlApprovedConfigurations.add(pause); await this.#sqlResume(pause);
  }
  /** Same original cursor, no second inspector. A held write remains paused;
   * this method never treats its data as permission to continue native SQL. */
  public async pumpSelectedSqlFence(): Promise<void> {
    need(this.#selectedSqlBootstrap !== null && this.#sqlReady && this.#packet !== null && !this.#busy && !this.#originActive && !this.#structureActive, "SELECTED_SQL_PUMP_OWNER");
    this.#busy = true; try {
      await this.#current(); if (this.#sqlHeld !== null) { return; } await this.#pump();
      const pause = this.#pause;
      if (pause !== null && !pause.resumed && pause.sqlSite !== undefined) {
        if (pause.sqlSite === "initializerSerialize" || pause.sqlSite === "initializerPragma") { await this.#configureSelectedSqlInitializer(pause); }
        else { this.#sqlMutationPauses += 1; need(this.#sqlMutationPauses <= 64, "SELECTED_SQL_MUTATION_BOUND"); this.#sqlHeld = pause; await this.#requireSelectedSqlCapture(); }
      }
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public selectedSqlFenceState(): Readonly<Record<string, unknown>> {
    return Object.freeze({ profile: "private.selected-file-main-sql-fence.v1", originalBootstrapRetained: this.#selectedSqlBootstrap !== null,
      ready: this.#sqlReady, conditionalBreakpoints: Math.max(0, this.#sqlBreakpoints.size - 2), nativePrimitivesReplaced: false,
      heldSite: this.#sqlHeld?.sqlSite ?? null, mutationsResumed: 0, mutationGrantAvailable: false,
      initializerConfigurations: Object.freeze([...this.#sqlConfigurationRecords]), initializerConfigurationAutomaticallyAdmitted: true, completeSqlEffectProven: false, executionAuthorized: false, saveAuthorized: false });
  }

  async #reprove(): Promise<void> {
    need(this.#sourceArray !== null && this.#retainedArray !== null && this.#source !== null, "ORIGINAL_CAPTURE_REQUIRED");
    const result = await this.#request({ phase: "require", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#sourceArray,
      functionDeclaration: CALLS.require.program, arguments: [{ objectId: this.#retainedArray }], returnByValue: true } });
    z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict().parse(result);
  }
  public async reprove(packet: CurrentFootprintCopyMainBackendObservation): Promise<void> {
    need(!this.#originAttempted && !this.#structureAttempted && !this.#busy && packet === this.#packet && issued.get(packet) === this, "ORIGINAL_PACKET_REQUIRED"); this.#busy = true;
    try { await this.#reprove(); } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** The native owner admits the fixed head-age phases only for its separate
   * head-age birth. This method cannot grant that birth to another transport.
   * Every actual Date method receives native V8 metadata checks before the one
   * synchronous parser/control call; failures consume the complete attempt. */
  public async prepareHeadAge(nativeRootPid: number): Promise<void> {
    need(this.#headAgeBootstrapCapture && !this.#headAgePreparationAttempted && !this.#originAttempted && !this.#structureAttempted && !this.#busy && this.#packet !== null && issued.get(this.#packet) === this &&
      this.#retainedArray !== null && this.#sourceArray !== null, "HEAD_AGE_CONSUMED");
    this.#headAgePreparationAttempted = true; this.#busy = true;
    try {
      need(Number.isSafeInteger(nativeRootPid) && nativeRootPid > 0 && nativeRootPid <= 4_294_967_295, "HEAD_AGE_NATIVE_ROOT");
      await this.#reprove();
      const captured = objectReply.parse(await this.#request({ phase: "head-age-context-capture", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: this.#sourceArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_CAPTURE_PROGRAM,
        arguments: [{ objectId: this.#retainedArray }], returnByValue: false } }));
      need(captured.result.description === "Array(4)", "HEAD_AGE_CONTEXT_ARRAY");
      const accessors = decodeCurrentFootprintHeadAgeContextArray(await this.#properties(captured.result.objectId, "head-age-context-array"));
      const getter = decodeCurrentFootprintHeadAgeContextAccessor(await this.#properties(accessors.getter, "head-age-context-getter"), "getter");
      const setter = decodeCurrentFootprintHeadAgeContextAccessor(await this.#properties(accessors.setter, "head-age-context-setter"), "setter");
      need(getter.scriptId === setter.scriptId && getter.scriptId === this.#headAgeBootstrapScriptId, "HEAD_AGE_CONTEXT_SCRIPT");
      const source = z.object({ scriptSource: z.string().length(15_939) }).strict().parse(await this.#request({ phase: "head-age-context-source", method: "Debugger.getScriptSource", params: { scriptId: getter.scriptId } }));
      this.#headAgeContextSource = qualifyCurrentFootprintHeadAgeContextSource(source.scriptSource);
      const getterScopes = decodeCurrentFootprintHeadAgeContextScopes(await this.#properties(getter.scopesId, "head-age-context-getter-scopes"));
      const setterScopes = decodeCurrentFootprintHeadAgeContextScopes(await this.#properties(setter.scopesId, "head-age-context-setter-scopes"));
      const context = objectReply.parse(await this.#request({ phase: "head-age-context-bind", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: getterScopes[0], functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_BIND_PROGRAM,
        arguments: [{ objectId: getterScopes[1] }, { objectId: setterScopes[0] }, { objectId: setterScopes[1] },
          { objectId: captured.result.objectId }, { value: nativeRootPid }], returnByValue: false } }));
      need(context.result.description === "Array(5)", "HEAD_AGE_CONTEXT_BOUND"); requireCurrentFootprintHeadAgeContextSource(this.#headAgeContextSource);
      const selected = objectReply.parse(await this.#request({ phase: "head-age-capture", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, objectId: this.#sourceArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_CAPTURE_PROGRAM,
        arguments: [{ objectId: this.#retainedArray }, { objectId: context.result.objectId }], returnByValue: false } }));
      need(selected.result.description === "Array(16)", "HEAD_AGE_ARRAY");
      const ids = decodeCurrentFootprintHeadAgeArray(await this.#properties(selected.result.objectId, "head-age-array"));
      for (const [index, name] of CURRENT_FOOTPRINT_HEAD_AGE_DATE_METHODS.entries()) {
        const id = ids[index]; need(id !== undefined, "HEAD_AGE_METHOD"); decodeCurrentFootprintHeadAgeNativeMethod(await this.#properties(id, name), name);
      }
      this.#metadataRole = null; this.#headAgeArray = selected.result.objectId;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Run the one synchronous native Date/parser observation only after the
   * original method roster was fully checked. Metadata reads occur outside the
   * Windows collection bracket; no retry or new array is allocated here. */
  public async observeHeadAge(input: unknown): Promise<CurrentFootprintHeadAgeMainObservation> {
    need(!this.#headAgeAttempted && !this.#originAttempted && !this.#structureAttempted && !this.#busy && this.#headAgeArray !== null && this.#packet !== null && issued.get(this.#packet) === this, "HEAD_AGE_CONSUMED");
    this.#headAgeAttempted = true; this.#busy = true;
    try {
      const scope = validateClockControlScope(input); need(scope.createdAtLiteral.length === 19, "HEAD_AGE_LITERAL");
      const observed = await this.#request({ phase: "head-age-observe", method: "Runtime.callFunctionOn", params: {
        ...FLAGS, throwOnSideEffect: false, objectId: this.#headAgeArray, functionDeclaration: CURRENT_FOOTPRINT_HEAD_AGE_OBSERVE_PROGRAM,
        arguments: [{ value: scope.createdAtLiteral }, { value: Date.parse(`${scope.createdAtLiteral.replace(" ", "T")}Z`) }], returnByValue: true } });
      const value = decodeCurrentFootprintHeadAgeCdpReply(observed);
      const decoded = decodeCurrentFootprintHeadAgeMainObservation(value, scope.createdAtLiteral); await this.#reprove(); return decoded;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public async release(): Promise<void> {
    need(this.#selectedSqlBootstrap === null, "SELECTED_SQL_RETAIN_THROUGH_EXIT"); await this.#release();
  }
  async #release(): Promise<void> {
    need(!this.#originActive && !this.#structureActive && this.#attempted && !this.#busy && !this.#releaseAttempted, "RELEASE_CONSUMED"); this.#releaseAttempted = true; this.#busy = true;
    try {
      if (this.#breakpoint !== null && !this.#removeAttempted) { await this.#remove(true); }
      empty.parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true)); this.#released = true;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  #normalCloseQuiescence(released: boolean): void {
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && this.#packet !== null &&
      !this.#busy && !this.#failed && this.#pendingId === null && this.#text.length === 0 && this.#removed &&
      this.#pause !== null && this.#pause.resumed && !this.#originActive && !this.#structureActive && !this.#completionActive && !this.#completionFailed &&
      !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain && this.#originBreakpoints.size === 0 &&
      this.#originEvents.length === 0 && this.#released === released && (!released || this.#releaseAttempted), "NORMAL_CLOSE_QUIESCENCE");
  }
  /** Dedicated observer cleanup may close after a semantic refusal only when
   * every original pause, allocation, response and group has settled. No
   * normal work or generic historical owner receives this cleanup exception. */
  #structureCloseQuiescence(released: boolean): void {
    const capability = this.#originCapability; need(isCurrentProjectStructureMainCapability(capability), "STRUCTURE_CLOSE_OWNER");
    mainCleanup(capability, this);
    need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && this.#packet !== null &&
      !this.#busy && this.#pendingId === null && this.#text === "" && this.#decoderPendingContinuations === 0 && this.#removed &&
      this.#pause !== null && this.#pause.resumed && this.#structureAttempted && !this.#structureActive && !this.#originAttempted &&
      !this.#completionAttempted && !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain &&
      !this.#structureAllocationUncertain && this.#structureAllocation === null && this.#originBreakpoints.size === 0 &&
      this.#originEvents.length === 0 && (this.#structureLease === null || this.#originGroupReleased) &&
      this.#released === released && (!released || this.#releaseAttempted), "STRUCTURE_CLOSE_QUIESCENCE");
  }
  /** No resume is dispatched here. A complete original observation, settled
   * origins and the acknowledged registration resume precede the existing
   * object-group release. A failed release consumes this cleanup attempt. */
  public async prepareNormalClose(): Promise<void> {
    need(this.#selectedSqlBootstrap === null, "SELECTED_SQL_RETAIN_THROUGH_EXIT");
    need(!this.#normalCloseAttempted, "NORMAL_CLOSE_CONSUMED"); this.#normalCloseAttempted = true;
    const structure = isCurrentProjectStructureMainCapability(this.#originCapability);
    if (structure) { this.#structureCloseQuiescence(this.#released); } else { this.#normalCloseQuiescence(this.#released); }
    if (!this.#released) { await this.#release(); }
    if (structure) { this.#structureCloseQuiescence(true); } else { this.#normalCloseQuiescence(true); }
  }
  public requireNormalClosePrepared(): void {
    need(this.#normalCloseAttempted, "NORMAL_CLOSE_REQUIRED");
    if (isCurrentProjectStructureMainCapability(this.#originCapability)) { this.#structureCloseQuiescence(true); } else { this.#normalCloseQuiescence(true); }
  }
  /** Transfer this original construction cursor once to the fixed structure
   * observer. Only its dedicated original native birth carries the new fixed
   * vocabulary; a token cannot upgrade another purpose or its native budget. */
  public async issueStructureLease(capability: CurrentFootprintCombinedMainCapability | CurrentProjectStructureMainCapability,
    packet: unknown): Promise<CurrentProjectStructureMainLease> {
    need(!this.#structureAttempted && !this.#originAttempted && !this.#busy && this.#packet !== null && packet === this.#packet && issued.get(this.#packet) === this &&
      this.#appScriptId !== null && this.#appSource !== null && this.#retainedArray !== null, "STRUCTURE_ORIGINAL_CONSTRUCTION_REQUIRED");
    mainCapability(capability, this); this.#same(false);
    this.#structureAttempted = true; this.#busy = true;
    if (isCurrentProjectStructureMainCapability(capability)) { this.#originCapability = capability; }
    try {
      await this.#reprove(); mainCapability(capability, this); this.#same(false);
      this.#structureSource = qualifyCurrentProjectStructureMainSource(this.#appSource);
      this.#originCapability = capability;
      const token = Object.freeze({ profile: "private.current-project-structure-main-lease.v1" as const });
      const binding: CurrentProjectStructureMainBinding = Object.freeze({ issuer: this, scriptId: this.#appScriptId,
        construction: this.#retainedArray, source: this.#structureSource,
        assertOriginal: async (): Promise<void> => { this.#structureCheck(token, false); await this.#current(); this.#structureCheck(token, false); },
        assertCleanup: (): void => { this.#structureCheck(token, true); },
        fail: (failure: unknown): void => {
          if (!this.#structureActive || this.#structureLease !== token) { return; }
          this.#fail(failure);
        },
        assertGenerationExited: (): void => { this.#structureCheck(token, true); need(mainExited(capability, this), "STRUCTURE_GENERATION_LIVE"); },
        request: (command: CurrentProjectStructureMainCommand, cleanup: boolean, retainAllocationReply?: (reply: unknown) => void): Promise<unknown> =>
          this.#structureRequest(token, command, cleanup, retainAllocationReply),
        settleAllocation: async (): Promise<void> => {
          this.#structureCheck(token, true);
          const allocation = this.#structureAllocation;
          if (allocation === null) { return; }
          need(!this.#busy && allocation.stopped && this.#pendingId === allocation.id, "STRUCTURE_ALLOCATION_PENDING"); this.#busy = true;
          try { await this.#pump(true); this.#structureCheck(token, true); } finally { this.#busy = false; }
        },
        pump: async (cleanup: boolean): Promise<void> => {
          this.#structureCheck(token, cleanup); need(!this.#busy, "STRUCTURE_BUSY"); this.#busy = true;
          try { await this.#pump(cleanup); this.#structureCheck(token, cleanup); } finally { this.#busy = false; }
        },
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#structureCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): void => {
          this.#structureCheck(token, true); need(!this.#busy && (mainExited(capability, this) ||
            this.#originGroupReleased && this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected &&
            !this.#originUncertain && !this.#structureAllocationUncertain && this.#structureAllocation === null &&
            this.#pendingId === null && this.#originEvents.length === 0), "STRUCTURE_CLEANUP_INCOMPLETE");
          this.#structureActive = false;
        },
      });
      this.#structureLease = token; this.#structureActive = true;
      structureLeases.set(token, Object.freeze({ assertOriginalEntry: (): void => { this.#structureCheck(token, true); }, binding }));
      return token;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Recheck the same native capability on every lease use. Only observed
   * original-root exit and empty Job bypass an expired inspector cleanup lane. */
  #structureCheck(token: CurrentProjectStructureMainLease, cleanup: boolean): void {
    need(this.#structureActive && this.#structureLease === token && this.#originCapability !== null && this.#structureSource !== null,
      "STRUCTURE_ORIGINAL_LEASE_REQUIRED");
    requireCurrentProjectStructureMainSource(this.#structureSource);
    if (cleanup && mainExited(this.#originCapability, this)) {
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER"); return;
    }
    if (cleanup) { mainCleanup(this.#originCapability, this); }
    else { mainCapability(this.#originCapability, this); need(!this.#originUncertain, "STRUCTURE_FAILED"); }
    this.#same(cleanup);
  }
  /** Preserve the original request allocator and pause acknowledgments. A
   * rejected allocation/dispatch remains consumed and cannot be retried. */
  async #structureRequest(token: CurrentProjectStructureMainLease, input: CurrentProjectStructureMainCommand, cleanup: boolean,
    retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    need(typeof cleanup === "boolean" && !this.#busy, "STRUCTURE_BUSY"); this.#structureCheck(token, cleanup);
    const command = validateCurrentProjectStructureMainCommand(input);
    need(retainAllocationReply === undefined || command.phase === "structure-main-arm" && !cleanup, "STRUCTURE_ALLOCATION_CALLBACK");
    const isCleanup = ["structure-main-remove", "structure-main-resume", "structure-main-release"].includes(command.phase);
    need(cleanup === isCleanup && (cleanup ? this.#structureCleanup < CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.cleanup :
      this.#structureNormal < CURRENT_PROJECT_STRUCTURE_MAIN_REQUESTS.normal), "STRUCTURE_REQUEST_BOUND");
    if (command.phase === "structure-main-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "STRUCTURE_BREAKPOINT_OWNER"); }
    if (command.phase === "structure-main-resume") {
      need(this.#originPauseActive && !this.#originResumeExpected, "STRUCTURE_RESUME_CONSUMED"); this.#originResumeExpected = true;
    }
    if (cleanup) { this.#structureCleanup += 1; } else { this.#structureNormal += 1; }
    this.#busy = true;
    try {
      let allocated: string | null = null;
      let retain: ((reply: unknown) => void) | undefined;
      if (command.phase === "structure-main-arm") { retain = (reply: unknown): void => {
        const known = z.looseObject({ breakpointId: handle }).safeParse(reply);
        if (known.success && !this.#originBreakpoints.has(known.data.breakpointId)) {
          allocated = known.data.breakpointId; this.#originBreakpoints.add(allocated);
        } else { this.#structureAllocationUncertain = true; }
        retainAllocationReply?.(reply);
      }; }
      const result = await this.#request(command, cleanup, retain); this.#structureCheck(token, cleanup);
      if (command.phase === "structure-main-arm") {
        const reply = z.object({ breakpointId: handle, actualLocation: location }).strict().parse(result);
        need(allocated === reply.breakpointId && reply.actualLocation.scriptId === command.params.location.scriptId && reply.actualLocation.lineNumber === command.params.location.lineNumber && reply.actualLocation.columnNumber === command.params.location.columnNumber, "STRUCTURE_BREAKPOINT_ALLOCATION");
      } else if (command.phase === "structure-main-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.phase === "structure-main-resume") { empty.parse(result); }
      else if (command.phase === "structure-main-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { if (command.phase !== "structure-main-arm") { this.#originUncertain = true; } this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Only the actual new combined native owner can join this original runner.
   * No caller-supplied scheduler, handles, flags or serialized packet is issued. */
  public async issueRequestOrigin(capability: CurrentFootprintCombinedMainCapability,
    packet: CurrentFootprintCopyMainBackendObservation): Promise<CurrentFootprintCopyMainRequestOrigin> {
    requireCurrentFootprintCombinedMainCapability(capability, this);
    const token = await this.#issueRequestOrigin(capability, packet);
    need(token.profile === "private.current-footprint-copy-main-request-origin.v1", "REQUEST_ORIGINAL_OWNER"); return token;
  }
  /** Consume the same original main cursor using only the separately issued
   * writer-v2 capability. This does not qualify clocks or enable a writer. */
  public async issueForwardExecutionRequestOrigin(capability: CurrentFootprintForwardExecutionMainCapability,
    packet: CurrentFootprintCopyMainBackendObservation): Promise<CurrentFootprintForwardMainRequestOrigin> {
    requireCurrentFootprintForwardExecutionMainCapability(capability, this);
    const token = await this.#issueRequestOrigin(capability, packet);
    need(token.profile === "private.current-footprint-forward-main-request-origin.v2", "FORWARD_REQUEST_ORIGINAL_OWNER"); return token;
  }
  async #issueRequestOrigin(capability: MainCapability, packet: CurrentFootprintCopyMainBackendObservation): Promise<MainRequestOrigin> {
    need(!this.#originAttempted && !this.#structureAttempted && !this.#busy && packet === this.#packet && issued.get(packet) === this &&
      this.#appScriptId !== null && this.#appSource !== null && this.#retainedArray !== null && this.#driverCallbackObjectId !== null,
    "REQUEST_ORIGINAL_CONSTRUCTION_REQUIRED");
    mainCapability(capability, this);
    this.#originAttempted = true; this.#busy = true;
    try {
      await this.#reprove(); mainCapability(capability, this); this.#same(false);
      this.#originSource = qualifyCurrentFootprintCopyMainRequestSource(this.#appSource);
      const forward = isCurrentFootprintForwardExecutionMainCapability(capability);
      const token = forward ? Object.freeze({ profile: "private.current-footprint-forward-main-request-origin.v2" as const, executionAuthorized: false as const }) :
        Object.freeze({ profile: "private.current-footprint-copy-main-request-origin.v1" as const, executionAuthorized: false as const });
      const bindings: CurrentFootprintForwardMainRequestOriginBindings = Object.freeze({ scriptId: this.#appScriptId,
        fail: (error: unknown): void => { if (forward && this.#originToken === token) { this.#fail(error); } },
        retainedArrayObjectId: this.#retainedArray, driverCallbackObjectId: this.#driverCallbackObjectId, qualifiedSource: this.#originSource,
        assertOriginal: (): Promise<void> => this.#originCurrent(token),
        assertCleanup: (): Promise<void> => { this.#originCheck(token, true); return Promise.resolve(); },
        assertOriginalGenerationExited: (): Promise<void> => {
          this.#originCheck(token, true); need(mainExited(capability, this), "REQUEST_ORIGINAL_GENERATION_LIVE"); return Promise.resolve();
        },
        request: (command: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void): Promise<unknown> => this.#originRequest(token, command, cleanup, retainAllocation),
        settleAllocation: (): Promise<void> => this.#settleOriginAllocation(token, false),
        pump: (cleanup: boolean): Promise<void> => this.#originPump(token, cleanup),
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#originCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): Promise<void> => {
          this.#originCheck(token, true); need(!this.#busy && (mainExited(capability, this) ||
            this.#originGroupReleased && this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected &&
            !this.#originUncertain && this.#pendingId === null && this.#structureAllocation === null && !this.#structureAllocationUncertain && this.#originEvents.length === 0), "REQUEST_ORIGINAL_CLEANUP_INCOMPLETE");
          if (this.#completionAttempted) {
            need(mainExited(capability, this), "COMPLETION_ORIGINAL_GENERATION_LIVE");
            return this.#retireFailedCompletionTransfer(capability);
          }
          this.#originActive = false; return Promise.resolve();
        },
      });
      this.#originCapability = capability; this.#originToken = token; this.#originActive = true;
      requestOrigins.set(token, Object.freeze({ kind: forward ? "forward" : "combined", assertOriginalEntry: (): void => { this.#originCheck(token, true); }, bindings, capability, runner: this })); return token;
    } catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Synchronous identity join before any create. Equal receipts or an origin
   * belonging to another original backend cannot pass this capability check. */
  public requireRequestOrigin(capability: CurrentFootprintCombinedMainCapability, token: CurrentFootprintCopyMainRequestOrigin): void {
    requireCurrentFootprintCombinedMainCapability(capability, this);
    need(capability === this.#originCapability && token === this.#originToken, "REQUEST_ORIGINAL_OWNER");
    this.#originCheck(token, false);
  }
  public requireForwardExecutionRequestOrigin(capability: CurrentFootprintForwardExecutionMainCapability, token: CurrentFootprintForwardMainRequestOrigin): void {
    requireCurrentFootprintForwardExecutionMainCapability(capability, this);
    need(capability === this.#originCapability && token === this.#originToken, "FORWARD_REQUEST_ORIGINAL_OWNER"); this.#originCheck(token, false);
  }
  /** Private original-owner handoff. Capacity refuses before either the old
   * lease or a native phase is consumed. A dispatched begin is one-shot; only
   * actual original exit can settle a lost acknowledgment. No writer starts. */
  public async issueCompletionOrigin(capability: CurrentFootprintCombinedMainCapability,
    packet: CurrentFootprintCopyMainRequestHeldFinalPb): Promise<CurrentFootprintCopyMainCompletionOrigin> {
    requireCurrentFootprintCombinedMainCapability(capability, this);
    const token = await this.#issueCompletionOrigin(capability, packet);
    need(token.profile === "private.current-footprint-copy-main-completion-origin.v1", "COMPLETION_ORIGINAL_OWNER"); return token;
  }
  /** Transfer the actual held PB on this same v2 main cursor after exact native
   * completion headroom, retaining failed/unknown begin custody without retry. */
  public async issueForwardExecutionCompletionOrigin(capability: CurrentFootprintForwardExecutionMainCapability,
    packet: CurrentFootprintCopyMainRequestHeldFinalPb): Promise<CurrentFootprintForwardMainCompletionOrigin> {
    requireCurrentFootprintForwardExecutionMainCapability(capability, this);
    const token = await this.#issueCompletionOrigin(capability, packet);
    need(token.profile === "private.current-footprint-forward-main-completion-origin.v2", "FORWARD_COMPLETION_ORIGINAL_OWNER"); return token;
  }
  async #issueCompletionOrigin(capability: MainCapability, packet: CurrentFootprintCopyMainRequestHeldFinalPb): Promise<MainCompletionOrigin> {
    need(!this.#completionAttempted && !this.#busy && this.#originToken !== null && capability === this.#originCapability &&
      this.#appSource !== null && this.#appScriptId !== null && this.#originSource !== null, "COMPLETION_ORIGINAL_CONSTRUCTION_REQUIRED");
    const forward = isCurrentFootprintForwardExecutionMainCapability(capability);
    const held = requireCurrentFootprintCopyMainRequestHeldFinalPb(packet), originalToken = this.#originToken;
    need(held.qualifiedSource === this.#originSource && held.scriptId === this.#appScriptId &&
      held.retainedArrayObjectId === this.#retainedArray, "COMPLETION_ORIGINAL_HELD_OWNER");
    this.#originCheck(originalToken, false);
    mainCompletionCapacity(capability, this, this.#requests + 1);
    const source = qualifyCurrentFootprintCopyMainCompletionSource(this.#appSource);
    this.#completionAttempted = true; this.#busy = true;
    try {
      await held.assertOriginal(); this.#originCheck(originalToken, false);
      need(requireCurrentFootprintCopyMainRequestHeldFinalPb(packet) === held && this.#pendingId === null && this.#text === "" &&
        (!forward || this.#decoderPendingContinuations === 0 && this.#structureAllocation === null && !this.#structureAllocationUncertain) &&
        this.#originEvents.length === 0 && this.#originBreakpoints.size === 0 && this.#originPauseActive &&
        !this.#originResumeExpected && !this.#originUncertain && !this.#originGroupReleased, "COMPLETION_ORIGINAL_CURSOR");
      this.#completionBeginAttempted = true; await mainCompletionBegin(capability, this, this.#requests + 1);
      this.#originCheck(originalToken, false);
      need(this.#pendingId === null && this.#text === "" &&
        (!forward || this.#decoderPendingContinuations === 0 && this.#structureAllocation === null && !this.#structureAllocationUncertain && this.#originBreakpoints.size === 0) &&
        this.#originEvents.length === 0 && this.#originPauseActive &&
        !this.#originResumeExpected && !this.#originUncertain && !this.#originGroupReleased, "COMPLETION_ORIGINAL_CURSOR");
      // No await between consuming the exact old held lease and installing its
      // Sole new origin. The old collector cannot resume, release or retire it.
      const transferredHeld = originalToken.profile === "private.current-footprint-forward-main-request-origin.v2" ?
        transferCurrentFootprintForwardMainRequestHeldFinalPb(packet, originalToken) : transferCurrentFootprintCopyMainRequestHeldFinalPb(packet, originalToken);
      need(transferredHeld === held, "COMPLETION_TRANSFER_IDENTITY");
      const token = forward ? Object.freeze({ profile: "private.current-footprint-forward-main-completion-origin.v2" as const, executionAuthorized: false as const }) :
        Object.freeze({ profile: "private.current-footprint-copy-main-completion-origin.v1" as const, executionAuthorized: false as const });
      this.#completionSource = source; this.#completionToken = token; this.#completionActive = true;
      const bindings: CurrentFootprintForwardMainCompletionOriginBindings = Object.freeze({ heldFinalPb: packet, transferredHeld,
        source, scriptId: held.scriptId,
        assertOriginal: (): Promise<void> => this.#completionCurrent(token),
        assertCleanup: (): Promise<void> => { this.#completionCheck(token, true); return Promise.resolve(); },
        assertOriginalHeld: (): Promise<void> => {
          this.#completionCheck(token, false); need(this.#originPauseActive && !this.#originResumeExpected &&
            !this.#completionFinalResumeAttempted && this.#originEvents.length === 0, "COMPLETION_ORIGINAL_PB_ADVANCED"); return Promise.resolve();
        },
        assertOriginalGenerationExited: (): Promise<void> => {
          this.#completionCheck(token, true); need(mainExited(capability, this), "COMPLETION_ORIGINAL_GENERATION_LIVE");
          // Only observed retained-root exit and empty Job permit abandoned
          // Inspector replies/events to settle without pretending they replied.
          this.#originEvents.length = 0; return Promise.resolve();
        },
        fail: (): void => {
          if (this.#completionToken === token) { this.#completionFailed = true; mainCompletionFail(capability, this); }
        },
        request: (command: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean, retainAllocation?: (reply: unknown) => void): Promise<unknown> => this.#completionRequest(token, command, cleanup, retainAllocation),
        settleAllocation: (): Promise<void> => this.#settleOriginAllocation(token, true),
        pump: (cleanup: boolean): Promise<void> => this.#completionPump(token, cleanup),
        takeEvent: (): CurrentFootprintCopyMainRequestOriginEvent | null => { this.#completionCheck(token, true); return this.#originEvents.shift() ?? null; },
        retire: (): Promise<void> => this.#completionRetire(token),
      });
      completionOrigins.set(token, Object.freeze({ kind: forward ? "forward" : "combined", assertOriginalEntry: (): void => { this.#completionCheck(token, true); }, bindings })); return token;
    } catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Poll only the retained original allocation once after its caller has
   * stopped. A late ID enters both original cleanup owners before any guard;
   * uncertainty never becomes normal eligibility or a replacement allocation. */
  async #settleOriginAllocation(token: MainRequestOrigin | MainCompletionOrigin, completion: boolean): Promise<void> {
    need(isCurrentFootprintForwardExecutionMainCapability(this.#originCapability), "FORWARD_ALLOCATION_ORIGINAL");
    const current = (): void => {
      if (token.profile === "private.current-footprint-forward-main-completion-origin.v2") { need(completion, "FORWARD_ALLOCATION_ORIGINAL"); this.#completionCheck(token, true); }
      else { need(!completion && token.profile === "private.current-footprint-forward-main-request-origin.v2", "FORWARD_ALLOCATION_ORIGINAL"); this.#originCheck(token, true); }
    };
    current(); const allocation = this.#structureAllocation;
    if (allocation === null) { return; }
    need(!this.#busy && allocation.stopped && this.#pendingId === allocation.id, "STRUCTURE_ALLOCATION_PENDING"); this.#busy = true;
    try { await this.#pump(true); current(); }
    finally { this.#busy = false; }
  }
  #completionCheck(token: MainCompletionOrigin, cleanup: boolean): void {
    need(this.#completionActive && token === this.#completionToken && this.#originCapability !== null && this.#completionSource !== null,
      "COMPLETION_ORIGINAL_LEASE_REQUIRED");
    requireCurrentFootprintCopyMainCompletionSource(this.#completionSource);
    if (cleanup && mainExited(this.#originCapability, this)) {
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER"); return;
    }
    if (cleanup) { mainCleanup(this.#originCapability, this); }
    else { need(!this.#completionFailed && !this.#originUncertain, "COMPLETION_FAILED"); mainCapability(this.#originCapability, this); }
    this.#same(cleanup);
  }
  async #completionCurrent(token: MainCompletionOrigin): Promise<void> {
    this.#completionCheck(token, false);
    if (this.#originCapability !== null && isCurrentFootprintForwardExecutionMainCapability(this.#originCapability)) { await reproveCurrentFootprintForwardExecutionMainPublication(this.#originCapability, this); this.#completionCheck(token, false); }
    await this.#current(); this.#completionCheck(token, false);
  }
  async #completionPump(token: MainCompletionOrigin, cleanup: boolean): Promise<void> {
    need(typeof cleanup === "boolean" && !this.#busy, "COMPLETION_ORIGINAL_BUSY"); this.#completionCheck(token, cleanup); this.#busy = true;
    try { await this.#pump(cleanup); this.#completionCheck(token, cleanup); }
    catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #completionRequest(token: MainCompletionOrigin, input: CurrentFootprintCopyMainCompletionCommand, cleanup: boolean,
    retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    need(typeof cleanup === "boolean" && !this.#busy, "COMPLETION_ORIGINAL_BUSY"); this.#completionCheck(token, cleanup);
    const command = validateCurrentFootprintCopyMainCompletionCommand(input);
    const actualCleanup = ["completion-remove", "completion-resume", "completion-resume-final-pb", "completion-release"].includes(command.phase);
    need(cleanup === actualCleanup && (cleanup ? this.#completionCleanup < CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup :
      this.#completionNormal < CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal), "COMPLETION_REQUEST_CLASS_OR_BOUND");
    if (command.phase === "completion-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "COMPLETION_BREAKPOINT_OWNER"); }
    if (command.method === "Debugger.resume") {
      // Resume consumes cleanup capacity but advances native application work.
      // A retained alias must never resume after a semantic/protocol failure.
      this.#completionCheck(token, false);
      need(this.#originPauseActive && !this.#originResumeExpected && (command.phase === "completion-resume-final-pb") === !this.#completionFinalResumeAttempted,
        "COMPLETION_ORIGINAL_RESUME_CONSUMED");
      if (command.phase === "completion-resume-final-pb") { this.#completionFinalResumeAttempted = true; }
      this.#originResumeExpected = true;
    }
    const allocation = command.phase === "completion-source-arm" || command.phase === "completion-callback-arm";
    const forward = token.profile === "private.current-footprint-forward-main-completion-origin.v2";
    need(retainAllocationReply === undefined || forward && allocation && !cleanup, "FORWARD_ALLOCATION_CALLBACK");
    this.#busy = true; if (cleanup) { this.#completionCleanup += 1; } else { this.#completionNormal += 1; }
    const retain = forward && allocation ? (reply: unknown): void => {
      const id = currentFootprintCopyMainCompletionAllocatedId(reply);
      if (id !== null && !this.#originBreakpoints.has(id)) { this.#originBreakpoints.add(id); this.#structureAllocationUncertain = false; }
      else { this.#structureAllocationUncertain = true; }
      retainAllocationReply?.(reply);
    } : undefined;
    if (retain !== undefined) { this.#structureAllocationUncertain = true; }
    try {
      const result = await this.#request(command, cleanup, retain); this.#completionCheck(token, cleanup);
      if (command.phase === "completion-source-arm" || command.phase === "completion-callback-arm") {
        const allocated = currentFootprintCopyMainCompletionAllocatedId(result);
        if (forward) { need(allocated !== null && this.#originBreakpoints.has(allocated) && !this.#structureAllocationUncertain, "COMPLETION_BREAKPOINT_ALLOCATION"); }
        else { need(allocated !== null && !this.#originBreakpoints.has(allocated), "COMPLETION_BREAKPOINT_ALLOCATION"); this.#originBreakpoints.add(allocated); }
      } else if (command.phase === "completion-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.method === "Debugger.resume") { empty.parse(result); }
      else if (command.phase === "completion-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { this.#completionFailed = true; this.#originUncertain = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  /** Native retirement acknowledgment does not settle inspector custody.
   * Recheck the original cursor after its await, retaining cleanup ownership
   * and the actual acknowledgment if a late event/frame requires root exit. */
  #completionRetireQuiescence(): void {
    need(!this.#completionFailed && this.#completionNormal === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.normal &&
      this.#completionCleanup === CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS.cleanup && this.#originGroupReleased &&
      this.#originBreakpoints.size === 0 && !this.#originPauseActive && !this.#originResumeExpected && !this.#originUncertain &&
      this.#pendingId === null && this.#structureAllocation === null && !this.#structureAllocationUncertain && this.#originEvents.length === 0 &&
      this.#text === "" && this.#decoderPendingContinuations === 0 &&
      (this.#forwardPoll === null || this.#forwardPoll.settled && this.#forwardPoll.delivered), "COMPLETION_ORIGINAL_CLEANUP_INCOMPLETE");
  }
  async #completionRetire(token: MainCompletionOrigin): Promise<void> {
    this.#completionCheck(token, true); need(!this.#busy && this.#originCapability !== null, "COMPLETION_ORIGINAL_BUSY");
    const exited = mainExited(this.#originCapability, this);
    if (!exited) { this.#completionRetireQuiescence(); }
    // A lost native retirement acknowledgement is never replayed. After actual
    // Exit the retained phase may be released locally without another request.
    if (this.#completionRetireAttempted) { need(exited, "COMPLETION_RETIRE_CONSUMED"); this.#completionActive = false; this.#originActive = false; return; }
    this.#completionRetireAttempted = true; this.#busy = true;
    try {
      await mainCompletionRetire(this.#originCapability, this); this.#completionRetirementAcknowledged = true;
      this.#completionCheck(token, true);
      if (!mainExited(this.#originCapability, this)) { this.#completionRetireQuiescence(); }
      this.#completionActive = false; this.#originActive = false;
    }
    catch (error) { this.#completionFailed = true; this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #retireFailedCompletionTransfer(capability: MainCapability): Promise<void> {
    if (this.#completionBeginAttempted && !this.#completionRetireAttempted) {
      this.#completionRetireAttempted = true; await mainCompletionRetire(capability, this);
    }
    this.#originActive = false;
  }
  #originCheck(token: MainRequestOrigin, cleanup: boolean): void {
    need(!this.#completionActive, "COMPLETION_OWNS_MAIN");
    need(this.#originActive && token === this.#originToken && this.#originCapability !== null && this.#originSource !== null,
      "REQUEST_ORIGINAL_LEASE_REQUIRED");
    if (cleanup && mainExited(this.#originCapability, this)) {
      // Actual original-root exit and empty Job settle the retained lease even
      // After inspector budgets expire. This path cannot revive native I/O.
      need(methods(this.#transport).every((value, index) => value === this.#methods[index]) && !this.#released, "OWNER");
      requireCurrentFootprintCopyMainRequestSource(this.#originSource);
      if (this.#source !== null) { requireCurrentFootprintCopyMainBackendSource(this.#source); }
      return;
    }
    if (cleanup) { mainCleanup(this.#originCapability, this); }
    else { mainCapability(this.#originCapability, this); }
    requireCurrentFootprintCopyMainRequestSource(this.#originSource); this.#same(cleanup);
  }
  async #originCurrent(token: MainRequestOrigin): Promise<void> {
    this.#originCheck(token, false);
    if (this.#originCapability !== null && isCurrentFootprintForwardExecutionMainCapability(this.#originCapability)) { await reproveCurrentFootprintForwardExecutionMainPublication(this.#originCapability, this); this.#originCheck(token, false); }
    await this.#current(); this.#originCheck(token, false);
  }
  async #originPump(token: MainRequestOrigin, cleanup: boolean): Promise<void> {
    need(!this.#completionAttempted, "COMPLETION_TRANSFER_CONSUMED");
    need(typeof cleanup === "boolean" && !this.#busy, "REQUEST_ORIGINAL_BUSY"); this.#originCheck(token, cleanup); this.#busy = true;
    try { await this.#pump(cleanup); this.#originCheck(token, cleanup); }
    catch (error) { this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  async #originRequest(token: MainRequestOrigin, input: CurrentFootprintCopyMainRequestCollectCommand, cleanup: boolean,
    retainAllocationReply?: (reply: unknown) => void): Promise<unknown> {
    need(!this.#completionAttempted, "COMPLETION_TRANSFER_CONSUMED");
    need(typeof cleanup === "boolean" && !this.#busy, "REQUEST_ORIGINAL_BUSY"); this.#originCheck(token, cleanup);
    const command = validateCurrentFootprintCopyMainRequestCollectCommand(input);
    if (command.phase === "request-remove") { need(this.#originBreakpoints.has(command.params.breakpointId), "REQUEST_BREAKPOINT_OWNER"); }
    if (command.phase === "request-resume") {
      // Although charged to cleanup, resume advances the original SQL path.
      // A v2 semantic refusal can retain removal custody, never resume it.
      if (token.profile === "private.current-footprint-forward-main-request-origin.v2") { this.#originCheck(token, false); }
      need(this.#originPauseActive && !this.#originResumeExpected, "REQUEST_ORIGINAL_RESUME_CONSUMED"); this.#originResumeExpected = true;
    }
    const allocation = command.phase === "request-driver-arm" || command.phase === "request-site-arm";
    const forward = token.profile === "private.current-footprint-forward-main-request-origin.v2";
    need(retainAllocationReply === undefined || forward && allocation && !cleanup, "FORWARD_ALLOCATION_CALLBACK");
    this.#busy = true;
    const retain = forward && allocation ? (reply: unknown): void => {
      const id = currentFootprintCopyMainRequestAllocatedId(reply);
      if (id !== null && !this.#originBreakpoints.has(id)) { this.#originBreakpoints.add(id); this.#structureAllocationUncertain = false; }
      else { this.#structureAllocationUncertain = true; }
      retainAllocationReply?.(reply);
    } : undefined;
    if (retain !== undefined) { this.#structureAllocationUncertain = true; }
    const mutation = ["request-driver-arm", "request-site-arm", ...CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_CLEANUP_PHASES].includes(command.phase);
    try {
      const result = await this.#request(command, cleanup, retain); this.#originCheck(token, cleanup);
      if (command.phase === "request-driver-arm" || command.phase === "request-site-arm") {
        const allocated = currentFootprintCopyMainRequestAllocatedId(result);
        if (forward) { need(allocated !== null && this.#originBreakpoints.has(allocated) && !this.#structureAllocationUncertain, "REQUEST_BREAKPOINT_ALLOCATION"); }
        else { need(allocated !== null && !this.#originBreakpoints.has(allocated), "REQUEST_BREAKPOINT_ALLOCATION"); this.#originBreakpoints.add(allocated); }
      } else if (command.phase === "request-remove") { empty.parse(result); this.#originBreakpoints.delete(command.params.breakpointId); }
      else if (command.phase === "request-resume") { empty.parse(result); }
      else if (command.phase === "request-release") { empty.parse(result); this.#originGroupReleased = true; }
      return result;
    } catch (error) { if (mutation) { this.#originUncertain = true; } this.#fail(error); throw error; } finally { this.#busy = false; }
  }
  public retained(): Readonly<{ attempted: boolean; completed: boolean; failed: boolean; phase: string; failure: string | null; requests: number; replies: number;
    pendingReplies: number; events: number; receivedBytes: number; initialContinuationCount: number; registrationPaused: boolean; sourceQualified: boolean;
    breakpointRemoved: boolean; releaseAttempted: boolean; released: boolean; registrationLocationFailure: RegistrationLocationFailure | null;
    metadataRole: MetadataRole | null; schemaIssues: readonly SchemaIssue[] | null; requestOriginIssued: boolean; requestOriginActive: boolean }> {
    return Object.freeze({ attempted: this.#attempted, completed: this.#packet !== null, failed: this.#failed, phase: this.#phase, failure: this.#lastFailure,
      requests: this.#requests, replies: this.#replies.length, pendingReplies: this.#pendingId === null ? 0 : 1, events: this.#events, receivedBytes: this.#received,
      initialContinuationCount: this.#initialContinuationCount, registrationPaused: this.#registrationSeen, sourceQualified: this.#source !== null,
      breakpointRemoved: this.#removed, releaseAttempted: this.#releaseAttempted, released: this.#released,
      registrationLocationFailure: this.#registrationLocationFailure, metadataRole: this.#metadataRole, schemaIssues: this.#schemaIssues,
      requestOriginIssued: this.#originAttempted, requestOriginActive: this.#originActive });
  }
}

// oxlint-disable-next-line typescript/unbound-method -- Invoke only on the same original private-field runner, after genuine native-owner admission.
const originalForwardMainCursor = CurrentFootprintCopyMainBackendRunner.prototype.issueForwardMainCursor;
/** The native v2 issuer captures the original cursor method rather than an
 * instance/prototype replacement. This issues no send or whole-writer role. */
export function captureOriginalCurrentFootprintForwardMainCursor(runner: CurrentFootprintCopyMainBackendRunner): CurrentFootprintForwardMainCursor {
  requireOriginalCurrentFootprintForwardMainRunner(runner);
  need(CurrentFootprintCopyMainBackendRunner.prototype.issueForwardMainCursor === originalForwardMainCursor, "FORWARD_CURSOR_ORIGINAL");
  return originalForwardMainCursor.call(runner);
}

const forwardMainPrototypes = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintCopyMainBackendRunner.prototype);
/** Recheck complete original method descriptors and actual receiver resolution.
 * Native factory membership and cursor/source admission are separate proofs. */
export function requireOriginalCurrentFootprintForwardMainRunner(runner: CurrentFootprintCopyMainBackendRunner): void {
  requireCurrentFootprintForwardExecutionPrototypes(forwardMainPrototypes);
  need(runner !== null && typeof runner === "object" && !types.isProxy(runner) &&
    Object.getPrototypeOf(runner) === CurrentFootprintCopyMainBackendRunner.prototype && Reflect.ownKeys(runner).length === 0, "FORWARD_CURSOR_ORIGINAL");
}
/** Authenticate the exact original allocation receiver, never a caller's
 * replacement callback. This membership check grants no native send or retry
 * and remains valid for a real late reply after the original caller stopped. */
export function requireOriginalCurrentFootprintForwardMainPollRetainer(runner: CurrentFootprintCopyMainBackendRunner,
  retain: (chunk: string) => void): void {
  requireOriginalCurrentFootprintForwardMainRunner(runner);
  need(typeof retain === "function" && !types.isProxy(retain), "FORWARD_ORIGINAL_POLL_RETAINER");
  const original = forwardPollRetainers.get(retain);
  need(original !== undefined && original.runner === runner, "FORWARD_ORIGINAL_POLL_RETAINER"); original.requireOriginal();
}
