/** Pre-du readonly reproof of the original compressed node. This program
 * neither runs the parser nor grants a continuation. Its caller must still
 * bind the actual held syncMerged frame and exact incoming delta/cache data. */
import { CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS } from "./current-pcb-via-save-programs.ts";
import { CURRENT_PCB_VIA_REPLAY_METHODS } from "./current-pcb-via-replay-source.ts";

export const CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM = `function(original,merged){${CURRENT_PCB_VIA_SAVE_RETAINED_GUARDS}
array(this,6);array(merged,10);const saved=retained(original,"compressed"),p=saved.project,r=saved.r,snapshot=saved.snapshot,pending=own(snapshot,"pending");
if(own(this,"0")!==p||own(this,"1")!==saved.arg||own(this,"2")!==r||own(merged,"0")!==p||own(this,"4")!==own(pending,"maximumTicket")+1)bad();
integer(own(this,"3"),1,8640000000000000);const body=own(this,"5");if(typeof body!=="string"||body.length<1||body.length>16384||!body.isWellFormed())bad();
const methods=${JSON.stringify(Object.values(CURRENT_PCB_VIA_REPLAY_METHODS).map(row => row.source))},names=${JSON.stringify(Object.keys(CURRENT_PCB_VIA_REPLAY_METHODS))};
for(let j=0;j<names.length;j++)if(Function.prototype.toString.call(method(r,names[j]))!==methods[j])bad();
const split=native(own(String.prototype,"split"),"split",2),parse=native(own(JSON,"parse"),"parse",2),parts=Reflect.apply(split,body,["|\\n"]);array(parts,2);
const first=own(parts,"0"),second=own(parts,"1"),a=first.indexOf("||"),b=second.indexOf("||");if(a<=0||b<=0)bad();
const head=plain(Reflect.apply(parse,JSON,[first.slice(0,a)])),doc=plain(Reflect.apply(parse,JSON,[first.slice(a+2)])),via=plain(Reflect.apply(parse,JSON,[second.slice(0,b)]));
if(Reflect.ownKeys(head).length!==2||own(head,"type")!=="DOCHEAD"||own(head,"ticket")!==own(this,"4")||own(doc,"docType")!=="PCB"||own(doc,"uuid")!==own(snapshot,"documentUuid")||own(doc,"client")!==own(pending,"client")||own(doc,"client")!==own(saved.arg,"client")||own(doc,"updateTime")!==own(this,"3")||own(doc,"version")!==String(own(this,"3")))bad();
if(Reflect.ownKeys(via).length!==3||own(via,"type")!=="VIA"||own(via,"id")!==own(pending,"primitiveId")||own(via,"ticket")!==own(pending,"ticket")||optional(via,"pend")!==undefined||optional(via,"client")!==undefined||second.slice(b+2)!==own(pending,"data"))bad();
verify();return true;}`;
