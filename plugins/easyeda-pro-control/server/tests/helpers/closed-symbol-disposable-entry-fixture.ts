/** Test-only fixed I/O composition. No production provider or original-token replacement. */
/* oxlint-disable import/max-dependencies -- Compose the actual owners, request, claim and coordinator rather than substitute authority callbacks. */
import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { ClosedSymbolDisposableEntry } from "../../src/closed-symbol-disposable-entry.ts";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";
import { SerializedGate } from "../../src/engine.ts";
import { isRecord, loadReviewedCompatibilityManifest, sha256Json } from "../../src/core.ts";
import { readExactUtf8Artifact } from "../../src/artifacts.ts";
import { VALIDATION_ACTION_ID } from "../../src/closed-symbol-target-claim.ts";
import type { ClosedSymbolTargetClaim } from "../../src/closed-symbol-target-claim.ts";
import type { ClosedSymbolValidationRequest } from "../../src/closed-symbol-validation-request.ts";
import { agedCoordinatorFixture } from "./closed-symbol-aged-coordinator-fixture.ts";
import { HISTORY_TABLE, IDS, OPERATION, mutate } from "./symbol-sql-fixture.ts";
import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";

type HandlerFixture = Awaited<ReturnType<typeof agedCoordinatorFixture>> & {
  entry: ClosedSymbolDisposableEntry; gate: SerializedGate; request: ClosedSymbolValidationRequest;
  localReads: string[]; launches: () => number;
};
export async function handlerFixture(context: TestContext, kind: "locked" | "aged" = "locked"): Promise<HandlerFixture> {
  const reviewedExecutionScopeSha256 = loadReviewedCompatibilityManifest().facadeImplementation["source-tree"].sha256;
  const f = await agedCoordinatorFixture(context, false, reviewedExecutionScopeSha256);
  assert.equal(f.stage.constructor, ClosedSymbolCoordinator, "The fixture and entry must share one maintained coordinator registry");
  if (kind === "locked") { mutate(f.source, `UPDATE "${HISTORY_TABLE}" SET is_lock=1,created_at='2020-01-01 00:00:00' WHERE uuid='${IDS.oldHead}'`); }
  const launcher = structuredClone(loadReviewedCompatibilityManifest().upstream.launcher);
  const localReads: string[] = [];
  context.mock.method(f.upstream, "launcherFingerprint", () => { localReads.push("launcherFingerprint"); return Promise.resolve(launcher); });
  const gate = new SerializedGate();
  const request: ClosedSymbolValidationRequest = { action: "run-disposable-once", target: { projectPath: f.source,
    projectUuid: IDS.project, branchUuid: IDS.branch, ownerUuid: IDS.actor, symbolUuid: IDS.target, companionPcbUuid: IDS.peer },
    metadata: { ...OPERATION.patch }, confirmDisposableMetadataEdit: true };
  const entry = new ClosedSymbolDisposableEntry(f.engine, f.upstream, f.runtime, f.ui, gate);
  const previousFrame = f.owner.state.onFrame;
  let launches = 0;
  f.owner.state.onFrame = (action): void => {
    if (action === "clocked-launch" || action === "launch") {
      launches += 1;
      const retained = entry.retained();
      const claim = retained["claim"], coordinator = retained["coordinator"], plan = retained["plan"];
      assert.ok(isRecord(plan) && isRecord(plan["marker"]) && isRecord(plan["operation"]) && isRecord(claim));
      assert.equal(retained["claimState"], "acknowledged"); assert.equal(claim["closedPlanSha256"], sha256Json(plan));
      assert.equal(plan["operation"]["id"], VALIDATION_ACTION_ID); assert.deepEqual(plan["operation"]["patch"], request.metadata);
      assert.ok(coordinator instanceof ClosedSymbolCoordinator);
      // Only the existing synthetic reply generator's data alias changes. It now
      // Reads the real entry-owned coordinator, never a replacement stage/token.
      Object.defineProperty(f, "stage", { value: coordinator, writable: true, configurable: true, enumerable: true });
      Object.assign(f.browser.input, { marker: { ...plan["marker"] } });
    }
    previousFrame?.(action);
  };
  context.after(async (): Promise<void> => {
    const coordinator = entry.retained()["coordinator"];
    if (coordinator instanceof ClosedSymbolCoordinator) {
      const operationId = coordinator.retained()["operationId"];
      if (typeof operationId === "string") { await retireSyntheticJournal(operationId); }
    }
  });
  return { ...f, entry, gate, request, localReads, launches: (): number => launches };
}

/** Read evidence only; this does not issue or restore claim/runtime authority. */
export async function originalClaim(entry: ClosedSymbolDisposableEntry): Promise<ClosedSymbolTargetClaim> {
  const value = entry.retained()["claim"];
  assert.ok(isRecord(value) && value["profile"] === "easyeda-pro-control.closed-symbol-validation-claim.v1" && isRecord(value["artifact"]));
  const artifact = value["artifact"];
  assert.equal(typeof artifact["path"], "string"); assert.equal(typeof artifact["bytes"], "number"); assert.equal(typeof artifact["sha256"], "string");
  const raw = await readExactUtf8Artifact({ path: String(artifact["path"]), bytes: Number(artifact["bytes"]), sha256: String(artifact["sha256"]) });
  const body: unknown = JSON.parse(raw.text); assert.ok(isRecord(body));
  assert.equal(body["closedPlanSha256"], value["closedPlanSha256"]); assert.equal(body["requestSha256"], value["requestSha256"]);
  assert.equal(body["markerSha256"], value["markerSha256"]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This is the retained original data receipt, never a revived issuer; exact raw artifact bindings are checked above.
  return value as unknown as ClosedSymbolTargetClaim;
}
