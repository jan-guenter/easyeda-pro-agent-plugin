/** Passive exact buffer/DB/request joins. No SQL, fetch, Buffer method,
 * serializer hook, Promise handler or application method is invoked. */
import {CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN} from "./current-selected-file-main-sql-fence-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const helpers=`${JOIN}
const checked=(o,z)=>{if(o===null||(typeof o!=="object"&&typeof o!=="function")||z.proxy(o))bad();return o;};
const text=(v,n)=>{if(typeof v!=="string"||v.length>n||!v.isWellFormed()||v.includes("\\0"))bad();return v;};
const bytes=(value,z)=>{checked(value,z);if(!ArrayBuffer.isView(value))bad();const names=Reflect.ownKeys(value),n=names.length;const length=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Uint8Array.prototype),"byteLength");if(n<17||n>32768||!length||typeof length.get!=="function"||Reflect.apply(length.get,value,[])!==n)bad();let hex="";const digits="0123456789abcdef";for(let i=0;i<n;i++){if(names[i]!==String(i))bad();const byte=own(value,String(i));if(!Number.isInteger(byte)||byte<0||byte>255)bad();hex+=digits[byte>>4]+digits[byte&15];}return hex;};
const capture=(frame,sqlCapture,requestCapture)=>{const z=original(sqlCapture);checked(frame,z);arr(frame,3);checked(requestCapture,z);arr(requestCapture,9);const requestFrame=checked(own(requestCapture,"0"),z);arr(requestFrame,7);if(own(requestCapture,"1")!==sqlCapture)bad();
const controller=checked(own(frame,"0"),z),ctx=checked(own(controller,"ctx"),z),path=own(controller,"path"),historyUuid=text(own(frame,"1"),32),projectUuid=text(own(ctx,"projectUuid"),64),buffer=checked(own(frame,"2"),z);
if(path!==z.path||!/^[a-f0-9]{32}$/.test(historyUuid)||!/^[a-f0-9]{64}$/.test(projectUuid)||own(ctx,"req")!==own(requestCapture,"2")||own(ctx,"res")!==own(requestFrame,"2"))bad();
const input=checked(own(ctx,"requestParams"),z);if(own(input,"uuid")!==historyUuid||own(input,"path")!==projectUuid)bad();
const pool=checked(own(ctx,"db"),z);if(Object.getPrototypeOf(pool)!==Object.prototype)bad();const promise=checked(own(pool,path),z);if(Object.getPrototypeOf(promise)!==Promise.prototype)bad();const hex=bytes(buffer,z),parts=[];for(let at=0;at<hex.length;at+=8192)parts.push(hex.slice(at,at+8192));verify();return{projectUuid,historyUuid,cipherHexParts:parts};};
const resolved=(sqlCapture,result)=>{const z=original(sqlCapture),sql=checked(result,z);if(Object.getPrototypeOf(sql)!==own(own(sqlCapture,"2"),"prototype")||own(sql,"path")!==z.path||own(sql,"transactionDepth")!==0)bad();const db=checked(own(sql,"db"),z),wrap=checked(own(sql,"dbWrap"),z);
if(own(wrap,"db")!==db||Object.getPrototypeOf(wrap)!==own(own(sqlCapture,"1"),"prototype")||Object.getPrototypeOf(db)!==own(own(z.sc,"Database"),"prototype")||own(db,"filename")!==z.path)bad();
const filename=Object.getOwnPropertyDescriptor(db,"filename");if(!filename||!Object.hasOwn(filename,"value")||filename.writable||filename.enumerable||filename.configurable)bad();
for(const o of[sql,wrap])for(const key of Reflect.ownKeys(Object.getPrototypeOf(o))){const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(o),key);if(d&&typeof d.value==="function"&&Object.hasOwn(o,key))bad();}for(const key of["each","get","run","prepare","close","serialize"])if(Object.hasOwn(db,key))bad();verify();};`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BODY_PROGRAMS=freezeDeep({
 capture:{program:`function(sqlCapture,requestCapture){${helpers}const value=capture(this,sqlCapture,requestCapture);return[this,sqlCapture,requestCapture,value,own(own(own(own(this,"0"),"ctx"),"db"),own(own(this,"0"),"path")),own(this,"2")];}`,arguments:2,length:6,returnByValue:false},
 resolved:{program:`function(result){${helpers}arr(this,6);const frame=own(this,"0");capture(frame,own(this,"1"),own(this,"2"));resolved(own(this,"1"),result);if(own(this,"4")!==own(own(own(own(frame,"0"),"ctx"),"db"),own(own(frame,"0"),"path")))bad();verify();return true;}`,arguments:1,length:0,returnByValue:true},
 value:{program:`function(){${helpers}arr(this,6);const frame=own(this,"0"),value=capture(frame,own(this,"1"),own(this,"2")),prior=own(this,"3");if(own(this,"5")!==own(frame,"2")||own(this,"4")!==own(own(own(own(frame,"0"),"ctx"),"db"),own(own(frame,"0"),"path"))||value.projectUuid!==own(prior,"projectUuid")||value.historyUuid!==own(prior,"historyUuid"))bad();const old=own(prior,"cipherHexParts");arr(old,value.cipherHexParts.length);for(let i=0;i<value.cipherHexParts.length;i++)if(own(old,String(i))!==value.cipherHexParts[i])bad();verify();return value;}`,arguments:0,length:0,returnByValue:true},
});
