/* oxlint-disable import/max-dependencies -- Exercise the actual retained native owner/channel with a synthetic child and a source-qualification-only substitution. */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import process from "node:process";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcb209RatlineStartupOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { CurrentPcb209RatlineBudget } from "../src/current-pcb-209-ratline-budget.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";

const source = "const syntheticIdentity = true;\n";
const uiProfile = { family: "ui", relativePath: "pro-ui/test-version/js/ui.js",
  scriptSha256: createHash("sha256").update(source).digest("hex"), scriptBytes: Buffer.byteLength(source) } as const;
const launch = { executable: "C:\\Reviewed\\easyeda-pro.exe", executableSha256: "c".repeat(64), confirmDiagnosticLaunch: true } as const;
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
async function fixture(context: TestContext, loseContext = false): Promise<Readonly<{
  owner: CurrentPcb209RatlineStartupOwner; budget: CurrentPcb209RatlineBudget; requests: Record<string, unknown>[];
}>> {
  const path = new URL("../src/current-pcb-diagnostic-owner.ts", import.meta.url);
  const actualRequire = createRequire(path);
  const generated = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${generated.code}\n})`); assert.ok(typeof evaluate === "function");
  const qualification = Object.freeze({ syntheticSourceQualification: true });
  Reflect.apply(evaluate, undefined, [(name: string): unknown => name === "./current-pcb-209-actor-clock-source.ts" ? {
    requireCurrentPcb209ActorClockSourceQualification: (input: unknown): void => { assert.equal(input, qualification); },
  } : actualRequire(name) as unknown, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209RatlineStartupOwner"]; assert.ok(typeof Constructor === "function");
  const child = spawn(process.execPath, [fileURLToPath(new URL("helpers/current-pcb-diagnostic-helper-fixture.ts", import.meta.url)),
    loseContext ? "opening-worker-startup-context-loss" : "opening-worker-startup"], { stdio: ["pipe", "pipe", "pipe"] });
  const requests: Record<string, unknown>[] = [], write = child.stdin.write.bind(child.stdin);
  context.mock.method(child.stdin, "write", (...args: Parameters<typeof child.stdin.write>) => {
    const input: unknown = args[0];
    if (typeof input === "string") {
      const value: unknown = JSON.parse(input); assert.ok(record(value)); requests.push(value);
    }
    return write(...args);
  });
  const budget = new CurrentPcb209RatlineBudget();
  // Only source text qualification is substituted. Original owner, channel,
  // Resource ledger and native-process reply handling execute unchanged.
  const owner: unknown = Reflect.construct(Constructor, [child, (): Promise<void> => Promise.resolve(), qualification, budget]);
  assert.ok(owner instanceof Constructor);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual unchanged module's fixed exported constructor was loaded above with one labeled source-only substitution.
  const retained = owner as CurrentPcb209RatlineStartupOwner;
  retained.start();
  context.after(async (): Promise<void> => {
    if (!retained.status().helperClosed) {
      const closed = once(child, "close");
      // EOF applies only to this test peer, which has no Windows handles.
      child.stdin.end(); await closed;
    }
  });
  return { owner: retained, budget, requests };
}
async function qualify(value: Awaited<ReturnType<typeof fixture>>): Promise<void> {
  await value.owner.launch(launch); await value.owner.browserObservation(); await value.owner.inspectFrames("target-1");
  await value.owner.inspectScript("frame-1", uiProfile);
}
async function close(owner: CurrentPcb209RatlineStartupOwner): Promise<void> {
  await owner.requestNormalClose("456"); assert.equal(await owner.observeTermination(), true); await owner.releaseClosed();
}
void test("ratline retained native owner accounts discovery, channel dispatch and original termination on one budget", async context => {
  const value = await fixture(context); await qualify(value);
  const before = value.budget.snapshot(); assert.ok(before.receivedBytes > Buffer.byteLength(source));
  const handoff = await value.owner.handoffWorkerStartup();
  assert.equal(value.owner.status().profile, "worker-startup-ratline209");
  assert.equal(handoff.channel.status().nextRequestId, value.budget.snapshot().requests + 1);
  const events: string[] = []; handoff.dependency.subscribe(event => { events.push(event.method); });
  assert.deepEqual(await handoff.dependency.request({ method: "Target.setAutoAttach", sessionId: "session-1", params: CURRENT_PCB_WORKER_STARTUP_ATTACH }), {});
  assert.deepEqual(events, ["Target.attachedToTarget"]);
  const ids = value.requests.filter(request => typeof request["requestId"] === "number").map(request => request["requestId"]);
  assert.deepEqual(ids, Array.from({ length: ids.length }, (_value, index) => index + 1));
  assert.equal(value.budget.snapshot().requests, ids.length); assert.ok(value.budget.snapshot().receivedBytes > before.receivedBytes);
  await assert.rejects(handoff.channel.releaseAfterTermination(), /RETAIN_LIVE_OWNER/u);
  assert.equal(handoff.channel.status().released, false);
  await close(value.owner); assert.equal(handoff.channel.status().released, true);
  assert.throws(() => { value.budget.consumePoll(); });
  assert.equal(value.owner.status().helperClosed, true);
});
void test("ratline context loss preserves the original native owner for close and verified release", async context => {
  const value = await fixture(context, true); await qualify(value); const handoff = await value.owner.handoffWorkerStartup();
  handoff.dependency.subscribe((): void => {
    // Actual context loss goes through the retained parent observer.
  });
  await assert.rejects(handoff.dependency.request({ method: "Target.setAutoAttach", sessionId: "session-1", params: CURRENT_PCB_WORKER_STARTUP_ATTACH }));
  await assert.rejects(handoff.dependency.assertOriginalOwner());
  await close(value.owner); assert.equal(handoff.channel.status().released, true);
});
