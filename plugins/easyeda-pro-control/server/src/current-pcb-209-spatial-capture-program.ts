/** Fixed descriptor capture of the original point RPC callback. No registered
 * callback, getter, hit method, serializer or selection path is executed.
 * The enclosing owner supplies its admitted original PCB execution context.
 * Binding construction uses throwOnSideEffect:false only to define and freeze
 * new private containers. V8 refuses those builtins under its side-effect flag
 * even for new objects. All other capture and qualification calls keep the flag.
 * Original source-defined bindings and standard renderer intrinsics are trusted.
 * This does not sandbox hostile page JavaScript.
 */
import { CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS, CURRENT_PCB_209_SPATIAL_FUNCTION_PLANS } from "./current-pcb-209-spatial-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PLANS, CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS } from "./current-pcb-209-spatial-track-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PLANS, CURRENT_PCB_209_SPATIAL_ARC_EXTRA_RELATIONS } from "./current-pcb-209-spatial-arc-source-profile.ts";

// Encode only module-owned identifier rosters. Splitting a fixed delimiter keeps
// The native command below its existing 64KiB bound without dropping a check.
function encodedClassRelations(track: boolean, arc: boolean): unknown[] {
  const relations = { ...CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS, ...(track ? CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_RELATIONS : {}),
    ...(arc ? CURRENT_PCB_209_SPATIAL_ARC_EXTRA_RELATIONS : {}) };
  return Object.entries(relations).map(([key, profile]) => {
  if (profile.prototypeKeys.some(name => name.includes("|"))) { throw new Error("PCB209_SPATIAL_RELATION_ENCODING"); }
  return [key, profile.parent, profile.prototypeKeys.join("|")];
  });
}

/** Constructors used only in initializers may be elided from the V8 closure.
 * Follow their one fixed original receiver/prototype association instead. */
function bindingCollector(track: boolean, arc = false): string { return `const collectBindings=scope=>{
const names=["Hr","Ke","zi","wl","x","mx","vD","Nd","BI","D0","qs","Ve","Qg","ki","M2","WA","Ff","sy","GN","Ud","g0","at","E","M","pe","Rut","Ys","ln","e0","vMe","Re","Ne","Le","Ue","si","Zi","In","yr","lr","ft","xt","je","Ba","qn","Ms","lt","_r","tb","BLe","CQ","E2e","Fi","Rr","j1","Ll","YP","qt","a4","Me","Ht","G_e","ye","Sr","St","Jdt","Em","N4","Wj","M0"];
const bindings={};for(const name of names)Object.defineProperty(bindings,name,{value:own(scope,name),enumerable:true});
${track ? 'for(const name of ["xr","qr","bR","V0","iy","yh","bC","oie"])Object.defineProperty(bindings,name,{value:own(scope,name),enumerable:true});' : ""}
${arc ? 'for(const name of ["Oi","vi","tF","le","Fr"])Object.defineProperty(bindings,name,{value:own(scope,name),enumerable:true});' : ""}
const constructor=o=>{const p=Object.getPrototypeOf(object(o)),c=own(p,"constructor");if(typeof c!=="function"||own(c,"prototype")!==p)bad();return c;},parent=c=>constructor(own(c,"prototype"));
const derived={LH:constructor(bindings.qt),Ni:parent(bindings.zi),n3:parent(bindings.qs),iV:constructor(bindings.Ht),
V_e:constructor(bindings.G_e),Ude:constructor(bindings.ye),It:parent(bindings.Qg),cP:parent(bindings.ki),_oe:parent(bindings.vD),
l8:parent(bindings.Ff),UD:parent(bindings.Ud),yl:parent(bindings.M),Zdt:constructor(bindings.Jdt),xe:constructor(own(bindings.Jdt,"fac")),
qme:constructor(bindings.Me),StClass:constructor(bindings.St),ls:parent(bindings.Ve),k0:parent(bindings.Zi),p0:parent(bindings.qn)};
${track ? 'derived.mt=parent(bindings.qr);derived.lEe=constructor(bindings.yh);' : ""}
for(const [key,value]of Object.entries(derived)){if(typeof value!=="function")bad();Object.defineProperty(bindings,key,{value,enumerable:true});}
for(const [key,parentName,encodedKeys]of ${JSON.stringify(encodedClassRelations(track, arc))}){
const prototypeKeys=encodedKeys.split("|"),c=own(bindings,key),p=own(c,"prototype"),expected=parentName===null?null:own(bindings,parentName),keys=Reflect.ownKeys(p);
if(typeof c!=="function"||own(p,"constructor")!==c||Object.getPrototypeOf(p)!==(expected===null?Object.prototype:own(expected,"prototype"))||Object.getPrototypeOf(c)!==(expected===null?Function.prototype:expected)||keys.length!==prototypeKeys.length||keys.some(k=>!prototypeKeys.includes(k))||Reflect.ownKeys(c).some(k=>typeof k!=="string"))bad();}
return Object.freeze(bindings);};`; }
export const CURRENT_PCB_209_SPATIAL_BINDING_COLLECTOR = bindingCollector(false);
export const CURRENT_PCB_209_SPATIAL_TRACK_BINDING_COLLECTOR = bindingCollector(true);
export const CURRENT_PCB_209_SPATIAL_ARC_BINDING_COLLECTOR = bindingCollector(true, true);

