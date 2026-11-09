/** Materialized original post data stays immutable through later cache
 * clearing. These scalars alone issue no sender, worker or ownership proof. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";

const scalar=z.string().min(1).max(256);
const values=z.tuple([scalar,z.literal("/pro-mgr/worker/batchPendData"),scalar,scalar,scalar,z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),z.string().min(1).max(16_384),scalar,scalar,scalar,z.literal("TEXT"),z.literal("SCH_PAGE")]);
const result=z.strictObject({type:z.literal("object"),value:values});
const schema=z.strictObject({result});
const targetSchema=z.strictObject({result:z.strictObject({type:z.literal("object"),value:z.tuple([scalar,scalar])})});
export type CurrentSchematicRelevancePublicationPayload=z.infer<typeof values>;
/** Capture only the original frame recipe's bounded primitive tuple, with
 * accessor/proxy-safe copying before schema validation or any owner callback. */
export function decodeCurrentSchematicRelevancePublicationPayload(input:unknown):Readonly<CurrentSchematicRelevancePublicationPayload>{return Object.freeze(schema.parse(captureCurrentPcbStringClockReply(input).value).result.value);}
/** Copy the two own publisher identities without treating either scalar as
 * ownership. Core joins the document UUID and project path independently. */
export function decodeCurrentSchematicRelevancePublicationTarget(input:unknown):readonly[string,string]{return Object.freeze(targetSchema.parse(captureCurrentPcbStringClockReply(input).value).result.value);}
