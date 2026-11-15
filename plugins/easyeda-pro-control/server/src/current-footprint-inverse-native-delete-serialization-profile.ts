/** Original tombstone serialization points; no upload/parser continuation. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_SITES = freezeDeep({
  headReady: { lineNumber: 109, columnNumber: 40_186, functionName: "deleteString", functionLine: 109, functionColumn: 40_040, expression: "[this,s,r,i,n,qe,Ke,xt,$e,Ie,JSON,String]" },
  setterEntry: { lineNumber: 4, columnNumber: 3359, functionName: "setMaxTicket", functionLine: 4, functionColumn: 3353, expression: "[this,e,t,xt,$e,Ie,JSON,String]" },
  setterReturned: { lineNumber: 4, columnNumber: 3403, functionName: "setMaxTicket", functionLine: 4, functionColumn: 3353, expression: "[this,e,t,xt,$e,Ie,JSON,String]" },
  stringReturned: { lineNumber: 109, columnNumber: 40_282, functionName: "deleteString", functionLine: 109, functionColumn: 40_040, expression: "[this,s,r,i,n,a,o,qe,Ke,xt,$e,Ie,JSON,String]" },
  callerReady: { lineNumber: 109, columnNumber: 40_450, functionName: "deleteData", functionLine: 109, functionColumn: 40_299, expression: "[this,s,r,xt,$e,Ie,JSON,String]" },
  uploadEntry: { lineNumber: 110, columnNumber: 17_028, functionName: "uploadLocal", functionLine: 110, functionColumn: 17_009, expression: "[this,t,s,r,xt,$e,Ie,JSON,String]" },
} as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_ORDER = Object.freeze(["headReady", "setterEntry", "setterReturned", "stringReturned", "callerReady", "uploadEntry"] as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_BEGIN = Object.freeze({ lineNumber: 109, columnNumber: 40_077, functionName: "deleteString", functionLine: 109, functionColumn: 40_040, expression: "[this,s,r,i,n,qe,Ke,xt,$e,Ie,JSON,String]" });
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_SERIALIZATION_FRAME_LENGTHS = Object.freeze({ begin: 12, headReady: 12, setterEntry: 8, setterReturned: 8, stringReturned: 14, callerReady: 8, uploadEntry: 9 } as const);
