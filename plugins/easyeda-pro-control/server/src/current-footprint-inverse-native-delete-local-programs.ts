/** One actual tombstone string with uploadLocal's default parseFull=true.
 * The historical Via false-parse programs and two-string copy stay unchanged. */
import {CURRENT_PCB_VIA_LOCAL_UPLOAD_PROGRAMS as PREVIOUS} from "./current-pcb-via-local-upload-programs.ts";
import {CURRENT_NATIVE_OWN_DATA_CHECK as CHECK} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as CACHE} from "./current-native-cache-response-intrinsics.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_HELPERS as SERIAL} from "./current-footprint-inverse-native-delete-serialization-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const before='const local=(a,b)=>{array(a,4);const p=body(b),t=own(a,"1");array(t,1);if(own(a,"0")!==p||own(t,"0")!==own(b,"5")||own(a,"2")!==false||own(a,"3")!==undefined)bad();return p;};';
const after=before.replace('own(a,"2")!==false','own(a,"2")!==true');
function ownLocal(program:string):string{if(program.split(before).length!==2){throw new Error("INVERSE_NATIVE_DELETE_LOCAL_PREIMAGE");}return program.replace(before,after);}
const selected=`function(bundle){${SERIAL}const x=selected(bundle,1,2);verify();return[x.project,x.consistency,x.texts];}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_CAPTURE=`function(upload,bundle,cacheIntrinsics){${CHECK}
dense(upload,3);dense(cacheIntrinsics,28);if(value(upload,"0")!==bundle||value(cacheIntrinsics,"0")!==root||invoke((${CACHE.reprove.program}),cacheIntrinsics,[])!==true)bad();
const state=invoke((${selected}),root,[bundle]);dense(state,3);const original=value(upload,"1");dense(original,9);const project=value(state,"0"),consistency=value(state,"1"),texts=value(state,"2"),strings=value(original,"1");dense(texts,3);dense(strings,1);
const text=value(texts,"2");if(value(original,"0")!==project||value(strings,"0")!==text||value(original,"2")!==true||value(original,"3")!==undefined||typeof text!=="string")bad();
return[[project,strings,true,undefined],[project,strings,consistency,text,undefined,text]];}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_PROGRAMS=freezeDeep({
 localIngress:ownLocal(PREVIOUS.localIngress),headEntry:PREVIOUS.headEntry,headPromise:PREVIOUS.headPromise,headSuccess:PREVIOUS.headSuccess,
 bufferIngress:ownLocal(PREVIOUS.bufferIngress),bufferScheduled:ownLocal(PREVIOUS.bufferScheduled),localReturned:ownLocal(PREVIOUS.localReturned),
});
