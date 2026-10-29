/** Actual private issuer/collector constructors with explicit synthetic source
 * and native capacity. Returns before the four main arms for composed tests. */
/* oxlint-disable import/max-dependencies -- These tests join the actual three original-owner classes with separately labelled native/source fixtures. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentFootprintCopyMainRequestRunner, requireCurrentFootprintCopyMainRequestHeldFinalPb, transferCurrentFootprintCopyMainRequestHeldFinalPb } from "../../src/current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainRequestOrigin } from "../../src/current-footprint-copy-main-request-origin.ts";
import type { CurrentFootprintCopyMainBackendCommand } from "../../src/current-footprint-copy-main-backend-contract.ts";
import type { CurrentFootprintCopyMainBackendTransport } from "../../src/current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintCopyMainRequestCollectCommand } from "../../src/current-footprint-copy-main-request-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand } from "../../src/current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionRunner } from "../../src/current-footprint-copy-main-completion-runner.ts";
import { mainBackendModule, mainBackendTransportFixture } from "./footprint-main-backend-runner-fixture.ts";
import { mainCompletionRunnerFixture } from "./footprint-main-completion-runner-fixture.ts";
import { requestCollectorFixture, syntheticRequestPlan, syntheticRequestSource } from "./footprint-main-request-collector-fixture.ts";

interface CollectorModule {
  readonly CurrentFootprintCopyMainRequestRunner: typeof CurrentFootprintCopyMainRequestRunner;
  readonly requireCurrentFootprintCopyMainRequestHeldFinalPb: typeof requireCurrentFootprintCopyMainRequestHeldFinalPb;
  readonly transferCurrentFootprintCopyMainRequestHeldFinalPb: typeof transferCurrentFootprintCopyMainRequestHeldFinalPb;
}
async function collectorModule(getOrigin: (token: CurrentFootprintCopyMainRequestOrigin) => unknown): Promise<CollectorModule> {
  const path = new URL("../../src/current-footprint-copy-main-request-runner.ts", import.meta.url);
  const originalRequire = createRequire(path);
  const loaded: { exports: Record<string, unknown> } = { exports: {} };
  const output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-main-request-origin.ts") { return { requireCurrentFootprintCopyMainRequestOrigin: getOrigin }; }
    if (specifier === "./current-footprint-copy-main-request-source.ts") { return { requireCurrentFootprintCopyMainRequestSource: (token: unknown): void => { assert.equal(token, syntheticRequestSource); } }; }
    return originalRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual compiled collector exports retain their private WeakMaps; only source/origin dependencies are explicitly synthetic.
  return loaded.exports as unknown as CollectorModule;
}
async function completionRunner(module: Awaited<ReturnType<typeof mainBackendModule>>, supplied: ReturnType<typeof mainCompletionRunnerFixture>): Promise<typeof CurrentFootprintCopyMainCompletionRunner> {
  const loaded: { exports: Record<string, unknown> } = { exports: {} }, path = new URL("../../src/current-footprint-copy-main-completion-runner.ts", import.meta.url);
  const originalRequire = createRequire(path), output = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${output.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => {
    if (specifier === "./current-footprint-copy-main-completion-origin.ts") { return { requireCurrentFootprintCopyMainCompletionOrigin: module.requireCompletion }; }
    if (specifier === "./current-footprint-copy-main-completion-source.ts") { return { ...originalRequire(specifier), requireCurrentFootprintCopyMainCompletionSource: supplied.requireSource }; }
    return originalRequire(specifier) as unknown;
  }, loaded, loaded.exports]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The actual sequencer uses the real issuer's private map and explicitly synthetic complete source.
  return loaded.exports["CurrentFootprintCopyMainCompletionRunner"] as typeof CurrentFootprintCopyMainCompletionRunner;
}
export async function unarmedMainCompletionOriginFixture(): Promise<Readonly<{
  module: Awaited<ReturnType<typeof mainBackendModule>>;
  backend: InstanceType<Awaited<ReturnType<typeof mainBackendModule>>["Constructor"]>;
  collector: CurrentFootprintCopyMainRequestRunner;
  collectorModule: CollectorModule;
  requestState: ReturnType<typeof requestCollectorFixture>["state"];
  oldOrigin: CurrentFootprintCopyMainRequestOrigin;
  Completion: typeof CurrentFootprintCopyMainCompletionRunner;
  capability: Readonly<{ profile: "private.current-footprint-combined-main-capability.v1"; executionAuthorized: false }>;
  native: { capacity: boolean; beginCount: number; sends: number; retireCount: number; tailReleases: number; exited: boolean; lostBegin: boolean; lostRetire: boolean };
}>> {
  const base = mainBackendTransportFixture(), completion = mainCompletionRunnerFixture(), request = requestCollectorFixture();
  const native = { capacity: true, beginCount: 0, sends: 0, retireCount: 0, tailReleases: 0, exited: false, lostBegin: false, lostRetire: false };
  const queue: string[] = [];
  const capability = Object.freeze({ profile: "private.current-footprint-combined-main-capability.v1", executionAuthorized: false } as const);
  let loaded: Awaited<ReturnType<typeof mainBackendModule>> | null = null;
  const collector = await collectorModule(token => { assert.ok(loaded !== null); return loaded.requireRequest(token); });
  const transport: CurrentFootprintCopyMainBackendTransport = Object.freeze({
    assertCurrent: base.transport.assertCurrent,
    send(command: CurrentFootprintCopyMainBackendCommand, id: number): Promise<void> {
      if (command.phase === "release" && native.beginCount > 0) {
        native.tailReleases += 1; assert.equal(id, 127); queue.push(`${JSON.stringify({ id, result: {} })}\0`); return Promise.resolve();
      }
      return base.transport.send(command, id);
    },
    async poll(cleanup: boolean): Promise<string> {
      if (request.state.invoked) {
        await request.bindings.pump(cleanup);
        for (let next = request.bindings.takeEvent(); next !== null; next = request.bindings.takeEvent()) { queue.push(`${JSON.stringify(next)}\0`); }
      }
      for (let next = completion.bindings.takeEvent(); next !== null; next = completion.bindings.takeEvent()) { queue.push(`${JSON.stringify(next)}\0`); }
      return queue.length > 0 ? Buffer.from(queue.shift() ?? "").toString("base64") : base.transport.poll(cleanup);
    },
  });
  loaded = await mainBackendModule({
    "./current-footprint-copy-main-request-runner.ts": collector,
    "./current-footprint-copy-main-request-source.ts": {
      qualifyCurrentFootprintCopyMainRequestSource: (): typeof syntheticRequestSource => syntheticRequestSource,
      requireCurrentFootprintCopyMainRequestSource: (token: unknown): void => { assert.equal(token, syntheticRequestSource); },
    },
    "./current-footprint-copy-main-completion-source.ts": {
      qualifyCurrentFootprintCopyMainCompletionSource: (): typeof completion.source => completion.source,
      requireCurrentFootprintCopyMainCompletionSource: completion.requireSource,
    },
    "./current-pcb-diagnostic-owner.ts": {
      requireCurrentFootprintCombinedMainCapability: (token: unknown): void => { assert.equal(token, capability); assert.equal(native.exited, false); },
      requireCurrentFootprintCombinedMainCleanup: (token: unknown): void => { assert.equal(token, capability); },
      currentFootprintCombinedMainGenerationExited: (token: unknown): boolean => { assert.equal(token, capability); return native.exited; },
      assertCurrentFootprintCombinedMainCompletionCapacity: (): void => { assert.ok(native.capacity, "current native capacity refuses"); },
      beginCurrentFootprintCombinedMainCompletion: (): Promise<void> => {
        native.beginCount += 1; return native.lostBegin ? Promise.reject(new Error("lost original begin ack")) : Promise.resolve();
      },
      failCurrentFootprintCombinedMainCompletion: (token: unknown): void => { assert.equal(token, capability); },
      sendCurrentFootprintCombinedMainCommand: async (token: unknown, _owner: unknown, command: CurrentFootprintCopyMainRequestCollectCommand, id: number): Promise<void> => {
        assert.equal(token, capability); native.sends += 1;
        queue.push(`${JSON.stringify({ id, result: await request.bindings.request(command, false) })}\0`);
      },
      sendCurrentFootprintCombinedMainCompletion: async (token: unknown, _owner: unknown, command: CurrentFootprintCopyMainCompletionCommand, id: number): Promise<void> => {
        assert.equal(token, capability); native.sends += 1;
        queue.push(`${JSON.stringify({ id, result: await completion.bindings.request(command, false) })}\0`);
      },
      retireCurrentFootprintCombinedMainCompletion: (): Promise<void> => {
        native.retireCount += 1; return native.lostRetire ? Promise.reject(new Error("lost original retirement ack")) : Promise.resolve();
      },
    },
  });
  const backend = new loaded.Constructor(transport), construction = await backend.observe();
  const oldOrigin = await backend.issueRequestOrigin(capability, construction);
  const owner = new collector.CurrentFootprintCopyMainRequestRunner(oldOrigin, syntheticRequestPlan);
  return { module: loaded, backend, collector: owner, collectorModule: collector, requestState: request.state,
    oldOrigin, capability, native, Completion: await completionRunner(loaded, completion) };
}
