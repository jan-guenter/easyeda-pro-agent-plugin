/** Passive native DEL publication roster. The pure full timer recipes supply
 * descriptor algorithms only; its original owner, clocks and origins never enter
 * this family. The original inverse Core must provide all four retained handles. */
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as TIMER,qualifyCurrentFootprintForwardWriterTicketTimerBindingSource} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
import {CURRENT_NATIVE_OWN_DATA_CHECK as CHECK} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_HELPERS as SERIAL} from "./current-footprint-inverse-v4-native-delete-serialization-programs.ts";
import {CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES as DEPENDENCIES} from "./current-footprint-copy-dependency-profiles.ts";
import {CURRENT_FOOTPRINT_COPY_DESTINATION_PROFILES as DESTINATIONS} from "./current-footprint-copy-destination-profiles.ts";
import {qualifyCurrentFootprintForwardWriterStartupNonprivateSource} from "./current-footprint-forward-writer-startup-nonprivate-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

function once(input:string,before:string,after:string):string{if(input.split(before).length!==2){throw new Error("INVERSE_NATIVE_DELETE_PUBLICATION_PREIMAGE");}return input.replace(before,after);}
let capture=once(TIMER.capture,"function(project,dependencies,destinations)","function(project,wrapper,callback)");
const before=`const fp=parent(footprint),ar=parent(fp),gd=parent(lg);dense(dependencies,${String(DEPENDENCIES.length+9)});dense(destinations,43);
for(const[key,index]of[["publishMaxTicket",0],["canWsPublish",2]]){absent(project,key);if(own(lg,key)!==own(destinations,""+index))bad();}
absent(project,"onHeadChange");if(own(lg,"onHeadChange")!==own(dependencies,"39"))bad();
absent(footprint,"onDataChange");if(own(fp,"onDataChange")!==own(dependencies,"${String(DEPENDENCIES.length-3)}")||own(project,"uploadStructure")!==own(dependencies,"${String(DEPENDENCIES.length-1)}"))bad();`;
capture=once(capture,before,`const fp=parent(footprint),ar=parent(fp),gd=parent(lg);
if(own(project,"uploadStructure")!==wrapper||typeof callback!=="function"||own(project,"isReady")!==true||value(project,"publishTimer")!==null)bad();
for(const key of["publishMaxTicket","canWsPublish","onHeadChange"]){absent(project,key);own(lg,key);}absent(footprint,"onDataChange");own(fp,"onDataChange");`);
export {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_GUARD_SOURCE as CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_GUARD,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_NATIVE_METADATA as CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_NATIVE_METADATA,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_METHOD_METADATA as CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_METHOD_METADATA} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
const head=DEPENDENCIES[39];const change=DEPENDENCIES.at(-3);const maximum=DESTINATIONS[0];const canPublish=DESTINATIONS[2];
if(head?.name!=="onHeadChange"||change?.name!=="onDataChange"||maximum?.name!=="publishMaxTicket"||canPublish?.name!=="canWsPublish"){throw new Error("INVERSE_NATIVE_DELETE_PUBLICATION_METHOD_ROSTER");}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_EXTRA_METADATA=freezeDeep([head,change,maximum,canPublish].map((row,index)=>({slot:index,name:row.name,arity:row.arity,async:row.async,regular:false,lineNumber:row.lineNumber,columnNumber:row.columnNumber,sourceBytes:row.bytes,sourceSha256:row.sha256})));
const readSerial=`function(bundle){${SERIAL}const selectedState=selected(bundle,1,2);verify();return[selectedState.project,selectedState.consistency,selectedState.e,selectedState.texts];}`;
const extra=`function(capture,bundle,wrapper,callback){${CHECK}dense(capture,49);
const guard=value(capture,"48");if(invoke(guard,root,[])!==true)bad();const original=invoke((${readSerial}),root,[bundle]);dense(original,4);const project=value(original,"0"),manager=value(original,"1"),expectation=value(original,"2"),texts=value(original,"3");dense(texts,3);
if(value(capture,"0")!==project||value(capture,"1")!==manager||value(project,"uploadStructure")!==wrapper||typeof callback!=="function"||value(manager,"maxTicket")!==value(expectation,"maximumTicket")+1)bad();
const lg=proto(project),fp=proto(value(capture,"40"));return[value(lg,"onHeadChange"),value(fp,"onDataChange"),value(lg,"publishMaxTicket"),value(lg,"canWsPublish"),project,wrapper,callback,value(expectation,"maximumTicket")+1,value(expectation,"targetUuid"),value(texts,"2")];}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_BINDING_PROGRAMS=freezeDeep({capture,extra});
export function qualifyCurrentFootprintInverseNativeDeletePublicationBindingSource(source:string):void{
 qualifyCurrentFootprintForwardWriterTicketTimerBindingSource(source);qualifyCurrentFootprintForwardWriterStartupNonprivateSource(source);
}
