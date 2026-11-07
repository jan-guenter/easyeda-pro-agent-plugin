/** Tg.get and Ne are direct children of the actual outer classic IIFE.
 * Only that Closure is selected; optional Script/Global are labels only. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.literal("object"),subtype:z.literal("internal#scope"),className:z.literal("Object"),description:z.string().max(128),objectId:handle});
const property=z.strictObject({name:z.string(),value:remote,writable:z.literal(true),configurable:z.literal(true),enumerable:z.literal(true),isOwn:z.literal(true)});
const schema=z.strictObject({result:z.array(property).min(2).max(3)});
export function currentFootprintInverseGetOuterClosure(input:unknown):string{const data=schema.parse(capture(input));const labels=data.result.length===3?["Closure","Script","Global"]:["Closure","Global"];const ids=new Set<string>();for(const[index,row]of data.result.entries()){if(row.name!==String(index)||row.value.description!==labels[index]||ids.has(row.value.objectId)){throw new Error("FOOTPRINT_INVERSE_GET_OUTER_CLOSURE");}ids.add(row.value.objectId);}const first=data.result[0];if(first===undefined){throw new Error("FOOTPRINT_INVERSE_GET_OUTER_CLOSURE");}return first.value.objectId;}
