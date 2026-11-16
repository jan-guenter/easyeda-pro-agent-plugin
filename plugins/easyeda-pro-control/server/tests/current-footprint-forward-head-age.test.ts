/** Production Main scheduling with explicit inert bootstrap/head/source seams.
 * This supplies no native issuer, SQL reader, app, writer or saved-state proof. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintForwardHeadAgeSchedule, CURRENT_FOOTPRINT_FORWARD_HEAD_AGE_PHASES as PHASES,
  validateCurrentFootprintForwardHeadAgeCommand } from "../src/current-footprint-forward-head-age.ts";
import type { CurrentFootprintForwardHeadAgeCommand } from "../src/current-footprint-forward-head-age.ts";
import type { CurrentFootprintCopyMainBackendRunner } from "../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintForwardHeadBootstrap } from "../src/current-footprint-forward-head-origin.ts";
import { currentFootprintForwardHeadAgeNativeWire } from "../src/current-footprint-forward-head-age-native.ts";
import { mainBackendModule, mainBackendTransportFixture } from "./helpers/footprint-main-backend-runner-fixture.ts";
import { footprintHeadAgeMainFixture } from "./helpers/footprint-head-age-main-fixture.ts";

async function fixture(failAt: number | null = null): Promise<Readonly<{ runner: CurrentFootprintCopyMainBackendRunner; value: ReturnType<typeof mainBackendTransportFixture>; bootstrap: CurrentFootprintForwardHeadBootstrap; calls: CurrentFootprintForwardHeadAgeCommand[] }>> {
  const calls: CurrentFootprintForwardHeadAgeCommand[] = [], value = mainBackendTransportFixture(true);
  const context = await import("../src/current-footprint-head-age-context.ts");
  const origin = await import("../src/current-footprint-forward-head-origin.ts");
  const bootstrap: CurrentFootprintForwardHeadBootstrap = Object.freeze({ profile: "private.current-footprint-forward-head-bootstrap.v1", executionAuthorized: false });
  const source = Object.freeze({ profile: "private.current-footprint-head-age-context-source.v1" as const, runtimeProcessVerified: false as const, executionAuthorized: false as const });
  let runner: CurrentFootprintCopyMainBackendRunner | null = null;
  const module = await mainBackendModule({
    "./current-footprint-forward-head-origin.ts": { ...origin,
      requireCurrentFootprintForwardHeadBootstrap(actual: unknown, transport: unknown): object { assert.equal(actual, bootstrap); assert.equal(transport, value.transport); return Object.freeze({ explicitSyntheticHeadSource: true }); },
      async sendCurrentFootprintForwardHeadAgeMainCommand(actual: unknown, held: unknown, command: CurrentFootprintForwardHeadAgeCommand, id: number): Promise<void> {
        assert.equal(actual, bootstrap); assert.equal(held, runner); assert.ok(runner !== null);
        runner.consumeForwardHeadAgeCommand(command, id); calls.push(command);
        if (failAt === calls.length) { throw new Error("SYNTHETIC_ORIGINAL_AGE_ACK_LOST"); }
        await value.transport.send(command.command, id);
      },
    },
    /* oxlint-disable eslint/class-methods-use-this -- This inert instance replaces the native-head boundary only in the test module loader; static methods cannot implement the original instance interface. */
    "./current-footprint-forward-head-main.ts": { CurrentFootprintForwardHeadMain: class {
      public readonly arm = (): Promise<void> => Promise.resolve();
      public readonly capture = (): Promise<void> => Promise.resolve();
      public readonly resolve = (): boolean => false;
      public readonly site = (): null => null;
    } },
    /* oxlint-enable eslint/class-methods-use-this */
    "./current-footprint-head-age-context.ts": { ...context,
      qualifyCurrentFootprintHeadAgeContextSource(actual: unknown): typeof source { assert.equal(actual, "s".repeat(context.CURRENT_FOOTPRINT_HEAD_AGE_CONTEXT_SOURCE.bytes)); return source; },
      requireCurrentFootprintHeadAgeContextSource(actual: unknown): void { assert.equal(actual, source); },
    },
  });
  runner = new module.Constructor(value.transport, undefined, undefined, bootstrap);
  return Object.freeze({ runner, value, bootstrap, calls });
}
void test("original forward Main consumes all23 age calls with contiguous physical IDs after construction", async () => {
  const f = await fixture(); await f.runner.observe(); await f.runner.prepareForwardHeadAge(f.bootstrap, 123);
  f.value.state.headAgeExceptionPhase = "head-age-observe";
  f.value.state.headAgeExceptionReply = { result: { type: "object", value: footprintHeadAgeMainFixture("2020-01-15 12:34:56") } };
  const result = await f.runner.observeForwardHeadAge(f.bootstrap, { createdAtLiteral: "2020-01-15 12:34:56", referenceUtcMs: 0 });
  assert.equal(result.scope.createdAtLiteral, "2020-01-15 12:34:56"); assert.deepEqual(f.calls.map(call => call.command.phase), PHASES);
  for (const [index, command] of f.calls.entries()) {
    const wire = currentFootprintForwardHeadAgeNativeWire(command, 50 + index); assert.equal(wire["requestId"], 50 + index); assert.equal(wire["action"], "footprint-forward-head-age-main");
  }
  const count = f.calls.length; await assert.rejects(f.runner.prepareForwardHeadAge(f.bootstrap, 123));
  await assert.rejects(f.runner.observeForwardHeadAge(f.bootstrap, { createdAtLiteral: "2020-01-15 12:34:56", referenceUtcMs: 0 })); assert.equal(f.calls.length, count);
});
void test("lost original age acknowledgments consume the attempt before another phase or native write", async () => {
  for (const failAt of [1, 2, 9, 21]) {
    const f = await fixture(failAt); await f.runner.observe(); await assert.rejects(f.runner.prepareForwardHeadAge(f.bootstrap, 123), /SYNTHETIC_ORIGINAL_AGE_ACK_LOST/u);
    assert.equal(f.calls.length, failAt); await assert.rejects(f.runner.prepareForwardHeadAge(f.bootstrap, 123)); assert.equal(f.calls.length, failAt);
  }
});
void test("a copied bootstrap and an unrelated command cannot obtain age continuation", async () => {
  const f = await fixture(); await f.runner.observe();
  await assert.rejects(f.runner.prepareForwardHeadAge({ ...f.bootstrap }, 123)); assert.equal(f.calls.length, 0);
  assert.throws(() => validateCurrentFootprintForwardHeadAgeCommand({ phase: "forward-head-age", command: { phase: "runtime-enable", method: "Runtime.enable", params: {} } }), /FORWARD_HEAD_AGE_PHASE/u);
});
void test("the finite age schedule refuses duplicate or gapped IDs and remains failed", async () => {
  const f = await fixture(); await f.runner.observe(); await f.runner.prepareForwardHeadAge(f.bootstrap, 123); const first = f.calls[0], second = f.calls[1]; assert.ok(first !== undefined && second !== undefined);
  for (const id of [50, 52, Number.NaN, -0]) {
    const schedule = new CurrentFootprintForwardHeadAgeSchedule(); schedule.consume(first, 50);
    assert.throws(() => { schedule.consume(second, id); }); assert.throws(() => { schedule.consume(second, 51); }); assert.throws(() => { schedule.requireComplete(); });
  }
  for (const id of [0, 129, Number.NaN, -0]) { assert.throws(() => currentFootprintForwardHeadAgeNativeWire(first, id)); }
});
