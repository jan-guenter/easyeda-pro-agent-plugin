/** Real stream/channel parsing with synthetic native dependencies only. */
import assert from "node:assert/strict";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { CurrentFootprintCopyForwardDiscoveryPipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { CurrentFootprintCopyForwardStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import { CURRENT_PCB_WORKER_STARTUP_ATTACH } from "../src/current-pcb-worker-startup-contract.ts";

for (const refuse of [false, true]) {
  void test(`forward discovery charges actual event bytes before delivery, refusal=${String(refuse)}`, async context => {
    const input = new PassThrough();
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the actual Writable completion contract unchanged.
    const output = new Writable({ autoDestroy: false, write(_chunk, _encoding, callback): void { callback(); } });
    const observed: number[] = [], order: string[] = [];
    const pipe = new CurrentFootprintCopyForwardDiscoveryPipe(input, output, bytes => {
      observed.push(bytes); order.push("charge"); if (refuse) { throw new Error("Synthetic counter refusal"); }
    });
    context.after(async () => {
      const closed = [input, output].map(async stream => { await once(stream, "close"); });
      input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners();
    });
    pipe.start(); const attached = pipe.attachTarget("original-target", () => { order.push("deliver"); });
    input.write(Buffer.from(`${JSON.stringify({ id: 1, result: { sessionId: "original-session" } })}\0`)); await attached;
    const event = JSON.stringify({ method: "Runtime.executionContextsCleared", params: {}, sessionId: "original-session" });
    input.write(Buffer.from(`${event}\0`));
    assert.deepEqual(observed, [Buffer.byteLength(event)]);
    assert.deepEqual(order, refuse ? ["charge"] : ["charge", "deliver"]);
    assert.equal(pipe.status().failure !== null, refuse);
    assert.equal(input.destroyed, false); assert.equal(output.destroyed, false);
  });

  void test(`forward startup charges the actual worker event before subscriber delivery, refusal=${String(refuse)}`, async context => {
    const parent = Object.freeze({ targetId: "original-parent", sessionId: "parent-session", nextRequestId: 1 });
    const chunks: Buffer[] = [], order: string[] = [];
    let terminated = false;
    const channel = new CurrentFootprintCopyForwardStartupChannel({
      requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
      assertOriginalTermination: (): Promise<void> => { assert.equal(terminated, true); return Promise.resolve(); },
      observeOriginalParentEvent: (): void => { assert.fail("Unexpected parent metadata event"); },
      exchange: (request): Promise<unknown> => {
        if (request.action === "poll") { return Promise.resolve({ bytes: (chunks.shift() ?? Buffer.alloc(0)).toString("base64") }); }
        assert.ok("requestId" in request); assert.equal(request["method"], "Target.setAutoAttach");
        const event = { method: "Target.attachedToTarget", sessionId: "parent-session", params: { sessionId: "worker-session", waitingForDebugger: true,
          targetInfo: { targetId: "worker-target", type: "worker", attached: true, title: "synthetic", url: "file:///synthetic/worker.js" } } };
        chunks.push(Buffer.from(`${JSON.stringify(event)}\0${JSON.stringify({ id: request["requestId"], sessionId: "parent-session", result: {} })}\0`));
        return Promise.resolve({ written: true });
      },
    }, bytes => { assert.ok(bytes > 0); order.push("charge"); if (refuse) { throw new Error("Synthetic counter refusal"); } });
    context.after(async () => { terminated = true; if (!channel.status().released) { await channel.releaseAfterTermination(); } });
    const dependency = await channel.start(); dependency.subscribe(() => { order.push("deliver"); });
    const attach = dependency.request({ method: "Target.setAutoAttach", params: CURRENT_PCB_WORKER_STARTUP_ATTACH, sessionId: "parent-session" });
    await (refuse ? assert.rejects(attach, /PCB_WORKER_STARTUP_CHANNEL_/u) : attach);
    assert.deepEqual(order, refuse ? ["charge"] : ["charge", "deliver"]);
    assert.equal(channel.status().failed, refuse);
  });
}
