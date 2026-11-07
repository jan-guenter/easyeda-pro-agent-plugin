/** Fixed readonly stages for the original held setter. Each stage's new
 * references require correlated Inspector classification before traversal.
 * No model accessor, history command, listener or event is invoked. */
const header = String.raw`"use strict";const get=native[0],proto=native[2],same=native[3],has=native[4],keys=native[5],apply=native[6],isArray=native[7],bad=()=>{throw "SCH209_COMPLETION_GRAPH";};
const own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},optional=(o,k)=>{const d=get(o,k);if(!d)return undefined;if(!has(d,"value"))bad();return d.value;},dense=(o,n)=>{if(!isArray(o)||own(o,"length")!==n||keys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,i);};
const count=own(qualified,"length");if(count>384)bad();dense(qualified,count);const known=o=>{for(let i=0;i<count;i++)if(own(qualified,i)===o)return;bad();},parent=o=>{known(o);return proto(o);},lookup=(o,k,kind="value")=>{for(let i=0;i<12;i++){if(o===null)return undefined;known(o);const d=get(o,k);if(d){if(kind==="value"?!has(d,"value"):has(d,"value"))bad();return own(d,kind);}o=proto(o);}bad();},method=(o,k,kind="value")=>{const fn=lookup(o,k,kind);if(typeof fn!=="function")bad();return fn;};`;

export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_ROOTS = `function(native,refs,entry,active,module,qualified){${header}
dense(refs,24);dense(entry,13);dense(active,8);dense(module,3);const history=own(active,0),stack=own(active,2),text=own(entry,8),base=own(module,1);known(history);known(stack);known(base);const historyProto=parent(history);known(historyProto);const historyBase=parent(historyProto);known(historyBase);
if(own(own(refs,10),"historyRecorder")!==history||own(history,"shapeManager")!==own(refs,10)||own(history,"batchSaveStack")!==stack||own(own(refs,22),"_currentAction")!==own(entry,10))bad();
return[history,stack,own(base,"prototype"),own(history,"_undoCommands"),own(history,"_redoCommands"),own(history,"_onBatchSaveStackWillRecord"),own(history,"_onWillRecord"),own(history,"_onDidRecord"),own(history,"_onStatusChange"),text,own(own(refs,10),"docManager"),historyProto,historyBase,own(stack,"_commands")];}`;

export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_DETAILS = `function(native,qualified){${header}
dense(this,14);const a=own(this,5),b=own(this,6),c=own(this,7),d=own(this,8);known(a);known(b);known(c);known(d);return[own(a,"_listenerSubscriptions"),own(b,"_listenerSubscriptions"),own(c,"_listenerSubscriptions"),own(d,"_listenerSubscriptions"),own(a,"_options"),own(b,"_options"),own(c,"_options"),own(d,"_options"),optional(a,"_deliveryQueue")??null,optional(b,"_deliveryQueue")??null,optional(c,"_deliveryQueue")??null,optional(d,"_deliveryQueue")??null];}`;

export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SUBSCRIPTIONS = `function(native,qualified){${header}
dense(this,12);const a=own(this,0),b=own(this,1),c=own(this,2),d=own(this,3);known(a);known(b);known(c);known(d);dense(a,1);dense(b,1);dense(c,1);dense(d,3);if(proto(a)!==native[16]||proto(b)!==native[16]||proto(c)!==native[16]||proto(d)!==native[16])bad();return[own(a,0),own(b,0),own(c,0),own(d,0),own(d,1),own(d,2)];}`;

