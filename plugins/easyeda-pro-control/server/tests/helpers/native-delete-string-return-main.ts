/** Standalone inert Inspector fixture: Node's test-runner Promise async-hook
 * symbols must not be confused with an application's uninstrumented Promise. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Worker } from "node:worker_threads";
import { CURRENT_PCB_209_WORKER_STARTUP_SOURCE as SOURCE } from "../../src/current-pcb-209-worker-startup-profile.ts";
import { qualifyCurrentFootprintInverseClockWorkerSource as qualify } from "../../src/current-footprint-inverse-clock-worker-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_CALLEES as CALLEES } from "../../src/current-footprint-inverse-delete-binding-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CLOCK_PROGRAMS as PROGRAMS } from "../../src/current-footprint-inverse-native-delete-clock-programs.ts";

async function run(): Promise<void> {
  const assetsRoot = process.env["EASYEDA_ASSETS_ROOT"]; assert.ok(assetsRoot !== undefined);
  const source = await readFile(join(assetsRoot, SOURCE.relativePath), "utf8"); qualify(source);
  const qe = CALLEES.find(row => row.key === "deleteString"); assert.ok(qe !== undefined);
  const intro = String.raw`var xt=()=>{},$e=()=>{},Ke=class{footprint={head(){return "head"},delete(){return "atom"}}},qe=async()=>123,Ie="|\n";`;
  let inert = source.replaceAll(/[^\r\n]/gu, " ");
  inert = `${intro + inert.slice(intro.length, qe.start - 8)  }class C{${  source.slice(qe.start, qe.end)  }}${  inert.slice(qe.end + 1)}`;

  const worker = new Worker(new URL("native-delete-string-return-worker.ts", import.meta.url), { workerData: { source: inert, program: PROGRAMS.retainReturn } });
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
