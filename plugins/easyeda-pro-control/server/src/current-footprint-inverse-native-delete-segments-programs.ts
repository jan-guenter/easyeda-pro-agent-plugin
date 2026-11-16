/** Readonly old-segment and pending-work join at the original held upload.
 * The genuine completed startup capture is supplied only by original Core. */
import {CURRENT_NATIVE_OWN_DATA_CHECK as CHECK}from"./current-native-own-data-intrinsics.ts";
import {CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES as POST,qualifyCurrentPcbViaPostHistorySyncSource}from"./current-pcb-via-post-history-sync-source.ts";
import {CURRENT_GENERATED_INITIAL_CACHE_SOURCE as CACHE}from"./current-generated-initial-cache-source.ts";
import {freezeDeep}from"./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_FRAME="[this,du,mg,fc,Us,Uo,ou,Na,Ro,Gu]";
const common=`${CHECK}
const plain=o=>{if(o===null||proto(o)!==objectProto)bad();return o;};
const absent=(o,k)=>{if(get(o,k)!==undefined)bad();};
const member=(o,key)=>{let at=o;for(let i=0;i<4&&at!==null;i++){const d=get(at,key);if(d!==undefined){if(!has(d,"value")||typeof d.value!=="function")bad();return d.value;}at=proto(at);}bad();};
const inspect=(initial,module,publication,nativeMap,rows)=>{
dense(initial,16);dense(module,10);dense(publication,49);
const project=value(initial,"0"),index=value(initial,"4"),lg=value(publication,"15"),gd=proto(lg);
if(value(module,"0")!==project||value(publication,"0")!==project||value(root,"PROJECT")!==project||proto(project)!==lg)bad();
if(invoke(value(initial,"5"),root,[])!==true||invoke(value(publication,"48"),root,[])!==true)bad();
if(typeof rows!=="number"||rows%1!==0||rows<1||rows>7)bad();dense(index,rows);if(value(project,"historyIndex")!==index)bad();
for(let i=0;i<rows;i++){
 const head=plain(value(index,""+i)),num=value(head,"num");if(typeof num!=="number"||num%1!==0||num<0||num>7)bad();
 absent(head,"snapshot");const ids=value(head,"docIds");dense(ids,num+1);
 for(let j=0;j<=num;j++){const segment=value(ids,""+j),length=value(segment,"length");if(typeof length!=="number"||length%1!==0||length<1||length>256)bad();dense(segment,length);for(let k=0;k<length;k++){const id=value(segment,""+k);if(typeof id!=="string"||id.length!==16&&id.length!==32)bad();for(let q=0;q<id.length;q++){const c=id[q];if(!(c>="0"&&c<="9"||c>="a"&&c<="f"))bad();}}}
}
for(const key of["notSyncCloud","pendingSyncCloud","isSyncing","isUploadingCloud","isTemporary","isHistoryBack","_isV2Format"])if(value(project,key)!==false)bad();
const set=value(root,"Set"),setProto=value(set,"prototype"),size=get(setProto,"size");if(!size||has(size,"value")||typeof size.get!=="function")bad();
for(const key of["task1","publishTask","task3","cachePromise","syncPendingNodeUuids","confirmedEmptyNodeUuids","warnedEmptyNodeUuids"]){const work=value(project,key);if(invoke(size.get,work,[])!==0||proto(work)!==setProto||count(work)!==0)bad();}
for(const key of["getFlowParse","applySnap","getLastHistoryUuid"]){absent(project,key);absent(lg,key);}
const functions=[value(module,"1"),value(module,"2"),value(module,"3"),value(module,"4"),value(module,"5"),value(module,"6"),value(module,"7"),value(module,"8"),value(module,"9"),value(gd,"getFlowParse"),value(gd,"applySnap"),value(gd,"getLastHistoryUuid"),member(value(project,"consistencyManager"),"flowParseFull")];
const map=value(root,"Map");if(map!==nativeMap)bad();const mapProto=value(map,"prototype"),mapSize=get(mapProto,"size");if(!mapSize||has(mapSize,"value")||typeof mapSize.get!=="function")bad();
return[index,functions,[map,mapSize.get]];};
`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SEGMENTS_PROGRAMS=freezeDeep({
 native:`function(){${CHECK}return value(root,"Map");}`,
 capture:`function(initial,module,publication,nativeMap,rows){${common}const checked=inspect(initial,module,publication,nativeMap,rows);return[initial,module,publication,value(checked,"0"),value(checked,"1"),value(checked,"2")];}`,
 reprove:`function(original,rows){${common}dense(original,6);const retainedNatives=value(original,"5");dense(retainedNatives,2);const checked=inspect(value(original,"0"),value(original,"1"),value(original,"2"),value(retainedNatives,"0"),rows),functions=value(original,"4"),actual=value(checked,"1");dense(functions,13);if(value(checked,"0")!==value(original,"3"))bad();for(let i=0;i<13;i++)if(value(actual,""+i)!==value(functions,""+i))bad();const natives=value(original,"5"),now=value(checked,"2");dense(natives,2);for(let i=0;i<2;i++)if(value(natives,""+i)!==value(now,""+i))bad();
const mapProto=value(value(natives,"0"),"prototype"),project=value(value(original,"0"),"0");
for(const key of["bufferUploadData","bufferUploadCache"]){const data=value(project,key);if(invoke(value(natives,"1"),data,[])!==0||proto(data)!==mapProto||count(data)!==0)bad();}return true;}`,
});
/** Function positions are derived only after both complete source qualifiers. */
export function currentFootprintInverseNativeDeleteSegmentsMetadata(source:string):readonly Readonly<{name:string;arity:number;async:boolean;regular:boolean;lineNumber:number;columnNumber:number;source:string}>[]{
 qualifyCurrentPcbViaPostHistorySyncSource(source);
 const row=CACHE.flowParseFull;const before=source.slice(0,row.start+row.source.indexOf("(")),last=before.lastIndexOf("\n");
 if(source.slice(row.start,row.end)!==row.source){throw new Error("INVERSE_NATIVE_DELETE_SEGMENTS_PARSER_SOURCE");}
 return freezeDeep([...POST,{name:"flowParseFull",arity:0,async:false,regular:false,lineNumber:before.split("\n").length-1,columnNumber:before.length-last-1,source:row.source}]);
}