function functionCollector(track: boolean, arc = false): string {
  const plans = [...CURRENT_PCB_209_SPATIAL_FUNCTION_PLANS, ...(track ? CURRENT_PCB_209_SPATIAL_TRACK_EXTRA_PLANS : []),
    ...(arc ? CURRENT_PCB_209_SPATIAL_ARC_EXTRA_PLANS : [])];
  const functionPaths = plans.map(plan => [
  plan.role, ["class", "function", "field", "prototype", "static"].indexOf(plan.target),
  "property" in plan ? plan.property : null, "getter" in plan && plan.getter ? 1 : 0,
]);
  return `const collectFunctions=bindings=>{
const plans=${JSON.stringify(functionPaths)},result=[];
for(const [role,target,property,getter]of plans){const owner=own(bindings,role);let value;
if(target===0||target===1)value=owner;
else if(target===2)value=own(owner,property);
else{const container=target===3?own(owner,"prototype"):owner,d=Object.getOwnPropertyDescriptor(container,property);
if(!d)bad();if(getter===1){if(Object.hasOwn(d,"value")||typeof d.get!=="function")bad();value=d.get;}else{if(!Object.hasOwn(d,"value"))bad();value=d.value;}}
if(typeof value!=="function")bad();result.push(value);}return Object.freeze(result);};`;
}
export const CURRENT_PCB_209_SPATIAL_FUNCTION_COLLECTOR = functionCollector(false);
export const CURRENT_PCB_209_SPATIAL_TRACK_FUNCTION_COLLECTOR = functionCollector(true);
export const CURRENT_PCB_209_SPATIAL_ARC_FUNCTION_COLLECTOR = functionCollector(true, true);

const guards = `"use strict";
const bad=()=>{throw new Error("PCB209_SPATIAL_CAPTURE_REFUSED");};
const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
const named=(o,name)=>{object(o);const p=Object.getPrototypeOf(o),c=own(p,"constructor");if(typeof c!=="function"||own(c,"name")!==name||own(c,"prototype")!==p)bad();return o;};`;

/** The RPC wrapper and its lexical t handler are inspected by the source and
 * location decoders. Keep exactly one original running task in the registry. */
export const CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION = `(()=>{${guards}
const bridge=named(own(globalThis,"MSG_BUS_PCB"),"YJ"),bus=named(own(bridge,"messageBus"),"Net");
const subscribed=object(own(bus,"subscribed")),p=Object.getPrototypeOf(subscribed);
if(p!==Object.prototype&&p!==null)bad();
const tasks=own(subscribed,"pcb/extensionAPI/document-getPrimitiveAtPoint");
if(!Array.isArray(tasks)||Object.getPrototypeOf(tasks)!==Array.prototype||own(tasks,"length")!==1||Reflect.ownKeys(tasks).length!==2)bad();
const task=named(own(tasks,"0"),"rye"),callback=own(task,"callback");
if(own(task,"isRunning")!==true||typeof callback!=="function")bad();return callback;
})()`;

export const CURRENT_PCB_209_SPATIAL_HANDLER_FUNCTION = `function(){${guards}
const handler=own(object(own(this,"object")),"t");if(typeof handler!=="function")bad();return handler;
}`;

/** This descriptor-only step must run on the original outer Closure scope,
 * selected by the fixed scope decoder. It proves no complete geometry graph.
 * The returned object stays private in the original object group.
 */
function bindingsFunction(track: boolean, arc = false): string { return `function(originalCallback){${guards}
if((${CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION})!==originalCallback)bad();
${bindingCollector(track, arc)}
${functionCollector(track, arc)}
const scope=object(own(this,"object")),bindings=collectBindings(scope);
if(typeof bindings.Hr!=="function"||typeof bindings.LH!=="function"||Object.getPrototypeOf(bindings.qt)!==own(bindings.LH,"prototype"))bad();
if(own(bindings.Me,"_smartMode")!==false||typeof bindings.Fi!=="function"||bindings.a4===null||typeof bindings.a4!=="object")bad();
const dialog=Object.getOwnPropertyDescriptor(bindings.qt,"dialog");
if(dialog&&(!Object.hasOwn(dialog,"value")||dialog.value!==undefined))bad();
if("dialog" in bindings.qt&&!dialog)bad();
return Object.freeze({scope,originalCallback,bindings,functions:collectFunctions(bindings)});
}`; }
export const CURRENT_PCB_209_SPATIAL_BINDINGS_FUNCTION = bindingsFunction(false);
export const CURRENT_PCB_209_SPATIAL_TRACK_BINDINGS_FUNCTION = bindingsFunction(true);
export const CURRENT_PCB_209_SPATIAL_ARC_BINDINGS_FUNCTION = bindingsFunction(true, true);

/** Return the same frozen original tuple created by the binding capture.
 * The runner qualifies every original function before the read kernel runs. */
export const CURRENT_PCB_209_SPATIAL_FUNCTIONS_FUNCTION = `function(){${guards}
if((${CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION})!==own(this,"originalCallback"))bad();
const result=own(this,"functions");if(!Array.isArray(result)||Object.getPrototypeOf(result)!==Array.prototype||!Object.isFrozen(result))bad();return result;
}`;
