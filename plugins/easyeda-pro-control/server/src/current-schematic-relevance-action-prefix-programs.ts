/** Fixed staged projections for one still-held original run. The owner must
 * qualify every input object/prototype from correlated native metadata before
 * these programs inspect it. No action, event, getter or callback is invoked. */
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_PREFIX_ROLES as ROLES } from "./current-schematic-relevance-action-prefix-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_RUN_EXPRESSIONS = Object.freeze([
  "[this,t,r,fre,qm,xDe,Bt,bO,ZH,sre,eC,nC,wB,Fl]",
  "[this,t,r,Rae,sm,l4e,Bt,PO,oz,Eae,AC,LC,IL,Zl]",
] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_GROUP_EXPRESSIONS = Object.freeze(["[wJ]", "[qJ]"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_RUN_FUNCTION_SLOTS = Object.freeze({ trace: 3, traceMap: 4, optionsHistory: 5, optionsNull: 6, asyncHelper: 7, asyncPredicate: 8, asyncType: 9 } as const);

/** Run14 is tied to the separately retained original entry3 by JS identity.
 * Symbols and the native toString alias remain opaque until qualified. */
export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_RUN_PROOF = String.raw`function(native,entry,refs){"use strict";
const get=native[0],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_RUN_MODULE";},own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;},dense=(o,n)=>{if(!isArray(o)||own(o,"length")!==n||keys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,i);};
dense(this,14);dense(entry,3);dense(refs,24);for(let i=0;i<3;i++)if(own(this,i)!==own(entry,i))bad();if(own(this,0)!==own(refs,22)||typeof own(this,11)!=="symbol"||typeof own(this,12)!=="symbol"||own(this,11)===own(this,12)||own(this,13)!=="parent")bad();for(let i=3;i<=10;i++)if(typeof own(this,i)!=="function")bad();const original=get(native[15],"toString");if(!original||!has(original,"value")||original.value!==own(this,10))bad();return true;}`;

/** All prototype owners followed by lookup must be in qualified, a bounded
 * tuple of actual non-Proxy references from the original staged graph/layers.
 * A newly found function is returned for native metadata, never inspected.
 * iteratorKey is the separately qualified original Symbol.iterator. */
const header = String.raw`"use strict";
const get=native[0],proto=native[2],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_PREFIX_FUNCTIONS";};
const own=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value"))bad();return d.value;};
const dense=(o,n)=>{if(!isArray(o)||own(o,"length")!==n||keys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,i);};
if(!isArray(qualified))bad();const count=own(qualified,"length");if(count<20||count>512)bad();dense(qualified,count);
const allowed=o=>{for(let i=0;i<count;i++)if(own(qualified,i)===o)return true;return false;};
const read=(o,k,kind="value")=>{if(!allowed(o))bad();const d=get(o,k);if(!d)bad();if(kind==="value"?!has(d,"value"):has(d,"value"))bad();const value=own(d,kind);if(typeof value!=="function")bad();return value;};
const find=(o,k,kind="value")=>{for(let i=0;o!==null&&i<12;i++){if(!allowed(o))bad();const d=get(o,k);if(d)return[o,read(o,k,kind)];o=proto(o);}bad();};
const method=(o,k,kind="value")=>find(o,k,kind)[1],parent=o=>{if(!allowed(o))bad();const p=proto(o);if(!allowed(p))bad();return p;},ctor=o=>read(parent(o),"constructor");
dense(run,14);dense(refs,24);dense(roots,9);dense(events,9);dense(details,7);dense(subscriptions,4);dense(module,4);
const runner=own(refs,22),shapes=own(refs,10),page=own(refs,9),will=own(roots,0),history=own(roots,1),doc=own(roots,2),container=own(roots,3),pause=own(roots,7),start=own(events,0),store=own(events,2),startQueue=own(details,4);
if(own(run,0)!==runner||own(module,0)===undefined||typeof own(module,0)!=="function"||typeof own(module,1)!=="function"||own(module,2)!==own(run,11)||own(module,3)!==own(run,12)||typeof groupConstructor!=="function"||typeof iteratorKey!=="symbol")bad();
if(!allowed(channel)||own(pause,"consistencyChannel")!==channel||own(history,"shapeManager")!==shapes)bad();
const willProto=parent(will),channelProto=parent(channel),runnerProto=parent(runner),shapeWill=find(shapes,"onWillTransact");
const values={runnerStartTimer:method(runner,"_startAutoCancelActionTimer"),runnerIsLocal:method(runner,"isRunningLocalAction"),pauseConstructor:ctor(pause),pauseTry:method(pause,"tryPause"),channelConstructor:ctor(channel),channelPause:method(channel,"pause"),channelBaseConstructor:read(parent(channelProto),"constructor"),channelBasePause:method(parent(channelProto),"pause"),containerConstructor:ctor(container),containerIterator:method(container,iteratorKey),eventConstructor:ctor(will),eventBaseConstructor:read(parent(willProto),"constructor"),eventDispatch:method(will,"dispatch"),eventDeliver:method(will,"_deliver"),eventSubscribe:method(will,"event","get"),disposableRegister:method(store,"register"),shapeWillTransact:shapeWill[1],shapeBaseWillTransact:method(parent(shapeWill[0]),"onWillTransact"),historyStartEventGet:method(history,"onBatchSaveStart","get"),historyStartListener:own(own(subscriptions,0),"cb"),historyGroupFactory:own(history,"_createGroupHistoryCommand"),docEventGet:method(page,"onAttrChange","get"),asyncHelper:own(run,7),asyncPredicate:own(run,8),trace:own(run,3),traceMap:own(run,4),optionsHistory:own(run,5),optionsNull:own(run,6),disposableFactory:own(module,0),eventRegistrar:own(doc,"_event"),eventQueueConstructor:ctor(startQueue),groupConstructor,disposableConstructor:read(parent(runnerProto),"constructor"),asyncType:own(run,9)};
`;
export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_FUNCTION_PROGRAM = `function(native,run,refs,roots,events,details,subscriptions,module,qualified,channel,groupConstructor,iteratorKey){${header}
const roles=${JSON.stringify(ROLES)},result=[];for(let i=0;i<roles.length;i++){const value=own(values,roles[i]);if(typeof value!=="function")bad();result[result.length]=value;}return result;}`;
/** Fresh descriptor/reference reproof after every native metadata await. */
export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_FUNCTION_SAME_PROGRAM = `function(native,run,refs,roots,events,details,subscriptions,module,qualified,channel,groupConstructor,iteratorKey){${header}
const roles=${JSON.stringify(ROLES)};dense(this,roles.length);for(let i=0;i<roles.length;i++)if(own(this,i)!==own(values,roles[i]))bad();return true;}`;

/** Merge only actual classified tuples/layers. Dedupe actual JS references,
 * since Inspector gives the same object different wrapper IDs. */
export const CURRENT_SCHEMATIC_RELEVANCE_PREFIX_QUALIFIED_PROGRAM = String.raw`function(native,a,b,c,d){"use strict";
const get=native[0],has=native[4],keys=native[5],isArray=native[7],bad=()=>{throw "SCH209_PREFIX_QUALIFIED";},own=(o,k)=>{const x=get(o,k);if(!x||!has(x,"value"))bad();return x.value;};
const tuples=[this,a,b,c,d],result=[];for(let i=0;i<5;i++){const tuple=tuples[i];if(!isArray(tuple))bad();const n=own(tuple,"length");if(n>512||keys(tuple).length!==n+1)bad();for(let j=0;j<n;j++){const value=own(tuple,j);if(value===null||typeof value!=="object"&&typeof value!=="function")continue;let present=false;for(let k=0;k<result.length;k++)if(result[k]===value){present=true;break;}if(!present){if(result.length===512)bad();result[result.length]=value;}}}return result;}`;
