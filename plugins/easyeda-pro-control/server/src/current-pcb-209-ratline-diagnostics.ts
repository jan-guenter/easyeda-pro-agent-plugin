/** Bounded classifications only: diagnostic status must never publish native
 * event payloads, exception values, source, URLs or user document identifiers. */
import { types } from "node:util";
import { z } from "zod";

const eventMethods = Object.freeze(["Runtime.executionContextCreated", "Runtime.executionContextDestroyed", "Runtime.executionContextsCleared",
  "Runtime.consoleAPICalled", "Runtime.exceptionThrown", "Debugger.scriptParsed", "Debugger.scriptFailedToParse", "Debugger.paused", "Debugger.resumed",
  "Target.attachedToTarget", "Target.detachedFromTarget", "Target.targetDestroyed", "Page.frameAttached", "Page.frameDetached", "Page.frameNavigated",
  "Page.navigatedWithinDocument", "Page.frameStartedLoading", "Page.frameStoppedLoading", "Inspector.workerScriptLoaded"] as const);
export type CurrentPcb209RatlineEventKind = typeof eventMethods[number] | "other" | "unparsed";
export function currentPcb209RatlineEventKind(method: string): CurrentPcb209RatlineEventKind {
  return eventMethods.find(value => value === method) ?? "other";
}
// Exact locally owned literals only. Matching a prefix is insufficient:
// An external exception can embed private uppercase text after that prefix.
const failureReasons = new Set([
  ...[
    "ABORTED", "ARM_CONSUMED", "CHILD_START_NOT_READY", "CLEANUP_OWNER", "CLEANUP_UNSETTLED", "COMMAND_BUDGET",
    "COMMAND_SESSION", "CONTEXT", "CONTINUATION_CONSUMED", "COPY_PRELOAD", "CREATION_OWNER", "DEADLINE",
    "DEPENDENCY", "DUPLICATE_PAUSE", "EVENT_BUDGET", "EVENT_SESSION", "EVENT_STATE", "FAILED", "FIRST_OBSERVATION",
    "FIRST_SCRIPT_OWNER", "NOT_CURRENT", "ORIGINAL_CHILD", "ORIGINAL_PACKET", "ORIGIN_COMMAND_OWNER",
    "OWNER_CHANGED", "PAUSE_IDENTITY", "PAUSE_REQUIRED", "PRELOAD_LOG", "PRELOAD_LOG_ORDER",
    "PRELOAD_LOG_REQUIRED", "REALM_CHILD_START", "REALM_CLAIM_CONSUMED", "REALM_COMMAND", "REALM_EVENTS",
    "REALM_OWNER", "REALM_REQUEST_BUDGET", "REALM_SCRIPT", "REALM_SESSION", "REALM_SOURCE", "REALM_SOURCE_HELD",
    "REALM_SUBSCRIPTION", "REALM_SUBSCRIPTION_CHANGED", "RELEASED", "RELEASE_CONSUMED", "SCRIPT_CONTEXT",
    "SCRIPT_ORDER", "SCRIPT_URL", "SOURCE_HELD", "STREAM_LOST", "SUBORDINATE_ATTACHMENT", "SUBSCRIPTION",
    "UNEXPECTED_EVENT", "UNEXPECTED_RESUME", "UNRESOLVED_ALLOCATION", "WORKER_SCRIPT_LOADED"
  ].map(code => `PCB209_RATLINE_BOOTSTRAP_${code}`),
  ...[
    "ABORTED", "ARM_CONSUMED", "CHILD_ATTACHMENT", "CHILD_IDENTITY", "COMMAND_BUDGET", "COMMAND_SESSION",
    "CONSOLE_CONTEXT", "CONTEXT", "CONTEXT_REQUIRED", "CONTINUATION_CONSUMED", "COPY_PARENT", "DEADLINE",
    "DEPENDENCY", "DUPLICATE_PAUSE", "EVENT_BUDGET", "EVENT_SESSION", "EVENT_STATE", "FAILED", "FRAME_URL",
    "NAVIGATION_CONSUMED", "NAVIGATION_REQUIRED", "NOT_ARMED", "NOT_CURRENT", "ORIGINAL_DEBUGGER",
    "ORIGINAL_PACKET", "ORIGIN_COMMAND_OWNER", "OWNER_CHANGED", "PAUSE_IDENTITY", "PAUSE_REQUIRED",
    "REALM_CHILD_START", "REALM_CLAIM_CONSUMED", "REALM_COMMAND", "REALM_EVENTS", "REALM_OWNER",
    "REALM_REQUEST_BUDGET", "REALM_SCRIPT", "REALM_SESSION", "REALM_SOURCE", "REALM_SOURCE_HELD",
    "REALM_SUBSCRIPTION", "REALM_SUBSCRIPTION_CHANGED", "RELEASED", "RELEASE_CONSUMED", "SCRIPT_CONTEXT",
    "SCRIPT_ORDER", "SCRIPT_URL", "SOURCE_HELD", "STREAM_LOST", "SUBSCRIPTION", "UNEXPECTED_EVENT",
    "UNEXPECTED_RESUME", "UNRESOLVED_ALLOCATION"
  ].map(code => `PCB209_RATLINE_PCB_BOOTSTRAP_${code}`),
  ...[
    "ABORTED", "CHILD_PROOF_CONSUMED", "CONTEXT_METHOD_CHANGED", "CONTINUATION_CONSUMED", "DEADLINE", "DEPENDENCY",
    "ENABLE_PHASE", "EVENT_OWNER", "FOREIGN_PAUSE", "NAVIGATION", "NAVIGATION_CONSUMED", "NAVIGATION_PAUSE_PHASE", "NAVIGATION_SCRIPT_EVENT", "NAVIGATION_SETTLED", "NAVIGATION_RESUMED", "ORIGINAL_UI_CONTEXT", "SCRIPT_EVIDENCE_BOUND", "NOT_CURRENT",
    "LOADER_PAUSE_PHASE", "LOADER_SCRIPT_EVENT", "LOADER_NAVIGATION_SETTLED", "LOADER_RESUMED",
    "ORIGINAL_CONTEXT", "ORIGINAL_CONTEXT_EVENT", "OWNER_CHANGED", "PARENT_CHANGED", "PARENT_SESSION",
    "PRE_NAVIGATION_CONTEXT", "PROOF_COMMAND_BUDGET", "PROOF_STAGE", "RELEASED", "SELECTED_CONTEXT_CHANGED",
    "SELECTED_FRAME", "SOURCE_CONTEXT", "SOURCE_CONTINUATION_PROOF", "SOURCE_CONTINUATION_REQUIRED", "SOURCE_HELD",
    "STREAM_LOST", "SUBSCRIPTION", "SUBSCRIPTION_CHANGED", "SUBSCRIPTION_CONSUMED", "UNEXPECTED_STOP"
  ].map(code => `PCB209_RATLINE_CONTEXT_${code}`),
  ...[
    "ACTOR_SEQUENCE", "ALLOCATION_REPLY", "ATTACHMENT", "ATTACH_REPLY", "BOOTSTRAP_ARM_SEQUENCE",
    "BOOTSTRAP_REQUIRED", "CHILD_START", "CHUNK", "CLEANUP", "CLEANUP_ACK", "CLEANUP_COMMAND",
    "CLEANUP_INTERRUPTED", "CLEANUP_PAUSE", "CONSTRUCTION_JOIN_BOUNDARY", "NAVIGATION_SEQUENCE", "LOADER_SEQUENCE", "DEPENDENCY", "DEPENDENCY_CHANGED", "DUPLICATE_PAUSE", "EVENT_BUDGET",
    "EVENT_SESSION", "FATAL", "FRAME", "FRAME_BUDGET", "HELD_CHILD_BOUNDARY", "NATIVE_ABORT_REQUIRED",
    "NOT_STARTED", "OPENING_SEQUENCE", "ORIGINAL_ALLOCATION", "ORIGINAL_COUNTER", "ORIGINAL_PARENT",
    "ORIGINAL_RESERVATION", "ORIGIN_STACK", "OWNER", "PARENT", "PARENT_EVENT", "PARENT_ROUTE", "PARENT_SESSION",
    "PAUSE_ALLOCATION", "PCB_OPENING_SEQUENCE", "PCB_SOURCE_SEQUENCE", "PENDING_CLASS", "POLL", "POLL_RESOURCE",
    "PREPARATION_STATE", "QUEUE_BUDGET", "RATLINE_ATTACHMENT", "RATLINE_SESSION", "RATLINE_STATE",
    "RATLINE_SUBSCRIBER", "RATLINE_SUBSCRIBER_CHANGED", "RELEASED", "RELEASE_STATE", "REMOTE", "REPLY", "REPLY_ID",
    "REPLY_ROLE", "REQUEST_BUDGET", "REQUEST_CLASS_BUDGET", "RESUME_SEQUENCE", "ROUTING_STATE", "SOURCE_SCRIPT",
    "SOURCE_SEQUENCE", "START_CLOSING", "START_CONSUMED", "SUBSCRIBER", "TERMINATED", "UNEXPECTED_RESUME",
    "WORKER_SESSION", "WORKER_SUBSCRIBER", "WRITE"
  ].map(code => `PCB209_RATLINE_STARTUP_CHANNEL_${code}`),
  ...[
    "ABORT_STATE", "ANCILLARY_CHANGED", "BEFORE_NAVIGATION", "CHILD_ATTACHMENT", "CHILD_CONSTRUCTION",
    "CHILD_EVENT_OWNER", "CHILD_SUBSCRIBER", "CHILD_SUBSCRIBER_CHANGED", "CLEANUP", "CONSUMED", "DUPLICATE_CHILD",
    "FAILED_CLEANUP", "NAVIGATION_CONSUMED", "NOT_CURRENT", "OPENING_REFUSED", "ORIGINAL_METHOD_CHANGED",
    "ORIGINAL_OWNERS", "ORIGINAL_OWNER_CHANGED", "ORIGINAL_PACKET", "ORIGINAL_REQUEST", "ORIGINAL_SQL_READER",
    "ORIGINAL_SQL_READER_CHANGED", "ORIGIN_OBSERVATION_REQUIRED", "ORIGIN_OWNERS", "PARENT_SUBSCRIBER",
    "PARENT_SUBSCRIBER_CHANGED", "PREFLIGHT", "RELEASE_STATE", "STREAM_LOST"
  ].map(code => `PCB209_RATLINE_NATIVE_SESSION_${code}`),
  ...[
    "CLEANUP_CLOSED", "CONTINUATION", "DISCOVERY_CLOSE", "DISCOVERY_PARSER_OWNS_EVENTS", "DISCOVERY_REQUEST",
    "EVENT_BOUND", "HELPER_CONTROL_BOUND", "HELPER_CONTROL_KIND", "HELPER_STDOUT_BOUND", "NORMAL_CLOSED", "NUMBER",
    "ORIGINAL", "PENDING_ID", "PIPE_BYTES", "POLL_BOUND", "REPLY_BOUND", "REPLY_KIND", "REQUEST_ID_OR_PHASE",
    "REQUEST_LIMIT", "SOURCE_PROFILE", "SOURCE_SLOT", "STARTUP_EVENT_BOUND"
  ].map(code => `PCB209_RATLINE_BUDGET_${code}`),
  ...[
    "ABORTED", "ABORT_STATE", "ATTACHMENT", "BREAKPOINT_RELOCATED", "BUDGET", "CHILD_ARGUMENTS", "CHILD_ORDER",
    "CHILD_OWNER", "CHILD_START_CONSUMED", "CHILD_START_FAILED", "CLEANUP", "CLEANUP_BUDGET", "CONSTRUCTOR_ARGUMENTS",
    "CONSTRUCTOR_OBSERVATIONS", "CONSUMED", "CONTINUATION_CONSUMED", "CONTINUATION_DEADLINE", "CONTINUATION_FAILED",
    "DEADLINE", "DUPLICATE_CHILD", "DUPLICATE_PAUSE", "EXISTING_CHILD", "EXTRA_PAUSE", "FAILED", "FAILED_OR_RELEASED",
    "INVENTORY_CHANGED", "INVENTORY_CHILD", "INVENTORY_DELTA", "INVENTORY_DUPLICATE", "INVENTORY_PARENT", "ORIGINAL_CHILD",
    "ORIGINAL_PACKET", "OWNER_CHANGED", "OWNER_LOST", "PARENT_NOT_HELD", "PAUSE_CAPTURE", "PAUSE_LOCATION", "PROFILE",
    "RELEASE_STATE", "REMOVE", "SUBORDINATE_URL", "SUBSCRIPTION", "TRANSPORT", "UNEXPECTED_RESUME",
    "UNRESOLVED_BREAKPOINTS",
  ].map(code => `PCB209_RATLINE_CREATION_${code}`),
  ...[
    "ABORT_STATE", "BREAKPOINT_RELOCATED", "BRIDGE", "BUDGET", "CANVAS_DOCUMENT", "CLEANUP_BUDGET", "CONSUMED", "DEADLINE",
    "DUPLICATE_PAUSE", "EVENT_CAPTURE", "EXTRA_PAUSE", "FACTORY_CALLER", "FAILED", "FAILED_OR_RELEASED", "FIXED_PROFILE",
    "IDENTITY_CHANGED", "IDENTITY_MISSING", "INCOMPLETE", "NONEMPTY_WORK", "ORIGINAL_PACKET", "OWNER_CHANGED", "OWNER_LOST",
    "PAUSE_DEADLINE", "PAUSE_LOCATION", "PAYLOAD", "RECEIVED_PAYLOAD", "RELEASE_STATE", "REMOVE", "SUBORDINATE_BRIDGE",
    "SUBORDINATE_ID", "SUBSCRIPTION", "TERMINAL_PAUSE_CHANGED", "TERMINAL_PAYLOAD_CHANGED", "TRANSPORT",
    "UNEXPECTED_RESUME", "UNRESOLVED_BREAKPOINTS", "WORKER_NAME", "WORKER_RETAINED",
  ].map(code => `PCB209_RATLINE_CAPTURE_${code}`),
  ...[
    "ABORTED", "ALLOCATION_REALM", "CAPTURE_ATTACHMENT", "CONSTRUCTION_COMPARISON_CONSUMED", "CREATION_SUBSCRIBER",
    "DEPENDENCY", "DUPLICATE_ALLOCATION", "DUPLICATE_PAUSE", "FAILED", "NOT_CURRENT", "ORIGINAL_OBJECTS", "OWNER_CHANGED",
    "PAUSE_BREAKPOINT", "PAUSE_REALM", "PAUSE_SUBSCRIPTION", "RELEASED", "RELEASE_STATE", "REMOVAL_OWNER",
    "REMOVED_BREAKPOINT", "RESUME_OWNER", "ROLE", "SOURCE_CONTINUATION_CONSUMED", "SOURCE_NOT_HELD", "STAGES_CHANGED",
    "STAGES_CONSUMED", "STAGE_FAILED", "STAGE_METHOD", "STAGE_OVERRIDE", "STAGE_PROTOTYPE", "STREAM_LOST", "SUBSCRIPTION",
    "SUBSCRIPTION_CHANGED", "SUBSCRIPTION_CONSUMED", "TERMINATED", "UNEXPECTED_RESUME", "UNKNOWN_BREAKPOINT",
  ].map(code => `PCB209_RATLINE_DISPATCH_${code}`),
  ...[
    "ABORTED", "ARM_CONSUMED", "BOOTSTRAP_METHOD", "BOOTSTRAP_OWNER", "CHILD_HELD", "DEPENDENCY", "DEPENDENCY_CHANGED",
    "FAILED", "NOT_CURRENT", "PARENT_SESSION", "REALM_COMMAND", "REALM_CONSUMED", "RELEASED", "ROLE", "STREAM_LOST",
  ].map(code => `PCB209_RATLINE_CHILD_GATE_${code}`),
  ...[
    "ABORTED", "ABORT_STATE", "CAPTURE_CONSUMED", "CAPTURE_MISSING", "CLEANUP", "CONSUMED", "DEADLINE", "DEPENDENCY",
    "FAILED", "NOT_CURRENT", "ORIGINAL_PACKET", "OWNER_CHANGED", "PROFILE", "RELEASE_STATE",
  ].map(code => `PCB209_RATLINE_COMPOSITE_${code}`),
  ...["CONSUMED", "DEADLINE", "DEPENDENCY", "ORIGINAL_OWNERS", "OWNER_CHANGED", "PARENT_BINDING"].map(code => `PCB209_RATLINE_ORIGIN_${code}`),
  ...["BRIDGE_FRAME", "CONSTRUCTION_FRAME", "JOIN_HANDLES", "JOIN_STATE", "JOIN_UNCONSUMED", "RELATION", "RELATION_HANDLES",
    "REPLY_SEQUENCE", "SELECTION", "SESSION"].map(code => `PCB209_RATLINE_HELD_CONSTRUCTION_${code}`),
  ...[
    "ACTOR_SEQUENCE", "ALLOCATION_REPLY", "ATTACHMENT", "ATTACH_REPLY", "BOOTSTRAP_ARM_SEQUENCE",
    "BOOTSTRAP_REQUIRED", "CHILD_START", "CHUNK", "CLEANUP", "CLEANUP_ACK", "CLEANUP_COMMAND",
    "CLEANUP_INTERRUPTED", "CLEANUP_PAUSE", "CONTINUATION_BOUNDARY", "DEPENDENCY", "DEPENDENCY_CHANGED",
    "DUPLICATE_PAUSE", "EVENT_BUDGET", "EVENT_SESSION", "FATAL", "FRAME", "FRAME_BUDGET", "LOADER_SEQUENCE",
    "NATIVE_ABORT_REQUIRED", "NAVIGATION_SEQUENCE", "NOT_STARTED", "OPENING_SEQUENCE", "ORIGINAL_ALLOCATION",
    "ORIGINAL_COUNTER", "ORIGINAL_PARENT", "ORIGINAL_RESERVATION", "ORIGIN_STACK", "OWNER", "PARENT",
    "PARENT_EVENT", "PARENT_ROUTE", "PARENT_SESSION", "PAUSE_ALLOCATION", "PCB_OPENING_SEQUENCE",
    "PCB_SOURCE_SEQUENCE", "PENDING_CLASS", "POLL", "POLL_RESOURCE", "PREPARATION_STATE", "PROJECT_IDENTITY_BOUNDARY",
    "PROJECT_IDENTITY_CONSUMED", "PROJECT_IDENTITY_PREPARATION", "PROJECT_IDENTITY_TUPLE", "QUEUE_BUDGET",
    "RATLINE_ATTACHMENT", "RATLINE_SESSION", "RATLINE_STATE", "RATLINE_SUBSCRIBER", "RATLINE_SUBSCRIBER_CHANGED",
    "RELEASED", "RELEASE_STATE", "REMOTE", "REPLY", "REPLY_ID", "REPLY_ROLE", "REQUEST_BUDGET",
    "REQUEST_CLASS_BUDGET", "RESUME_SEQUENCE", "ROUTING_STATE", "SOURCE_BOUNDARY", "SOURCE_SCRIPT",
    "SOURCE_SEQUENCE", "START_CLOSING", "START_CONSUMED", "SUBSCRIBER", "TERMINATED", "UNEXPECTED_RESUME",
    "WORKER_SESSION", "WORKER_SUBSCRIBER", "WRITE"
  ].map(code => `PCB209_RATLINE_CONTINUATION_CHANNEL_${code}`),
  ...[
    "CLEANUP_CLOSED", "CONTINUATION", "DISCOVERY_CLOSE", "DISCOVERY_PARSER_OWNS_EVENTS", "DISCOVERY_REQUEST",
    "EVENT_BOUND", "HELPER_CONTROL_BOUND", "HELPER_CONTROL_KIND", "HELPER_STDOUT_BOUND", "NORMAL_CLOSED", "NUMBER",
    "ORIGINAL", "PENDING_ID", "PIPE_BYTES", "POLL_BOUND", "REPLY_BOUND", "REPLY_KIND", "REQUEST_ID_OR_PHASE",
    "REQUEST_LIMIT", "SOURCE_PROFILE", "SOURCE_SLOT", "STARTUP_EVENT_BOUND"
  ].map(code => `PCB209_RATLINE_CONTINUATION_BUDGET_${code}`),
  ...[
    "ABORTED", "DEADLINE", "DEPENDENCY", "DEPENDENCY_CHANGED", "DEPTH", "DUPLICATE_REALM", "EVENT_BUDGET",
    "EVENT_OR_CALLBACK", "EVENT_SESSION", "LISTENER_CHANGED", "LISTENER_CONSUMED", "LISTENER_REQUIRED",
    "NOT_CURRENT", "ORIGINAL_ATTACHMENT", "ORIGINAL_PARENT", "ORIGINAL_REALM", "OWNER_CHANGED", "RELEASED",
    "RELEASE_STATE", "START", "START_CONSUMED", "START_INTERRUPTED", "STREAM_LOST", "SUBSCRIPTION",
    "SUBSCRIPTION_UNCERTAIN", "UNSUBSCRIBE_FAILED"
  ].map(code => `PCB209_RATLINE_CONTINUATION_ROUTER_${code}`),
  ...[
    "CHILD_ATTACHMENT", "CHILD_PARENT", "CHILD_SUBSCRIPTION", "CHILD_SUBSCRIPTION_CHANGED", "CLEANUP",
    "CLEANUP_COMMAND", "CONSUMED", "DEADLINE", "DEPENDENCY", "DEPENDENCY_CHANGED", "FAILED_CLEANUP",
    "FIRST_SCRIPT_OWNER", "NOT_CURRENT", "ORIGINAL_CONSTRUCTION", "ORIGINAL_CONTEXT", "ORIGINAL_PACKET",
    "ORIGIN_OWNER", "ORIGIN_REQUIRED", "PARENT_BACKLOG_BOUND", "PARENT_REQUIRED", "PARENT_SUBSCRIPTION",
    "PARENT_SUBSCRIPTION_CHANGED", "RELEASED", "RELEASE_STATE", "STREAM_LOST"
  ].map(code => `PCB209_RATLINE_CONTINUATION_${code}`),
  ...[
    "ANCILLARY_CHANGED", "BEFORE_NAVIGATION", "CONSUMED", "DEADLINE", "DEPENDENCY", "FAILED_CLEANUP",
    "NAVIGATION_CONSUMED", "NOT_CURRENT", "OPENING_REFUSED", "ORIGINAL_METHOD", "ORIGINAL_OWNER",
    "ORIGINAL_PACKET", "ORIGINAL_REQUEST", "ORIGINAL_SQL_READER", "PREFLIGHT", "RELEASED", "RELEASE_STATE", "SEMANTIC_TARGET", "WIRE"
  ].map(code => `PCB209_RATLINE_CONTINUATION_NATIVE_${code}`),
  ...[
    "CONSUMED", "DEADLINE", "NOT_CURRENT", "ORIGINAL_METHOD", "ORIGINAL_OWNER", "ORIGINAL_PACKET", "RELEASED",
    "RELEASE_STATE", "RESUME_OBSERVATION", "SUBSCRIPTION", "SUBSCRIPTION_UNCERTAIN", "TERMINATION_OWNER",
    "UNSUBSCRIBE_FAILED"
  ].map(code => `PCB209_RATLINE_SUBORDINATE_CONTINUATION_${code}`),
  ...["SEAL_CONSUMED", "SEAL_INCOMPLETE", "ORIGINAL_SOURCE_SEAL", "RETIREMENT_CONSUMED"].map(code => `PCB209_RATLINE_BOOTSTRAP_${code}`),
  ...["SEAL_CONSUMED", "SEAL_INCOMPLETE", "ORIGINAL_CAPTURE_SEAL"].map(code => `PCB209_RATLINE_COMPOSITE_${code}`),
  ...["WINDOW_PHASE", "WINDOW_SCRIPT_EVENT", "WINDOW_FRAME_REUSED", "WINDOW_FRAME_CHANGED", "WINDOW_CHANGED", "WINDOW_RESUMED", "WINDOW_SCRIPT_LIMIT"].map(code => `PCB209_RATLINE_CONTEXT_${code}`),
  ...["WINDOW_PHASE", "WINDOW_SEQUENCE", "WINDOW_SCRIPT_LIMIT"].flatMap(code => [
    `PCB209_RATLINE_STARTUP_CHANNEL_${code}`, `PCB209_RATLINE_CONTINUATION_CHANNEL_${code}`]),
  ...["REALM_RETIRED", "RETIREMENT_STATE"].map(code => `PCB209_RATLINE_CONTINUATION_CHANNEL_${code}`),
  ...["REALM_RETIRED", "RETIREMENT_STATE", "RETIRED_REALM_EVENT"].map(code => `PCB209_RATLINE_CONTINUATION_ROUTER_${code}`),
  ...["ABORTED", "BINDING_CONSUMED", "BOUNDARY_CONSUMED", "BOUNDARY_SEAL", "CAPTURE_OWNER_CHANGED", "CAPTURE_REQUIRED", "CHILD_REQUIRED",
    "CONTEXT_IDENTITY", "DEADLINE", "DETACH_IDENTITY", "EARLY_RETIREMENT", "FAILED", "FLOW_CHANGED", "INCOMPLETE", "OWNER", "OWNER_METHOD",
    "REGISTER_CONSUMED", "RESUME_ACKNOWLEDGMENT", "RESUME_STATE", "SEAL_CONSUMED", "SOURCE_OWNER_CHANGED"].map(code => `PCB209_RATLINE_HANDOFF_${code}`),
  "PCB209_RATLINE_CAPTURE_HANDOFF_TIMING", "PCB209_RATLINE_WINDOW_PAUSE",
  "PCB209_RATLINE_CONTINUATION_TIMING_BINDING",
  "PCB209_RATLINE_NATIVE_SESSION_OWNER_DEADLINE", "PCB209_RATLINE_TRANSPORT_WINDOW_CONSUMED", "PCB209_RATLINE_BOOTSTRAP_SOURCE",
  "PCB209_RATLINE_NAVIGATION_PAUSE", "PCB209_RATLINE_NAVIGATION_SOURCE",
  "PCB209_RATLINE_LOADER_PAUSE", "PCB209_RATLINE_LOADER_SOURCE",
  "PCB209_RATLINE_PCB_BOOTSTRAP_SOURCE", "PCB_DIAGNOSTIC_CONTEXT_IDENTITY", "PCB_DIAGNOSTIC_CONTEXT_INVALIDATED",
]);
export function currentPcb209RatlineFailureReason(error: unknown): string {
  if (error === null || typeof error !== "object" || types.isProxy(error)) { return "UNCLASSIFIED"; }
  // Zod's custom instanceof hook inspects _zod.traits. An exception object is
  // Not trusted to provide getters or methods; its own data name is only a
  // Bounded diagnostic category and grants no schema/admission authority.
  const nameDescriptor = Object.getOwnPropertyDescriptor(error, "name");
  const name: unknown = nameDescriptor !== undefined && Object.hasOwn(nameDescriptor, "value") ? nameDescriptor.value : null;
  if (name === "ZodError") { return "SCHEMA"; }
  const descriptor = Object.getOwnPropertyDescriptor(error, "message");
  const value: unknown = descriptor !== undefined && Object.hasOwn(descriptor, "value") ? descriptor.value : null;
  return typeof value === "string" && failureReasons.has(value) ? value : "UNCLASSIFIED";
}

