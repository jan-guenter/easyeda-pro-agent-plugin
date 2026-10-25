/** Actual origin owner/timers with explicitly synthetic source/creation/child
 * owners. This verifies deadline consumption, not native source or identity. */
/* oxlint-disable eslint/max-classes-per-file -- Three small synthetic private-slot owners stand in for the three original upstream owners in this deadline-only fixture. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { test } from "node:test";
import { setImmediate as immediate } from "node:timers/promises";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import type { CurrentPcb209RatlineOrigin } from "../src/current-pcb-209-ratline-origin.ts";

void test("origin lookup timeout retains original evidence, consumes once and denies late reply authority", async () => {
  const construction = Object.freeze({ role: "pcb" }), sourcePacket = Object.freeze({ sessionId: "parent-session", scriptId: "pcb-script" });
  class Source {
    readonly #packet = sourcePacket;
    public requireOriginalDebugger(value: unknown): Promise<string> { assert.equal(value, this.#packet); return Promise.resolve("parent-debugger"); }
  }
  class Creation {
    readonly #packet = construction;
    public requireOriginalConstructor(value: unknown): Promise<unknown> {
      assert.equal(value, this.#packet); return Promise.resolve({ parentSessionId: "parent-session", scriptId: "pcb-script", before: {}, after: {} });
    }
  }
  const creation = new Creation();
  class Child {
    readonly #creation = creation;
    public requireOriginalFirstScript(parent: unknown, value: unknown): Promise<unknown> {
      assert.equal(parent, this.#creation); assert.equal(value, construction);
      return Promise.resolve({ debuggerId: "child-debugger", uniqueContextId: "child-context", scriptId: "bootstrap", url: "https://client/editor?entry=pcb-ratline-worker.js",
        pause: { asyncStackTraceId: { id: "51", debuggerId: "parent-debugger" } } });
    }
  }
  const path = new URL("../src/current-pcb-209-ratline-origin.ts", import.meta.url), source = await readFile(path, "utf8");
  const generated = await transform(source, { loader: "ts", format: "cjs", target: "node24" });
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const replacements = new Map<string, unknown>([
    ["./current-pcb-209-ratline-pcb-bootstrap-owner.ts", { CurrentPcb209RatlinePcbBootstrapOwner: Source }],
    ["./current-pcb-209-ratline-creation-runner.ts", { CurrentPcb209RatlinePcbCreation: Creation }],
    ["./current-pcb-209-ratline-bootstrap-owner.ts", { CurrentPcb209RatlineBootstrapOwner: Child }],
  ]);
  const execute: unknown = runInThisContext(`(function(require,module,exports){${generated.code}\n})`); assert.ok(typeof execute === "function");
  Reflect.apply(execute, undefined, [(name: string): unknown => replacements.get(name) ?? actualRequire(name) as unknown, loaded, loaded.exports]);
  const Constructor = loaded.exports["CurrentPcb209RatlineOrigin"]; assert.ok(typeof Constructor === "function");
  const dispatched = Promise.withResolvers<null>(), reply = Promise.withResolvers<unknown>(); let calls = 0;
  const constructed: unknown = Reflect.construct(Constructor, [{ assertOriginalOwner: (): Promise<void> => Promise.resolve(), request: (command: unknown): Promise<unknown> => {
    calls += 1; assert.deepEqual(command, { method: "Debugger.getStackTrace", sessionId: "parent-session", params: { stackTraceId: { id: "51", debuggerId: "parent-debugger" } } });
    dispatched.resolve(null); return reply.promise;
  } }]);
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The exact actual origin module is loaded with only its three upstream owner classes substituted for this labeled synthetic deadline test.
  const owner = constructed as CurrentPcb209RatlineOrigin;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- These synthetic objects match the substituted owner prototypes solely in the isolated loaded module and cannot enter a real native coordinator.
  const args = [new Source(), sourcePacket, creation, construction, new Child()] as unknown as Parameters<CurrentPcb209RatlineOrigin["capture"]>;
  const pending = owner.capture(...args), rejected = assert.rejects(pending, /PCB209_RATLINE_ORIGIN_DEADLINE/u);
  await dispatched.promise; assert.equal(calls, 1); await rejected;
  const evidence = owner.evidence(), summary = owner.summary(); assert.ok(evidence !== null && summary !== null);
  assert.equal(evidence.stackReply, null); assert.equal(summary.reason, "stack-lookup-unavailable");
  assert.equal(summary.nativeWorkerTargetIdentityVerified, false);
  reply.resolve({ stackTrace: { description: "Worker Created", callFrames: [] } }); await immediate();
  assert.equal(owner.evidence(), evidence); assert.equal(owner.summary(), summary);
  await assert.rejects(owner.capture(...args), /ORIGIN_CONSUMED/u); assert.equal(calls, 1);
});
