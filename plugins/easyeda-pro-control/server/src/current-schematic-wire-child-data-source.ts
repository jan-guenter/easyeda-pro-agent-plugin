/** Exact original tag/init method metadata; no stand-in caller or body authority. */
import {compareCurrentSchematicWireFunctionMetadata as compare} from "./current-schematic-wire-completion-source.ts";
import {CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as SOURCE} from "./current-schematic-wire-transition-source.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_METHOD_SOURCE as METHOD} from "./current-schematic-wire-group-method-source.ts";

export function qualifyCurrentSchematicWireChildDataTag(input:unknown,actual:unknown,variant:0|1,scriptId:string):ReturnType<typeof compare>{return compare(input,actual,METHOD[variant].rows.lineTagName,scriptId);}
export function qualifyCurrentSchematicWireChildDataInit(input:unknown,actual:unknown,variant:0|1,scriptId:string):ReturnType<typeof compare>{const p=SOURCE[variant].methods.historyInitOldData;return compare(input,actual,{bytes:p.bytes,sha256:p.sha256,name:p.name,arity:p.arity,constructible:false,className:"Function",parentType:"function",parentClassName:"Function",parentDescription:"function () { [native code] }",lineNumber:p.lineNumber,columnNumber:p.columnNumber},scriptId);}
