import assert from "node:assert/strict";
import { test } from "node:test";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION_SHA256 } from "../src/current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } from "../src/current-pcb-209-startup-opening-program.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_TIMING as opening, CURRENT_PCB_209_STARTUP_TIMING as pauses } from "../src/current-pcb-209-worker-startup-timing.ts";
import { CURRENT_PCB_209_EMPTY_NATIVE_PROFILE } from "../src/current-pcb-209-empty-native-profile.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "../src/current-pcb-209-ratline-budget.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE } from "../src/current-pcb-209-ratline-continuation-budget.ts";

void test("209 opening counts the complete finite await graph once, including final owner proofs", () => {
  assert.deepEqual(opening, {
    attachmentAndPauseWaitMs: 255_000, workerSetupMs: 20_000, sourceCaptureMs: 136_000,
    constructionCaptureMs: 236_000, captureCompletionMs: 4000, captureMs: 651_000,
    ordinaryOpeningMs: 45_000, openingReplyGraceMs: 25_000, nativeMs: 696_000,
    hostMs: 721_000, openingCompletionMs: 84_000,
  });
  // These watchdogs start at events, so their carry allowances overlap the
  // Preceding resume. They are not nine-plus-seven sequential parent timers.
  const sourceWindows = pauses.bootstrapPauseMs + 5 * pauses.sourcePauseMs + pauses.projectPauseMs;
  assert.equal(sourceWindows - opening.sourceCaptureMs, 14_000);
  assert.equal(pauses.constructionPauseMs.reduce((sum, value) => sum + value, 0) - opening.constructionCaptureMs, 16_000);
  assert.equal(pauses.requestMs, 2000); assert.equal(pauses.legacyPauseMs, 5000);
});

void test("only the fixed209 startup literal receives the allowance and the original launch ceilings stay unchanged", () => {
  assert.equal(CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION_SHA256, "186b6756f5a8b261ef225ac54202c4b9a9a8ccf65e9f30da537886779111d044");
  assert.equal(CURRENT_PCB_209_STARTUP_OPENING_FUNCTION.replace('phase==="preflight"?10000:696000', 'phase==="preflight"?10000:45000')
    .replace('stage="dispatch";substage="native-open-project";', 'stage="dispatch";'),
    CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION);
  for (const profile of [CURRENT_PCB_209_EMPTY_NATIVE_PROFILE, CURRENT_PCB_209_RATLINE_NATIVE_PROFILE,
    CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE]) {
    assert.equal(profile.elapsed.normalMilliseconds, 3_600_000);
    assert.equal(profile.elapsed.cleanupMilliseconds, 60_000);
    assert.equal(profile.elapsed.anchor, "original-monotonic-launch");
    assert.ok(opening.hostMs + opening.openingCompletionMs < profile.elapsed.normalMilliseconds);
  }
});
