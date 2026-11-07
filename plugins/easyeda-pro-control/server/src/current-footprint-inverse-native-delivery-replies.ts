/** Actual correlated Event metadata must pass before any prototype traversal
 * or getter invocation. A Proxy/extra own field cannot reach the fixed helper. */
import { z } from "zod";
import { captureCurrentFootprintInverseDeleteBindingReply as capture } from "./current-footprint-inverse-delete-binding-capture.ts";
import { currentNativeMessageEventCallable } from "./current-native-message-event-metadata.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const nativeFunction=z.strictObject({type:z.literal("function"),className:z.literal("Function"),description:z.literal("function get isTrusted() { [native code] }"),objectId:handle});
/* oxlint-disable unicorn/max-nested-calls -- Closed original Event descriptor and native envelope fields are checked together before traversal. */
const eventSchema=z.strictObject({result:z.tuple([z.strictObject({name:z.literal("isTrusted"),get:nativeFunction,set:z.strictObject({type:z.literal("undefined")}),configurable:z.literal(false),enumerable:z.literal(true),isOwn:z.literal(true)})]),internalProperties:z.tuple([z.strictObject({name:z.literal("[[Prototype]]"),value:z.strictObject({type:z.literal("object"),className:z.literal("MessageEvent"),description:z.literal("MessageEvent"),objectId:handle})})])});
export function qualifyCurrentFootprintInverseNativeDeliveryEvent(input:unknown):void{const reply=eventSchema.parse(capture(input));currentNativeMessageEventCallable({result:reply.result[0].get},3);}
export const currentFootprintInverseNativeDeliveryExpectedSchema=z.strictObject({nativeEnvelope:z.strictObject({type:z.literal("IGIVE"),uuid:z.uuid(),topic:z.literal("/mgr/projectWorker/footprint/delete"),id:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).refine(value=>!Object.is(value,-0)),target:z.uuid(),message:z.strictObject({message:z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),replyTopic:z.string().min(32).max(256).regex(/^[A-Za-z\d_./:-]+$/u)})}),nativeOrigin:z.string().max(2048)});
export function captureCurrentFootprintInverseNativeDeliveryExpected(input:unknown):Readonly<z.infer<typeof currentFootprintInverseNativeDeliveryExpectedSchema>>{return freezeDeep(currentFootprintInverseNativeDeliveryExpectedSchema.parse(capture(input)));}
