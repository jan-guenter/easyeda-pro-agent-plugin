/** Fixed post-copy drain/delete syntax under distinct full owner actions. */
import {currentPcbViaSaveDrainWire} from "./current-pcb-via-save-drain-wire.ts";
import {currentPcbViaSaveTailDeleteControlWire} from "./current-pcb-via-save-tail-delete-control-wire.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export function currentFootprintForwardWriterCopyDrainWire(input:unknown,id:number):ReturnType<typeof currentPcbViaSaveDrainWire>{
 const original=currentPcbViaSaveDrainWire(input,id);return freezeDeep({command:original.command,request:{...original.request,action:"footprint-forward-copy-drain"}});
}
export function currentFootprintForwardWriterCopyDeleteWire(input:unknown,id:number):ReturnType<typeof currentPcbViaSaveTailDeleteControlWire>{
 const original=currentPcbViaSaveTailDeleteControlWire(input,id);return freezeDeep({command:original.command,request:{...original.request,action:"footprint-forward-copy-delete"}});
}
