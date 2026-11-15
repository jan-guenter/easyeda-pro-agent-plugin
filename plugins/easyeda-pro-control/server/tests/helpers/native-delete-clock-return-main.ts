/** Standalone inert Inspector fixture: Node's test-runner Promise async-hook
 * symbols must not be confused with an application's uninstrumented Promise. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE as SOURCE } from "../../src/current-pcb-209-worker-startup-profile.ts";
import { CURRENT_FOOTPRINT_INVERSE_CLOCK_WORKER_CALLEES as CALLEES, qualifyCurrentFootprintInverseClockWorkerSource as qualify } from "../../src/current-footprint-inverse-clock-worker-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROGRAMS as PROGRAMS } from "../../src/current-footprint-inverse-native-delete-clock-programs.ts";

async function run(): Promise<void> {
  const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"]; assert.ok(assetsRoot !== undefined);
  const source = await readFile(join(assetsRoot, SOURCE.relativePath), "utf8"); qualify(source);
  const qe = CALLEES.find(row => row.key === "qe"); assert.ok(qe !== undefined);
  const intro = 'var wa=()=>({rpcCall(){return globalThis.__nativeClockInner=Promise.resolve(123456789)}}),oo=()=>({_TAB_ID_:"native_clock_fixture"});';
  let inert = source.replaceAll(/[^\r\n]/gu, " ");
  inert = intro + inert.slice(intro.length, qe.start) + source.slice(qe.start, qe.end) + inert.slice(qe.end);
  const worker = new Worker(new URL("native-delete-clock-return-worker.ts", import.meta.url), { workerData: { source: inert, program: PROGRAMS.retainReturn } });
  const messages: unknown[] = []; worker.on("message", message => { messages.push(message); });
  // oxlint-disable-next-line promise/avoid-new -- This Promise joins the original fixture worker's exact exit event.
  const code = await new Promise<number>((resolve, reject) => { worker.once("error", reject); worker.once("exit", resolve); });
  assert.equal(code, 0); assert.equal(messages.length, 1); process.stdout.write(JSON.stringify(messages[0]));
}
try {
  // oxlint-disable-next-line node/no-top-level-await -- This standalone fixture joins its original Worker and reports one bounded data packet.
  await run();
} catch (caughtError) {
  process.stderr.write(caughtError instanceof Error ? caughtError.message : "native clock fixture failed"); process.exitCode = 1;
}
