/* oxlint-disable eslint/no-template-curly-in-string,unicorn/prefer-string-raw -- Vendor methods remain exact quoted source data, including their literal interpolation and escape bytes. */
/** Exact original natural history-body return; source data is not a request or owner. */
import {createHash} from "node:crypto";
import {qualifyCurrentFootprintCopyMainBackendSource} from "./current-footprint-copy-main-backend-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_TAIL_SOURCE=freezeDeep([{"name":"getDataStrByUuid","start":2_596_076,"end":2_596_379,"source":"async getDataStrByUuid(e,r,i){let s=F1.instance(),n=await(await y(e,r)).queryOne({JOIN:s},{EQ:[s.uuid,new d(i)]},{PROJECTION:[s.dataStr]});if(!n)return null;try{return U4.Buffer.from(n.dataStr,\"base64\")}catch(o){throw e.logger.error(`Data decoding error for ${i}`,o),new Error(`Decoding failed: ${o}`)}}","bytes":303,"sha256":"6f2e7e981b8ac6543f6b31a95b3a0d6b8b923b204ec2d530057bff5c9f0d0d30"},{"name":"getDataStr","start":2_604_961,"end":2_605_149,"source":"async getDataStr(){let e=this.ctx.requestParams.uuid;if(!e)throw new Error(\"historyUuid\\u4E0D\\u80FD\\u7A7A\");let r=await this.service.getDataStrByUuid(this.ctx,this.path,e);this.ctx.body=r}","bytes":188,"sha256":"820b898e86ae313f200e009f4c815b77ffddc29f7e5836eacd4b5bd7388aa4de"}]);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BODY_SITE=Object.freeze({
 name:"getDataStr",lineNumber:8573,columnNumber:2685,functionColumn:2524,expression:"[this,e,r]",length:3,
});
export function qualifyCurrentFootprintInverseNativeDeleteMainTailSource(source:string):void{
 qualifyCurrentFootprintCopyMainBackendSource(source);
 for(const row of CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_TAIL_SOURCE){
  const value=source.slice(row.start,row.end);
  if(value!==row.source||Buffer.byteLength(value)!==row.bytes||createHash("sha256").update(value).digest("hex")!==row.sha256){throw new Error("INVERSE_NATIVE_DELETE_MAIN_TAIL_SOURCE");}
 }
}
/** The natural sync(undefined) path is qualified separately from Main.
 * Its runtime argument and pending task still need the original worker issuer. */
export {qualifyCurrentPcbViaPostHistorySyncSource as qualifyCurrentFootprintInverseNativeDeletePostSyncSource} from "./current-pcb-via-post-history-sync-source.ts";
/** Original caller positions for the closed natural read schedule. queryOne
 * and queryAll remain protected by their original selected-SQL classifier. */
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_TAIL_READ_CALLERS=freezeDeep({
 tableExists:{name:"tableExists",lineNumber:1025,columnNumber:3625},
 branch:{name:"MC",lineNumber:8572,columnNumber:14_687},
 history:{name:"yB",lineNumber:8572,columnNumber:23_273},
 ancestry:{name:"UB",lineNumber:8572,columnNumber:26_699},
 body:{name:"getDataStrByUuid",lineNumber:8572,columnNumber:21_496},
});
export function currentFootprintInverseNativeDeleteMainTailReadonlyRoster(selectedReadonlyQueries:8|9):readonly Readonly<{site:"queryOne"|"queryAll";caller:Readonly<{name:string;lineNumber:number;columnNumber:number}>}>[]{
 const c=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_TAIL_READ_CALLERS;
 type Caller=Readonly<{name:string;lineNumber:number;columnNumber:number}>;
 const one=(caller:Caller):Readonly<{site:"queryOne";caller:Caller}>=>({site:"queryOne",caller});
 const all=(caller:Caller):Readonly<{site:"queryAll";caller:Caller}>=>({site:"queryAll",caller});
 return freezeDeep([all(c.branch),one(c.tableExists),one(c.branch),one(c.ancestry),...(selectedReadonlyQueries===9?[one(c.ancestry)]:[]),one(c.tableExists),one(c.history),all(c.history),one(c.body)]);
}
