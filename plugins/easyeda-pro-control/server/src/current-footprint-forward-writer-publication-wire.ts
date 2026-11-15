/** Scalar-only ready callback/serial commands; no program enters native input. */
import {currentFootprintForwardWriterPublicationTemplate,validateCurrentFootprintForwardWriterPublicationCommand} from "./current-footprint-forward-writer-publication-protocol.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export function currentFootprintForwardWriterPublicationWire(input:unknown,id:number):Readonly<{
 command:ReturnType<typeof validateCurrentFootprintForwardWriterPublicationCommand>["command"];
 request:Readonly<Record<string,string|number>>;
}>{
 if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("FORWARD_PUBLICATION_REQUEST_ID");}
 const value=validateCurrentFootprintForwardWriterPublicationCommand(input);const row=currentFootprintForwardWriterPublicationTemplate(value);
 return freezeDeep({command:value.command,request:{action:"footprint-forward-copy-publication",requestId:id,lane:value.lane,phase:row.phase,method:row.method,...row.values}});
}
