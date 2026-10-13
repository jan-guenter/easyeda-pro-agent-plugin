import assert from "node:assert/strict";
import fsPromises from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { basename } from "node:path";
import { test } from "node:test";
import { fixture } from "./closed-symbol-coordinator-fixture.ts";
import { INPUT } from "./windows-closed-session-fixture.ts";
import { isRecord } from "../../src/core.ts";

for (const drift of ["caller", "lifecycle-epoch"] as const) {
  void test(`full coordinator refuses ${drift} change during its last 44-event journal read`, async (context) => {
    const f = await fixture(context), open = fsPromises.open;
    let changed = false;
    context.mock.method(fsPromises, "open", async (...args: Parameters<typeof open>): ReturnType<typeof open> => {
      const handle = await open(...args);
      const retained = f.stage.retained();
      if (!changed && retained["lastSuccessfulStage"] === "verify-sql-compare" && basename(String(args[0])) === `${String(retained["operationId"])}.json`) {
        changed = true;
        if (drift === "caller") { f.plan["targetUuid"] = "e".repeat(32); }
        else { await f.owner.supervisor.capture({ ...INPUT, bindingSha256: "8".repeat(64), challengeAttempt: 4 }); }
      }
      return handle;
    }); syncBuiltinESMExports();
    try {
      await assert.rejects(f.stage.recordFullEvidence(f.plan));
      assert.equal(changed, true);
      const retained = f.stage.retained();
      assert.equal(retained["completionProved"], false);
      assert.equal(retained["lastSuccessfulStage"], "verify-sql-compare");
      assert.ok(isRecord(retained["verification"]));
      assert.ok(retained["verification"]["savedRead"] !== undefined);
      assert.ok(retained["verification"]["comparison"] !== undefined);
      assert.ok(retained["verification"]["copy"] !== undefined);
      assert.equal(f.events.filter((event) => event === "launch").length, 3);
      assert.equal(f.events.filter((event) => event === "normal-close").length, 3);
      assert.equal(f.state.writes, 1);
    } finally { context.mock.restoreAll(); syncBuiltinESMExports(); }
  });
}
