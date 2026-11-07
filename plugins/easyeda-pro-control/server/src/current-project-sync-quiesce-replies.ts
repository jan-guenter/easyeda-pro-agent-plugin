/** Exact private inspector-created tuples. Readonly programs never freeze
 * them; original fixed closures reprove all retained values/descriptors. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.enum(["object","function","number","string","undefined","boolean"]),subtype:z.string().optional(),className:z.string().optional(),objectId:handle.optional(),description:z.string().max(8192).optional(),value:z.unknown().optional()});
const property=z.strictObject({name:z.string().max(256),value:remote,writable:z.boolean(),configurable:z.boolean(),enumerable:z.boolean(),isOwn:z.literal(true)});
const internal=z.strictObject({name:z.literal("[[Prototype]]"),value:z.strictObject({type:z.literal("object"),subtype:z.literal("array"),className:z.string().optional(),description:z.string().optional(),objectId:handle})});
export function decodeCurrentProjectSyncQuiesceArray(input:unknown,count:number):ReadonlyMap<string,z.infer<typeof remote>> {
  const reply=z.strictObject({result:z.array(property).length(count+1),internalProperties:z.tuple([internal])}).parse(captureCurrentPcbStringClockReply(input).value);
  const fields=new Map(reply.result.map(item=>[item.name,item]));const length=fields.get("length");if(fields.size!==count+1||length===undefined||!length.writable||length.configurable||length.enumerable||length.value.type!=="number"||length.value.value!==count){throw new Error("PROJECT_SYNC_QUIESCE_PRIVATE_ARRAY");}
  const result=new Map<string,z.infer<typeof remote>>();for(let index=0;index<count;index+=1){const field=fields.get(String(index));if(field===undefined||!field.writable||!field.configurable||!field.enumerable||field.value.subtype==="proxy"){throw new Error("PROJECT_SYNC_QUIESCE_PRIVATE_ARRAY");}result.set(String(index),field.value);}return result;
}
