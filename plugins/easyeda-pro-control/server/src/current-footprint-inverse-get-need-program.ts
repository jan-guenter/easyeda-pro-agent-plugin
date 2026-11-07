/** Descriptor-only branch check after original object metadata. Undefined is
 * a fixed own-field requirement; JSON loss or a caller flag cannot select it. */
import { CURRENT_NATIVE_MESSAGE_EVENT_CAPTURE_HELPERS_V2 as HELPERS } from "./current-native-message-event-programs-v2.ts";

export const CURRENT_FOOTPRINT_INVERSE_GET_NEED_PROGRAM=`function(intrinsics,targetUuid){${HELPERS}if(typeof targetUuid!=="string"||targetUuid.length!==16&&targetUuid.length!==32)bad();for(let i=0;i<targetUuid.length;i++){const c=targetUuid[i];if(!(c>="0"&&c<="9"||c>="a"&&c<="f"))bad();}if(parent(this)!==objectProto||size(this)!==2||own(this,"uuid")!==targetUuid||own(this,"need")!==undefined)bad();verify();return[intrinsics,this,targetUuid,()=>{verify();return true;}];}`;
