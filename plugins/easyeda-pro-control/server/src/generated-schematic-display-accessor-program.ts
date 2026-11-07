/** Fixed descriptor-only projections on the original Array2 display holder.
 * No model constructor, getter, setter, factory, action or Save is invoked. */
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_FIELDS as FIELDS } from "./generated-schematic-display-accessor-source.ts";

const GUARD = `"use strict";const bad=()=>{throw new Error("SCH209_DISPLAY_ACCESSOR_PROJECTION");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const json=v=>JSON.stringify(v,(_key,value)=>value&&typeof value==="object"&&!Array.isArray(value)?Object.fromEntries(Object.keys(value).sort().map(key=>[key,value[key]])):value);
const dense=(o,n)=>{if(!Array.isArray(o)||Object.getPrototypeOf(o)!==Array.prototype||own(o,"length")!==n||Reflect.ownKeys(o).length!==n+1)bad();for(let i=0;i<n;i++)own(o,String(i));};
const plain=o=>{if(o===null||typeof o!=="object"||Object.getPrototypeOf(o)!==Object.prototype)bad();return o;};
const fn=v=>{if(typeof v!=="function")bad();return v;};
const selected=(holder,target,operation)=>{dense(holder,2);const b=plain(own(holder,"0")),state=plain(own(holder,"1"));if(own(state,"owner")!==holder||own(state,"identity")!==json({target,operation})||own(state,"failed")!==false||own(state,"modifyAttempted")!==false||own(state,"saveAttempted")!==false)bad();
const text=own(own(state,"before"),"text"),shapes=own(b,"shapes"),textProto=Object.getPrototypeOf(text),base=Object.getPrototypeOf(textProto),ctor=fn(own(textProto,"constructor")),baseCtor=fn(own(base,"constructor"));if(own(text,"shapeManager")!==shapes||own(text,"modelType")!=="Text"||own(text,"cmdKey")!=="text"||own(ctor,"prototype")!==textProto||own(baseCtor,"prototype")!==base||Object.getPrototypeOf(ctor)!==baseCtor)bad();
const setters=plain(own(b,"setters")),fields=${JSON.stringify(FIELDS)};if(Reflect.ownKeys(setters).length!==fields.length)bad();
const bindings=fields.map(field=>{const binding=plain(own(setters,field)),d=Object.getOwnPropertyDescriptor(base,field);if(!d||Object.hasOwn(d,"value")||d.enumerable!==false||d.configurable!==true||typeof d.get!=="function"||typeof d.set!=="function"||own(binding,"object")!==text||own(binding,"owner")!==base||own(binding,"key")!==field||own(binding,"get")!==d.get||own(binding,"set")!==d.set)bad();return binding;});
const monitor=own(shapes,"modifyMonitor"),monitorProto=Object.getPrototypeOf(monitor),monitorCtor=fn(own(monitorProto,"constructor"));if(own(monitor,"shapeManager")!==shapes||own(monitor,"_isWatched")!==true||own(shapes,"_isBaseWatched")!==true||own(monitorCtor,"prototype")!==monitorProto)bad();return{b,state,text,base,ctor,baseCtor,fields,bindings,monitor,monitorCtor,monitorProto};};`;

/** Native metadata follows only these26 original function handles. Public
 * wrapped setter roles are later joined to their actual raw a/i/t/e scopes. */
export const GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CALLEE_FUNCTION = `function(target,operation){${GUARD}
const s=selected(this,target,operation),values=[s.ctor,s.baseCtor];for(const binding of s.bindings)values.push(fn(own(binding,"get")),fn(own(binding,"set")));
values.push(s.monitorCtor,fn(own(s.monitor,"setAttribute")),fn(own(s.monitor,"record")),fn(own(s.monitorProto,"watch")));return values;}`;

/** Native supplies only a/i/t values extracted from this actual original
 * wrapper's debugger scopes. Descriptor a.get equals the public native getter;
 * a.set is the source-pinned raw setter, never the public wrapper itself. */
export const GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_CLOSURE_FUNCTION = `function(holder,target,operation,field,decorator,capturedField){${GUARD}
const s=selected(holder,target,operation);if(!s.fields.slice(2).includes(field)||capturedField!==field)bad();const binding=s.bindings[s.fields.indexOf(field)],a=plain(this),i=plain(decorator);
if(Reflect.ownKeys(a).length!==5||!["get","set","configurable","writable","enumerable"].every(k=>Object.hasOwn(a,k))||own(a,"configurable")!==true||own(a,"writable")!==undefined||own(a,"enumerable")!==false||own(a,"get")!==own(binding,"get")||own(a,"set")===own(binding,"set"))bad();
if(Reflect.ownKeys(i).length!==2||!Object.hasOwn(i,"accessor")||!Object.hasOwn(i,"setter"))bad();return[fn(own(i,"setter")),fn(own(a,"get")),fn(own(a,"set")),fn(own(i,"accessor"))];}`;

/** Lexical this from the original watched setAttribute/record/AST closures
 * must be the actual monitor selected from the same original holder. */
export const GENERATED_SCHEMATIC_DISPLAY_MONITOR_CLOSURE_FUNCTION = `function(holder,target,operation){${GUARD}const s=selected(holder,target,operation);if(this!==s.monitor)bad();return true;}`;
