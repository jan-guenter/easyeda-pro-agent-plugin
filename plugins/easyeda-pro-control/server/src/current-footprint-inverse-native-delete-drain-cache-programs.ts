/** Own-descriptor cache joins for the natural native DEL drain. Original
 * producer/cache receipts and metadata remain the controller's custody.
 * No Cache/Response method, getter, resolver or application parser is called. */
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CHECK as CHECK}from"./current-footprint-inverse-native-delete-drain-programs.ts";

const cacheCheck=`${CHECK}
const intrinsic=intrinsics=>{
 dense(intrinsics,28);
 if(own(intrinsics,"0")!==root)bad();
 const ctors=["Cache","CacheStorage","Response"];
 for(let i=0;i<3;i++){const ctor=own(intrinsics,""+(i+1)),prototype=own(intrinsics,""+(i+4));if(own(root,ctors[i])!==ctor||own(ctor,"prototype")!==prototype||own(prototype,"constructor")!==ctor||proto(prototype)!==objectProto)bad();}
 let owner=root,found=false;for(let i=0;i<6&&owner!==null;i++){const d=get(owner,"caches");if(d!==undefined){if(owner!==own(intrinsics,"7")||has(d,"value")||d.get!==own(intrinsics,"27")||d.set!==undefined||!d.enumerable||!d.configurable)bad();found=true;break;}owner=proto(owner);}if(!found)bad();
 const methodOwners=[4,4,4,4,5,5,5,5,6,6],methodKeys=["put","match","delete","keys","open","keys","has","delete","clone","arrayBuffer"];
 for(let i=0;i<10;i++){const d=get(own(intrinsics,""+methodOwners[i]),methodKeys[i]);if(!d||!has(d,"value")||d.value!==own(intrinsics,""+(8+i))||!d.writable||!d.enumerable||!d.configurable)bad();}
 const getterKeys=["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"];
 for(let i=0;i<9;i++){const d=get(own(intrinsics,"6"),getterKeys[i]);if(!d||has(d,"value")||d.get!==own(intrinsics,""+(18+i))||d.set!==undefined||!d.enumerable||!d.configurable)bad();}
};
const entry=original=>{
 dense(original,10);const intrinsics=own(original,"5");intrinsic(intrinsics);
 const tuple=own(original,"0"),cache=own(original,"3"),response=own(original,"4");dense(tuple,4);
 if(own(tuple,"0")!==own(original,"2")||own(tuple,"1")!==own(original,"6")||own(tuple,"2")!==response||own(tuple,"3")!==undefined||own(own(original,"2"),"cache")!==cache||proto(cache)!==own(intrinsics,"4")||count(cache)!==0||proto(response)!==own(intrinsics,"6")||count(response)!==0)bad();
 if(own(original,"8")!==own(p,"uuid")||own(original,"9")!==own(p,"_branchUuid"))bad();return tuple;
};
const document=(frame,key,text)=>{entry(frame);if(typeof key!=="string"||typeof text!=="string"||own(frame,"6")!==key||own(frame,"7")!==text)bad();};
`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CACHE_CHECK=cacheCheck;
/** Validate every own descriptor before qualified native JSON.stringify can
 * run. Source-created graph provenance and throwOnSideEffect remain required;
 * this algorithm cannot turn an arbitrary candidate graph into authority. */
