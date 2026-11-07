/** A fresh ordinary workflow keeps its own permanent validator binding.
 * Construction grants no capture, process ownership or bridge admission. */
import { EasyedaControlEngine } from "./engine.ts";
import type { UpstreamClient } from "./engine.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { createWindowsRuntimeValidator } from "./windows-runtime-validator.ts";

/** The index supplies its exact already-owned runtime and scope check. Never
 * rebind an earlier engine or let historical captures select a new runtime. */
export function createOriginalWindowsRuntimeEngine(upstream: UpstreamClient, runtime: WindowsControlRuntime, assertOriginalOwner: () => void): EasyedaControlEngine {
  return new EasyedaControlEngine(upstream, { executionAuthorityValidator: createWindowsRuntimeValidator(() => {
    assertOriginalOwner(); return runtime;
  }) });
}
