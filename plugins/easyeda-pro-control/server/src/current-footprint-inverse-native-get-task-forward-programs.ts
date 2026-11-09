/** Live original-frame and actual invocation-Promise joins for the fresh
 * native GET continuation. No function invokes app, BC, SQL or caller code. */
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_HELPERS as common } from "./current-footprint-inverse-native-get-task-manager-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_GET_SEND_EXPRESSIONS as OLD } from "./current-footprint-inverse-get-send-source.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_CHANNEL_EXPRESSIONS as LIVE } from "./current-footprint-inverse-native-get-task-channel-programs.ts";

const before=`function(frame,original,caller,originalCaller,prepared){${common}dense(frame,17);dense(original,17);dense(caller,5);dense(originalCaller,5);dense(prepared,5);for(let j=0;j<17;j++)if(value(frame,""+j)!==value(original,""+j))bad();for(let j=0;j<5;j++)if(value(caller,""+j)!==value(originalCaller,""+j))bad();guard(value(prepared,"4"));return[value(frame,"0"),value(frame,"1"),value(frame,"2"),value(frame,"3"),value(frame,"4"),value(frame,"5"),value(frame,"6")];}`;
const samePromise=`function(original,outer,local,members){${common}dense(members,24);guard(value(members,"23"));if(original!==outer||proto(original)!==value(members,"21")||count(original)!==0||proto(local)!==value(members,"21")||count(local)!==0)bad();return true;}`;
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_FORWARD_PROGRAMS=freezeDeep({before,samePromise}as const);
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_FORWARD_EXPRESSIONS=Object.freeze({inner:LIVE.inner,caller:LIVE.caller,post:OLD.post,uiTimer:OLD.uiTimer,uiOuterLocal:OLD.uiOuterLocal,nativeListener:OLD.nativeListener,incoming:OLD.incoming}as const);
