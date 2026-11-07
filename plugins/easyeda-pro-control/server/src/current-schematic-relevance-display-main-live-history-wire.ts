/** The unchanged thirteen readonly messages acquire only an own7 sender. */
import { currentPcbViaMainLiveHistoryWire } from "./current-pcb-via-main-live-history-wire.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceDisplayMainLiveHistoryWire(command:unknown,id:number):ReturnType<typeof currentPcbViaMainLiveHistoryWire>{const fixed=currentPcbViaMainLiveHistoryWire(command,id);return freezeDeep({...fixed,action:"schematic-relevance-display-main-live-history"});}
