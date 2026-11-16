/** Exact normal body and original constructor instruction identity. */
import {createHash} from "node:crypto";
import {z} from "zod";
import {GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as SOURCE} from "./generated-schematic-wire-native-source.ts";
import {compareCurrentSchematicWireFunctionMetadata as compare} from "./current-schematic-wire-completion-source.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";

const site=z.strictObject({scriptId:z.string(),lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const internalValue=z.object({value:z.unknown().optional()});
const internal=z.object({name:z.string(),value:internalValue});
const constructorPacket=z.object({internalProperties:z.array(internal).length(3)});
export function currentSchematicWirePointConstructorSite(input:unknown):z.infer<typeof site>{const raw=constructorPacket.parse(capture(input).value);return site.parse(raw.internalProperties.find(row=>row.name==="[[FunctionLocation]]")?.value.value);}

export function qualifyCurrentSchematicWirePointNormal(input:unknown,actual:unknown,variant:0|1,scriptId:string):ReturnType<typeof compare>{const p=SOURCE[variant]?.methods.pointNormal;if(p===undefined){throw new Error("WIRE_POINT_NORMAL");}const text='normal(e){if(isFinite(e))return e;throw new Error(Uh.format("%f is not permitted",e))}';if(createHash("sha256").update(`static ${text}`).digest("hex")!==p.sha256){throw new Error("WIRE_POINT_NORMAL_PIN");}return compare(input,actual,{bytes:Buffer.byteLength(text),sha256:createHash("sha256").update(text).digest("hex"),name:"normal",arity:1,constructible:false,className:"Function",parentType:"function",parentClassName:"Function",parentDescription:"function () { [native code] }",lineNumber:p.lineNumber,columnNumber:p.columnNumber+13},scriptId);}
