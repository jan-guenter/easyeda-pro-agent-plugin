/** Fixed manager DEL call sites. Source/function admission remains with the
 * original manager preparation; these coordinates issue no runtime authority. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE as SOURCE } from "./current-footprint-inverse-delete-manager-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_POINTS = freezeDeep({
  body: { name: "", file: "manager", lineNumber: SOURCE.handler.lineNumber, columnNumber: 42_405, functionColumn: SOURCE.handler.columnNumber },
  method: { name: "deleteData", file: "manager", lineNumber: SOURCE.method.lineNumber, columnNumber: 75_433, functionColumn: SOURCE.method.columnNumber },
} as const);
export const CURRENT_FOOTPRINT_INVERSE_DELETE_SEND_EXPRESSIONS = Object.freeze({
  body: "[void 0,t,s]",
  method: "[this,t,arguments.length]",
} as const);
