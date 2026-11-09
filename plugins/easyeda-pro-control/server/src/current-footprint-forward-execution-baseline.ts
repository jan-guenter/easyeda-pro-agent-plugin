/** Separate managed evidence for a v2 owner's complete closed SQL baseline.
 * These sidecars leave historical opening journals unchanged and grant no
 * current-head/frontier, create, Save or saved-copy authority. */
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, publishManagedAttachmentExclusive, verifyExactManagedArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { sha256Json, sha256Text } from "./core.ts";
import { currentFootprintForwardExecutionOpeningIdSchema } from "./current-footprint-forward-execution-opening-contract.ts";

const digest = z.string().regex(/^[a-f\d]{64}$(?![\s\S])/u);
const bindingKeys = ["operationId", "sourceInputSha256", "openingRecordsSha256", "normalCloseResultSha256", "terminationResultSha256", "beforeCheckpointSha256", "beforeSqlSha256"] as const;
const binding = {
  operationId: currentFootprintForwardExecutionOpeningIdSchema,
  sourceInputSha256: digest, openingRecordsSha256: digest,
  normalCloseResultSha256: digest, terminationResultSha256: digest,
  beforeCheckpointSha256: digest, beforeSqlSha256: digest,
};
export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_BASELINE_BUDGET = Object.freeze({
  profile: "private.current-footprint-forward-execution-baseline-budget.v1",
  records: 3, recordBytes: 65_536, bytes: 3 * 65_536,
  completeClosedSnapshotAttempts: 1, nativeCreateAttempts: 0, explicitSaveAttempts: 0,
});
export const currentFootprintForwardExecutionBaselineIntentSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-execution-baseline-intent.v1"),
  ...binding, originalNormalCloseAcknowledged: z.literal(true), originalRootExited: z.literal(true), originalJobEmpty: z.literal(true),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export const currentFootprintForwardExecutionBaselineResultSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-execution-closed-baseline.v1"),
  ...binding, baselineIntentSha256: digest, closedCheckpointSha256: digest, closedSqlSha256: digest,
  exactLogicalSqlUnchanged: z.literal(true), originalCompletedReadersRetained: z.literal(true),
  originalNormalCloseAcknowledged: z.literal(true), originalRootExited: z.literal(true), originalJobEmpty: z.literal(true),
  helperReleaseProved: z.literal(false), savedCopyVerified: z.literal(false),
  currentHeadVerified: z.literal(false), continuousProducerExclusionVerified: z.literal(false),
  executionReady: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export type CurrentFootprintForwardExecutionBaselineIntent = Readonly<z.infer<typeof currentFootprintForwardExecutionBaselineIntentSchema>>;
export type CurrentFootprintForwardExecutionBaselineResult = Readonly<z.infer<typeof currentFootprintForwardExecutionBaselineResultSchema>>;
const failureSchema = z.object({
  schema: z.literal("easyeda-pro-control.footprint-forward-execution-baseline-failure.v1"),
  ...binding, originalErrorRetained: z.literal(true), code: z.literal("ORIGINAL_BASELINE_FAILED"),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
type RecordKind = "intent" | "result" | "failure";
/** Bounded publication only. The original provider separately retains native
 * and reader custody; these matching JSON files cannot recreate either. */
export class CurrentFootprintForwardExecutionBaselineJournal {
  readonly #intent: CurrentFootprintForwardExecutionBaselineIntent;
  readonly #attempts = new Map<RecordKind, Promise<void>>();
  readonly #descriptors = new Map<RecordKind, Readonly<ArtifactDescriptor>>();
  public constructor(intent: CurrentFootprintForwardExecutionBaselineIntent) {
    this.#intent = Object.freeze(currentFootprintForwardExecutionBaselineIntentSchema.parse(intent)); Object.freeze(this);
  }
  async #publish(kind: RecordKind, value: unknown): Promise<void> {
    if (this.#attempts.has(kind)) { throw new Error("FORWARD_EXECUTION_BASELINE_PUBLICATION_CONSUMED"); }
    let selected;
    if (kind === "intent") { selected = currentFootprintForwardExecutionBaselineIntentSchema.parse(value); }
    else if (kind === "result") { selected = currentFootprintForwardExecutionBaselineResultSchema.parse(value); }
    else { selected = failureSchema.parse(value); }
    for (const key of bindingKeys) {
      if (selected[key] !== this.#intent[key]) { throw new Error("FORWARD_EXECUTION_BASELINE_PUBLICATION_BINDING"); }
    }
    if (kind === "result" && (!this.#descriptors.has("intent") || this.#attempts.has("failure"))) { throw new Error("FORWARD_EXECUTION_BASELINE_PUBLICATION_ORDER"); }
    if (kind === "result" && (!Object.hasOwn(selected, "baselineIntentSha256") ||
        Reflect.get(selected, "baselineIntentSha256") !== sha256Json(this.#intent) ||
        Reflect.get(selected, "closedSqlSha256") !== this.#intent.beforeSqlSha256)) { throw new Error("FORWARD_EXECUTION_BASELINE_RESULT_BINDING"); }
    const bytes = Buffer.from(`${JSON.stringify(selected)}\n`);
    if (bytes.length > CURRENT_FOOTPRINT_FORWARD_EXECUTION_BASELINE_BUDGET.recordBytes) { throw new Error("FORWARD_EXECUTION_BASELINE_PUBLICATION_BOUND"); }
    const path = join(controlDataDirectory(), "footprint-forward-execution-baselines", selected.operationId, `${kind}.json`);
    const descriptor = Object.freeze({ path, bytes: bytes.length, sha256: sha256Text(bytes.toString("utf8")) });
    // Reserve the original promise before calling a publisher that can throw
    // Synchronously. Rejection never permits another write of this record.
    const pending = this.#write(kind, bytes, selected.schema, descriptor);
    this.#attempts.set(kind, pending); await pending;
  }
  async #write(kind: RecordKind, bytes: Buffer, schema: string, descriptor: Readonly<ArtifactDescriptor>): Promise<void> {
    await Promise.resolve();
    await publishManagedAttachmentExclusive(descriptor.path, "Forward execution closed baseline", bytes, schema);
    await verifyExactManagedArtifact(descriptor); this.#descriptors.set(kind, descriptor);
  }
  public async publishIntent(): Promise<void> { await this.#publish("intent", this.#intent); }
  public async publishResult(result: CurrentFootprintForwardExecutionBaselineResult): Promise<void> { await this.#publish("result", result); }
  public async publishFailure(): Promise<void> {
    const selected = this.#intent;
    await this.#publish("failure", { schema: "easyeda-pro-control.footprint-forward-execution-baseline-failure.v1",
      operationId: selected.operationId, sourceInputSha256: selected.sourceInputSha256, openingRecordsSha256: selected.openingRecordsSha256,
      normalCloseResultSha256: selected.normalCloseResultSha256, terminationResultSha256: selected.terminationResultSha256,
      beforeCheckpointSha256: selected.beforeCheckpointSha256, beforeSqlSha256: selected.beforeSqlSha256,
      originalErrorRetained: true, code: "ORIGINAL_BASELINE_FAILED", executionAuthorized: false, saveAuthorized: false });
  }
  /** Rehash only original successful publications. Failed writes stay failed;
   * reading a file cannot turn a lost publication into a successful attempt. */
  public async assertCurrent(): Promise<void> {
    for (const descriptor of this.#descriptors.values()) { await verifyExactManagedArtifact(descriptor); }
  }
}
