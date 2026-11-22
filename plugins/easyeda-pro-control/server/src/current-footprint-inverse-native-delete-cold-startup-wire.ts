/** Reuse only fixed readonly startup syntax under a new channel identity.
 * No legacy saved-source reader, writer marker or caller program is admitted. */
import {currentFootprintCopyHeldSavedStartupWire} from "./current-pcb-worker-startup-wire.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_PROFILE as PROFILE} from "./current-footprint-inverse-native-delete-cold-profile.ts";

export function currentFootprintInverseNativeDeleteColdStartupWire(raw:unknown,id:number):ReturnType<typeof currentFootprintCopyHeldSavedStartupWire>{
 if(!Number.isSafeInteger(id)||id<1||id>PROFILE.requestLimit){throw new Error("INVERSE_NATIVE_DELETE_COLD_STARTUP_ID");}
 const wire=currentFootprintCopyHeldSavedStartupWire(raw,id);
 if(wire.request["startupPhase"]==="footprint-saved-source-read"){throw new Error("INVERSE_NATIVE_DELETE_COLD_LEGACY_SOURCE_REFUSED");}
 return wire;
}
