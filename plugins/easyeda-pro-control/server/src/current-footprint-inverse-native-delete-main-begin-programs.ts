/** Native DELETE result discriminator over unchanged source-qualified BEGIN
 * programs. These strings never enroll the original Via owner or registry. */
import {CURRENT_PCB_VIA_MAIN_BEGIN_CALLS as PREVIOUS} from "./current-pcb-via-main-begin-programs.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_BEGIN_CALLS=freezeDeep({
 save:PREVIOUS.save,transaction:PREVIOUS.transaction,run:PREVIOUS.run,callback:PREVIOUS.callback,
 returned:{...PREVIOUS.returned,program:PREVIOUS.returned.program.replaceAll("private.current-pcb-via-main-begin-result.v1","private.current-footprint-inverse-native-delete-main-begin-result.v1")},
});