const diagnosticStage = z.enum(["ready", "arming", "creation", "constructor-before", "constructor-after", "child-inventory", "held-constructor",
  "source-continuation", "capture-arming", "child-arming", "parent-continuation", "child-start", "capture", "comparison", "cleanup", "released"]);
const diagnosticStep = z.enum(["idle", "owner-reproof", "native-request", "breakpoint-allocation", "pause-wait", "pause-validation",
  "event-routing", "source-resume", "child-qualification", "cleanup", "settled"]);
const diagnosticCommand = z.enum(["Target.getTargets", "Debugger.setBreakpoint", "Debugger.removeBreakpoint", "Debugger.resume",
  "Runtime.runIfWaitingForDebugger", "Debugger.evaluateOnCallFrame", "Runtime.callFunctionOn"]);
const diagnosticEvent = z.enum(["paused", "resumed", "attached", "lost"]);
const diagnosticObservation = { stage: diagnosticStage, step: diagnosticStep, lastCommand: diagnosticCommand.nullable(), lastEvent: diagnosticEvent.nullable() };
export const currentPcb209RatlineStageDiagnosticsSchema = z.object({ ...diagnosticObservation,
  firstFailure: z.object({ ...diagnosticObservation, reason: z.enum([...failureReasons, "SCHEMA", "UNCLASSIFIED"]) }).strict().nullable() }).strict();
