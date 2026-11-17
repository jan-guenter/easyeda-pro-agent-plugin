/** Original detached IIFE's one successful native Cache.delete. These
 * observers call no cache method or getter, application method or resolver. */
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_CACHE_CHECK as CHECK}from"./current-footprint-inverse-native-delete-drain-cache-programs.ts";

const common=`${CHECK}
const originalFrame=(frame,original,intrinsics)=>{reply(original);intrinsic(intrinsics);dense(frame,4);
 const wrapper=own(frame,"0"),key=own(frame,"1"),local=own(original,"3"),cache=own(wrapper,"cache");
 if(wrapper!==own(p,"localCache")||wrapper!==own(local,"2")||own(wrapper,"cacheName")!=="localProject_"+own(p,"uuid")+"_v1"||proto(cache)!==own(intrinsics,"4")||count(cache)!==0||key!==own(local,"6")||own(frame,"2")!==undefined||own(frame,"3")!==undefined)bad();
 const prefix="https://client/upload/"+own(p,"_branchUuid")+"?key=";if(typeof key!=="string"||key.length!==prefix.length+16)bad();for(let i=0;i<prefix.length;i++)if(key[i]!==prefix[i])bad();for(let i=prefix.length;i<key.length;i++){const c=key[i];if(!(c>="0"&&c<="9"||c>="a"&&c<="f"))bad();}
 oneMap(own(p,"bufferUploadCache"),"","",true);return cache;
};
`;
const call=`function(frame,caller,intrinsics,original,reflection,recipe,dependencies){${common}
const cache=originalFrame(frame,original,intrinsics);dense(caller,6);const history=own(original,"1"),response=own(own(original,"2"),"8"),job=own(history,"1");
if(own(caller,"0")!==p||own(caller,"1")!==job||own(caller,"2")!==own(history,"2")||own(caller,"3")!==response||own(caller,"4")!==own(history,"3")||own(caller,"5")!==own(frame,"1"))bad();
if(proto(job)!==objectProto||count(job)!==2)bad();const urls=own(job,"url"),chunks=own(job,"data");dense(urls,1);dense(chunks,1);if(own(urls,"0")!==own(frame,"1")||own(chunks,"0")!==own(history,"3")||own(own(original,"3"),"7")!==own(history,"3"))bad();oneMap(own(caller,"2"),"","",true);
return[frame,caller,intrinsics,p,cache];
}`;
const returned=`function(frame,previous,original,intrinsics,reflection,recipe,dependencies){${common}
const cache=originalFrame(frame,original,intrinsics);dense(previous,5);if(own(previous,"2")!==intrinsics||own(previous,"3")!==p||own(previous,"4")!==cache)bad();equal(frame,own(previous,"0"),4);oneMap(own(own(previous,"1"),"2"),"","",true);return[frame,intrinsics,p];
}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_DELETE_PROGRAMS=Object.freeze({call,returned});
