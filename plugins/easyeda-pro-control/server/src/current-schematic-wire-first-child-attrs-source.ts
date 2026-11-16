/** Original class-relative scale source and fresh same-constructor metadata. */
import {createHash} from "node:crypto";
import {z} from "zod";
import {GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as SOURCE} from "./generated-schematic-wire-native-source.ts";
import {compareCurrentSchematicWireFunctionMetadata as compare} from "./current-schematic-wire-completion-source.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),site=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const internal=z.object({name:z.string(),value:z.object({objectId:handle.optional(),value:z.unknown().optional()})});
const packet=z.object({result:z.array(z.unknown()).max(64),internalProperties:z.array(internal).length(3)});
export function qualifyCurrentSchematicWireFirstChildScale(input:unknown,actual:unknown,constructorMetadata:unknown,constructorValue:unknown,variant:0|1):Readonly<{scale:ReturnType<typeof compare>;constructorScopes:string}>{
 const raw=packet.parse(capture(constructorMetadata).value);const fields=new Map(raw.internalProperties.map(row=>[row.name,row.value]));
 const location=site.parse(fields.get("[[FunctionLocation]]")?.value),scopes=fields.get("[[Scopes]]")?.objectId;
 if(scopes===undefined||fields.size!==3){throw new Error("WIRE_FIRST_CHILD_SCALE_CONSTRUCTOR");}
 const classSource=SOURCE[variant]?.methods.pointConstructor.source;const ctor=z.object({type:z.literal("function"),className:z.literal("Function"),description:z.string()}).parse(capture(constructorValue).value);if(classSource===undefined||ctor.description!==classSource){throw new Error("WIRE_FIRST_CHILD_SCALE_SOURCE");}
 const text=variant===0?"scale(e){return new dl(this.x*e,this.y*e)}":"scale(e){return new hl(this.x*e,this.y*e)}";
 const expected={bytes:42,sha256:createHash("sha256").update(text).digest("hex"),name:"scale",arity:1,constructible:false,className:"Function",parentType:"function",parentClassName:"Function",parentDescription:"function () { [native code] }",lineNumber:location.lineNumber,columnNumber:location.columnNumber+1914};
 return Object.freeze({scale:compare(input,actual,expected,location.scriptId),constructorScopes:scopes});
}
