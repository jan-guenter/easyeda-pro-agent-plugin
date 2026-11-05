import { z } from "zod";
import { shutdownBeforeLeaseRelease } from "./shutdown.ts";
import { currentFootprintForwardSourceRelinquishmentRequestSchema } from "./current-footprint-forward-source-relinquishment-contract.ts";

const historicalSourceMetadataInputSchema = z.object({ request: z.object({
  action: z.literal("footprint-forward-source-relinquishment"), request: currentFootprintForwardSourceRelinquishmentRequestSchema,
}).strict() }).strict();

export const sessionRetirementRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("inspect") }).strict(),
  z.object({ action: z.literal("retire"), confirmRetire: z.literal(true) }).strict(),
  z.object({ action: z.literal("close-retired"), confirmCloseRetired: z.literal(true) }).strict(),
]);

export const sessionRetirementOutputSchema = z.object({
  schema: z.literal("easyeda-pro-control.session-retirement.v1"),
  state: z.enum(["active", "checking", "retiring", "retired", "retirement-failed"]),
  activeCalls: z.number().int().nonnegative(),
  liveAdmissionOpen: z.boolean(),
  leaseReleaseAcknowledged: z.boolean(),
  replacementConnectionRequired: z.boolean(),
}).strict();

/** Scheduling closes this connection only. Delivery and observed process exit
 * remain independent facts that this reply cannot establish. */
export const sessionRetiredCloseOutputSchema = z.object({
  schema: z.literal("easyeda-pro-control.session-close-scheduled.v1"),
  retirementState: z.literal("retired"), leaseReleaseAcknowledged: z.literal(true), closeScheduled: z.literal(true),
  deliveryAcknowledged: z.literal(false), processExitProved: z.literal(false), retryAllowed: z.literal(false),
}).strict();

/** Expose the mounted local retirement grammar without acquiring authority. */
export function querySessionRetirement(includeSchemas = false): Record<string, unknown> {
  return { tool: "easyeda_control_session", actions: ["inspect", "retire", "close-retired"],
    executionAuthorized: false, nativeCleanupRequired: true, automaticLeaseRetry: false,
    ...(includeSchemas ? { requestSchema: z.toJSONSchema(sessionRetirementRequestSchema),
      resultSchema: z.toJSONSchema(sessionRetirementOutputSchema), closeResultSchema: z.toJSONSchema(sessionRetiredCloseOutputSchema) } : {}) };
}

/** Validate exact local arguments; matching arguments do not authorize retirement. */
export function validateSessionRetirementArguments(input: unknown): Record<string, unknown> {
  const parsed = sessionRetirementRequestSchema.safeParse(input);
  return parsed.success ? { valid: true, request: parsed.data, executionAuthorized: false } : {
    valid: false, executionAuthorized: false,
    issues: parsed.error.issues.slice(0, 16).map(issue => ({ path: issue.path.join("."), message: issue.message.slice(0, 512) })),
  };
}

interface RetirementDependencies {
  readonly assertQuiescent: () => Promise<void>;
  readonly closeLiveAdmission: () => void;
  readonly authority: { readonly close: () => Promise<void> };
  readonly lease: { readonly release: () => Promise<void> };
  /** The index defers its existing guarded normal shutdown to a later event-loop turn. */
  readonly scheduleRetiredClose?: () => void;
}

/** Counts callback admission before any await, including work waiting inside a
 * second serialization gate. Retirement never closes native proof owners. */
export class FacadeSessionRetirement {
  private state: z.infer<typeof sessionRetirementOutputSchema>["state"] = "active";
  private activeCalls = 0;
  #sourceReferenceOnly = true;
  #unusedSourceMetadataOnly = true;
  #retiredCloseAttempted = false;
  private readonly dependencies: RetirementDependencies;

  /** Retain facade-owned cleanup callbacks; public requests supply no owners. */
  public constructor(dependencies: RetirementDependencies) { this.dependencies = dependencies; }

  /** Local state only. Release acknowledgement does not infer lock presence after failure. */
  public inspect(): z.infer<typeof sessionRetirementOutputSchema> {
    return { schema: "easyeda-pro-control.session-retirement.v1", state: this.state,
      activeCalls: this.activeCalls, liveAdmissionOpen: this.state === "active",
      leaseReleaseAcknowledged: this.state === "retired", replacementConnectionRequired: this.state === "retired" };
  }

