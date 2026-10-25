import { z } from "zod";
import { EXACT_READ_ENVELOPE_SCHEMA } from "./exact-readers.ts";
import {
  SDK_PUBLIC_READERS_BATCH_DEADLINE_MS, SDK_PUBLIC_READERS_BATCH_MAX_BYTES, SDK_PUBLIC_READERS_BATCH_MAX_METHODS,
  SDK_PUBLIC_READERS_MAX_BYTES, SDK_PUBLIC_READERS_RETAIN_OWNER_PROGRAM,
  buildSdkPublicReadersBatchMemberProgram, sdkPublicReadersBatchRequestSchema, validateSdkPublicReadersResult,
} from "./sdk-public-readers.ts";

/** A single fixed program captures every requested owner before any public
 * method runs. Every await rechecks the complete retained set; no invocation
 * adopts an owner observed later in the batch or starts another deadline. */
export function buildSdkPublicReadersBatchProgram(input: unknown): string {
  const request = sdkPublicReadersBatchRequestSchema.parse(input);
  return `let batchTimer,batchClear,batchApply,batchRoot;try{
const fail=()=>{throw new Error('SDK_PUBLIC_READERS_BATCH_INVALID_RESULT');};
const data=(object,key)=>{const descriptor=Object.getOwnPropertyDescriptor(object,key);if(!descriptor||!Object.hasOwn(descriptor,'value'))fail();return descriptor.value;};
${SDK_PUBLIC_READERS_RETAIN_OWNER_PROGRAM}
batchRoot=globalThis;batchApply=Reflect.apply;
const clock=batchRoot.performance,now=retain(clock,'now'),set=data(batchRoot,'setTimeout');batchClear=data(batchRoot,'clearTimeout');
if(typeof set!=='function'||typeof batchClear!=='function')fail();
let lastTime=batchApply(now.method,clock,[]),expired=false;
if(!Number.isFinite(lastTime)||lastTime<0)fail();const deadline=lastTime+${SDK_PUBLIC_READERS_BATCH_DEADLINE_MS};
const readersBatchDeadline=()=>{
 if(globalThis!==batchRoot||batchRoot.performance!==clock||data(batchRoot,'setTimeout')!==set||data(batchRoot,'clearTimeout')!==batchClear)fail();
 now.check();const time=batchApply(now.method,clock,[]);
 if(expired||!Number.isFinite(time)||time<lastTime||time>=deadline)fail();lastTime=time;
};
readersBatchDeadline();batchTimer=batchApply(set,batchRoot,[()=>{expired=true;},${SDK_PUBLIC_READERS_BATCH_DEADLINE_MS}]);
const readers=[${request.requests.map(buildSdkPublicReadersBatchMemberProgram).join(",\n")}];
const readersBatchCurrent=()=>{readersBatchDeadline();for(const reader of readers)reader.sameOwner();readersBatchDeadline();};
const passes=[[],[]];
for(let sample=0;sample<passes.length;sample++){
 const pass=passes[sample];
 for(let index=0;index<readers.length;index++){
  const reader=readers[index];
  readersBatchCurrent();const value=reader.uiBacked?await reader.read():reader.read();readersBatchCurrent();
  if(new TextEncoder().encode(JSON.stringify(value)).byteLength>${SDK_PUBLIC_READERS_MAX_BYTES})fail();
  if(sample===1&&JSON.stringify(value)!==JSON.stringify(passes[0][index]))fail();pass.push(value);
 }
}
if(JSON.stringify(passes[0])!==JSON.stringify(passes[1]))fail();readersBatchCurrent();
const json=JSON.stringify({ok:true,kind:'sdk-public-readers-batch',results:passes[0],samplesMatched:true,
 observationOrder:'two-complete-ordered-passes',atomicSnapshot:false});
const utf8Bytes=new TextEncoder().encode(json).byteLength;
const envelope={schema:${JSON.stringify(EXACT_READ_ENVELOPE_SCHEMA)},utf8Bytes,json};
if(utf8Bytes>${SDK_PUBLIC_READERS_BATCH_MAX_BYTES}||new TextEncoder().encode(JSON.stringify(envelope)).byteLength>${SDK_PUBLIC_READERS_BATCH_MAX_BYTES})fail();
readersBatchCurrent();return envelope;
}catch{throw new Error('SDK_PUBLIC_READERS_BATCH_READ_FAILED');}finally{
 if(batchTimer!==undefined&&batchClear&&batchApply){try{batchApply(batchClear,batchRoot,[batchTimer]);}catch{throw new Error('SDK_PUBLIC_READERS_BATCH_READ_FAILED');}}
}`;
}

const batchPayloadSchema = z.object({ ok: z.literal(true), kind: z.literal("sdk-public-readers-batch"),
  results: z.array(z.unknown()).min(1).max(SDK_PUBLIC_READERS_BATCH_MAX_METHODS), samplesMatched: z.literal(true),
  observationOrder: z.literal("two-complete-ordered-passes"), atomicSnapshot: z.literal(false),
}).strict();

export function validateSdkPublicReadersBatchResult(input: unknown, raw: unknown): Record<string, unknown> {
  const request = sdkPublicReadersBatchRequestSchema.parse(input);
  if (Buffer.byteLength(JSON.stringify(raw), "utf8") > SDK_PUBLIC_READERS_BATCH_MAX_BYTES) {
    throw new Error("Public reader batch payload exceeds its byte bound.");
  }
  const payload = batchPayloadSchema.parse(raw);
  if (payload.results.length !== request.requests.length) { throw new Error("Public reader batch result membership differs."); }
  const results = request.requests.map((member, index) => {
    const value = payload.results[index];
    if (Buffer.byteLength(JSON.stringify(value), "utf8") > SDK_PUBLIC_READERS_MAX_BYTES) {
      throw new Error("Public reader batch member exceeds its byte bound.");
    }
    const result = validateSdkPublicReadersResult(member, value);
    if (Buffer.byteLength(JSON.stringify(result), "utf8") > SDK_PUBLIC_READERS_MAX_BYTES) {
      throw new Error("Public reader batch result member exceeds its byte bound.");
    }
    return result;
  });
  const result = { ...payload, results, sharedDeadlineMilliseconds: SDK_PUBLIC_READERS_BATCH_DEADLINE_MS,
    authority: "bounded-public-utility-batch-read-only;not-project-state-or-runtime-admission",
    limitations: [
      "One to seven unique reviewed methods, each sampled twice in two complete ordered passes. All owners are retained before the first invocation and rechecked around every await. The result is sequential, not an atomic snapshot or a guarantee of later stability.",
      "All methods share one ten-second monotonic deadline and cooperative timer. Expiry prevents further calls or acceptance, but does not cancel an outstanding vendor RPC, its bookkeeping or synchronous work. No retry, partial success or proof caching.",
      "Each member retains its single-reader meaning and limits. SDK-resolved language can be a fallback; toolbar units are not document units; the fixed library UUID does not enumerate libraries. API viewport is not desktop or PCB geometry.",
      "The complete response is bounded to 65536 UTF-8 bytes and each member to 8192 bytes. A failure discards the entire returned batch; it does not undo already performed reads. No design, navigation, network, settings change or Save operation is introduced.",
    ] };
  if (Buffer.byteLength(JSON.stringify(result), "utf8") > SDK_PUBLIC_READERS_BATCH_MAX_BYTES) {
    throw new Error("Public reader batch result exceeds its byte bound.");
  }
  return result;
}
