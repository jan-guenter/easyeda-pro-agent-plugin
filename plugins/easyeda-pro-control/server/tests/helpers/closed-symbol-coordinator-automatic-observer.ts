/** Test-only transparent pause after the real original-bound selector settles. */
import assert from "node:assert/strict";
import { selectOriginalBaselineHead as original } from "../../src/closed-symbol-head-selector.ts";

interface Pause {
  readonly reached: ReturnType<typeof Promise.withResolvers<Readonly<{ selected: Awaited<ReturnType<typeof original>>; inputs: Parameters<typeof original> }>>>;
  readonly release: { promise: Promise<void>; resolve: () => void };
}
let pending: Pause | undefined;
let calls = 0;
export function selectionCalls(): number { return calls; }
export function pauseNextSelection(): Readonly<{ reached: Pause["reached"]["promise"]; resume: () => void }> {
  assert.equal(pending, undefined);
  const pause: Pause = { reached: Promise.withResolvers(), release: Promise.withResolvers() };
  pending = pause;
  return Object.freeze({ reached: pause.reached.promise, resume: (): void => { if (pending === pause) { pending = undefined; } pause.release.resolve(); } });
}
/** Test-owned deadline and pending rejection observation; no production timing changes. */
export async function waitForSelection(pause: ReturnType<typeof pauseNextSelection>, running: Promise<unknown>): Pause["reached"]["promise"] {
  const deadline = Promise.withResolvers<never>();
  const timer = setTimeout(() => { deadline.reject(new Error("Synthetic selector was not reached within 120 seconds")); }, 120_000);
  const settled = (async (): Promise<never> => { await running; throw new Error("Synthetic full attempt settled before the selector pause"); })();
  try { return await Promise.race([pause.reached, settled, deadline.promise]); }
  finally { clearTimeout(timer); }
}
export async function selectOriginalBaselineHead(...args: Parameters<typeof original>): ReturnType<typeof original> {
  calls += 1;
  const pause = pending; pending = undefined;
  try {
    const selected = await original(...args);
    if (pause !== undefined) { pause.reached.resolve(Object.freeze({ selected, inputs: args })); await pause.release.promise; }
    return selected;
  } catch (error) { pause?.reached.reject(error); throw error; }
}
