/** Exact original DEL success-return site. Source bytes/locations do not
 * supply a receiver, held event, native owner or execution authority. */
import{CURRENT_FOOTPRINT_DELETE_SOURCE as DELETE,CURRENT_FOOTPRINT_DELETE_WORKER as WORKER,assertCurrentFootprintDeleteSource,qualifyCurrentFootprintDeleteSource}from"./current-footprint-delete-source.ts";
import{freezeDeep}from"./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_SOURCE=freezeDeep({
 worker:WORKER,method:DELETE.deleteData,name:"deleteData",arity:1,async:true,regular:false,
 functionLocation:{lineNumber:109,columnNumber:40_299},returned:{lineNumber:109,columnNumber:40_494},
 frame:"[this,s]",maximumFrames:32,
}as const);
export function qualifyCurrentFootprintInverseNativeDeleteReturnSource(source:string):string{
 qualifyCurrentFootprintDeleteSource(source);const row=DELETE.deleteData;const method=source.slice(row.start,row.end);assertCurrentFootprintDeleteSource("deleteData",method);
 const at=(offset:number):Readonly<{lineNumber:number;columnNumber:number}>=>{const before=source.slice(0,offset),last=before.lastIndexOf("\n");return{lineNumber:before.split("\n").length-1,columnNumber:before.length-last-1};};
 const actual=at(row.end-1);const fn=at(row.start+method.indexOf("("));const expected=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_SOURCE;
 if(actual.lineNumber!==expected.returned.lineNumber||actual.columnNumber!==expected.returned.columnNumber||fn.lineNumber!==expected.functionLocation.lineNumber||fn.columnNumber!==expected.functionLocation.columnNumber||!method.endsWith(",{success:!0}}")){throw new Error("INVERSE_NATIVE_DELETE_RETURN_SOURCE");}
 return method;
}
