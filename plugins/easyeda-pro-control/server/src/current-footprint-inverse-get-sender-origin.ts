/** Original UI-realm serialized origin. This collector issues no GetJob and
 * does not use CDP context origins, Location or a worker receipt. */
import { z } from "zod";
import type { CURRENT_NATIVE_SERIALIZED_ORIGIN_PROGRAMS as PROGRAMS} from "./current-native-serialized-origin.ts";
import {currentNativeSerializedOriginCallable,qualifyCurrentNativeSerializedOriginFunction,qualifyCurrentNativeSerializedOriginPrototype } from "./current-native-serialized-origin.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { currentFootprintInverseLookupArray as array,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties,currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import type { CurrentFootprintInverseLookupRemote as Remote } from "./current-footprint-inverse-lookup-preentry-replies.ts";

interface Bindings {
  readonly current:()=>void;
  readonly properties:(objectId:string)=>Promise<unknown>;
  readonly call:(role:keyof typeof PROGRAMS,references:readonly string[],original?:string)=>Promise<unknown>;
}
export interface CurrentFootprintInverseGetSenderOrigin {
  readonly chain:string;readonly getter:string;readonly origin:string;readonly owners:number;
  readonly reprove:()=>Promise<void>;
}
export const CURRENT_FOOTPRINT_INVERSE_GET_SENDER_ORIGIN_BOUND=Object.freeze({calls:20,properties:50,helpers:20,cdpRequests:90}as const);
function need(condition:boolean):asserts condition{if(!condition){throw new Error("INVERSE_GET_SENDER_ORIGIN");}}
export async function collectCurrentFootprintInverseGetSenderOrigin(b:Bindings):Promise<Readonly<CurrentFootprintInverseGetSenderOrigin>>{
  const props=async(id:string):Promise<unknown>=>{b.current();const raw=await b.properties(id);b.current();return raw;};
  const call=async(role:keyof typeof PROGRAMS,refs:readonly string[],original?:string):Promise<unknown>=>{b.current();const raw=await b.call(role,refs,original);b.current();return raw;};
  const initial=result(await call("begin",[]),2);const initialValues=array(await props(initial),2);const root=initialValues[0];const empty=initialValues[1];need(root!==undefined&&empty!==undefined);let owner=object(root);let chain=object(empty);array(await props(chain),0);
  for(let owners=1;owners<=8;owners+=1){
    const snapshot=result(await call("step",[owner,chain]),5);const values=array(await props(snapshot),5);const next=values[1];const get=values[2];const set=values[3];const guard=values[4];need(next!==undefined&&get!==undefined&&set!==undefined&&guard!==undefined);properties(await props(object(guard)));
    if(next.type==="object"&&next.subtype!=="null"){qualifyCurrentNativeSerializedOriginPrototype(await props(object(next)),next);}else{need(next.type==="object"&&next.subtype==="null"&&next.value===null);}
    const qualify=async(value:Remote,role:"get"|"set"):Promise<string|null>=>{if(value.type==="object"&&value.subtype==="null"&&value.value===null){return null;}const id=currentNativeSerializedOriginCallable(value,role);qualifyCurrentNativeSerializedOriginFunction(await props(id),value,role);return id;};
    const getter=await qualify(get,"get");await qualify(set,"set");chain=result(await call("append",[chain,snapshot]),owners);array(await props(chain),owners);
    if(getter!==null){const origin=z.strictObject({result:z.strictObject({type:z.literal("string"),value:z.string().min(1).max(2048)})}).parse(capture(await call("read",[chain,getter]))).result.value;need(!origin.includes("\0"));const finalChain=chain;const reprove=async():Promise<void>=>{const raw=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(capture(await call("reprove",[finalChain,getter],origin)));need(raw.result.value);};return Object.freeze({chain:finalChain,getter,origin,owners,reprove});}
    need(next.subtype!=="null");owner=object(next);
  }
  throw new Error("INVERSE_GET_SENDER_ORIGIN_DEPTH");
}
