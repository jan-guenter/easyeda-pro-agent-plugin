/** Separate complete fixed bindings, including actual hidden ATTR hit methods.
 * This catalog is unreachable through an older spatial native codebook. */
import { CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS } from "./current-pcb-209-spatial-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_PAD_EXTRA_RELATIONS } from "./current-pcb-209-spatial-pad-source-profile.ts";
import { CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PLANS, CURRENT_PCB_209_COMPONENT_POINT_EXTRA_RELATIONS } from "./current-pcb-209-component-point-complete-source-profile.ts";
import { CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION } from "./current-pcb-209-spatial-capture-program.ts";

const names = ["Hr", "Ke", "zi", "wl", "x", "mx", "vD", "Nd", "BI", "D0", "qs", "Ve", "Qg", "ki", "M2", "WA", "Ff", "sy", "GN", "Ud", "g0", "at", "E", "M", "pe", "Rut", "Ys", "ln", "e0", "vMe", "Re", "Ne", "Le", "Ue", "si", "Zi", "In", "yr", "lr", "ft", "xt", "je", "Ba", "qn", "Ms", "lt", "_r", "tb", "BLe", "CQ", "E2e", "Fi", "Rr", "j1", "Ll", "YP", "qt", "a4", "Me", "Ht", "G_e", "ye", "Sr", "St", "Jdt", "Em", "N4", "Wj", "M0", "Mi", "tE", "tC", "rE", "xi", "ws", "Li", "lC", "Ae", "IQ", "Ji", "gqe", "yqe", "f3", "rd", "Bi", "jue"] as const;
const relations = Object.entries({ ...CURRENT_PCB_209_SPATIAL_CLASS_RELATIONS, ...CURRENT_PCB_209_SPATIAL_PAD_EXTRA_RELATIONS, ...CURRENT_PCB_209_COMPONENT_POINT_EXTRA_RELATIONS })
  .map(([key, relation]) => [key, relation.parent, relation.prototypeKeys.join("|")]);
export const CURRENT_PCB_209_COMPONENT_POINT_BINDING_COLLECTOR = `const collectBindings=scope=>{
const bindings={};for(const name of ${JSON.stringify(names)})Object.defineProperty(bindings,name,{value:own(scope,name),enumerable:true});
const constructor=o=>{const p=Object.getPrototypeOf(object(o)),c=own(p,"constructor");if(typeof c!=="function"||own(c,"prototype")!==p)bad();return c;},parent=c=>constructor(own(c,"prototype"));
const derived={LH:constructor(bindings.qt),Ni:parent(bindings.zi),n3:parent(bindings.qs),iV:constructor(bindings.Ht),V_e:constructor(bindings.G_e),Ude:constructor(bindings.ye),It:parent(bindings.Qg),cP:parent(bindings.ki),_oe:parent(bindings.vD),l8:parent(bindings.Ff),UD:parent(bindings.Ud),yl:parent(bindings.M),Zdt:constructor(bindings.Jdt),xe:constructor(own(bindings.Jdt,"fac")),qme:constructor(bindings.Me),StClass:constructor(bindings.St),ls:parent(bindings.Ve),k0:parent(bindings.Zi),p0:parent(bindings.qn),et:parent(bindings.tE)};
for(const[key,value]of Object.entries(derived)){if(typeof value!=="function")bad();Object.defineProperty(bindings,key,{value,enumerable:true});}
for(const[key,parentName,encoded]of ${JSON.stringify(relations)}){const c=own(bindings,key),p=own(c,"prototype"),base=parentName===null?null:own(bindings,parentName),keys=Reflect.ownKeys(p),expected=encoded.split("|");
if(typeof c!=="function"||own(p,"constructor")!==c||Object.getPrototypeOf(p)!==(base===null?Object.prototype:own(base,"prototype"))||Object.getPrototypeOf(c)!==(base===null?Function.prototype:base)||keys.length!==expected.length||keys.some(key=>!expected.includes(key))||Reflect.ownKeys(c).some(key=>typeof key!=="string"))bad();}return Object.freeze(bindings);};`;
const plans = CURRENT_PCB_209_COMPONENT_COMPLETE_POINT_FUNCTION_PLANS.map(plan => {
  let accessor = 0; if ("getter" in plan && plan.getter) { accessor = 1; } else if ("setter" in plan && plan.setter) { accessor = 2; }
  return [plan.role, ["class", "function", "field", "prototype", "static"].indexOf(plan.target), "property" in plan ? plan.property : null, accessor];
});
export const CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_COLLECTOR = `const collectFunctions=bindings=>{
const result=[];for(const[role,target,property,accessor]of ${JSON.stringify(plans)}){const owner=own(bindings,role);let value;
if(target===0||target===1)value=owner;else if(target===2)value=own(owner,property);else{const at=target===3?own(owner,"prototype"):owner,d=Object.getOwnPropertyDescriptor(at,property);if(!d)bad();if(accessor!==0){if(Object.hasOwn(d,"value")||typeof d[accessor===1?"get":"set"]!=="function")bad();value=d[accessor===1?"get":"set"];}else{if(!Object.hasOwn(d,"value"))bad();value=d.value;}}
if(typeof value!=="function")bad();result.push(value);}return Object.freeze(result);};`;
export const CURRENT_PCB_209_COMPONENT_POINT_BINDINGS_FUNCTION = `function(originalCallback,expectedScene){"use strict";
const bad=()=>{throw new Error("PCB209_COMPONENT_CAPTURE");};const own=(o,k)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function"))bad();const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};const object=o=>{if(o===null||typeof o!=="object"||Array.isArray(o))bad();return o;};
if((${CURRENT_PCB_209_SPATIAL_CALLBACK_EXPRESSION})!==originalCallback)bad();
object(expectedScene);if(Object.getPrototypeOf(expectedScene)!==Object.prototype||Reflect.ownKeys(expectedScene).length!==11||own(expectedScene,"schema")!=="private.pcb209-generated-component-scene.v1")bad();
for(const key of ["projectUuid","documentUuid","footprintUuid","componentId","padId","ownedPadId","footprintAttrId","designatorAttrId","placedFootprintAttrId","placedDesignatorAttrId"]){const value=own(expectedScene,key),length=key==="projectUuid"?64:["documentUuid","footprintUuid","ownedPadId"].includes(key)?32:16;if(typeof value!=="string"||value.length!==length||!/^[a-f0-9]+$/.test(value))bad();}if(own(expectedScene,"ownedPadId")!==own(expectedScene,"componentId")+own(expectedScene,"padId"))bad();
${CURRENT_PCB_209_COMPONENT_POINT_BINDING_COLLECTOR}
${CURRENT_PCB_209_COMPONENT_POINT_FUNCTION_COLLECTOR}
const scope=object(own(this,"object")),bindings=collectBindings(scope);if(own(bindings.Me,"_smartMode")!==false||typeof bindings.Fi!=="function")bad();
const dialog=Object.getOwnPropertyDescriptor(bindings.qt,"dialog");if(dialog&&(!Object.hasOwn(dialog,"value")||dialog.value!==undefined)||"dialog" in bindings.qt&&!dialog)bad();
return Object.freeze({scope,originalCallback,bindings,functions:collectFunctions(bindings),expectedScene:Object.freeze({...expectedScene})});}`;
