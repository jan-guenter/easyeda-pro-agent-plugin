/* oxlint-disable import/max-dependencies -- The composed test loader retains actual owners and supplies source-only fixture imports alongside their declared constructor types. */
/** Load unchanged production lifecycle modules with labeled synthetic source
 * qualification only. All private owners, event routing, commands and joins
 * remain actual implementations; this is not installed-source validation. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInThisContext } from "node:vm";
import { transform } from "esbuild";
import { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES, currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl } from "../../src/current-pcb-209-ratline-pcb-bootstrap-profile.ts";
import { CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES, currentPcb209RatlineBootstrapRoleUrl, qualifyCurrentPcb209RatlineBootstrapUrl } from "../../src/current-pcb-209-ratline-bootstrap-profile.ts";
import type { CurrentPcb209RatlineContinuationSession } from "../../src/current-pcb-209-ratline-continuation-session.ts";
import type { CurrentPcb209RatlineSubordinateContinuation } from "../../src/current-pcb-209-ratline-subordinate-continuation.ts";
import type { CurrentPcb209RatlineBootstrapOwner } from "../../src/current-pcb-209-ratline-bootstrap-owner.ts";
import type { ratlineCaptureInspector } from "./current-pcb-209-ratline-capture-inspector.ts";
import { ratlineCaptureFixtureSource } from "./current-pcb-209-ratline-capture-fixture.ts";
import type { RatlineCaptureFixtureOptions } from "./current-pcb-209-ratline-capture-fixture.ts";

export async function loadRatlineContinuationFixtureModule(path: URL, replacements: ReadonlyMap<string, unknown>): Promise<Record<string, unknown>> {
  const actualRequire = createRequire(path), loaded: { exports: Record<string, unknown> } = { exports: {} };
  const transformed = await transform(await readFile(path, "utf8"), { loader: "ts", format: "cjs", target: "node24" });
  const evaluate: unknown = runInThisContext(`(function(require,module,exports){${transformed.code}\n})`); assert.ok(typeof evaluate === "function");
  Reflect.apply(evaluate, undefined, [(specifier: string): unknown => replacements.get(specifier) ?? actualRequire(specifier) as unknown,
    loaded, loaded.exports]); return loaded.exports;
}
export async function ratlineContinuationModules(): Promise<Readonly<{
  Session: typeof CurrentPcb209RatlineContinuationSession;
  Subordinate: typeof CurrentPcb209RatlineSubordinateContinuation;
  Source: typeof CurrentPcb209RatlineBootstrapOwner;
  inspector: typeof ratlineCaptureInspector;
}>> {
  const modules = new Map<string, unknown>([["./current-pcb-209-ratline-pcb-bootstrap-profile.ts", { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES, currentPcb209RatlinePcbBootstrapCopy, currentPcb209RatlinePcbBootstrapRoleUrl,
    qualifyCurrentPcb209RatlinePcbBootstrapSource: (role: string, raw: unknown): void => { assert.deepEqual(raw, { scriptSource: `synthetic:${role}` }); },
    qualifyCurrentPcb209RatlinePcbBootstrapCopyCreator: (): void => {
      // Synthetic source metadata only; actual context and source order remain.
    },
    qualifyCurrentPcb209RatlinePcbBootstrapCopyPause: (): void => {
      // The dedicated fixed-source suite validates vendor copy excerpts.
    },
  }], ["./current-pcb-209-ratline-bootstrap-profile.ts", { CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES, currentPcb209RatlineBootstrapRoleUrl, qualifyCurrentPcb209RatlineBootstrapUrl,
    qualifyCurrentPcb209RatlineBootstrapSource: (role: string, raw: unknown): void => { assert.deepEqual(raw, { scriptSource: `synthetic:${role}` }); },
  }]]);
  for (const name of ["pcb-bootstrap-owner", "bootstrap-owner", "child-start-gate", "startup-session", "pcb-context-router", "origin", "subordinate-continuation", "continuation-session"]) {
    const file = `current-pcb-209-ratline-${name}.ts`; modules.set(`./${file}`, await loadRatlineContinuationFixtureModule(new URL(`../../src/${file}`, import.meta.url), modules));
  }
  const inspect = await loadRatlineContinuationFixtureModule(new URL("current-pcb-209-ratline-capture-inspector.ts", import.meta.url), new Map([["./current-pcb-209-ratline-capture-fixture.ts", {
    ratlineCaptureFixtureSource: (role: "pcb" | "worker", hold = false, options: RatlineCaptureFixtureOptions = {}): string => {
      const source = ratlineCaptureFixtureSource(role, hold, options); if (role === "pcb") { return source; }
      const after = "return globalThis.fixtureRpc();", before = "return Promise.resolve({message:[]});";
      assert.equal(source.split(before).length, 2); assert.ok(after.length <= before.length);
      // Preserve every excerpt offset while making the synthetic RPC depend on
      // The actual subordinate source continuation observed by the coordinator.
      return source.replace(before, after.padEnd(before.length));
    },
  }]]));
  const session = modules.get("./current-pcb-209-ratline-continuation-session.ts"), source = modules.get("./current-pcb-209-ratline-bootstrap-owner.ts"),
    subordinate = modules.get("./current-pcb-209-ratline-subordinate-continuation.ts");
  assert.ok(source !== null && typeof source === "object" && session !== null && typeof session === "object" && subordinate !== null && typeof subordinate === "object");
  assert.ok("CurrentPcb209RatlineBootstrapOwner" in source && "CurrentPcb209RatlineContinuationSession" in session && "CurrentPcb209RatlineSubordinateContinuation" in subordinate);
  const result = { Source: source.CurrentPcb209RatlineBootstrapOwner, Session: session.CurrentPcb209RatlineContinuationSession,
    Subordinate: subordinate.CurrentPcb209RatlineSubordinateContinuation, inspector: inspect["ratlineCaptureInspector"] };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Exact actual modules above are transformed with only the explicitly labeled source-profile imports replaced.
  return result as Readonly<{
      Session: typeof CurrentPcb209RatlineContinuationSession; Subordinate: typeof CurrentPcb209RatlineSubordinateContinuation;
      Source: typeof CurrentPcb209RatlineBootstrapOwner; inspector: typeof ratlineCaptureInspector;
    }>;
}
