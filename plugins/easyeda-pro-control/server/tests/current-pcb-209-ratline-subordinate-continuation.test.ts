/** Controlled disposer faults supplement the composed actual-owner/V8 test.
 * The synthetic source owner here proves no source or native authority. */
import assert from "node:assert/strict";
import { test } from "node:test";
import type { CurrentPcb209RatlineSubordinateContinuation } from "../src/current-pcb-209-ratline-subordinate-continuation.ts";
import type { CurrentPcb209RatlineBootstrapPacket } from "../src/current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineRealmDependency } from "../src/current-pcb-209-ratline-event-dispatcher.ts";
import { loadRatlineContinuationFixtureModule } from "./helpers/current-pcb-209-ratline-continuation-modules.ts";

void test("verified termination and throwing consumed disposer prevent pending subordinate success", async () => {
  const source: CurrentPcb209RatlineBootstrapPacket = Object.freeze({ profile: "private.pcb209-ratline-bootstrap.v1", childTargetId: "subordinate",
    childSessionId: "subordinate-session", scriptId: "source", uniqueContextId: "context", completeImportedSourceQualified: true,
    importedSourceHeldBeforeExecution: true, nativeWorkerTargetIdentityVerified: false, continuousInstallationLeaseVerified: false, executionAuthorized: false });
  const reply = Promise.withResolvers<null>(), resumed = Promise.withResolvers<null>();
  let disposed = 0, terminated = false;
  let events: Parameters<CurrentPcb209RatlineRealmDependency["subscribe"]>[0] | null = null;
  class SyntheticSourceOwner {
    readonly #source = source;
    public requireOriginal(packet: CurrentPcb209RatlineBootstrapPacket): Promise<void> { assert.equal(packet, this.#source); return Promise.resolve(); }
    public claimOriginalWorkerRealm(packet: CurrentPcb209RatlineBootstrapPacket): Promise<Pick<CurrentPcb209RatlineRealmDependency, "subscribe">> {
      assert.equal(packet, this.#source); return Promise.resolve({ subscribe: listener => { events = listener;
        return (): never => { disposed += 1; throw new Error("original synthetic disposer failed"); }; } });
    }
    public async releaseOriginalPinnedSource(packet: CurrentPcb209RatlineBootstrapPacket): Promise<void> {
      assert.equal(packet, this.#source); assert.ok(events !== null); events.resumed(); resumed.resolve(null); await reply.promise;
    }
  }
  const loaded = await loadRatlineContinuationFixtureModule(new URL("../src/current-pcb-209-ratline-subordinate-continuation.ts", import.meta.url),
    new Map([["./current-pcb-209-ratline-bootstrap-owner.ts", { CurrentPcb209RatlineBootstrapOwner: SyntheticSourceOwner }]]));
  const Constructor = loaded["CurrentPcb209RatlineSubordinateContinuation"]; assert.equal(typeof Constructor, "function");
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The unchanged observer is loaded against the explicitly synthetic disposer owner above solely for pending cleanup fault injection.
  const Observer = Constructor as new (owner: SyntheticSourceOwner, packet: CurrentPcb209RatlineBootstrapPacket, termination: () => Promise<void>) => CurrentPcb209RatlineSubordinateContinuation;
  const observer = new Observer(new SyntheticSourceOwner(), source, (): Promise<void> => { assert.ok(terminated); return Promise.resolve(); });
  const work = observer.continue(); await resumed.promise; terminated = true;
  await assert.rejects(observer.releaseAfterTermination(), /UNSUBSCRIBE_FAILED/u); assert.equal(disposed, 1);
  reply.resolve(null); await assert.rejects(work, /NOT_CURRENT/u);
  await assert.rejects(observer.continue(), /CONSUMED/u); await assert.rejects(observer.releaseAfterTermination(), /RELEASE_STATE/u);
  assert.equal(disposed, 1); assert.equal(observer.status()["packetRetained"], false); assert.equal(observer.status()["terminationVerified"], true);
});
