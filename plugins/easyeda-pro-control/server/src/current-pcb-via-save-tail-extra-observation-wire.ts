/** The extra three Via cache jobs reuse the exact shared immutable encoder and get separate readonly counters. */
import { currentProjectSaveProducerNativeCases,validateCurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import type { CurrentProjectSaveProducerCommand } from "./current-project-save-producer-protocol.ts";
import { currentProjectSaveProducerTemplate,currentProjectSaveProducerWire } from "./current-project-save-producer-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_VIA_SAVE_TAIL_EXTRA_OBSERVATION_REQUESTS=Object.freeze({jobs:3,entryPerJob:6,promisePerJob:5,successPerJob:3,cdpRequests:42});
function allowed(command:CurrentProjectSaveProducerCommand):boolean {
  if(command.phase==="project-save-producer-frame"||command.phase==="project-save-producer-receiver"){return command.role==="headEntry"||command.role==="headPromise"||command.role==="headSuccess";}
  if(command.phase==="project-save-producer-cache-caller"||command.phase==="project-save-producer-cache-receiver"){return command.cacheRole==="localSave"||command.cacheRole==="flow"||command.cacheRole==="syncHead";}
  return command.phase==="project-save-producer-properties"||command.phase==="project-save-producer-cache-properties"||command.phase==="project-save-producer-cache-promise"||command.phase==="project-save-producer-cache-promise-properties";
}
export function currentPcbViaSaveTailExtraObservationWire(input:unknown,id:number):ReturnType<typeof currentProjectSaveProducerWire>{const command=validateCurrentProjectSaveProducerCommand(input);if(!allowed(command)){throw new Error("VIA_TAIL_FIXED_EXTRA_OBSERVATION");}const old=currentProjectSaveProducerWire(command,id,"via");return freezeDeep({command,request:{...old.request,action:"pcb-via-tail-extra-observe"}});}
export function currentPcbViaSaveTailExtraObservationNativePhases():readonly string[]{return freezeDeep(currentProjectSaveProducerNativeCases().filter(command=>allowed(command)).map(command=>currentProjectSaveProducerTemplate(command).phase));}
