/** Actual original construction owner; only the separately tested producer
 * observation is replaced with an inert boundary. No CAD or writer executes. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS } from "../src/current-footprint-copy-create-bindings.ts";
import { currentFootprintCopyPreparationWire } from "../src/current-pcb-worker-startup-wire.ts";
import type { CurrentFootprintCopyProducerObservation, CurrentFootprintCopyProducerTransport } from "../src/current-footprint-copy-producer-runner.ts";
import type { CurrentPcb209WorkerConstructionRunner } from "../src/current-pcb-worker-construction-runner.ts";
// oxlint-disable-next-line import/max-dependencies -- This integration fixture joins the real inspector, constructor owner and native wire encoder at the formerly missing command boundary.
import { construction209Inspector } from "./helpers/current-pcb-worker-construction-inspector.ts";

async function handled(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The actual awaited capture remains the reported result.
  }
}
void test("original209 producer continuation issues only after final state reproof and never adopts copied state", { timeout: 30_000 }, async context => {
  for (const drift of [false, true]) {
    const peer = await construction209Inspector(context);
    const observation = Object.freeze({ syntheticProducerObservation: true });
    const requests: { program: string; objects: readonly string[] }[] = [];
    let producerRuns = 0;
    class Producer {
      readonly #transport: CurrentFootprintCopyProducerTransport;
      public constructor(transport: CurrentFootprintCopyProducerTransport) { this.#transport = transport; }
      public async observe(): Promise<typeof observation> {
        producerRuns += 1; this.#transport.assertCurrent();
        await this.#transport.captureOriginalMethods(); await this.#transport.recheckOriginalMethods();
        if (drift) { await peer.syntheticEvaluate("PROJECT.consistencyManager.maxTicket=1"); }
        return observation;
      }
      public requireOriginal(value: unknown): void { assert.equal(value, observation); this.#transport.assertCurrent(); }
      public retained(): Readonly<{ synthetic: true; transportRetained: boolean }> { return Object.freeze({ synthetic: true, transportRetained: Object.hasOwn(this.#transport, "assertCurrent") }); }
    }
    const path = new URL("../src/current-pcb-worker-construction-runner.ts", import.meta.url);
    const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
    const program = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
    const evaluate: unknown = runInThisContext(`(function(require,module,exports){${program.code}\n})`);
    assert.ok(typeof evaluate === "function");
    Reflect.apply(evaluate, undefined, [(specifier: string): unknown => specifier === "./current-footprint-copy-producer-runner.ts" ?
      { CurrentFootprintCopyProducerRunner: Producer } : actualRequire(specifier) as unknown, loaded, loaded.exports]);
    const Constructor = loaded.exports["CurrentPcb209WorkerConstructionRunner"]; assert.ok(typeof Constructor === "function");
    const transport: typeof peer.transport = { ...peer.transport, request: command => {
      if (command.method === "Runtime.callFunctionOn" && Object.values(CURRENT_FOOTPRINT_COPY_CREATE_METHOD_CALLS)
        .some(call => call.program === command.params.functionDeclaration)) {
        const wire = currentFootprintCopyPreparationWire({ ...command, sessionId: "original-session" }, 264);
        assert.equal(wire.request["startupPhase"], command.params.returnByValue ?
          "footprint-producer-methods-recheck" : "footprint-producer-methods-capture");
        assert.equal(Object.hasOwn(wire.request, "functionDeclaration"), false);
        requests.push({ program: command.params.functionDeclaration, objects: command.params.arguments.map(item => { assert.ok("objectId" in item); return item.objectId; }) });
        assert.equal(command.params.throwOnSideEffect, true); assert.equal(command.params.awaitPromise, false);
        return Promise.resolve(command.params.returnByValue ? { result: { type: "boolean", value: true } } : {
          result: { type: "object", subtype: "array", className: "Array", description: "Array(8)", objectId: "synthetic-method-bundle" },
        });
      }
      return peer.transport.request(command);
    } };
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Load the actual owner with only its producer observer import replaced by the inert boundary above.
    const owner = Reflect.construct(Constructor, [transport]) as CurrentPcb209WorkerConstructionRunner;
    const capturing = owner.capture(); void handled(capturing); await owner.whenArmed();
    const running = peer.run(); void handled(running); const packet = await capturing; await running;
    await peer.syntheticEvaluate('PROJECT.uuid="a".repeat(64);PROJECT._branchUuid="b".repeat(32);globalThis._TAB_ID_="window_1";');
    await owner.proveProjectIdentity(packet); const assignments = await owner.proveCurrentAssignments(packet);
    const state = await owner.observeFootprintState(packet, assignments);
    const before = peer.commands.length;
    await assert.rejects(owner.observeFootprintProducers(packet, assignments, { ...state }), /FOOTPRINT_PRODUCER_OWNER/u);
    assert.equal(peer.commands.length, before); assert.equal(producerRuns, 0);
    if (drift) {
      await assert.rejects(owner.observeFootprintProducers(packet, assignments, state), /FOOTPRINT_CHANGED/u);
      assert.equal(owner.retainedFootprintProducers()?.["completed"], false);
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The injected boundary's shape is deliberately not a real producer qualification; the owner must refuse it after final state drift.
      await assert.rejects(owner.requireFootprintProducers(packet, assignments, state, observation as unknown as CurrentFootprintCopyProducerObservation));
    } else {
      const produced = await owner.observeFootprintProducers(packet, assignments, state);
      assert.equal(produced, observation); assert.equal(owner.retainedFootprintProducers()?.["completed"], true);
      await assert.rejects(owner.requireFootprintProducers(packet, assignments, state, { ...produced }), /ORIGINAL_FOOTPRINT_PRODUCER_PACKET/u);
      await owner.requireFootprintProducers(packet, assignments, state, produced);
    }
    await assert.rejects(owner.observeFootprintProducers(packet, assignments, state)); assert.equal(producerRuns, 1);
    const captured = requests[0], rechecked = requests[1]; assert.ok(captured && rechecked);
    assert.equal(captured.objects.length, 4); assert.deepEqual(rechecked.objects, [...captured.objects, "synthetic-method-bundle"]);
    assert.equal(owner.retainedFootprintProducers()?.["originalMethodBundleRetained"], true);
    const replies = owner.retainedFootprintProducers()?.["originalReplies"]; assert.ok(Array.isArray(replies)); assert.ok(replies.length >= 2);
    await owner.release();
  }
});
