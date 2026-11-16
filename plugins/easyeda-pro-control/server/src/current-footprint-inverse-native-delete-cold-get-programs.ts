/** Fixed readonly native-manager absence leaf. A retained isDelete record,
 * original method metadata and fresh Core source custody are prerequisites.
 * Neither an empty cache nor a matching failure object issues authority. */
import { CURRENT_NATIVE_OWN_DATA_CHECK } from "./current-native-own-data-intrinsics.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const common = `"use strict";${CURRENT_NATIVE_OWN_DATA_CHECK}
const data=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();return d.value;};
const method=(o,k)=>{const d=get(o,k);if(!d||!has(d,"value")||!d.writable||d.enumerable||!d.configurable||typeof d.value!=="function")bad();return d.value;};
const guard=f=>{if(typeof f!=="function"||invoke(f,undefined,[])!==true)bad();};
const identity=v=>{if(proto(v)!==objectProto||count(v)!==4||typeof value(v,"projectUuid")!=="string"||typeof value(v,"branchUuid")!=="string"||typeof value(v,"targetUuid")!=="string"||typeof value(v,"maximumTicket")!=="number")bad();};`;
const project = `function(project){${common}if(value(root,"PROJECT")!==project)bad();return[value(project,"footprint")];}`;
const footprint = `function(footprint){${common}return[proto(footprint),value(footprint,"data")];}`;
const methods = `function(project,footprint,parent,rows,target){${common}identity(target);if(value(root,"PROJECT")!==project||value(project,"footprint")!==footprint||proto(footprint)!==parent||value(footprint,"data")!==rows||proto(rows)!==objectProto||get(footprint,"get")!==undefined||get(footprint,"getData")!==undefined)bad();return[method(parent,"get"),method(parent,"getData"),data(rows,value(target,"targetUuid"))];}`;
const snapshot = `function(project,footprint,parent,rows,methods,target){${common}identity(target);dense(methods,3);const read=value(methods,"0"),getData=value(methods,"1"),entry=value(methods,"2"),id=value(target,"targetUuid"),uuid=value(target,"projectUuid"),branch=value(target,"branchUuid"),ticket=value(target,"maximumTicket");
const check=()=>{if(value(root,"PROJECT")!==project||data(project,"uuid")!==uuid||data(project,"_branchUuid")!==branch||value(project,"footprint")!==footprint||proto(footprint)!==parent||value(footprint,"data")!==rows||proto(rows)!==objectProto||get(footprint,"get")!==undefined||get(footprint,"getData")!==undefined||method(parent,"get")!==read||method(parent,"getData")!==getData||proto(read)!==functionProto||proto(getData)!==functionProto||get(read,"apply")!==undefined||get(getData,"apply")!==undefined||data(rows,id)!==entry||proto(entry)!==objectProto||data(entry,"uuid")!==id||data(entry,"ticket")!==ticket||data(entry,"isDelete")!==true)bad();return true;};check();return[footprint,id,read,getData,check];}`;
const read = `function(proof){${common}dense(proof,5);const check=value(proof,"4");guard(check);const result=invoke(value(proof,"3"),value(proof,"0"),[value(proof,"1")]);guard(check);return[result,()=>{guard(check);return true;}];}`;
const result = `function(proof,read){${common}dense(proof,5);dense(read,2);guard(value(proof,"4"));guard(value(read,"1"));const result=value(read,"0");if(proto(result)!==objectProto||count(result)!==2||data(result,"success")!==false||data(result,"message")!=="数据不存在")bad();return true;}`;
const reprove = `function(proof){${common}dense(proof,5);guard(value(proof,"4"));return true;}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_PROGRAMS = freezeDeep({ project, footprint, methods, snapshot, read, result, reprove });
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_GET_SIGNATURES = freezeDeep({
  project: { references: 1, target: false, byValue: false },
  footprint: { references: 1, target: false, byValue: false },
  methods: { references: 4, target: true, byValue: false },
  snapshot: { references: 5, target: true, byValue: false },
  read: { references: 1, target: false, byValue: false },
  result: { references: 2, target: false, byValue: true },
  reprove: { references: 1, target: false, byValue: true },
} as const);
