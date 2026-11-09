/** One original worker helper source read; its exact declaration/expression is retained privately before dispatch. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const schema=z.strictObject({phase:z.literal("via-observed-source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u)})});
export type CurrentPcbViaObservedSourceCommand=z.infer<typeof schema>;
export function validateCurrentPcbViaObservedSourceCommand(input:unknown):CurrentPcbViaObservedSourceCommand{return freezeDeep(schema.parse(captureCurrentPcbStringClockReply(input).value));}
export function currentPcbViaObservedSourceWire(input:unknown,id:number):Readonly<{command:CurrentPcbViaObservedSourceCommand;request:Readonly<Record<string,string|number>>}>{if(!Number.isSafeInteger(id)||id<1||id>2_147_483_647){throw new Error("VIA_OBSERVED_SOURCE_ID");}const command=validateCurrentPcbViaObservedSourceCommand(input);return freezeDeep({command,request:{action:"pcb-via-observed-source",requestId:id,scriptId:command.params.scriptId}});}
