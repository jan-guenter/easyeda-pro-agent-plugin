/** First-birth/channel bounds only. Prewrite qualification already consumes
 * this schedule; complete writer/main/saved counters require a separate full
 * derivation before mounting. No legacy purpose receives a larger allowance. */
import { CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE as OBSERVATION,
  CURRENT_FOOTPRINT_COPY_FORWARD_RENDERER_PROFILE as RENDERER } from "./current-footprint-copy-forward-profile.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE } from "./current-footprint-forward-execution-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_BIRTH_PROFILE = freezeDeep({
  purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE,
  nativeSwitch: "-WorkerStartupFootprintForwardExecution209",
  renderer: OBSERVATION.renderer,
  main: OBSERVATION.main,
  controls: OBSERVATION.controls,
  normalMilliseconds: OBSERVATION.normalMilliseconds,
  cleanupMilliseconds: OBSERVATION.cleanupMilliseconds,
  wholeWriterReserved: false,
  executionAuthorized: false,
} as const);
export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_RENDERER_PROFILE = freezeDeep({
  ...RENDERER,
  purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE,
  wholeWriterReserved: false,
} as const);
