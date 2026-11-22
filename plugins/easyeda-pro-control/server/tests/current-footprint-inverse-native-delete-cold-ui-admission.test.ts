import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import {
  assertNoUnresolvedCurrentFootprintInverseNativeDeleteColdUis,
  isOriginalCurrentFootprintInverseNativeDeleteColdUiDiagnosticOperation,
} from "../src/current-footprint-inverse-native-delete-cold-ui-generation.ts";
import { operationPath } from "../src/artifacts.ts";
import { CurrentFootprintInverseNativeDeleteColdUiJournal } from "../src/current-footprint-inverse-native-delete-cold-ui-journal.ts";

void test("unscoped admission cannot exclude a structurally valid cold UI birth", async () => {
  const operationId = `footprint-inverse-cold-ui-${"a".repeat(32)}`;
  const journal = new CurrentFootprintInverseNativeDeleteColdUiJournal({
    operationId,
    parentOperationId: "footprint-inverse-owned-fixture",
    sourceSha256: "b".repeat(64),
    documentUuid: "c".repeat(16),
    readonlyContinuation: true,
    saveRequests: 0,
  });

  await journal.reserve();
  await journal.append("checkpoint-intent", {});
  await journal.append("checkpoint-result", { originalCompleted: true });
  await journal.append("birth-intent", {});
  await journal.assertStage("birth-intent");

  assert.equal(await isOriginalCurrentFootprintInverseNativeDeleteColdUiDiagnosticOperation(operationId), false);
  await assert.rejects(assertNoUnresolvedCurrentFootprintInverseNativeDeleteColdUis(), /UNRESOLVED_OTHER_COLD_UI/u);
  await journal.beginOriginalCleanup("birth");
  journal.recordOriginalCleanupClosure(true, false);
  await journal.settleOriginalCleanupPublication();
  await assertNoUnresolvedCurrentFootprintInverseNativeDeleteColdUis();

  const path = join(dirname(operationPath(operationId)), operationId, "00-operation-intent.json");
  await writeFile(path, "changed cold UI phase artifact");
  await assert.rejects(assertNoUnresolvedCurrentFootprintInverseNativeDeleteColdUis());
});
