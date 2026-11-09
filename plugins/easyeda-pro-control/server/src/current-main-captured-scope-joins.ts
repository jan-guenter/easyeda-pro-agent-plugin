/** Fixed one-request normalization followed by each original Main consumer.
 * SQL capture, startup tracker and registration tracker remain independent
 * private owner handles; this table supplies no original-pause authority. */
import { CURRENT_MAIN_CAPTURED_SCOPE_FRAMES as FRAMES } from "./current-main-captured-scope-frames.ts";
import { CURRENT_SELECTED_FILE_MAIN_REQUEST_CALLS as REQUEST } from "./current-selected-file-main-request-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_CALLS as REGISTRATION } from "./current-saved-project-registration-config-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_MAIN_CAPTURED_SCOPE_JOINS = freezeDeep({
  driver: `function(capture){"use strict";const legacy=(${FRAMES.driver.program}).call(this,capture);return (${REQUEST.capture}).call(legacy,capture);}`,
  registrationBind: `function(capture,startup,path){"use strict";const legacy=(${FRAMES.registrationBind.program}).call(this,capture);return (${REGISTRATION.bind}).call(legacy,startup,path);}`,
  registrationAfterExec: `function(capture,registration){"use strict";const legacy=(${FRAMES.registrationAfterExec.program}).call(this,capture);return (${REGISTRATION.afterExec}).call(legacy,registration);}`,
  registrationOpened: `function(capture,registration){"use strict";const legacy=(${FRAMES.registrationOpened.program}).call(this,capture);return (${REGISTRATION.opened}).call(legacy,registration);}`,
} as const);

export const CURRENT_SAVED_PROJECT_REGISTRATION_CAPTURED_FRAMES = freezeDeep({
  bind: FRAMES.registrationBind,
  afterExec: FRAMES.registrationAfterExec,
  opened: FRAMES.registrationOpened,
} as const);

/** Runtime.getProperties presents scope bindings virtually; callFunctionOn
 * receives their Inspector wrapper instead. Accept only that exact wrapper
 * shape and normalize its own data before the unchanged original consumer.
 * The request/SQL captures are original private owner provenance here. */
export const CURRENT_MAIN_CAPTURED_REQUEST_BIND_PROGRAM = `function(requestScope,webidlScope,webidlObject,brandScope){${JOIN}
const capture=own(this,"1"),z=original(capture);verify();if(z.proxy!==own(own(z.util,"types"),"isProxy"))bad();if(z.proxy(this))bad();arr(this,9);const unwrap=(scope,description)=>{if(scope===null||typeof scope!=="object"||z.proxy(scope))bad();const keys=Reflect.ownKeys(scope);if(Object.getPrototypeOf(scope)!==Object.prototype||keys.length!==2||keys[0]!=="description"||keys[1]!=="object")bad();for(const key of keys){const d=Object.getOwnPropertyDescriptor(scope,key);if(!d||!Object.hasOwn(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();}if(own(scope,"description")!==description)bad();const value=own(scope,"object");if(value===null||typeof value!=="object"||z.proxy(value))bad();return value;};const block=unwrap(requestScope,"Block (lib/web/fetch/request.js)"),closure=unwrap(webidlScope,"Closure (lib/web/fetch/request.js)"),brand=unwrap(brandScope,"Closure (lib/web/webidl/index.js)");const result=(${REQUEST.bind}).call(this,block,closure,webidlObject,brand);original(capture);verify();return result;}`;
