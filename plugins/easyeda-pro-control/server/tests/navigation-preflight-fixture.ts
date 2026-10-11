import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import type { TestContext } from "node:test";
import { runInNewContext } from "node:vm";
import { canonicalJson, extractToolPayload } from "../src/core.ts";
import type { DesignExecutor } from "../src/design-execution.ts";
import { PCB_NAVIGATION_PREFLIGHT_PROFILE, buildPcbNavigationPreferencePreflight } from "../src/pcb-navigation-preflight.ts";
import type { ExpectedContext } from "../src/runtime-scripts.ts";

/** Run the maintained coordinator preflight and generated passive predicate.
 * Only the installed-asset identity and transport/context observations are
 * synthetic. No native asset, user preference or live executor is accessed.
 */
export async function installNavigationPreflight(t: TestContext, executor: DesignExecutor, context: ExpectedContext): Promise<void> {
  const source = await readFile(new URL("../src/design-execution.ts", import.meta.url), "utf8");
  const start = source.indexOf("  private async assertNavigationPreferences(");
  const end = source.indexOf("  /** Execute promises", start);
  assert.ok(start > 0 && end > start);
  type Preflight = (current: ExpectedContext) => Promise<void>;
  let preflight: Preflight | undefined;
  const calls: string[] = [];
  const bindings = {
    register: (value: Preflight): void => { preflight = value; },
    canonicalJson, extractToolPayload, PCB_NAVIGATION_PREFLIGHT_PROFILE, buildPcbNavigationPreferencePreflight,
    verifyLibraryNativeProfile: (assetsRoot: string): Promise<void> => {
      assert.equal(assetsRoot, "/synthetic/navigation-assets"); calls.push("profile"); return Promise.resolve();
    },
    engine: {
      assertBridgeDispatchAllowed: (): Promise<true> => { calls.push("quarantine"); return Promise.resolve(true); },
      assertContext: (current: ExpectedContext): Promise<ExpectedContext> => {
        assert.equal(canonicalJson(current), canonicalJson(context)); calls.push("context"); return Promise.resolve(context);
      },
      upstream: {
        installedEasyedaBundles: (): Promise<{ assetsRoot: string }> => Promise.resolve({ assetsRoot: "/synthetic/navigation-assets" }),
        callTool: async (name: string, args: { code: string; timeoutMs: number; confirmWrite: boolean }, timeout: number): Promise<unknown> => {
          assert.equal(name, "easyeda_execute"); assert.equal(timeout, 25_000);
          assert.equal(canonicalJson(args), canonicalJson({ code: buildPcbNavigationPreferencePreflight(context), timeoutMs: 15_000, confirmWrite: true }));
          calls.push("passive-read");
          const result: unknown = await runInNewContext(`(async()=>{${args.code}})()`, {
            eda: {
              dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
              dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) },
            },
            window: { top: { localStorage: {
              getItem: (key: string): string => { assert.equal(key, "preferences"); calls.push("preference-read"); return '{"pcbCommandTab":true}'; },
              setItem: (): never => assert.fail("Synthetic preflight must not write preferences"),
            } } },
          });
          return { structuredContent: { ok: true, result } };
        },
      },
    },
  };
  runInNewContext(stripTypeScriptTypes(`class Subject {
    constructor(){this.engine=engine;}
    ${source.slice(start, end)}
  }const subject=new Subject();register(subject.assertNavigationPreferences.bind(subject));`), bindings);
  assert.ok(preflight);
  const maintainedPreflight = preflight;
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Replace only this private boundary with its maintained method running on a synthetic engine.
  const seams = executor as unknown as { assertNavigationPreferences: Preflight };
  t.mock.method(seams, "assertNavigationPreferences", async (current: ExpectedContext): Promise<void> => {
    assert.equal(canonicalJson(current), canonicalJson(context)); calls.length = 0;
    await maintainedPreflight(current);
    assert.deepEqual(calls, ["quarantine", "profile", "passive-read", "preference-read", "profile", "context"]);
  });
}
