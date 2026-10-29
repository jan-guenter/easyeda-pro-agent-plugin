/** A separate preparation launch. These counts cover observation and binding,
 * not native create, clocks, Save, or saved-generation verification. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

const actor = 35, bindings = 97, cleanup = 34, dependencies = 101, managerRoute = 57, startup = 224, uiObserve = 35, uiReprove = 17;
export const CURRENT_FOOTPRINT_COPY_PREPARATION_PROFILE = freezeDeep({
  purpose: "worker-startup-footprint209",
  normalRequestLimit: startup + actor + bindings + uiObserve + uiReprove + dependencies + managerRoute,
  requestLimit: startup + actor + bindings + uiObserve + uiReprove + dependencies + managerRoute + cleanup,
  // UI observation25 plus two parent/ancillary sweeps8 and original worker
  // Identity checks2; one reproof7 with the same10 bracketing requests. One
  // Separate UI and manager groups extend cleanup32 to34. Manager observation30
  // And reproof7 each add the same10 bracketing requests.
  requests: { startup, actor, bindings, uiObserve, uiReprove, dependencies, managerRoute, cleanup },
  stateSampleLimit: 18,
  normalMilliseconds: 60 * 60 * 1000,
  cleanupMilliseconds: 60 * 1000,
  // The existing cumulative byte/event ceilings remain availability caps.
  // More requests do not allocate a fresh stream budget at each stage.
  bytes: 64 * 1024 * 1024,
  executionAuthorized: false,
  saveAuthorized: false,
} as const);
