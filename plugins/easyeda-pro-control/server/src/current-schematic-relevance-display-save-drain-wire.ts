/** Distinct seven-record selectors over fixed inert worker codecs. */
import { currentPcbViaSaveTailObservationWire } from "./current-pcb-via-save-tail-observation-wire.ts";
import { currentPcbViaSaveTailExtraObservationWire } from "./current-pcb-via-save-tail-extra-observation-wire.ts";
import { currentPcbViaSaveTailDeleteControlWire } from "./current-pcb-via-save-tail-delete-control-wire.ts";
import { currentPcbViaSaveDrainWire } from "./current-pcb-via-save-drain-wire.ts";
import { currentPcbViaPostHistorySyncWire } from "./current-pcb-via-post-history-sync-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceDisplayTailWire(input:unknown,id:number):ReturnType<typeof currentPcbViaSaveTailObservationWire>{const wire=currentPcbViaSaveTailObservationWire(input,id);return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-tail"}});}
export function currentSchematicRelevanceDisplayTailExtraWire(input:unknown,id:number):ReturnType<typeof currentPcbViaSaveTailExtraObservationWire>{const wire=currentPcbViaSaveTailExtraObservationWire(input,id);return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-tail-extra"}});}
export function currentSchematicRelevanceDisplayTailDeleteWire(input:unknown,id:number):ReturnType<typeof currentPcbViaSaveTailDeleteControlWire>{const wire=currentPcbViaSaveTailDeleteControlWire(input,id);return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-tail-delete"}});}
export function currentSchematicRelevanceDisplayDrainWire(input:unknown,id:number):ReturnType<typeof currentPcbViaSaveDrainWire>{const wire=currentPcbViaSaveDrainWire(input,id);return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-drain"}});}
export function currentSchematicRelevanceDisplayPostSyncWire(input:unknown,id:number):ReturnType<typeof currentPcbViaPostHistorySyncWire>{const wire=currentPcbViaPostHistorySyncWire(input,id);return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-save-post-sync"}});}
