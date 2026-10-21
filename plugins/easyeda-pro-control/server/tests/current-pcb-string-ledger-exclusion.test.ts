/** Synthetic control-root reservations only. Never reads the live journal. */
import assert from "node:assert/strict";
import { mkdir, rename, symlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_PCB_STRING_LEDGER_DIRECTORY, assertNoUnresolvedCurrentPcbStringLedgers,
  readCurrentPcbStringLedgerReservations } from "../src/current-pcb-string-ledger-exclusion.ts";

void test("global admission rejects partial and falsely completed String ledgers without a journal-selected bypass", async () => {
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  const parent = join(controlDataDirectory(), CURRENT_PCB_STRING_LEDGER_DIRECTORY);
  await mkdir(parent, { mode: 0o700 });
  await assertNoUnresolvedCurrentPcbStringLedgers();
  const slot = join(parent, "string-ledger-partial"); await mkdir(slot, { mode: 0o700 });
  assert.deepEqual(await readCurrentPcbStringLedgerReservations(), ["string-ledger-partial"]);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /unresolved String lifecycle/u);
  await writeFile(join(slot, "complete.json"), JSON.stringify({ completeLifecycleVerified: true, released: true }), { mode: 0o600 });
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /unresolved String lifecycle/u);
  await writeFile(join(parent, "string-ledger-file"), "{}", { mode: 0o600 });
  await assert.rejects(readCurrentPcbStringLedgerReservations(), /unknown reservation/u);
  await rename(parent, `${parent}-retained-test`);
  await symlink(`${parent}-retained-test`, parent, "dir");
  await assert.rejects(readCurrentPcbStringLedgerReservations(), /symbolic|directory|ELOOP|ENOTDIR/u);
});
