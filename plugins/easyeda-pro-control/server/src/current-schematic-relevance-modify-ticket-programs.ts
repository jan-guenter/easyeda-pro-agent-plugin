/** Passive ticket-timer recipes. No program calls a timer/native application
 * method, writes PROJECT or creates a cancellation/worker/Save issuer. */
import { CURRENT_NATIVE_OWN_DATA_CHECK as CHECK } from "./current-native-own-data-intrinsics.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as WORKER } from "./current-schematic-relevance-modify-worker-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const head = `"use strict";${CHECK}const own=value,known=o=>{if(o===null)return;const n=own(qualified,"length");dense(qualified,n);for(let i=0;i<n;i++)if(own(qualified,""+i)===o)return;bad();};`;
const methods = `function(project,qualified){${head}known(project);const lg=proto(project);known(lg);if(get(project,"localPublishTicket")!==undefined||get(project,"canWsPublish")!==undefined)bad();const local=get(lg,"localPublishTicket"),ws=get(lg,"canWsPublish");if(!local||!has(local,"value")||!ws||!has(ws,"value"))bad();return[lg,local.value,ws.value];}`;
const natives = `function(qualified){${head}for(let owner=root,depth=0;owner!==null&&depth<12;owner=proto(owner),depth++){known(owner);const set=get(owner,"setTimeout");if(set){const clear=get(owner,"clearTimeout");if(!has(set,"value")||!clear||!has(clear,"value"))bad();return[owner,set.value,clear.value];}}bad();}`;
const methodCheck = `known(project);dense(methods,3);const lg=own(methods,"0"),local=own(methods,"1"),ws=own(methods,"2");known(lg);known(local);known(ws);if(proto(project)!==lg||own(root,"PROJECT")!==project||get(project,"localPublishTicket")!==undefined||get(project,"canWsPublish")!==undefined)bad();const a=get(lg,"localPublishTicket"),b=get(lg,"canWsPublish");if(!a||!has(a,"value")||a.value!==local||!b||!has(b,"value")||b.value!==ws)bad();for(let i=1;i<3;i++){const fn=own(methods,""+i);if(typeof fn!=="function"||proto(fn)!==functionProto||get(fn,"apply")!==undefined)bad();}`;
const nativeCheck = `dense(natives,3);const owner=own(natives,"0"),set=own(natives,"1"),clear=own(natives,"2");known(owner);known(set);known(clear);let selected=null;for(let at=root,depth=0;at!==null&&depth<12;at=proto(at),depth++){known(at);const d=get(at,"setTimeout");if(d){selected=at;break;}}if(selected!==owner)bad();const sd=get(owner,"setTimeout"),cd=get(owner,"clearTimeout");if(!sd||!has(sd,"value")||sd.value!==set||!cd||!has(cd,"value")||cd.value!==clear)bad();for(let i=1;i<3;i++){const fn=own(natives,""+i);if(typeof fn!=="function"||proto(fn)!==functionProto||get(fn,"apply")!==undefined)bad();}`;
const nativeProof = `function(natives,qualified){${head}${nativeCheck}return true;}`;
const before = `function(frame,project,methods,natives,qualified){${head}${methodCheck}${nativeCheck}dense(frame,2);const timer=get(project,"publishTimer");if(own(frame,"0")!==project||own(frame,"1")!==undefined||own(project,"isReady")!==true||!timer||!has(timer,"value")||timer.value!==null||!timer.writable)bad();return true;}`;
const websocketExcluded = `function(frame,project,methods,qualified){${head}${methodCheck}dense(frame,2);if(own(frame,"0")!==project||own(frame,"1")!==false)bad();return true;}`;
/** Refuse an unexpected shared comparator shape before deriving a fixed recipe. */
function replace(input: string, from: string, to: string): string {
  if (input.split(from).length !== 2) { throw new Error("SCH_MODIFY_TICKET_FIXED_DELTA"); }
  return input.replace(from, to);
}
/** Derive two separate fixed one-field recipes from the existing complete
 * descriptor comparator. The shared SAME remains immutable and still rejects
 * either timer delta; neither recipe invokes clearTimeout or proves it ran. */
function delta(stage: "introduced" | "cleared"): string {
  let source = replace(WORKER.same, "function(snapshot,qualified){", "function(snapshot,qualified,project){");
  source = replace(source, "dense(snapshot,n);const same=", 'dense(snapshot,n);known(project);if(own(root,"PROJECT")!==project)bad();let changed=0,timer=null;const same=');
  const selected = stage === "introduced" ? 'if(own(d,"value")!==null)bad();timer=own(now,"value");' : 'if(own(now,"value")!==null)bad();timer=own(d,"value");';
  source = replace(source, 'if(a[m]!==b[m]||!same(own(d,a[m]),own(now,a[m])))bad();',
    `{if(a[m]!==b[m])bad();if(o===project&&k[j]==="publishTimer"&&a[m]==="value"){${selected}if(typeof timer!=="number"||timer<=0||timer>2147483647||timer%1!==0)bad();changed++;}else if(!same(own(d,a[m]),own(now,a[m])))bad();}`);
  return replace(source, "return true;}", "if(changed!==1)bad();return timer;}");
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_PROGRAMS = freezeDeep({ methods, natives, nativeProof, before, websocketExcluded,
  introduced: delta("introduced"), cleared: delta("cleared"), snapshot: WORKER.snapshot, same: WORKER.same, reprove: WORKER.reprove } as const);
