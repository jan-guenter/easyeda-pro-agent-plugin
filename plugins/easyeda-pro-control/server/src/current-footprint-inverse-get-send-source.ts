/** Exact source breakpoints for the original selected GET. Return locations
 * come from unmodified-source Node24 Inspector, never estimated padding. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_GET_SEND_POINTS=freezeDeep({
 getData:{file:"manager",name:"getData",lineNumber:104,functionColumn:71_588,columnNumber:71_606},
 innerRpc:{file:"manager",name:"rpcCall",lineNumber:0,functionColumn:8718,columnNumber:8734},
 innerReturned:{file:"manager",name:"rpcCall",lineNumber:0,functionColumn:8718,columnNumber:8983},
 post:{file:"manager",name:"post",lineNumber:0,functionColumn:12_642,columnNumber:12_646},
 postReturned:{file:"manager",name:"post",lineNumber:0,functionColumn:12_642,columnNumber:12_677},
 uiTimer:{file:"ui",name:"",lineNumber:1033,functionColumn:30_312,columnNumber:30_320},
 managerTimer:{file:"manager",name:"",lineNumber:0,functionColumn:7612,columnNumber:7620},
 uiOuterReturned:{file:"ui",name:"rpcCall",lineNumber:1033,functionColumn:30_110,columnNumber:30_341},
 managerOuterReturned:{file:"manager",name:"rpcCall",lineNumber:0,functionColumn:7412,columnNumber:7641},
 onMessage:{file:"manager",name:"onMessage",lineNumber:0,functionColumn:11_822,columnNumber:11_835},
}as const);
export const CURRENT_FOOTPRINT_INVERSE_GET_SEND_EXPRESSIONS=Object.freeze({
 globals:"[Object,Array,Promise,JSON,console,setTimeout]",
 getData:"[this,t,s,arguments.length,J]",
 innerRpc:"[this,e,t,s,arguments.length,Promise,console]",
 post:"[this,e]",
 uiTimer:"[n,r,i,Promise,setTimeout]",
 managerTimer:"[i,n,s,Promise,setTimeout]",
 uiOuterLocal:"[o]",
 managerOuterLocal:"[r]",
 nativeListener:"[this,s]",
 incoming:"[this,e]",
}as const);
