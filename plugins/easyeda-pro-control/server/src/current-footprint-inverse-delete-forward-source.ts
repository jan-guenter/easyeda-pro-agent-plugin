/** Exact shared transport breakpoints for the original DEL. Return locations
 * come from unmodified-source Node24 Inspector, never estimated padding. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_POINTS=freezeDeep({
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
export { CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_EXPRESSIONS } from "./current-footprint-inverse-delete-forward-programs.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_LOCATION_POINTS = freezeDeep({ ...CURRENT_FOOTPRINT_INVERSE_DELETE_FORWARD_POINTS,
 "tail-p4Returned": { file: "ui", name: "P4", lineNumber: 1321, functionColumn: 124_710, columnNumber: 124_844 },
 "tail-yyReturned": { file: "ui", name: "yy", lineNumber: 1954, functionColumn: 68_814, columnNumber: 68_856 },
 "tail-jaReturned": { file: "ui", name: "Ja", lineNumber: 1321, functionColumn: 124_325, columnNumber: 124_692 },
 forceReturned: { file: "ui", name: "rpcCall", lineNumber: 1033, functionColumn: 30_110, columnNumber: 30_341 },
} as const);