  /** Retain a monotonic local history, never a caller assertion about past use. */
  public isSourceReferenceOnly(): boolean { return this.#sourceReferenceOnly; }

  /** This history grants no native or journal authority. Retirement additionally
   * requires the original completed metadata coordinator's allocation proof. */
  public isUnusedSourceMetadataOnly(): boolean { return this.#unusedSourceMetadataOnly && this.activeCalls === 0; }

  /** Admit and count a callback before another gate. Only the fixed SDK wrapper
   * supplies the already-validated reference classification; no request schema
   * exposes it, and a later reference call cannot undo prior non-reference use. */
  public async run<Result>(name: string, task: () => Result | Promise<Result>, sourceReferenceApi = false, validatedInput?: unknown): Promise<Result> {
    // This local state endpoint cannot dispatch work. After final retirement,
    // The API callback separately selects only synchronous reference queries.
    if (this.#retiredCloseAttempted) { throw new Error("This retired EasyEDA facade has consumed its connection-close request; no further metadata work or retry is admitted."); }
    if (name === "easyeda_control_session") { return task(); }
    const retiredApi = name === "easyeda_control_api" && (this.state === "retired" || this.state === "retirement-failed");
    if (this.state !== "active" && !retiredApi) { throw new Error("This EasyEDA facade has closed live admission for retirement. Use a fresh connection after acknowledged retirement."); }
    if (name !== "easyeda_control_api" || !sourceReferenceApi) { this.#sourceReferenceOnly = false; }
    if (!(name === "easyeda_control_api" && sourceReferenceApi) &&
        !(name === "easyeda_control_pcb209_worker_startup" && historicalSourceMetadataInputSchema.safeParse(validatedInput).success)) {
      this.#unusedSourceMetadataOnly = false;
    }
    this.activeCalls += 1;
    try { return await task(); }
    finally { this.activeCalls -= 1; }
  }

  /** Consume one explicit close only after irreversible retirement and zero
   * callbacks. Scheduling failure stays consumed; neither return nor timeout
   * proves reply delivery, transport closure or process termination. */
  public closeRetired(): z.infer<typeof sessionRetiredCloseOutputSchema> {
    if (this.state !== "retired" || this.activeCalls !== 0) {
      throw new Error("Closing this connection requires acknowledged retirement and every metadata callback to finish first.");
    }
    if (this.#retiredCloseAttempted) { throw new Error("This retired EasyEDA connection-close request is already consumed; do not retry it."); }
    const schedule = this.dependencies.scheduleRetiredClose;
    if (schedule === undefined) { throw new Error("This EasyEDA facade has no supported retired connection-close callback."); }
    this.#retiredCloseAttempted = true;
    schedule();
    return { schema: "easyeda-pro-control.session-close-scheduled.v1", retirementState: "retired", leaseReleaseAcknowledged: true,
      closeScheduled: true, deliveryAcknowledged: false, processExitProved: false, retryAllowed: false };
  }

  /** Reserve quiescence, then permanently close live authority before lease release. */
  public async retire(): Promise<z.infer<typeof sessionRetirementOutputSchema>> {
    if (this.state !== "active") { throw new Error("This EasyEDA retirement attempt is already reserved or consumed. Inspect its retained state; do not repeat it."); }
    if (this.activeCalls !== 0) { throw new Error("EasyEDA retirement requires every admitted tool call, including queued work, to finish first."); }
    // Reserve synchronously. New calls cannot enter while journals are read.
    this.state = "checking";
    try { await this.dependencies.assertQuiescent(); }
    catch (error) {
      // No authority cleanup has begun. Existing owners still need their
      // Original tools to finish ordinary cleanup or resolve quarantine.
      this.state = "active";
      throw error;
    }
    this.state = "retiring";
    let leaseReleaseAttempted = false;
    try {
      this.dependencies.closeLiveAdmission();
      await shutdownBeforeLeaseRelease([this.dependencies.authority], {
        release: async (): Promise<void> => {
          leaseReleaseAttempted = true;
          await this.dependencies.lease.release();
        },
      });
      this.state = "retired";
      return this.inspect();
    } catch (error) {
      // Cleanup uncertainty consumes the attempt and keeps live admission
      // Closed. shutdownBeforeLeaseRelease never releases after close failure.
      this.state = "retirement-failed";
      if (leaseReleaseAttempted) {
        throw new Error("EasyEDA retirement closed its authority but lease release was not acknowledged; the lock state is uncertain. Inspect the original connection and do not retry or start a replacement.", { cause: error });
      }
      throw error;
    }
  }
}
