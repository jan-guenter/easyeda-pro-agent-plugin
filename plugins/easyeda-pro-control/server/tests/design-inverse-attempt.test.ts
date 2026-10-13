import assert from "node:assert/strict";
import { test } from "node:test";
import { hasDesignInverseAttempt } from "../src/design-inverse-attempt.ts";

void test("inverse intent and legacy attempt evidence survive visible state and runtime changes", () => {
  const states = ["applied-unsaved", "runtime-rebound-needs-reconciliation", "target-opened-needs-reconciliation"];
  const phases = ["design-inverse-intent", "flat-inverse-prepared", "inverse", "inverse-upload-barrier", "inverse-verified"];
  for (const state of states) {
    assert.equal(hasDesignInverseAttempt({ state, artifacts: [] }), false);
    assert.equal(hasDesignInverseAttempt({ state, inverseAttempted: true, artifacts: [] }), true);
    assert.equal(hasDesignInverseAttempt({ state, orphanedCallPhase: "inverse", artifacts: [] }), true);
    for (const phase of phases) {
      assert.equal(hasDesignInverseAttempt({ state, artifacts: [{ path: `/synthetic/11-${phase}.json`, bytes: 1, sha256: "a".repeat(64) }] }), true);
    }
  }
  for (const state of ["inverse-dispatching", "inverse-needs-recovery", "rolled-back"]) {
    assert.equal(hasDesignInverseAttempt({ state, artifacts: [] }), true);
  }
  assert.throws(() => hasDesignInverseAttempt({ state: "applied-unsaved", artifacts: [], inverseAttempted: false }), /malformed/u);
  assert.equal(hasDesignInverseAttempt({ state: "applied-unsaved", artifacts: [
    { path: "/synthetic/11-flat-inverse-verification.json", bytes: 1, sha256: "a".repeat(64) },
  ] }), false, "A rejected durability preflight does not consume an undispatched inverse.");
});
