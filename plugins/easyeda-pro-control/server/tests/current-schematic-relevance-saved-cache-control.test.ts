/** Original finite byte-pipe transitions with inert replies; this test cannot
 * issue the separate Core/native durable-backup enrollment. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import { CurrentSchematicRelevanceSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { requireOriginalCurrentSchematicRelevanceSavedCacheAbsence, requireOriginalCurrentSchematicRelevanceSavedLoadingPreparation } from "../src/current-schematic-relevance-saved-cache-control.ts";
import { currentSchematicRelevanceSavedGuardFrame, currentSchematicRelevanceSavedGuardWire } from "../src/current-schematic-relevance-saved-cache-wire.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SAVED_READBACK_PROFILE as PROFILE } from "../src/current-schematic-relevance-saved-readback-profile.ts";

const rawWindowsPath = String.raw`C:\Synthetic\Codex_schematic_relevance_1111111111111111.eprj2`;
const projectUuid = createHash("sha256").update(rawWindowsPath).digest("hex");
const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath, projectUuid, branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) });
void test("actual schematic byte pipe keeps each deletion behind its own once-only guard after enrollment", async context => {
  const input = new PassThrough(), output = new PassThrough(), pipe = new CurrentSchematicRelevanceSavedReadbackPipe(input, output);
  context.after(() => { input.destroy(); output.destroy(); }); const frames: Record<string, unknown>[] = [];
  output.on("data", (chunk: Buffer) => {
    const request: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8")); assert.ok(request !== null && typeof request === "object" && "id" in request && "method" in request);
    frames.push(request); const result = request.method === "Target.attachToTarget" ? { sessionId: "original_session" } : {};
    input.write(`${JSON.stringify({ id: request.id, result, ...("sessionId" in request ? { sessionId: request.sessionId } : {}) })}\0`);
  }); pipe.start(); pipe.retainSchematicSavedEarlyActors(() => "held"); for (const stage of ["before", "arm", "after"] as const) { await pipe.observeSchematicSavedEarlyActors(stage); }
  await pipe.attachTarget("original_target", () => { throw new Error("UNEXPECTED_WORKER_EVENT"); }); await pipe.armSchematicSavedCacheParent(); await pipe.observeSchematicSavedPreflight("original_context", target);
  const plan = Object.freeze({ command: Object.freeze({ phase: "saved-cache-delete" as const, ordinal: 0 as const }), method: "CacheStorage.deleteCache" as const, params: Object.freeze({ cacheId: "original_cache" }) });
  assert.throws(() => { void pipe.observeSchematicSavedCache(plan); }, /SCHEMATIC_SAVED_CACHE_ORIGINAL/u); const before = frames.length;
  pipe.enrollSchematicSavedBackup(); assert.throws(() => { pipe.enrollSchematicSavedBackup(); });
  assert.throws(() => { void pipe.observeSchematicSavedCache(plan); }, /SCHEMATIC_SAVED_CACHE_ORIGINAL/u); assert.equal(frames.length, before);
  await pipe.observeSchematicSavedGuard("original_context", target, "before-delete-0"); await pipe.observeSchematicSavedCache(plan);
  assert.throws(() => { void pipe.observeSchematicSavedGuard("original_context", target, "before-delete-0"); });
  const final = frames.at(-1); assert.equal(final?.["method"], "CacheStorage.deleteCache");
  assert.equal(PROFILE.renderer.activeCache, 145); assert.equal(PROFILE.renderer.deleteGuards, 2 * (9 + 1)); assert.equal(PROFILE.renderer.activeInvalidation, 165); assert.equal(PROFILE.renderer.activeLoading, 175);
});
void test("late guards encode only the original fixed preflight and their distinct finite stage", () => {
  for (const stage of ["before-delete-0", "before-delete-1", "loading"] as const) {
    const wire = currentSchematicRelevanceSavedGuardWire(146, "original_session", "original_context", target, stage); const chunk = Buffer.from(`${JSON.stringify(wire)}\0`);
    const fields = currentSchematicRelevanceSavedGuardFrame(chunk, "original_session", "original_context", target, stage);
    assert.equal(fields["cacheGuardStage"], stage); assert.equal(fields["targetDocumentUuid"], target.documentUuid);
    assert.throws(() => currentSchematicRelevanceSavedGuardFrame(chunk, "foreign_session", "original_context", target, stage));
    assert.throws(() => currentSchematicRelevanceSavedGuardFrame(chunk, "original_session", "other_context", target, stage));
  }
});
void test("absence and loading-looking JSON cannot provide an original reader, checkpoint or getter", () => {
  let effects = 0; const foreign = Object.freeze({ get profile(): string { effects += 1; return "copied"; } });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately foreign runtime inputs must refuse before any getter can run.
  const args = [foreign, foreign, foreign] as unknown as Parameters<typeof requireOriginalCurrentSchematicRelevanceSavedCacheAbsence>;
  assert.throws(() => requireOriginalCurrentSchematicRelevanceSavedCacheAbsence(...args));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The separate loading brand cannot be supplied by copied data either.
  const loading = args as unknown as Parameters<typeof requireOriginalCurrentSchematicRelevanceSavedLoadingPreparation>;
  assert.throws(() => requireOriginalCurrentSchematicRelevanceSavedLoadingPreparation(...loading)); assert.equal(effects, 0);
});