const count = z.number().int().nonnegative();
const captureScope = z.enum(["full", "pcb-held-prefix"]);
const creationDiagnostics = currentPcb209RatlineStageDiagnosticsSchema.extend({
  consumed: z.boolean(), settled: z.boolean(), failed: z.boolean(), released: z.boolean(),
  parentContinued: z.boolean(), childStartRequested: z.boolean(), parentPaused: z.boolean(),
  retainedChildren: count.max(4), commands: count.max(32), uncertainBreakpoints: count.max(2), unresolvedBreakpoints: z.boolean(),
});
const captureDiagnostics = currentPcb209RatlineStageDiagnosticsSchema.extend({
  role: z.enum(["pcb", "worker"]), scope: captureScope, consumed: z.boolean(), settled: z.boolean(), failed: z.boolean(), released: z.boolean(),
  events: count.max(9), commands: count.max(128), paused: z.boolean(), unresolvedBreakpoints: z.boolean(),
});
const dispatcherDiagnostics = currentPcb209RatlineStageDiagnosticsSchema.extend({
  role: z.enum(["pcb", "worker"]), scope: captureScope, failed: z.boolean(), released: z.boolean(), uncertainBreakpoints: count.max(11), retainedBreakpoints: count.max(11),
  sourceContinuationConsumed: z.boolean(), sourceResumePending: z.boolean(), paused: z.boolean(), deferredPause: z.boolean(),
});
export const currentPcb209RatlineCompositeDiagnosticsSchema = currentPcb209RatlineStageDiagnosticsSchema.extend({
  scope: captureScope, consumed: z.boolean(), settled: z.boolean(), failed: z.boolean(), released: z.boolean(),
  sourceReleaseConsumed: z.boolean(), childInstrumentationConsumed: z.boolean(),
  creation: creationDiagnostics, capture: captureDiagnostics, dispatcher: dispatcherDiagnostics,
});
/** Data-only state of an internal owner. Only closed enums and classified reasons
 * can enter snapshots; cleanup preserves the first original failure unchanged. */
export class CurrentPcb209RatlineStageDiagnostics {
  public stage: z.infer<typeof diagnosticStage> = "ready";
  public step: z.infer<typeof diagnosticStep> = "idle";
  public lastCommand: z.infer<typeof diagnosticCommand> | null = null;
  public lastEvent: z.infer<typeof diagnosticEvent> | null = null;
  #failure: Readonly<NonNullable<z.infer<typeof currentPcb209RatlineStageDiagnosticsSchema>["firstFailure"]>> | null = null;
  public record(error: unknown): void {
    this.#failure ??= Object.freeze({ reason: currentPcb209RatlineFailureReason(error), stage: this.stage, step: this.step,
      lastCommand: this.lastCommand, lastEvent: this.lastEvent });
  }
  public snapshot(): Readonly<z.infer<typeof currentPcb209RatlineStageDiagnosticsSchema>> {
    return Object.freeze({ stage: this.stage, step: this.step, lastCommand: this.lastCommand, lastEvent: this.lastEvent, firstFailure: this.#failure });
  }
}
