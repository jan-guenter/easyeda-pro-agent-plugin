/** First-birth/channel bounds only. Prewrite qualification already consumes
 * this schedule; complete writer/main/saved counters require a separate full
 * derivation before mounting. No legacy purpose receives a larger allowance. */
import { CURRENT_FOOTPRINT_COPY_FORWARD_PROFILE as OBSERVATION,
  CURRENT_FOOTPRINT_COPY_FORWARD_RENDERER_PROFILE as RENDERER } from "./current-footprint-copy-forward-profile.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE } from "./current-footprint-forward-execution-contract.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_FORWARD_EXECUTION_CAPACITY as CAPACITY } from "./current-footprint-copy-forward-capacity.ts";

const renderer = freezeDeep({ ...OBSERVATION.renderer,
  normalRequestLimit: CAPACITY.writer.renderer.requestLimit, requestLimit: CAPACITY.writer.renderer.requestLimit,
  normalClassLimit: CAPACITY.writer.renderer.normalClassLimit, cleanupClassLimit: CAPACITY.writer.renderer.cleanupClassLimit,
  requests: { cleanup: CAPACITY.writer.renderer.cleanupClassLimit } });

export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_BIRTH_PROFILE = freezeDeep({
  purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE,
  nativeSwitch: "-WorkerStartupFootprintForwardExecution209",
  renderer,
  main: OBSERVATION.main,
  controls: CAPACITY.controls.writer,
  normalMilliseconds: OBSERVATION.normalMilliseconds,
  cleanupMilliseconds: OBSERVATION.cleanupMilliseconds,
  wholeWriterReserved: false,
  executionAuthorized: false,
} as const);
export const CURRENT_FOOTPRINT_FORWARD_EXECUTION_RENDERER_PROFILE = freezeDeep({
  ...RENDERER,
  ...renderer,
  purpose: CURRENT_FOOTPRINT_FORWARD_EXECUTION_PURPOSE,
  wholeWriterReserved: false,
} as const);
