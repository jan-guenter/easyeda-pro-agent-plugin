import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection } from "../src/saved-symbol-projection.ts";

const CLIENT="a".repeat(16), FRESH="b".repeat(16), TARGET="2".repeat(32);
function record(type:string,ticket:number,raw:string,client=CLIENT):string{return `${JSON.stringify({type,ticket,id:"shape",client})}||${raw}`;}
const cases=[
  ["lower-ticket tombstone suppressed",record("ELE_PLACEHOLDER",8,'{"max":1,"dataType":"LINE"}'),record("LINE",4,""),8,1],
  ["same-ticket lower-client tombstone suppressed",record("ELE_PLACEHOLDER",8,'{"max":1,"dataType":"LINE"}',"f".repeat(16)),record("LINE",8,""),8,1],
  ["newer tombstone selected",record("ELE_PLACEHOLDER",4,'{"max":1,"dataType":"LINE"}'),record("LINE",8,""),8,8],
  ["same-ticket higher-client tombstone selected",record("ELE_PLACEHOLDER",8,'{"max":1,"dataType":"LINE"}',"0".repeat(16)),record("LINE",8,""),8,8],
  ["ordinary same-ticket lower-client tombstone suppressed",record("LINE",8,'{"x":1}',"f".repeat(16)),record("LINE",8,""),8,8],
  ["first tombstone selected",record("LINE",4,""),record("LINE",4,""),4,4],
]as const;
for(const[name,first,second,maximumTicket,metadataTicket]of cases){
  void test(`retained native selected-callback ticket: ${name}`,async()=>{
    const header=`{"type":"DOCHEAD","ticket":1}||${JSON.stringify({docType:"SYMBOL",uuid:TARGET,client:CLIENT,updateTime:100,version:"100"})}`;
    const meta='{"type":"META","ticket":1,"id":"META"}||{"title":"Synthetic","description":"","tags":[],"docType":2,"source":""}';
    const chunks=[[header,meta,first,second].join("|\n")];
    const projection=await prepareSavedSymbolProjection({chunks,targetUuid:TARGET,maximumTicket,currentEditVersion:"3.0"});
    assert.ok(expectedSavedSymbolContent(projection,FRESH).includes(`{"type":"META","ticket":${String(metadataTicket)},"id":"META"}||`));
  });
}
