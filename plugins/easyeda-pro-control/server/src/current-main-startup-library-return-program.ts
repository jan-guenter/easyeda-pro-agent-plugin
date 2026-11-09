/** A real debugger return-value reference is independently required. SQL
 * counts and a fresh frame receiver alone cannot prove an async normal return. */
import { CURRENT_MAIN_STARTUP_LIBRARY_JOIN_HELPERS as HELPERS } from "./current-main-startup-library-programs.ts";

export const CURRENT_MAIN_STARTUP_LIBRARY_RETURN_PROGRAM = `function(configTracker,tracker,returnPromise,returned){${HELPERS}
const old=libraryRetained(tracker,configTracker),z=old.z;checked(this,z.proxy);arr(this,1);checked(returnPromise,z.proxy);checked(returned,z.proxy);const isPromise=own(own(z.util,"types"),"isPromise");if(typeof isPromise!=="function"||z.proxy(isPromise)||Function.prototype.toString.call(isPromise)!=="function () { [native code] }"||!isPromise(returnPromise))bad();if(returnPromise===returned||own(this,"0")!==old.current.yo||returned!==old.current.yo||own(old.state,"next")!==332)bad();verify();return true;}`;
