/** Real byte-pipe/Promise identity. All peer replies are inert, so neither this
 * test nor a copied target can issue actual native owner or source authority. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { PassThrough } from "node:stream";
import { test } from "node:test";
import { setImmediate as afterImmediate } from "node:timers/promises";
import { CurrentSchematicRelevanceSavedReadbackPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";
import type { CurrentPcbViaSavedLoadWorkerPair } from "../src/current-pcb-via-saved-load-controller.ts";

void test("original saved schematic project Promise stays retained while its own actual worker pipe lane settles", async context => {
  const rawWindowsPath = String.raw`C:\Synthetic\CodexEasyedaFixture_11111111111111111111111111111111\Codex_schematic_relevance_2222222222222222.eprj2`;
  const projectUuid = createHash("sha256").update(rawWindowsPath).digest("hex");
  const target = { rawWindowsPath, projectUuid, branchUuid: "b".repeat(32), pageUuid: "c".repeat(32), schematicUuid: "d".repeat(32), expectedSourceSha256: "e".repeat(64) };
  const input = new PassThrough(), output = new PassThrough(), pipe = new CurrentSchematicRelevanceSavedReadbackPipe(input, output);
  context.after(() => { input.destroy(); output.destroy(); }); let openingId: number | null = null; const frames: Record<string, unknown>[] = [];
  const reply = (id: unknown, sessionId?: unknown): void => { input.write(`${JSON.stringify({ id, result: {}, ...(sessionId === undefined ? {} : { sessionId }) })}\0`); };
  output.on("data", (chunk: Buffer) => {
    const raw: unknown = JSON.parse(chunk.subarray(0, -1).toString("utf8")); assert.ok(raw !== null && typeof raw === "object" && "id" in raw && "method" in raw); frames.push(raw);
    if (raw.method === "Target.attachToTarget") { input.write(`${JSON.stringify({ id: raw.id, result: { sessionId: "ui_session" } })}\0`); return; }
    if ("schematicSavedOpening" in raw && raw.schematicSavedOpening === "open-project") {
      assert.ok(typeof raw.id === "number"); openingId = raw.id;
      const targetInfo = { targetId: "original_worker", type: "worker", attached: true, title: "original title", url: "original source URL" };
      setImmediate(() => { for (const [sessionId, child] of [[undefined, "browser_worker"], ["ui_session", "page_worker"]] as const) {
        input.write(`${JSON.stringify({ method: "Target.attachedToTarget", params: { sessionId: child, targetInfo, waitingForDebugger: true }, ...(sessionId === undefined ? {} : { sessionId }) })}\0`);
      } }); return;
    }
    if ("schematicSavedRegistration" in raw) {
      const data = { schema: "easyeda-pro-control.generated-fixture-path-registration.v1", projectUuid, rawWindowsPath, beforeRegistrySha256: "1".repeat(64), afterRegistrySha256: "1".repeat(64), beforeCount: 1, afterCount: 1,
        registrationDispatched: false, priorRegistrationPresent: true, exactOtherRegistrationRosterUnchanged: true, selectedRawPathMatched: true, selectedNonCbbMatched: true, recentPathRowMayHaveChanged: false,
        projectNavigationDispatched: false, cadEditDispatched: false, explicitSaveDispatched: false, persistentRegistrationVerified: false, replayAllowed: false, writerAuthority: false };
      input.write(`${JSON.stringify({ id: raw.id, result: { result: { type: "string", value: JSON.stringify(data) } }, ...("sessionId" in raw ? { sessionId: raw.sessionId } : {}) })}\0`); return;
    }
    reply(raw.id, "sessionId" in raw ? raw.sessionId : undefined);
  }); pipe.start(); pipe.retainSchematicSavedEarlyActors(() => "project"); for (const stage of ["before", "arm", "after"] as const) { await pipe.observeSchematicSavedEarlyActors(stage); }
  await pipe.attachTarget("original_ui", () => { throw new Error("UNEXPECTED_UI_EVENT"); }); await pipe.armSchematicSavedCacheParent();
  const generic = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath, projectUuid, branchUuid: target.branchUuid, documentUuid: target.pageUuid, expectedSourceSha256: target.expectedSourceSha256 });
  await pipe.observeSchematicSavedPreflight("ui_context", generic); pipe.enrollSchematicSavedBackup(); await pipe.observeSchematicSavedGuard("ui_context", generic, "loading");
  const events: unknown[] = []; pipe.retainSchematicSavedColdEvents(event => { pipe.requireOriginalSchematicSavedOpeningPending(); events.push(event); }); const retained: { promise: Promise<unknown> | null } = { promise: null };
  const registration = pipe.registerSchematicSavedProject("ui_context", target, pending => { retained.promise = pending; pipe.requireOriginalSchematicSavedRegistrationPending(pending); });
  assert.ok(retained.promise !== null); const originalPending = retained.promise; const registered = await registration; assert.equal(await originalPending, registered); assert.throws(() => { pipe.requireOriginalSchematicSavedRegistrationPending(originalPending); }); pipe.requireOriginalSchematicSavedRegistrationNoDispatch(originalPending, target); assert.throws(() => { pipe.requireOriginalSchematicSavedRegistrationNoDispatch(registration, target); }); assert.throws(() => { pipe.requireOriginalSchematicSavedRegistrationNoDispatch(originalPending, { ...target, pageUuid: "f".repeat(32) }); });
  pipe.bindSchematicSavedOpening(); await pipe.observeSchematicSavedOpening("ui_context", target, "preflight", "original_window");
  const opened = pipe.observeSchematicSavedOpening("ui_context", target, "open-project", "original_window"); await afterImmediate(); assert.ok(openingId !== null); assert.equal(events.length, 2); pipe.requireOriginalSchematicSavedOpeningPending();
  const pair: CurrentPcbViaSavedLoadWorkerPair = Object.freeze({ targetId: "original_worker", browserSessionId: "browser_worker", pageSessionId: "page_worker", title: "original title", url: "original source URL" });
  pipe.bindSchematicSavedColdWorker(pair); const command = { phase: "saved-load-runtime", method: "Runtime.enable", params: {} } as const;
  await pipe.observeSchematicSavedCold(command); pipe.requireOriginalSchematicSavedOpeningPending();
  const last = frames.at(-1); assert.equal(last?.["sessionId"], "page_worker"); assert.equal(last?.["schematicSavedCold"], true);
  assert.throws(() => { void pipe.observeSchematicSavedCold(command); }); assert.throws(() => { void pipe.observeSavedReadbackLoadWorker(command); });
  reply(openingId, "ui_session"); await opened; assert.throws(() => { pipe.requireOriginalSchematicSavedOpeningPending(); });
});
