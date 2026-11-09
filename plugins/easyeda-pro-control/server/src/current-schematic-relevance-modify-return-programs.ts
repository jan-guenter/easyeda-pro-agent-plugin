/** Exact passive CM/ticket/enclosing-return recipes. Only the separately
 * fixed cancellation program may call a native timer; these helpers read data. */
import { CURRENT_NATIVE_OWN_DATA_CHECK as CHECK } from "./current-native-own-data-intrinsics.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_PROGRAMS as TICKET } from "./current-schematic-relevance-modify-ticket-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as WORKER } from "./current-schematic-relevance-modify-worker-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_PROGRAMS as CM } from "./current-schematic-relevance-modify-cm-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_PROGRAMS as EVENT } from "./current-schematic-relevance-modify-event-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const head = `"use strict";${CHECK}const own=value,known=o=>{if(o===null)return;const n=own(qualified,"length");dense(qualified,n);if(n>256)bad();for(let i=0;i<n;i++)if(own(qualified,""+i)===o)return;bad();};`;
const tuple = `function(frame,original){"use strict";${CHECK}const n=value(original,"length");if(n!==2&&n!==14&&n!==18)bad();dense(original,n);dense(frame,n);for(let i=0;i<n;i++)if(value(frame,""+i)!==value(original,""+i))bad();return true;}`;
const project = `function(roots,qualified){${head}dense(roots,14);const p=own(roots,"0");known(p);if(own(root,"PROJECT")!==p)bad();return[p];}`;
const timerEntry = `function(frame,roots,created,parts,qualified){${head}dense(frame,3);dense(roots,14);dense(created,3);dense(parts,14);const sheet=own(roots,"1"),resolver=own(created,"0"),promise=own(created,"1");known(sheet);known(resolver);known(promise);if(own(frame,"0")!==sheet||own(frame,"1")!==resolver||own(frame,"2")!==promise||typeof resolver!=="function"||proto(resolver)!==functionProto||proto(promise)!==own(parts,"0")||count(promise)!==0)bad();const timer=own(sheet,"canvasTimer");if(typeof timer!=="number"||timer<=0||timer>2147483647||timer%1!==0)bad();return true;}`;
/** Retain the unchanged descriptor comparator except for the source's one
 * new own row.length=0. All unknown strings/Symbols keep their exact order,
 * descriptors and prototypes; this never relaxes the generic SAME reader. */
function parentDelta(): string {
 const signature = "function(snapshot,qualified){";
 const anchor = 'dense(snapshot,n);const same=';
 const selected = 'const o=own(row,"0"),before=own(row,"2"),k=keys(o);';
 if (!WORKER.same.startsWith(signature) || WORKER.same.split(anchor).length !== 2 || WORKER.same.split(selected).length !== 2 || !WORKER.same.endsWith("return true;}")) { throw new Error("SCH_MODIFY_PARENT_DELTA_ANCHOR"); }
 const binding = 'dense(read,2);dense(frame,14);const envelope=own(read,"1");known(envelope);const message=own(envelope,"message");known(message);dense(message,4);const cache=own(message,"0");known(cache);const target=own(cache,own(frame,"1"));known(target);let changed=0;';
 const projection = 'const o=own(row,"0"),before=own(row,"2"),all=keys(o),k=[];for(let j=0;j<all.length;j++){const key=all[j];if(o===target&&key==="length"){const d=get(o,key);if(!d||!has(d,"value")||d.value!==0||!d.writable||!d.enumerable||!d.configurable||keys(d).length!==4)bad();changed++;}else{const index=""+k.length;if(get(arrayProto,index)!==undefined||get(objectProto,index)!==undefined)bad();k[k.length]=key;}}';
 const result = WORKER.same.replace(signature, "function(snapshot,qualified,read,frame){").replace(anchor, `dense(snapshot,n);${binding}const same=`).replace(selected, projection).slice(0, -"return true;}".length);
 return `${result}if(changed!==1)bad();return true;}`;
}
/** The batch creates one own length field. Reject inherited setters,
 * inherited readonly data and a nonextensible original row before that body. */
function parentBefore():string{
 const signature="function(snapshot,qualified){";const ending="return true;}";if(!WORKER.same.startsWith(signature)||!WORKER.same.endsWith(ending)){throw new Error("SCH_MODIFY_PARENT_BEFORE_DERIVATION");}
 const prefix=WORKER.same.slice(signature.length,-ending.length);
 return `function(snapshot,qualified,read,frame,native){${prefix}dense(read,2);dense(frame,14);dense(native,18);const envelope=own(read,"1");known(envelope);const message=own(envelope,"message");known(message);dense(message,4);const cache=own(message,"0");known(cache);const target=own(cache,own(frame,"1"));known(target);if(get(target,"length")!==undefined)bad();for(let p=proto(target),depth=0;p!==null;p=proto(p),depth++){if(depth===12)bad();known(p);const d=get(p,"length");if(d&&(!has(d,"value")||d.writable!==true))bad();}const extensible=own(native,"15");known(extensible);if(typeof extensible!=="function"||proto(extensible)!==functionProto||get(extensible,"apply")!==undefined||invoke(extensible,undefined,[target])!==true)bad();return true;}`;
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_PROGRAMS = freezeDeep({
 tuple, project, timerEntry, collectionSame: CM.collectionSame, parentDelta: parentDelta(), parentBefore:parentBefore(), methods: TICKET.methods, natives: TICKET.natives, nativeProof: TICKET.nativeProof, ticketBefore: TICKET.before, ticketIntroduced: TICKET.introduced, ticketCleared: TICKET.cleared, websocketExcluded: TICKET.websocketExcluded,
 eventRead: EVENT.read, eventSame: EVENT.sameRead, snapshot: WORKER.snapshot, same: WORKER.same,
} as const);
