/** Same fixed readonly observation rows, distinct complete-owner action. */
import {currentPcbViaSaveTailObservationWire} from "./current-pcb-via-save-tail-observation-wire.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export function currentFootprintForwardWriterCopyTailObservationWire(input:unknown,id:number):ReturnType<typeof currentPcbViaSaveTailObservationWire>{
 const original=currentPcbViaSaveTailObservationWire(input,id);
 return freezeDeep({command:original.command,request:{...original.request,action:"footprint-forward-copy-tail-observe"}});
}