const selection = String.raw`dense(roots,14);dense(details,12);dense(subscriptions,6);dense(entry,13);dense(base,34);dense(queue,18);
const history=own(roots,0),stack=own(roots,1),commandBase=own(roots,2),undo=own(roots,3),redo=own(roots,4),text=own(roots,9),doc=own(roots,10),historyProto=own(roots,11),historyBase=own(roots,12),commands=own(roots,13);
const objects=[history,stack,commandBase,undo,redo,text,doc,historyProto,historyBase,commands,native[15],native[16]];for(let i=0;i<objects.length;i++)known(objects[i]);
if(own(entry,8)!==text||parent(history)!==historyProto||parent(historyProto)!==historyBase||own(history,"batchSaveStack")!==stack||own(stack,"_commands")!==commands||own(history,"_undoCommands")!==undo||own(history,"_redoCommands")!==redo||own(history,"shapeManager")===null||own(history,"belongTabId")!==own(doc,"tabId")||own(history,"_enable")!==true)bad();
dense(undo,0);dense(redo,0);if(proto(undo)!==native[16]||proto(redo)!==native[16]||proto(commands)!==native[18]||keys(commands).length!==0||apply(native[14],commands,[])!==0)bad();const max=own(history,"maxLength");if(typeof max!=="number"||max%1!==0||max<1||max>100000)bad();
const emitters=["_onBatchSaveStackWillRecord","_onWillRecord","_onDidRecord","_onStatusChange"],sizes=[1,1,1,3];let subscriptionAt=0;
for(let i=0;i<4;i++){const emitter=own(roots,5+i),list=own(details,i),options=own(details,4+i),q=own(details,8+i);known(emitter);known(list);known(options);if(own(history,emitters[i])!==emitter||own(emitter,"_size")!==sizes[i]||own(emitter,"_listenerSubscriptions")!==list||own(emitter,"_options")!==options||typeof own(emitter,"_event")!=="function"||method(emitter,"dispatch")!==own(base,12)||method(emitter,"_deliver")!==own(base,13)||method(emitter,"_deliverQueue")!==own(queue,0))bad();
dense(list,sizes[i]);if(proto(list)!==native[16])bad();for(let j=0;j<sizes[i];j++){const sub=own(subscriptions,subscriptionAt++);known(sub);if(own(list,j)!==sub||typeof own(sub,"cb")!=="function"||typeof own(sub,"dispose")!=="function")bad();}
const hooks=["onBeforeAdd","onAdd","onBeforeRemove","onRemove"];for(let j=0;j<4;j++)if(lookup(options,hooks[j])!==undefined)bad();
if(q===null){if(lookup(emitter,"_deliveryQueue")!==undefined)bad();}else{known(q);if(own(emitter,"_deliveryQueue")!==q||method(q,"constructor")!==own(base,30)||method(q,"enqueue")!==own(queue,2)||method(q,"dispose")!==own(queue,3)||lookup(q,"current")!==undefined||lookup(q,"args")!==undefined)bad();const index=own(q,"index"),end=own(q,"end");if(!(index===-1&&end===0||typeof index==="number"&&typeof end==="number"&&index%1===0&&index===end&&end>=0&&end<=64))bad();}}
for(let i=0;i<6;i++)for(let j=0;j<i;j++)if(own(subscriptions,i)===own(subscriptions,j))bad();
const functions=[method(commandBase,"canRecord","get"),method(history,"_record"),method(history,"clearRecordsCore"),method(history,"status","get"),method(historyBase,"canRedo","get"),method(historyBase,"canUndo","get"),method(historyProto,"canRedo","get"),method(historyProto,"canUndo","get"),method(stack,"forEach"),method(stack,"remove"),method(stack,"size","get"),own(own(subscriptions,0),"cb"),own(own(subscriptions,1),"cb"),own(own(subscriptions,2),"cb"),own(own(subscriptions,3),"cb"),own(own(subscriptions,4),"cb"),own(own(subscriptions,5),"cb"),method(text,"x","get"),method(text,"y","get"),method(text,"rotation","get"),method(text,"hAlign","get"),method(text,"vAlign","get"),method(native[16],"at"),method(native[16],"shift")];
for(let i=0;i<functions.length;i++)if(typeof functions[i]!=="function")bad();`;

export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_FUNCTIONS = `function(native,roots,details,subscriptions,entry,base,queue,qualified){${header}${selection}return functions;}`;
export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SAME = `function(native,roots,details,subscriptions,entry,base,queue,qualified,x,y,rotation,hAlign,vAlign){${header}${selection}dense(this,24);const position=[x,y,rotation,hAlign,vAlign];for(let i=0;i<24;i++)if(own(this,i)!==functions[i])bad();for(let i=0;i<5;i++)if(own(this,17+i)!==own(position,i))bad();return true;}`;

/** Shared complete descriptor rows allow the later exact one-field delta to
 * retain this original pre-write snapshot without weakening its SAME proof. */
export { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT as CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SNAPSHOT, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT_SAME as CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_SNAPSHOT_SAME } from "./current-schematic-relevance-publication-snapshot-programs.ts";

/** Four graph stages, twelve layers with six tuple commands per layer plus
 * two terminal reads, at most384 distinct metadata classifications, one
 * complete source, four tuple reads, twenty-four function replies and five final snapshot/descriptor proofs. */
export const CURRENT_SCHEMATIC_RELEVANCE_COMPLETION_READ_BOUND = 4 * (12 * 6 + 2) + 384 + 1 + 4 * 2 + 24 + 5;
