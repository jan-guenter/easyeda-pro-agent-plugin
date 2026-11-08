/** Exact readonly worker filter used by the derived-footprint query. */
import{createHash}from"node:crypto";
import{freezeDeep}from"./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_REFERENCE_FILTER_SOURCE=freezeDeep({
 getAll:{start:1_881_480,end:1_881_549,source:"getAll(){return Object.values(this.data).filter(s=>this.get(s.uuid))}"},
 getKeysBySource:{start:1_883_780,end:1_883_915,source:"getKeysBySource(s){this.verifySource(s);let r=[];return this.getAll().forEach(i=>{i.source===s&&r.push(i.uuid)}),{success:!0,result:r}}"},
}as const);
export function qualifyCurrentFootprintInverseReferenceFilterSource(source:string):void{if(Buffer.byteLength(source)!==2_181_308||createHash("sha256").update(source).digest("hex")!=="0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046"){throw new Error("INVERSE_REFERENCE_FILTER_SOURCE");}for(const row of Object.values(CURRENT_FOOTPRINT_INVERSE_REFERENCE_FILTER_SOURCE)){if(source.slice(row.start,row.end)!==row.source){throw new Error("INVERSE_REFERENCE_FILTER_SPAN");}}}
