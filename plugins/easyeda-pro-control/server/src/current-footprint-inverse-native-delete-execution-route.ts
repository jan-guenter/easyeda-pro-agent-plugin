/** Fixed direct-native DEL route/source data only. This catalogue creates
 * no Call, accepted worker origin, clock or mutation permission. */
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE as SOURCE} from "./current-footprint-inverse-delete-manager-source.ts";

export type CurrentFootprintInverseNativeDeleteExecutionKind="delete";
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_EXECUTION_PROFILES=freezeDeep({delete:{group:"footprint",method:"deleteData",topic:"/mgr/projectWorker/footprint/delete",outer:"/PrjDB/footprint/delete",argument:true,callbackFn:SOURCE.handler.columnNumber,callbackEntry:42_405,callbackCall:42_435,methodFn:SOURCE.method.columnNumber,methodEntry:75_433,methodCall:75_478}} as const);
