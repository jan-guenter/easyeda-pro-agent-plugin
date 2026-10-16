/** One original successful verifier may derive one inverse; no caller patch,
 * new opening reservation, old clock reuse or failed-write inversion is allowed.
 */
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { CurrentAgedSqlReferenceStage } from "./current-aged-sql-reference.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { prepareCurrentSymbolInverseBaselineCopy } from "./current-symbol-baseline-copy.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { CurrentSymbolBaselineCoordinator } from "./current-symbol-baseline-runtime.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { assertCurrentSymbolInverseBaselineOwner, currentSymbolInverseOwnershipTransferred, prepareCurrentSymbolInverseOwner } from "./current-symbol-inverse-owner.ts";
import type { CurrentSymbolInverseBaselineOwner } from "./current-symbol-inverse-owner.ts";
// oxlint-disable-next-line import/no-cycle -- Forward/inverse lifecycle composition consumes lexical original-owner registries; replacing them with callback registration would allow fabricated authority.
import { assertCurrentSymbolVerificationResult } from "./current-symbol-verification-runtime.ts";
import type { CurrentSymbolVerificationResult } from "./current-symbol-verification-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

type Value = Readonly<Record<string, unknown>>;
export class CurrentSymbolInverseCoordinator {
  private readonly engine: EasyedaControlEngine;
  private predecessor?: CurrentSymbolVerificationResult;
  private owner?: CurrentSymbolInverseBaselineOwner;
  private baseline?: CurrentSymbolBaselineCoordinator;
  private prepared = false;
  private failed = false;
  private busy = false;
  public constructor(engine: EasyedaControlEngine) { this.engine = engine; }
  public async prepare(result: CurrentSymbolVerificationResult): Promise<Value> {
    if (this.predecessor !== undefined || this.busy) { throw new Error("Inverse preparation was already consumed."); }
    assertCurrentSymbolVerificationResult(result, this.engine); this.predecessor = result; this.busy = true;
    try {
      const owner = await prepareCurrentSymbolInverseOwner(this.engine, result); this.owner = owner;
      const original = assertCurrentSymbolInverseBaselineOwner(owner, this.engine);
      const copy = await prepareCurrentSymbolInverseBaselineCopy(this.engine, owner);
      const reference = await new CurrentAgedSqlReferenceStage(this.engine).runOnce({ baseline: copy, proof: original.result.originalSnapshot.proof });
      // The original verifier still owns retirement until this exact adoption.
      const baseline = new CurrentSymbolBaselineCoordinator(this.engine, original.source.runtime, original.result.writer.sqlRuntime);
      this.baseline = baseline;
      await baseline.adoptInverse(owner, copy, reference); this.prepared = true;
      return await this.inspect(owner.operationId);
    } catch (error) { this.failed = true; throw error; }
    finally { this.busy = false; }
  }
  private retained(operationId: string, requirePrepared = true): CurrentSymbolBaselineCoordinator {
    if (this.owner?.operationId !== operationId || this.baseline === undefined || this.busy ||
      !currentSymbolInverseOwnershipTransferred(this.owner, this.engine) || (requirePrepared && !this.prepared)) {
      throw new Error("Inverse lifecycle requires its original transferred baseline.");
    }
    return this.baseline;
  }
  public async inspect(operationId?: string): Promise<Value> {
    if (operationId !== undefined && operationId !== this.owner?.operationId) { throw new Error("Inverse inspection operation differs."); }
    const transferred = this.owner !== undefined && currentSymbolInverseOwnershipTransferred(this.owner, this.engine);
    let status: Value = {};
    if (this.baseline !== undefined && this.owner !== undefined) {
      try { status = await this.baseline.inspect(this.owner.operationId); }
      catch {
        status = { childInspectionAvailable: false, childInspectionDiagnostic: "original-child-inspection-unavailable" };
      }
    }
    return Object.freeze({ ...status, profile: "private.current-symbol-inverse-lifecycle.v1", operationId: this.owner?.operationId ?? null,
      predecessorOperationId: this.predecessor?.operationId ?? null, prepared: this.prepared, failed: this.failed,
      cleanupOwner: transferred ? "inverse-baseline" : "predecessor-verifier", originalOwnerRetained: this.predecessor !== undefined,
      initialMetadataDerivedInternally: true, historicalDatabaseBytesRestored: false, executionAuthorized: false });
  }
  public relaunch(operationId: string): Promise<Value> { return this.retained(operationId).relaunch(operationId); }
  public admit(operationId: string): Promise<Value> { return this.retained(operationId).admit(operationId); }
  public observeCaches(operationId: string): Promise<Value> { return this.retained(operationId).observeCaches(operationId); }
  public openProject(operationId: string): Promise<Value> { return this.retained(operationId).openProject(operationId, true); }
  public observeAgedClock(operationId: string): Promise<Value> { return this.retained(operationId).observeAgedClock(operationId); }
  public getProjectOnlyGeneration(operationId: string): ReturnType<CurrentSymbolBaselineCoordinator["getProjectOnlyGeneration"]> {
    return this.retained(operationId).getProjectOnlyGeneration(operationId);
  }
  public getAgedClock(operationId: string): ReturnType<CurrentSymbolBaselineCoordinator["getAgedClock"]> {
    return this.retained(operationId).getAgedClock(operationId);
  }
  public finishNormalClose(operationId: string): Promise<Value> { return this.retained(operationId, false).finishNormalClose(operationId); }
  public observeFinish(operationId: string): Promise<Value> { return this.retained(operationId, false).observeFinish(operationId); }
}
