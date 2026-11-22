/** Same inert readonly startup grammar, distinct from-birth UI domain. */
import {currentFootprintCopyHeldSavedStartupWire} from "./current-pcb-worker-startup-wire.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_PROFILE as PROFILE} from "./current-footprint-inverse-native-delete-cold-ui-profile.ts";

export function currentFootprintInverseNativeDeleteColdUiStartupWire(raw:unknown,id:number):ReturnType<typeof currentFootprintCopyHeldSavedStartupWire>{
 if(!Number.isSafeInteger(id)||id<1||id>PROFILE.requestLimit){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_STARTUP_ID");}
 const wire=currentFootprintCopyHeldSavedStartupWire(raw,1);
 if(wire.request["startupPhase"]==="footprint-saved-source-read"){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_OLD_SOURCE_REFUSED");}return Object.freeze({command:Object.freeze({...wire.command,id}),request:Object.freeze({...wire.request,requestId:id})});
}
