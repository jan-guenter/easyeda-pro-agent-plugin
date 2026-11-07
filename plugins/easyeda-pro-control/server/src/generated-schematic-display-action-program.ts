/** Descriptor-only metadata leaves for the original action/recorder graph.
 * These never start an action, call a factory/watch/getter/setter, resolve a
 * history batch, resume a worker, Save or issue a writer capability. */
const GUARD = `"use strict";const bad=()=>{throw new Error("SCH209_DISPLAY_ACTION_PROJECTION");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const optional=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d)return undefined;if(!Object.hasOwn(d,"value"))bad();return d.value;};
const plain=o=>{if(o===null||typeof o!=="object"||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const fn=v=>{if(typeof v!=="function")bad();return v;};
const dense=(v,n)=>{if(!Array.isArray(v)||Object.getPrototypeOf(v)!==Array.prototype||own(v,"length")!==n||Reflect.ownKeys(v).length!==n+1)bad();for(let i=0;i<n;i++)own(v,String(i));};
const size=(v,proto)=>{if(Object.getPrototypeOf(v)!==proto)bad();return Reflect.apply(Object.getOwnPropertyDescriptor(proto,"size").get,v,[]);};
const get=(o,key,kind="value")=>{const d=Object.getOwnPropertyDescriptor(o,key);if(!d)bad();if(kind==="value"){if(!Object.hasOwn(d,"value"))bad();return fn(d.value);}if(Object.hasOwn(d,"value"))bad();return fn(d[kind]);};
const json=v=>JSON.stringify(v,(_key,value)=>value&&typeof value==="object"&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
const selected=(holder,target,operation,active)=>{dense(holder,2);const b=plain(own(holder,"0")),state=plain(own(holder,"1"));if(own(state,"owner")!==holder||own(state,"identity")!==json({target,operation})||own(state,"failed")!==false||own(state,"modifyAttempted")!==active||own(state,"saveAttempted")!==false||own(state,"modifyAcknowledged")!==false)bad();
const shapes=own(b,"shapes"),runner=own(b,"runner"),text=own(own(state,"before"),"text"),history=own(shapes,"historyRecorder"),runnerProto=Object.getPrototypeOf(runner),historyProto=Object.getPrototypeOf(history),historyBase=Object.getPrototypeOf(historyProto),runnerCtor=get(runnerProto,"constructor"),historyCtor=get(historyProto,"constructor"),historyBaseCtor=get(historyBase,"constructor");
if(own(runnerCtor,"prototype")!==runnerProto||own(historyCtor,"prototype")!==historyProto||own(historyBaseCtor,"prototype")!==historyBase||Object.getPrototypeOf(historyCtor)!==historyBaseCtor||own(history,"shapeManager")!==shapes||own(shapes,"docManager")!==own(b,"page")||own(history,"_isWatched")!==true||own(text,"shapeManager")!==shapes)bad();
const run=plain(own(b,"run"));if(own(run,"object")!==runner||own(run,"owner")!==runnerProto||own(run,"key")!=="run"||own(run,"fn")!==get(runnerProto,"run"))bad();
const map=own(runner,"_historyResolversMap");if(Object.getPrototypeOf(map)!==WeakMap.prototype)bad();const resolver=Reflect.apply(WeakMap.prototype.get,map,[shapes]),action=own(runner,"_currentAction"),stack=optional(history,"batchSaveStack");
const stable=[runnerCtor,get(runnerProto,"run"),get(runnerProto,"useAction"),get(runnerProto,"_tryStartHistory"),get(runnerProto,"_getActionRealOptions"),get(runnerProto,"currentAction","get"),get(runnerProto,"currentAction","set"),get(runnerProto,"running","get"),historyCtor,historyBaseCtor,get(historyProto,"watch"),get(historyProto,"getModelHistoryCommand"),get(historyBase,"withResolvers"),get(historyBase,"transactionSuccessHandler"),get(historyBase,"transactionFailHandler"),fn(own(history,"_tryHandleGroupModelCommand")),get(historyProto,"isWatched","get")];
return{b,state,shapes,runner,history,text,resolver,action,stack,stable};};
const activeGraph=s=>{const action=plain(s.action),resolver=plain(s.resolver);if(own(action,"status")!=="running"||own(action,"history")!=="add"||Reflect.ownKeys(resolver).length!==3||!["start","complete","failure"].every(k=>Object.hasOwn(resolver,k))||s.stack===undefined||s.stack===null)bad();
const stackProto=Object.getPrototypeOf(s.stack),ctor=get(stackProto,"constructor");if(own(ctor,"prototype")!==stackProto)bad();
return[fn(own(s.history,"onModelAttributeChange")),fn(own(resolver,"start")),fn(own(resolver,"complete")),fn(own(resolver,"failure")),ctor,get(stackProto,"add"),s.history,resolver,s.stack,action,own(s.history,"modelCommandMap")];};
const sameStable=(s,original)=>{dense(original,18);for(let i=0;i<s.stable.length;i++)if(own(original,String(i))!==s.stable[i])bad();};`;

/** Idle callback is qualified as Cr only before the original action begins. */
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_FUNCTION = `function(target,operation){${GUARD}
const s=selected(this,target,operation,false);if(s.action!==null||s.resolver!==undefined||s.stack!==undefined&&s.stack!==null||size(own(s.history,"modelCommandMap"),Map.prototype)!==0)bad();
const noop=fn(own(s.history,"onModelAttributeChange"));if(own(s.history,"onSubTreeInsertConnectedChild")!==noop||own(s.history,"onSubTreeRemoveConnectedChild")!==noop)bad();return[...s.stable,noop];}`;

/** Inspect only while the first actual setter is held, after source-owned
 * batch startup. The active callback must differ from idle Cr. The native
 * consumer must separately qualify every returned function and lexical this. */
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_ACTIVE_FUNCTION = `function(holder,target,operation){${GUARD}
const s=selected(holder,target,operation,true);sameStable(s,this);if(size(own(s.history,"modelCommandMap"),Map.prototype)!==0||size(own(s.stack,"_commands"),Set.prototype)!==0)bad();const values=activeGraph(s);if(values[0]===own(this,"17"))bad();return values;}`;

/** Actual active callback/resolver arrow lexical this must be the same
 * original recorder; no preflight Cr pointer is assumed during the action. */
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_CLOSURE_FUNCTION = `function(holder,target,operation,original){${GUARD}
const s=selected(holder,target,operation,true);sameStable(s,original);activeGraph(s);if(this!==s.history)bad();return true;}`;

/** Reprove the retained active functions after metadata qualification without
 * invoking any of them; existing Text history commands may now be present. */
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_SAME_FUNCTION = `function(holder,target,operation,original){${GUARD}
const s=selected(holder,target,operation,true);sameStable(s,original);dense(this,11);const values=activeGraph(s);for(let i=0;i<11;i++)if(own(this,String(i))!==values[i])bad();return true;}`;

/** Same original idle graph after function/source metadata awaits. */
export const GENERATED_SCHEMATIC_DISPLAY_ACTION_PREFLIGHT_SAME_FUNCTION = `function(holder,target,operation){${GUARD}
const s=selected(holder,target,operation,false);sameStable(s,this);if(s.action!==null||s.resolver!==undefined||s.stack!==undefined&&s.stack!==null||size(own(s.history,"modelCommandMap"),Map.prototype)!==0||own(s.history,"onModelAttributeChange")!==own(this,"17")||own(s.history,"onSubTreeInsertConnectedChild")!==own(this,"17")||own(s.history,"onSubTreeRemoveConnectedChild")!==own(this,"17"))bad();return true;}`;
