import { z } from "zod";
import { ACTOR_NAME_MAX_CODE_UNITS, SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE } from "./symbol-dual-actor.ts";

const milliseconds = z.number().int().nonnegative().refine((value) => Number.isSafeInteger(value) && !Object.is(value, -0));
const clockSample = z.object({ rendererBeforeMs: milliseconds, serverTimeMs: milliseconds, rendererAfterMs: milliseconds }).strict()
  .refine((value) => value.rendererBeforeMs <= value.serverTimeMs && value.serverTimeMs <= value.rendererAfterMs &&
    value.rendererAfterMs - value.rendererBeforeMs <= 10_000);

/** Current UI observations, not proof of the backend request actor, original
 * login response, WS lifetime or a future write's timestamp. No public schema.
 */
export const currentSymbolRuntimeObservationSchema = z.object({
  editorVersion: z.literal("3.2.206"),
  actor: z.object({ uuid: z.string().regex(/^[a-f0-9]{32}$/u), username: z.string().min(1).max(ACTOR_NAME_MAX_CODE_UNITS),
    nickname: z.string().max(ACTOR_NAME_MAX_CODE_UNITS) }).strict(),
  clockSamples: z.array(clockSample).length(4),
  backendActorVerified: z.literal(false), backendClockVerified: z.literal(false), clockProducerOwnershipVerified: z.literal(false),
}).strict().refine((value) => {
  const first = value.clockSamples[0], last = value.clockSamples[3];
  return first !== undefined && last !== undefined && last.rendererAfterMs - first.rendererBeforeMs <= 10_000 &&
    value.clockSamples.every((sample, index) => index === 0 || sample.rendererBeforeMs >= (value.clockSamples[index - 1]?.rendererAfterMs ?? Infinity));
});

/** Fixed fragment for the internal closed-target compiler only. Requires its
 * own()/method()/methodCheck()/same() helpers. UI3823ed6e binds concurrentBus to
 * the cached /<tab>/notify BroadcastChannel; unlike messageBus, rpcCall returns
 * a bare scalar. WS7a372d72 serves Date.now()+offset. The two admitted offline
 * modes do not start its websocket; these bounded samples merely agree with
 * the renderer clock and cannot reconstruct that producer's startup history.
 */
export const CURRENT_SYMBOL_RUNTIME_OBSERVATION_SOURCE = `
${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
const observedEditorVersion=own(root,'PRO_EDITOR_VERSION');if(observedEditorVersion!=='3.2.206')bad();
const notifyTab=own(root,'_TAB_ID_');if(typeof notifyTab!=='string'||!/^[a-f0-9]{16}$/.test(notifyTab))bad();
const notifyKey='/'+notifyTab+'/notify',concurrent=own(host,'concurrentBus'),clockRpc=method(concurrent,'rpcCall');
const nativeDate=own(root,'Date'),dateNow=own(nativeDate,'now');if(typeof nativeDate!=='function'||typeof dateNow!=='function')bad();
const clockSamples=[];
const checkRuntimeObservation=()=>{
 checkDualActor();methodCheck(clockRpc);
 if(own(root,'PRO_EDITOR_VERSION')!==observedEditorVersion||own(root,'_TAB_ID_')!==notifyTab||own(root,notifyKey)!==concurrent||own(host,'concurrentBus')!==concurrent||own(root,'Date')!==nativeDate||own(nativeDate,'now')!==dateNow)bad();
};
const clockInteger=value=>{if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||Object.is(value,-0))bad();return value;};
const sampleRuntimeClock=async()=>{
 same();const rendererBeforeMs=clockInteger(apply(dateNow,nativeDate,[]));
 const serverTimeMs=await apply(clockRpc.fn,concurrent,['/pro-mgr/serverTime/now']);same();clockInteger(serverTimeMs);
 const rendererAfterMs=clockInteger(apply(dateNow,nativeDate,[]));same();
 if(rendererBeforeMs>serverTimeMs||serverTimeMs>rendererAfterMs||rendererAfterMs-rendererBeforeMs>10000||clockSamples.length>=4)bad();
 const previous=clockSamples[clockSamples.length-1],first=clockSamples[0];
 if((previous&&rendererBeforeMs<previous.rendererAfterMs)||(first&&rendererAfterMs-first.rendererBeforeMs>10000))bad();
 clockSamples.push({rendererBeforeMs,serverTimeMs,rendererAfterMs});
};
const runtimeObservation=()=>{
 same();if(clockSamples.length!==4)bad();
 return{editorVersion:observedEditorVersion,actor:cachedActorProjection,clockSamples,backendActorVerified:false,backendClockVerified:false,clockProducerOwnershipVerified:false};
};
`;
