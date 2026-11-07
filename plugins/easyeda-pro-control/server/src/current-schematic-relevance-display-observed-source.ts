/** Same fixed getScriptSource syntax; only the seven-record native sender can
 * choose its original worker session and charge this separate source budget. */
import { currentPcbViaObservedSourceWire } from "./current-pcb-via-observed-source-protocol.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export function currentSchematicRelevanceDisplayObservedSourceWire(input:unknown,id:number):ReturnType<typeof currentPcbViaObservedSourceWire>{const wire=currentPcbViaObservedSourceWire(input,id);return freezeDeep({...wire,request:{...wire.request,action:"schematic-relevance-display-observed-source"}});}
