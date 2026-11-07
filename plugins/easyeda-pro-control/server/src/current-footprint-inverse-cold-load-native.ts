/* oxlint-disable unicorn/max-nested-calls -- Full immutable source-template and complete wire hash projections remain verbatim at this build-only encoder boundary. */
/** Own inverse keys/limits reuse only the immutable source-template encoder.
 * No saved reader origin, controller, runtime flag or continuation transfers. */
import {createHash}from"node:crypto";
import {gzipSync}from"node:zlib";
import {currentFootprintInverseColdLoadArmOrder,currentFootprintInverseColdLoadBudget,currentFootprintInverseColdLoadCases,currentFootprintInverseColdLoadNativeFrame,currentFootprintInverseColdLoadSourceTemplate,currentFootprintInverseColdLoadWire}from"./current-footprint-inverse-cold-load-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_PRODUCER_ARM_REQUESTS as PRODUCER } from "./current-footprint-inverse-producer-protocol.ts";
import {currentPcbViaSavedLoadWorkerWire}from"./current-pcb-via-saved-load-worker-wire.ts";

const literal=(value:string):string=>`@"${value.replaceAll('"','""')}"`;
export function currentFootprintInverseColdLoadNativeSource():string{
 const cases=currentFootprintInverseColdLoadCases();
 const rows=cases.map(command=>{
   const frame=currentFootprintInverseColdLoadNativeFrame(Buffer.from(`${JSON.stringify(currentFootprintInverseColdLoadWire(command,1,"original_worker"))}\0`),command,"original_worker");
   const source=currentPcbViaSavedLoadWorkerWire(currentFootprintInverseColdLoadSourceTemplate(command),1);
   const fields=Object.entries(frame).filter(([name])=>!["action","requestId","phase","method"].includes(name)).map(([name,value])=>`${name}=${String(value)}`).join(",");
   const wire=currentFootprintInverseColdLoadWire(command,73,"original_worker");const hash=createHash("sha256").update(`${JSON.stringify({id:73,method:wire.method,params:wire.params,sessionId:"original_worker"})}\0`).digest("hex");
   return[frame["phase"],source.request["phase"],command.method,hash,fields].join("\t");
 });
 const bytes=Buffer.from(rows.join("\0"));if(bytes.length>60_000){throw new Error("FOOTPRINT_INVERSE_COLD_TABLE_BOUND");}
 // oxlint-disable-next-line node/no-sync -- Fixed inverse-key/source-template association only, using the existing bounded table decoder.
 const packed=gzipSync(bytes,{level:9});const order=currentFootprintInverseColdLoadArmOrder();

 return `public static class EasyedaFootprintInverseColdProtocol{
static readonly string[][] Rows=EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},${String(rows.length)},5);
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-inverse-cold-protocol");}
public static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){string[] found=null;foreach(string[] row in Rows)if(row[0]==phase){Need(found==null);found=row;}Need(found!=null&&found[2]==method&&method!="Debugger.resume");return EasyedaPcbViaSavedLoadWorkerProtocol.Encode(id,session,found[1],method,fields);}
public static void VerifySmoke(){foreach(string[] row in Rows){var fields=new System.Collections.Hashtable();if(row[4].Length>0)foreach(string field in row[4].Split(',')){string[] pair=field.Split('=');Need(pair.Length==2);fields.Add(pair[0],pair[1]);}
string encoded=Encode(73,"original_worker",row[0],row[2],fields);using(var sha=System.Security.Cryptography.SHA256.Create())Need(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()==row[3]);bool denied=false;try{Encode(73,"original_worker",row[0],"Debugger.resume",fields);}catch(System.InvalidOperationException){denied=true;}Need(denied);}}
}
public sealed partial class EasyedaDiagnosticOwner{
static readonly string[] FootprintInverseColdArmOrder=new[]{${order.map(value=>literal(value)).join(",")}};int footprintInverseColdArm,footprintInverseColdHelpers,footprintInverseColdRequests,footprintInverseColdBound;
public void BindFootprintInverseCold(int chunks){if(!footprintInverse209||footprintInverseAborted||footprintInverseCtorHeld!="bootstrap"||footprintInverseProducerStep!=FootprintInverseProducerOrder.Length||footprintInverseProducerHelpers!=${String(PRODUCER.helperSources)}||footprintInverseColdBound!=0||chunks<1||chunks>8)throw Error("footprint-inverse-cold-bind");AssertLive();footprintInverseColdBound=chunks;}
public void SendFootprintInverseCold(int id,string phase,string method,System.Collections.IDictionary fields){if(!footprintInverse209||footprintInverseAborted||!footprintInverseSourceBound||footprintInverseCtorHeld!="bootstrap"||footprintInverseColdBound<1||footprintInverseColdRequests>=46+22*footprintInverseColdBound)throw Error("footprint-inverse-cold-held");AssertLive();
if(footprintInverseColdArm<FootprintInverseColdArmOrder.Length&&phase!="inverse-cold-helper"){if(FootprintInverseColdArmOrder[footprintInverseColdArm]!=phase)throw Error("footprint-inverse-cold-arm-order");footprintInverseColdArm++;}
if(phase=="inverse-cold-helper"&&++footprintInverseColdHelpers>13+9*footprintInverseColdBound)throw Error("footprint-inverse-cold-helper-bound");
if(fields.Contains("uniqueContextId")&&fields["uniqueContextId"]as string!=footprintInverseWorkerContext||fields.Contains("scriptId")&&phase!="inverse-cold-helper"&&fields["scriptId"]as string!=footprintInverseWorkerScript)throw Error("footprint-inverse-cold-source");
string text=EasyedaFootprintInverseColdProtocol.Encode(id,footprintInversePageSession,phase,method,fields);footprintInverseColdRequests++;SendMessage(id,text);}
}
/* inverse-cold maximum${String(currentFootprintInverseColdLoadBudget(8).normal)};no-resume */`;
}
