/** A distinct seven-record state machine over shared immutable wire tables.
 * The substitutions name only private owner fields; they transfer no owner. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { currentPcbViaSaveTailOwnerNative } from "./current-pcb-via-save-tail-observation-native-fragment.ts";
import { currentPcbViaSaveDrainOwnerNative } from "./current-pcb-via-save-drain-native-fragment.ts";
import { currentPcbViaPostHistorySyncOwnerNative } from "./current-pcb-via-post-history-sync-native-fragment.ts";
import { CURRENT_PCB_VIA_REPLAY_NO_PUBLICATION_PROGRAM as VIA_REPLAY } from "./current-pcb-via-replay-program.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_REPLAY_NO_PUBLICATION_PROGRAM as TEXT_REPLAY } from "./current-schematic-relevance-display-replay-program.ts";
import { currentPcbViaPostHistorySyncTemplate } from "./current-pcb-via-post-history-sync-wire.ts";
import { installOwnedNativeDispatch } from "./native-owned-dispatch.ts";
import { installNativeCompileOnlyHook } from "./native-compile-only-hook.ts";

const begin="// BEGIN ORIGINAL RELEVANCE SAVE DRAIN",end="// END ORIGINAL RELEVANCE SAVE DRAIN";
const identifiers:Readonly<Record<string,string>>=Object.freeze({pcbViaWrite209:"schematicRelevanceDisplayWrite209",viaAbortAttempted:"schematicDisplayAbort",viaWorkerStage:"schematicWorkerStage",viaWorkerSession:"schematicWorkerSession",viaProducerContext:"schematicProducerContext",viaWorkerSourceRead:"schematicWorkerSourceRead",viaWorkerInstrumentRemoved:"schematicWorkerInstrumentRemoved",viaProducerObserveArms:"schematicProducerObserveArms",viaWorkerProjectScript:"schematicWorkerProjectScript",viaSaveGenerationAttempted:"relevanceSaveGenerated",viaLocalUploadStep:"relevanceLocalUploadStep",viaUploadRequestStep:"relevanceUploadRequestStep",viaStructureHistoryGranted:"RelevanceHistoryGranted",viaSyncQuiesceCompleted:"RelevanceStartupQuiesced",viaStructureTransportPublished:"schematicStructureTransportPublished",viaLiveHistoryStep:"relevanceLiveHistoryStep"});
function owner(input:string):string{
 let source=input.replaceAll(/\b(?:pcbViaWrite209|via[A-Z]\w*|Via(?:Drain|PostSync)\w*|RequireVia\w*|SendPcbVia\w*|CompletePcbVia\w*)\b/gu,name=>{if(name in identifiers){return identifiers[name]??name;}return name.replace(/^via/u,"relevance").replace(/^Via/u,"Relevance").replace("RequireVia","RequireRelevance").replace("SendPcbVia","SendRelevance").replace("CompletePcbVia","CompleteRelevance");});
 for(const name of ["SaveTailObservationQuote","SaveDrainQuote","PostSyncQuote"]){source=source.replace(`public static string ${name}(string text){return JsonString(text);}`,"");}
 if(/\bvia[A-Z]\w*\b/u.test(source)){throw new Error("RELEVANCE_DRAIN_FOREIGN_OWNER_FIELD");}return source;
}
const sha=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
const quote=(text:string):string=>`@"${text.replaceAll('"','""')}"`;
function native():string{
 const raw=Buffer.from([VIA_REPLAY,TEXT_REPLAY].join("\0"));if(raw.length>65_536){throw new Error("RELEVANCE_REPLAY_TABLE_BOUND");}
 // oxlint-disable-next-line node/no-sync -- Immutable build-time literals use the existing bounded fixed-table decoder.
 const packed=gzipSync(raw,{level:9});
 let post=owner(currentPcbViaPostHistorySyncOwnerNative());
 post=post.replace("string encoded=EasyedaPcbViaPostHistorySyncProtocol.Encode(id,schematicWorkerSession,phase,method,fields);","string encoded=EncodeRelevancePostSync(id,schematicWorkerSession,phase,method,fields);");
 if(!post.includes("string encoded=EncodeRelevancePostSync(")){throw new Error("RELEVANCE_DRAIN_REPLAY_ENCODER");}
 const replayWire=`{"id":79,${currentPcbViaPostHistorySyncTemplate({phase:"via-post-sync-replay"}).template.replaceAll('"__via_post_sync_body__"','"original_body"').replaceAll('"__via_post_sync_entry__"','"original_entry"').replaceAll('"__via_post_sync_merged__"','"original_merged"').replace(JSON.stringify(VIA_REPLAY),JSON.stringify(TEXT_REPLAY)).slice(1,-1)},"sessionId":"worker"}\0`;
 const replayHash=sha(Buffer.from(replayWire));
 const drain=owner(currentPcbViaSaveDrainOwnerNative()).replace("public void CompleteRelevanceSaveDrain(){",'public void CompleteRelevanceSaveDrain(){if(relevanceTailExtraRequests!=42||relevanceLocalCacheRequests!=14)throw Error("relevance-drain-original-cache-metadata");');
 return `${owner(currentPcbViaSaveTailOwnerNative())}${drain}${post}public sealed partial class EasyedaDiagnosticOwner {
 bool RelevanceHistoryGranted {get{return relevanceHistoryStep==20;}}
 bool RelevanceStartupQuiesced {get{return relevancePollingQuiesced&&relevanceLibraryQuiesced;}}
 static readonly string[][] RelevanceReplayPrograms=EasyedaDiagnosticFixedTable.Load(${quote(packed.toString("base64"))},${String(raw.length)},${quote(sha(raw))},${quote(sha(packed))},2,1);
 public static string EncodeRelevancePostSync(int id,string session,string phase,string method,System.Collections.IDictionary fields){string encoded=EasyedaPcbViaPostHistorySyncProtocol.Encode(id,session,phase,method,fields);if(phase=="via-post-sync-replay"){string original=JsonString(RelevanceReplayPrograms[0][0]),replacement=JsonString(RelevanceReplayPrograms[1][0]);int start=encoded.IndexOf(original,StringComparison.Ordinal);if(start<0||encoded.IndexOf(original,start+original.Length,StringComparison.Ordinal)>=0)throw Error("relevance-replay-fixed-program");encoded=encoded.Substring(0,start)+replacement+encoded.Substring(start+original.Length);if(System.Text.Encoding.UTF8.GetByteCount(encoded)>65536)throw Error("relevance-replay-bound");}return encoded;}
 void ObserveRelevanceReplaySave(string phase,System.Collections.IDictionary fields){if(!schematicRelevanceDisplayWrite209||phase!="schematic-save-value")return;if(relevancePostSyncSaveEntry!=null||relevancePostSyncSaveBody!=null||!relevanceSaveGenerated)throw Error("relevance-replay-save-once");relevancePostSyncSaveEntry=fields["argument0"] as string;relevancePostSyncSaveBody=fields["objectId"] as string;}
 public static void VerifyRelevanceDrainSmoke(){var fields=new System.Collections.Hashtable();fields.Add("body","original_body");fields.Add("entry","original_entry");fields.Add("merged","original_merged");string encoded=EncodeRelevancePostSync(79,"worker","via-post-sync-replay","Runtime.callFunctionOn",fields);using(var sha=System.Security.Cryptography.SHA256.Create())if(System.BitConverter.ToString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(encoded))).Replace("-","").ToLowerInvariant()!=${quote(replayHash)})throw Error("relevance-replay-smoke");}
 }`;
}
const sends=Object.freeze([["tail","SendRelevanceSaveTailObservation"],["tail-extra","SendRelevanceTailExtraObserve"],["tail-delete","SendRelevanceSaveTailDelete"],["drain","SendRelevanceSaveDrain"],["post-sync","SendRelevancePostSync"]] as const);
const dispatch=sends.map(([action,method])=>`        'schematic-relevance-display-save-${action}' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or $request.phase -isnot [string] -or $request.method -isnot [string] -or ($request.requestId -isnot [int] -and $request.requestId -isnot [long])){throw 'relevance-save-drain-fields'}
          $baseFields=@('action','helperInstance','id','jobId','rootCreated','rootPid','requestId','phase','method');$fields=New-Object Collections.Hashtable ([StringComparer]::Ordinal)
          foreach($field in $baseFields){if(@($request.PSObject.Properties.Name) -cnotcontains $field){throw 'relevance-save-drain-field'}}
          foreach($property in $request.PSObject.Properties){if($baseFields -cnotcontains $property.Name){$fields.Add($property.Name,$property.Value)}}
          $owner.${method}([int]$request.requestId,$request.phase,$request.method,$fields);$result=@{written=$true}
        }
`).join("")+([['drain','CompleteRelevanceSaveDrain'],['post-sync','CompleteRelevancePostSync']] as const).map(([action,method])=>`        'schematic-relevance-display-save-${action}-complete' {
          if(-not $SchematicRelevanceDisplayWrite209 -or -not $launched -or (@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne 'action,helperInstance,id,jobId,rootCreated,rootPid'){throw 'relevance-save-drain-complete-fields'}
          $owner.${method}();$result=@{completed=$true}
        }
`).join("");
export function applyCurrentSchematicRelevanceDisplaySaveDrainNativeFragment(input:string):string{
 let source=input;const anchor='case "schematic-relevance-display-main-observe":';const actions=[...sends.map(([action])=>`case "schematic-relevance-display-save-${action}":`),...['drain','post-sync'].map(action=>`case "schematic-relevance-display-save-${action}-complete":`)].join("");if(!source.includes(actions)){if(source.split(anchor).length!==2){throw new Error("RELEVANCE_DRAIN_ACTION_ANCHOR");}source=source.replace(anchor,actions+anchor);}
 const bodyHook="ObserveRelevanceSaveBodyRequest(phase,fields);",expanded=`${bodyHook}ObserveRelevanceReplaySave(phase,fields);`;if(!source.includes(expanded)){if(source.split(bodyHook).length!==2){throw new Error("RELEVANCE_DRAIN_SAVE_HOOK");}source=source.replace(bodyHook,expanded);}
 const prepared="public void AssertRelevanceSaveMainPrepared(){";const checked=`${prepared}if(relevanceTailObservationStep!=3)throw Error("relevance-tail-pre-save-arms");`;if(!source.includes(checked)){if(source.split(prepared).length!==2){throw new Error("RELEVANCE_DRAIN_PRE_SAVE_ANCHOR");}source=source.replace(prepared,checked);}
 source=installOwnedNativeDispatch(source,dispatch,"        'schematic-relevance-display-main-observe' {");source=installNativeCompileOnlyHook(source,"    [EasyedaDiagnosticOwner]::VerifyRelevanceDrainSmoke()","    [EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()");
 const value=`${begin}\n${native()}\n${end}`;const start=source.indexOf(begin),stop=source.indexOf(end);if(start!==-1||stop!==-1){if(start===-1||stop<start||source.includes(begin,start+1)||source.includes(end,stop+1)){throw new Error("RELEVANCE_DRAIN_MARKERS");}return source.slice(0,start)+value+source.slice(stop+end.length);}const place="internal enum EasyedaPcbViaWriteBirth { Original }";if(source.split(place).length!==2){throw new Error("RELEVANCE_DRAIN_BODY_ANCHOR");}return source.replace(place,`${value}\n${place}`);
}
/** Complete readable build-time owner body for private C#5 compilation. */
export function currentSchematicRelevanceDisplaySaveDrainOwnerNative():string{return native();}