const graph=`
const encode=graph=>{
 if(get(objectProto,"toJSON")!==undefined||get(arrayProto,"toJSON")!==undefined)bad();
 const ancestors=[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null];let visited=0;
 const walk=(v,depth)=>{
  if(++visited>8192||depth>=20)bad();if(v===null||typeof v==="boolean")return;
  if(typeof v==="string"){if(v.length>8192)bad();return;}if(typeof v==="number"){if(v-v!==0)bad();return;}if(typeof v!=="object")bad();
  for(let i=0;i<depth;i++)if(ancestors[i]===v)bad();ancestors[depth]=v;
  if(get(v,"toJSON")!==undefined||symbols(v).length!==0)bad();
  if(isArray(v)){const length=own(v,"length");if(typeof length!=="number"||length<0||length>8192||length%1!==0)bad();dense(v,length);for(let i=0;i<length;i++)walk(own(v,""+i),depth+1);}
  else{if(proto(v)!==objectProto)bad();const keys=names(v);if(keys.length>1024)bad();for(let i=0;i<keys.length;i++){const key=own(keys,""+i),d=get(v,key);if(key==="toJSON"||!d||!has(d,"value")||!d.enumerable)bad();walk(d.value,depth+1);}}
  ancestors[depth]=null;
 };walk(graph,0);const text=invoke(own(dependencies,"8"),own(dependencies,"6"),[graph]);if(typeof text!=="string"||text.length>8192)bad();return text;
};
`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_JSON_CHECK=graph;
const localSave=`function(frame,original,key,text,reflection,recipe,dependencies){${cacheCheck}
reply(original);dense(frame,10);const caller=own(frame,"1"),h=own(original,"1"),r=own(original,"2");dense(caller,8);
if(own(caller,"0")!==p||own(caller,"1")!==own(h,"1")||own(caller,"2")!==own(h,"2")||own(caller,"3")!==own(r,"8")||own(caller,"4")!==own(h,"3")||own(caller,"5")!==key||own(frame,"2")!==own(p,"localCache")||text!==own(h,"3"))bad();
const prefix="https://client/localSave/"+own(p,"_branchUuid")+"?key="+own(original,"5")+"&time=";
if(typeof key!=="string"||key.length<=prefix.length||key.length>prefix.length+16)bad();for(let i=0;i<prefix.length;i++)if(key[i]!==prefix[i])bad();for(let i=prefix.length;i<key.length;i++)if(key[i]<"0"||key[i]>"9")bad();
document(frame,key,text);return true;
}`;
const flow=`function(frame,original,key,text,historyUuid,documentUuid,num,reflection,recipe,dependencies){${cacheCheck}
reply(original);dense(frame,10);const caller=own(frame,"1");dense(caller,10);
if(own(frame,"2")!==own(p,"cache")||own(caller,"0")!==p||own(caller,"1")!==documentUuid||own(caller,"2")!==0||own(caller,"3")!==text||own(caller,"4")!==key||own(own(caller,"5"),"uuid")!==historyUuid||own(own(caller,"5"),"num")!==num||own(caller,"6")!==num||own(caller,"7")!==undefined||historyUuid!==own(original,"5")||num!==0||documentUuid!=="FOOTPRINT"||own(p,"isUploadingCloud")!==false||own(p,"pendingSyncCloud")!==false||own(p,"notSyncCloud")!==true||own(p,"isSyncing")!==true)bad();
document(frame,key,text);return true;
}`;
const head=`function(frame,original,key,text,reflection,recipe,dependencies){${cacheCheck}${graph}
reply(original);dense(frame,10);const caller=own(frame,"1");dense(caller,13);
if(own(frame,"2")!==own(p,"cache")||own(caller,"0")!==p||own(caller,"7")!==own(p,"historyIndex")||own(caller,"9")!==true||own(p,"isUploadingCloud")!==false||own(p,"pendingSyncCloud")!==false||own(p,"notSyncCloud")!==true||own(p,"isSyncing")!==true)bad();
entry(frame);if(own(frame,"6")!==key||typeof text!=="string"||encode(own(frame,"7"))!==text)bad();return true;
}`;
const headPromise=`function(frame,original,pending,reflection,recipe,dependencies){${cacheCheck}
reply(original);const tuple=entry(pending);dense(frame,6);for(let i=0;i<4;i++)if(own(frame,""+i)!==own(tuple,""+i))bad();if(own(frame,"4")!==0||typeof own(frame,"5")!=="function")bad();return true;
}`;
const headSuccess=`function(frame,original,entryFrame,pending,reflection,recipe,dependencies){${cacheCheck}
reply(original);const tuple=entry(entryFrame);dense(frame,6);dense(pending,6);for(let i=0;i<4;i++)if(own(frame,""+i)!==own(tuple,""+i))bad();equal(frame,pending,6);if(own(frame,"4")!==0||typeof own(frame,"5")!=="function")bad();return true;
}`;
function capture(kind:"localSave"|"flow"|"head"):string{
 const local=kind==="localSave",member=local?"localCache":"cache";let length=13;if(local){length=8;}else if(kind==="flow"){length=10;}
 let body='const body=own(p,"historyIndex");if(key!=="https://client/index/v1/"+branch||own(caller,"7")!==body)bad();';
 if(kind==="localSave"){body='if(key!==own(caller,"5"))bad();const body=own(caller,"4");';}else if(kind==="flow"){body='if(key!==own(caller,"4"))bad();const body=own(caller,"3");';}
 return`function(frame,caller,intrinsics,original,reflection,recipe,dependencies){${cacheCheck}
reply(original);dense(frame,4);dense(caller,${String(length)});dense(intrinsics,28);
if(own(caller,"0")!==p||own(caller,"${String(length-2)}")!==parent||own(caller,"${String(length-1)}")!==base)bad();
const wrapper=own(frame,"0"),key=own(frame,"1"),response=own(frame,"2"),uuid=own(p,"uuid"),branch=own(p,"_branchUuid");
if(wrapper!==own(p,"${member}")||own(wrapper,"cacheName")!=="${local?"localProject_":"project_"}"+uuid+"${local?"_v1":"_v6"}"||typeof key!=="string"||key.length<1||key.length>4096||own(frame,"3")!==undefined)bad();
${body}${local||kind==="flow"?'if(typeof body!=="string"||body.length>16384)bad();':""}
const result=[frame,caller,wrapper,own(wrapper,"cache"),response,intrinsics,key,body,uuid,branch];entry(result);return result;
}`;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CACHE_PROGRAMS=Object.freeze({localSave,flow,head,headPromise,headSuccess,captureLocalSave:capture("localSave"),captureFlow:capture("flow"),captureHead:capture("head")});
