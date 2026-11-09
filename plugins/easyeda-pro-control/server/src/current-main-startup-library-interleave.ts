/** A paused stock invocation cannot absorb another startup database call.
 * Read-only interleaving requires the already captured predicate and original
 * registered JB/DC receiver. This program invokes no application or SQL body. */
import { CURRENT_MAIN_STARTUP_CONFIG_JOIN_HELPERS as HELPERS } from "./current-main-startup-config-programs.ts";

export const CURRENT_MAIN_STARTUP_LIBRARY_READ_OWNER_PROGRAM = `function(configTracker){${HELPERS}
const old=retained(configTracker),z=old.z;checked(this,z.proxy);arr(this,4);const wrap=checked(own(this,"0"),z.proxy),record=own(old.state,"origins").get(wrap);if(record===undefined)bad();checked(record,z.proxy);const role=own(record,"role");if(role!=="jb"&&role!=="dc")bad();const bound=owner(own(record,"yo"),old.path,old.capture);if(own(this,"3")!==z.sc||bound.wrap!==wrap||bound.db!==own(record,"db")||own(bound.yo,"transactionDepth")!==0)bad();verify();return true;}`;
