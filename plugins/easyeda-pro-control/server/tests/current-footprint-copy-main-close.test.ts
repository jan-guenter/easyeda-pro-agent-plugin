/** Actual main runner and native-owner callback join over inert child pipes.
 * Only source qualification and the helper's Windows operations are synthetic.
 * No application, inspector socket, process handle or native Job is allocated. */
/* oxlint-disable import/max-dependencies -- This integration exercises the actual runner/owner with independently retained child pipes and fixed source-only substitutions. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCombinedNativeOwner, CurrentFootprintHeadAgeValidationOwner, CurrentFootprintMainNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { mainBackendModule } from "./helpers/footprint-main-backend-runner-fixture.ts";
import { unarmedMainCompletionOriginFixture } from "./helpers/footprint-main-completion-origin-fixture.ts";

type Owner = CurrentFootprintCombinedNativeOwner | CurrentFootprintHeadAgeValidationOwner | CurrentFootprintMainNativeOwner;
const readyPreload = fileURLToPath(new URL("helpers/current-footprint-combined-helper-ready.ts", import.meta.url));
const peerFixture = new URL("helpers/footprint-main-backend-runner-fixture.ts", import.meta.url).href;

async function ownerConstructor(combined: boolean, headAge: boolean): Promise<Readonly<{ Constructor: new (...args: unknown[]) => Owner; source: object; seed: (owner: Owner) => void }>> {
  const path = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const completion = Object.freeze({ observedChildClose: true, exitCode: 0, exitSignal: null }), sqlHead = Object.freeze({ syntheticSqlHead: true });
  // External SQL/factory provenance is synthetic. The production owner itself
  // Still mints and reproves its genuine private bootstrap capability below.
  const sourceCode = `${await readFile(path, "utf8")}\nexport function seedSyntheticHeadAgeClose(owner){
 const binding=Object.freeze({operationId:"footprint-head-age-synthetic-close",target:Object.freeze({}),originalTarget:Object.freeze({}),
  prepared:Object.freeze({checkpoint:Object.freeze({checkpointSha256:"a".repeat(64)})}),inventory:Object.freeze({checkpointSha256:"a".repeat(64)}),runtime:Object.freeze({})});
 const allocation={binding,text:headAgeValidationBindingText(binding),completion:readerCompletion(binding.inventory),head:syntheticSqlHead,owner,status:"retained"};
 headAgeValidationAllocations.set(binding,allocation);headAgeValidationFactories.set(owner,Object.freeze({allocation,options:Object.freeze({syntheticOnly:true}),installation:{facadeSha256:"b".repeat(64)}}));
}\n`;
  const compiled = await transform(sourceCode, { loader: "ts", format: "cjs", target: "node24", logLevel: "silent" });
  const originalOwner: unknown = actualRequire("./current-pcb-diagnostic-owner.ts"); assert.ok(originalOwner !== null && typeof originalOwner === "object");
  const runner = await mainBackendModule(headAge ? { "./current-pcb-diagnostic-owner.ts": { ...originalOwner,
    requireCurrentFootprintHeadAgeBootstrapCapability(capability: unknown, transport: unknown): void {
      const requireOriginal = loaded.exports["requireCurrentFootprintHeadAgeBootstrapCapability"]; assert.equal(typeof requireOriginal, "function");
      if (typeof requireOriginal !== "function") { throw new TypeError("Missing original capability issuer."); }
      Reflect.apply(requireOriginal, undefined, [capability, transport]);
    } } } : {}), source = Object.freeze({ syntheticOriginalSource: true });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports,syntheticSqlHead){${compiled.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(name: string): unknown => {
    if (name === "./current-footprint-copy-main-backend-runner.ts") { return { CurrentFootprintCopyMainBackendRunner: runner.Constructor }; }
    if (name === "./current-pcb-209-actor-clock-source.ts") {
      return { requireCurrentPcb209ActorClockSourceQualification: (value: unknown): void => { assert.equal(value, source); } };
    }
    if (headAge && name === "./sqlite-inventory.ts") { return { readerCompletion: (): object => completion }; }
    if (headAge && name === "./current-footprint-head-age-sql.ts") { return { requireCurrentFootprintHeadAgeSqlHead: (actual: unknown): void => { assert.equal(actual, sqlHead); } }; }
    return actualRequire(name) as unknown;
  }, loaded, loaded.exports, sqlHead]);
  const name = headAge ? "CurrentFootprintHeadAgeValidationOwner" : "CurrentFootprintMainNativeOwner";
  const Constructor = loaded.exports[combined ? "CurrentFootprintCombinedNativeOwner" : name];
  assert.ok(typeof Constructor === "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The evaluated maintained export is checked above; construction below supplies the exact native-owner arguments.
  return { Constructor: Constructor as new (...args: unknown[]) => Owner, source, seed(owner): void {
    if (headAge) { const seed = loaded.exports["seedSyntheticHeadAgeClose"]; assert.ok(typeof seed === "function"); Reflect.apply(seed, undefined, [owner]); }
  } };
}

async function fixture(combined: boolean, failure: "none" | "source" | "release" | "detach", headAge = false): Promise<Readonly<{
  owner: Owner; actions: string[]; dispose: () => Promise<void>;
}>> {
  const { Constructor, seed, source } = await ownerConstructor(combined, headAge);
  const script = `
import { createInterface } from 'node:readline';
import { mainBackendTransportFixture } from ${JSON.stringify(peerFixture)};
const f=mainBackendTransportFixture(${String(headAge)});const failure=${JSON.stringify(failure)};
f.state.wrongSource=failure==='source';if(failure==='release')f.state.sendFailure='release';
const input=createInterface({input:process.stdin});
input.on('line',async line=>{const q=JSON.parse(line);let result;
try{
 if(q.action==='launch')result={helperInstance:'b'.repeat(32),jobId:'c'.repeat(32),rootPid:123,rootCreated:'123456789012345'};
 else if(q.action==='main-attach')result={attached:true};
 else if(q.action==='main-reprove')result={current:true};
 else if(q.action==='main-send'){await f.transport.send({phase:q.phase,method:q.method,params:{objectId:q.objectId}},q.requestId);result={written:true};}
 else if(q.action==='main-poll')result={bytes:await f.transport.poll(q.cleanup)};
 else if(q.action==='main-close-detach'){if(failure==='detach')throw Error('synthetic detach refused');result={inspectorDetached:true};}
 else if(q.action==='normal-close')result={closeDispatched:true,saveOrDiscardSelected:false};
 else if(q.action==='termination')result={terminated:true,originalRootExited:true,originalJobEmpty:true};
 else if(q.action==='release')result={released:true};
 else throw Error('unexpected synthetic action');
 process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
}catch{process.stdout.write(JSON.stringify({id:q.id,ok:false,error:'pcb-diagnostic-main-synthetic-refusal'})+'\\n');}
});`;
  const child = spawn(process.execPath, [...(combined ? ["--import", readyPreload] : []), "--input-type=module", "-e", script],
    { stdio: ["pipe", "pipe", "pipe"] });
  const actions: string[] = [], write = child.stdin.write.bind(child.stdin);
  const record = (chunk: unknown): void => {
    if (typeof chunk === "string") {
      const raw: unknown = JSON.parse(chunk); assert.ok(raw !== null && typeof raw === "object" && "action" in raw);
      actions.push(String(raw["action"]) + ("phase" in raw ? `:${String(raw["phase"])}` : ""));
    }
  };
  // Writable's overloads are preserved through its original method; only the
  // First scalar argument is observed by this inert test peer.
  child.stdin.write = (chunk: unknown, ...rest: unknown[]): boolean => {
    record(chunk); const result: unknown = Reflect.apply(write, undefined, [chunk, ...rest]); assert.ok(typeof result === "boolean"); return result;
  };
  const owner = new Constructor(child, (): Promise<void> => Promise.resolve(), source, null, undefined, undefined,
    ...(combined ? ["a".repeat(32)] : []));
  seed(owner); owner.start();
  if (combined) {
    assert.ok("waitFootprintCombinedReady" in owner); await owner.waitFootprintCombinedReady();
  }
  await owner.launch({ executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true });
  return { owner, actions, async dispose(): Promise<void> {
    if (child.exitCode === null && child.signalCode === null) { const closed = once(child, "close"); child.stdin.end(); await closed; }
  } };
}

void test("ordinary and combined main owners release then detach before their sole normal-close dispatch", async context => {
  for (const combined of [false, true]) {
    const f = await fixture(combined, "none"); context.after(f.dispose);
    await f.owner.observeFootprintMainConstruction(); const before = f.actions.length;
    await f.owner.requestNormalClose("456");
    const close = f.actions.slice(before);
    const detach = close.indexOf("main-close-detach"), normal = close.indexOf("normal-close"), release = close.indexOf("main-send:release");
    assert.ok(release !== -1 && detach > release && normal > detach);
    assert.equal(f.owner.retainedFootprintMainConstruction()?.released, true);
    assert.equal(f.owner.status().mainCloseDetached, true); assert.equal(f.owner.status().released, false);
    assert.equal(f.actions.includes("main-terminate"), false); assert.equal(f.actions.includes("combined-abort"), false);
    await assert.rejects(f.owner.reproveFootprintMain(), /MAIN_ORIGINAL_OWNER/u);
    await assert.rejects(f.owner.requestNormalClose("456"), /CLOSE_CONSUMED/u);
    assert.equal(f.actions.filter(value => value === "main-close-detach").length, 1);
    assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  }
});

void test("genuine head-age bootstrap custody survives only its original release/detach normal-close lane", async context => {
  const f = await fixture(false, "none", true); context.after(f.dispose);
  await f.owner.observeFootprintMainConstruction(); const before = f.actions.length;
  await f.owner.requestNormalClose("456");
  const close = f.actions.slice(before), detached = close.indexOf("main-close-detach"), normal = close.indexOf("normal-close"), released = close.indexOf("main-send:release");
  assert.ok(released !== -1 && detached > released && normal > detached);
  assert.equal(f.owner.retainedFootprintMainConstruction()?.released, true); assert.equal(f.owner.status().mainCloseDetached, true);
  const after = [...f.actions]; await assert.rejects(f.owner.reproveFootprintMain(), /MAIN_ORIGINAL_OWNER/u);
  await assert.rejects(f.owner.requestNormalClose("456"), /CLOSE_CONSUMED/u); assert.deepEqual(f.actions, after);
  assert.equal(f.actions.filter(action => action === "main-send:release").length, 1); assert.equal(f.actions.includes("head-age-abort"), false);
  assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed(); assert.equal(f.owner.status().helperClosed, true);
});

void test("held registration, failed release and failed detach never reach normal close or replay cleanup", async context => {
  for (const failure of ["source", "release", "detach"] as const) {
    const f = await fixture(true, failure); context.after(f.dispose);
    await (failure === "source" ? assert.rejects(f.owner.observeFootprintMainConstruction()) : f.owner.observeFootprintMainConstruction());
    await assert.rejects(f.owner.requestNormalClose("456")); const after = [...f.actions];
    await assert.rejects(f.owner.requestNormalClose("456"), /CLOSE_CONSUMED/u);
    assert.deepEqual(f.actions, after); assert.equal(f.actions.includes("normal-close"), false);
    assert.equal(f.owner.status().released, false); assert.equal(f.owner.status().mainCloseDetached, false);
    assert.equal(f.actions.filter(value => value === "main-close-detach").length, failure === "detach" ? 1 : 0);
    assert.equal(f.actions.filter(value => value === "main-send:resume").length, failure === "source" ? 1 : 2);
    assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  }
});
void test("never-attempted inspector attachment preserves close while attempted attachment without its original runner refuses", async context => {
  for (const attached of [false, true]) {
    const f = await fixture(true, "none"); context.after(f.dispose);
    if (attached) {
      await f.owner.attachFootprintMain();
      await assert.rejects(f.owner.requestNormalClose("456"), /MAIN_CLOSE_QUIESCENCE/u);
    } else { await f.owner.requestNormalClose("456"); }
    assert.equal(f.actions.includes("normal-close"), !attached);
    assert.equal(f.actions.includes("main-close-detach"), false);
    assert.equal(f.actions.includes("main-send:release"), false);
    assert.equal(await f.owner.observeTermination(), true); await f.owner.releaseClosed();
  }
});
void test("an issued active original request origin refuses close preparation before any group release", async () => {
  const f = await unarmedMainCompletionOriginFixture(); const before = f.backend.retained();
  assert.equal(before.requestOriginActive, true);
  await assert.rejects(f.backend.prepareNormalClose(), /NORMAL_CLOSE_QUIESCENCE/u);
  const after = f.backend.retained();
  assert.equal(after.requests, before.requests); assert.equal(after.releaseAttempted, false); assert.equal(after.requestOriginActive, true);
});
