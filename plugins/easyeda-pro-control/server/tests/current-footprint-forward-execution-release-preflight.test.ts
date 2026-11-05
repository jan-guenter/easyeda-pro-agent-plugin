/** Genuine v2 factory and release callbacks with an inert Linux child and
 * synthetic graph verification. No Windows process or release proof is issued. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { combinedReadyFactoryFixture } from "./helpers/current-footprint-combined-ready-fixture.ts";

type ReleaseKind = "closed" | "unlaunched" | "no-process";
const launch = { executable: String.raw`C:\Synthetic\easyeda-pro.exe`, executableSha256: "a".repeat(64), confirmDiagnosticLaunch: true as const };

async function rejected(pending: Promise<unknown>): Promise<unknown> {
  try { await pending; } catch (caughtError) { return caughtError; }
  throw new Error("The original release invocation must reject.");
}

async function fixture(context: TestContext, mode: "normal" | "live-termination" | "malformed-release" | "slow-termination" = "normal"): Promise<Readonly<{
  source: Awaited<ReturnType<typeof combinedReadyFactoryFixture>>;
  owner: Awaited<ReturnType<Awaited<ReturnType<typeof combinedReadyFactoryFixture>>["api"]["startCurrentFootprintForwardExecutionNativeOwner"]>>;
  verifyNext: (run: () => Promise<void>) => void;
  failNext: (caught: Error) => void;
}>> {
  let next: (() => Promise<void>) | null = null;
  const source = await combinedReadyFactoryFixture("ready", "forward-execution", false, {
    launchTarget: { windowsPath: launch.executable, sha256: launch.executableSha256 },
    modules: { "./current-footprint-forward-native-graph.ts": {
      captureCurrentFootprintForwardNativeGraph: (_distribution: unknown, challenge: unknown): Promise<object> => Promise.resolve(Object.freeze({
        verify: (): Promise<void> => { const run = next; next = null; return run?.() ?? Promise.resolve(); },
        bootstrap: `$ErrorActionPreference='Stop';# synthetic graph\n& {} -WorkerStartupFootprintForwardExecution209 -CombinedReadyChallenge '${String(challenge)}'`,
      })),
    } },
    childProgram: `const mode=${JSON.stringify(mode)};const readline=require('node:readline');
process.stdout.write(JSON.stringify(packet)+'\\n');const input=readline.createInterface({input:process.stdin});
input.on('line',line=>{const q=JSON.parse(line);let result;
if(q.action==='termination')result={terminated:mode!=='live-termination',originalRootExited:mode!=='live-termination',originalJobEmpty:true};
else if(mode==='malformed-release')result={released:false};
else if(q.action==='release-unlaunched')result={released:true,launchNeverAttempted:true};
else if(q.action==='release-no-process')result={released:true,creationState:'not-entered',processCreated:false};
else if(q.action==='release')result={released:true};else throw Error('Unexpected inert release request');
const reply=()=>process.stdout.write(JSON.stringify({id:q.id,ok:true,result})+'\\n');
if(mode==='slow-termination'&&q.action==='termination')setTimeout(reply,30);else reply();});`,
  });
  const owner = await source.api.startCurrentFootprintForwardExecutionNativeOwner(source.options);
  context.after(async () => {
    if (!owner.status().helperClosed) { const closed = once(source.child(), "close"); source.child().stdin.end(); await closed; }
  });
  return { source, owner, verifyNext: (run): void => { next = run; }, failNext: (caught): void => { next = (): Promise<never> => Promise.reject(caught); } };
}

function release(f: Awaited<ReturnType<typeof fixture>>, kind: ReleaseKind): Promise<unknown> {
  if (kind === "closed") { return f.owner.releaseClosed(); }
  if (kind === "unlaunched") { return f.owner.releaseUnlaunched(); }
  return f.owner.releaseNoProcess();
}

for (const kind of ["closed", "unlaunched", "no-process"] as const) {
  void test(`genuine writer-v2 ${kind} release preflight proof is original, kind-bound and consumed once before explicit cleanup`, async context => {
    const f = await fixture(context);
    if (kind === "no-process") {
      f.failNext(new Error("synthetic local launch preflight")); await assert.rejects(f.owner.launch(launch), /local launch preflight/u);
      assert.equal(f.source.state.writes, 0);
    }
    const original = new Error("synthetic release preflight"); f.failNext(original);
    const caught = await rejected(release(f, kind)); assert.equal(caught, original); assert.equal(f.source.state.writes, 0);
    assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(new Error(original.message), kind), false);
    assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(structuredClone(original), kind), false);
    assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(caught, kind === "closed" ? "unlaunched" : "closed"), false);
    assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(caught, kind), true);
    assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(caught, kind), false);
    assert.equal(f.source.state.writes, 0); assert.equal(f.owner.status().released, false);
    await release(f, kind);
    assert.equal(f.owner.status().helperClosed, true); assert.equal(f.source.child().exitCode, 0);
    assert.deepEqual(f.source.state.actions, kind === "closed" ? ["termination", "release"] : [kind === "unlaunched" ? "release-unlaunched" : "release-no-process"]);
  });
}

void test("writer-v2 release preflight proof refuses copied receivers, another owner and legacy factories", async context => {
  const f = await fixture(context), other = await fixture(context);
  const original = new Error("synthetic original owner preflight"); f.failNext(original);
  await rejected(f.owner.releaseUnlaunched());
  assert.equal(other.owner.consumeFootprintForwardExecutionReleasePreflightFailure(original, "unlaunched"), false);
  let traps = 0;
  const proxy = new Proxy(f.owner, { get: (): never => { traps += 1; throw new Error("Must not inspect proxy"); } });
  const prototype: unknown = Object.getPrototypeOf(f.owner); assert.ok(prototype !== null && typeof prototype === "object");
  for (const copied of [Object.create(prototype), proxy, {}] as unknown[]) {
    // oxlint-disable-next-line typescript/unbound-method -- The hostile receiver is supplied explicitly to the original method; no getter is evaluated.
    assert.equal(Reflect.apply(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure, copied, [original, "unlaunched"]), false);
  }
  assert.equal(traps, 0);
  const legacy = await combinedReadyFactoryFixture("ready", "forward");
  const old = await legacy.api.startCurrentFootprintCopyForwardNativeOwner(legacy.options);
  try { assert.equal(old.consumeFootprintForwardExecutionReleasePreflightFailure(original, "unlaunched"), false); }
  finally { await old.releaseUnlaunched(); }
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(original, "unlaunched"), true);
  assert.equal(f.source.state.writes, 0); assert.equal(other.source.state.writes, 0);
});

void test("writer-v2 stale or concurrently rejected release prefixes cannot consume the latest proof", async context => {
  const f = await fixture(context);
  const first = new Error("first prefix"), second = new Error("second prefix");
  f.failNext(first); await rejected(f.owner.releaseUnlaunched());
  f.failNext(second); await rejected(f.owner.releaseUnlaunched());
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(first, "unlaunched"), false);
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(second, "unlaunched"), true);
  f.failNext(second); await rejected(f.owner.releaseUnlaunched());
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(second, "unlaunched"), false);
  const entered = Promise.withResolvers<null>(), gate = Promise.withResolvers<null>(), refusal = new Error("held prefix");
  f.verifyNext(async (): Promise<never> => { entered.resolve(null); await gate.promise; throw refusal; });
  const pending = f.owner.releaseUnlaunched(); await entered.promise;
  const busy = await rejected(f.owner.releaseClosed());
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(busy, "closed"), false);
  assert.equal(f.owner.status().busy, true);
  gate.resolve(null); assert.equal(await rejected(pending), refusal);
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(refusal, "unlaunched"), false);
  assert.equal(f.source.state.writes, 0);
});

void test("writer-v2 queued native work invalidates prefix proof while standalone termination leaves the release pipeline untouched", async context => {
  const f = await fixture(context, "slow-termination");
  const first = new Error("first prefix"), second = new Error("queued prefix"), third = new Error("after standalone observation");
  f.failNext(first); await rejected(f.owner.releaseUnlaunched());
  const pending = f.owner.syntheticForwardRequestForTest({ action: "termination" });
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(first, "unlaunched"), false);
  f.failNext(second); await rejected(f.owner.releaseUnlaunched()); await pending;
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(second, "unlaunched"), false);
  assert.equal(await f.owner.observeTermination(), true);
  f.failNext(third); await rejected(f.owner.releaseUnlaunched());
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(third, "unlaunched"), true);
  assert.deepEqual(f.source.state.actions, ["termination", "termination"]);
});

void test("writer-v2 any release pipeline work permanently excludes later local-prefix retry proof", async context => {
  const f = await fixture(context, "live-termination");
  const afterWork = await rejected(f.owner.releaseClosed());
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(afterWork, "closed"), false);
  assert.throws(() => f.owner.observeFootprintForwardExecutionRelease(), /RELEASE_NOT_ATTEMPTED/u);
  const later = new Error("later prefix after termination work"); f.failNext(later);
  assert.equal(await rejected(f.owner.releaseUnlaunched()), later);
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(later, "unlaunched"), false);
  assert.deepEqual(f.source.state.actions, ["termination"]);
});

for (const kind of ["unlaunched", "no-process"] as const) {
  void test(`writer-v2 ${kind} helper release ambiguity never issues a preflight proof`, async context => {
    const f = await fixture(context, "malformed-release");
    if (kind === "no-process") { f.failNext(new Error("local launch refusal")); await rejected(f.owner.launch(launch)); }
    const caught = await rejected(release(f, kind));
    assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(caught, kind), false);
    const later = await rejected(release(f, kind));
    assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(later, kind), false);
    assert.equal(f.source.state.writes, 1); assert.equal(f.owner.status().released, false);
  });
}

void test("writer-v2 current helper failure prevents consumption of an earlier original prefix proof", async context => {
  const f = await fixture(context), original = new Error("prefix before helper failure");
  f.failNext(original); await rejected(f.owner.releaseUnlaunched());
  f.source.child().stderr.emit("data", Buffer.from("synthetic helper failure"));
  assert.equal(f.owner.consumeFootprintForwardExecutionReleasePreflightFailure(original, "unlaunched"), false);
  assert.equal(f.source.state.writes, 0);
});
