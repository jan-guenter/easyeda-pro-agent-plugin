/** Maintained native owner and real child-pipe callbacks with a synthetic peer.
 * Only the source-qualification input is replaced. No Windows or app launch. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintMainNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";

void test("original owner retains a bounded main attach refusal before construction runner allocation", async context => {
  const path = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const compiled = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const token = Object.freeze({ syntheticSourceOnly: true });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${compiled.code}\n})`); assert.equal(typeof evaluate, "function");
  assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-pcb-209-actor-clock-source.ts" ? {
    requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, token); },
  } : actualRequire(name) as unknown, loaded, loaded.exports]);
  const Owner = loaded.exports["CurrentFootprintMainNativeOwner"];
  assert.equal(typeof Owner, "function"); assert.ok(typeof Owner === "function");
  const child = spawn(process.execPath, ["-e", `
const readline=require('node:readline');const lines=readline.createInterface({input:process.stdin});
lines.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='launch')result={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
else if(q.action==='main-attach'){process.stdout.write(JSON.stringify({id:q.id,ok:false,error:'pcb-diagnostic-main-tcp-owner'})+'\\n');return;}
else if(q.action==='main-terminate'){process.stdout.write(JSON.stringify({id:q.id,ok:false,error:'pcb-diagnostic-main-terminate-refused'})+'\\n');return;}
else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
else if(q.action==='release')result={released:true};else throw Error('unexpected synthetic action');
process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');});
`], { stdio: ["pipe", "pipe", "pipe"] });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The evaluated maintained constructor receives the real child and the explicitly replaced inert source-qualification token.
  const owner = Reflect.construct(Owner, [child, (): Promise<void> => Promise.resolve(), token]) as CurrentFootprintMainNativeOwner;
  owner.start();
  context.after(async () => { if (!owner.status().helperClosed) { const closed = once(child, "close"); child.stdin.end(); await closed; } });
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  await assert.rejects(owner.observeFootprintMainConstruction(), /NATIVE_REFUSAL/u);
  assert.equal(owner.retainedFootprintMainConstruction(), null);
  assert.deepEqual(owner.status().mainNativeFailure, { action: "main-attach", code: "pcb-diagnostic-main-tcp-owner" });
  assert.equal(Object.isFrozen(owner.status().mainNativeFailure), true);
  await assert.rejects(owner.observeFootprintMainConstruction(), /OBSERVATION_CONSUMED/u);
  await assert.rejects(owner.terminateFootprintMain(true), /NATIVE_REFUSAL/u);
  assert.deepEqual(owner.status().mainNativeFailure, { action: "main-attach", code: "pcb-diagnostic-main-tcp-owner" });
  assert.equal(await owner.observeTermination(), true); await owner.releaseClosed();
  assert.equal(child.exitCode, 0); assert.equal(child.signalCode, null);
});
