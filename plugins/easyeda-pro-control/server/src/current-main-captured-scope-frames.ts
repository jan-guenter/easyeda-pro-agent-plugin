/** Fixed nested Main frame normalization. A genuine original SQL capture is
 * private provenance supplied by its owner; arbitrary capture objects or
 * Proxy captures are not admitted by matching this table or running a helper. */
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_JOIN_HELPERS as JOIN } from "./current-selected-file-main-sql-fence-programs.ts";
import { CURRENT_SELECTED_FILE_MAIN_REQUEST_FRAME as DRIVER } from "./current-selected-file-main-request-programs.ts";
import { CURRENT_SAVED_PROJECT_REGISTRATION_CONFIG_SITES as REGISTRATION } from "./current-saved-project-registration-config-source.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_SITES as STRUCTURE, CURRENT_PCB_VIA_MAIN_STRUCTURE_CALLERS as STRUCTURE_CALLERS } from "./current-pcb-via-main-structure-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

interface Frame { readonly originalExpression: string; readonly rawExpression: string; readonly legacySize: number; readonly utilIndex: number; readonly program: string }
function need(value: boolean): asserts value { if (!value) { throw new Error("MAIN_CAPTURED_SCOPE_FRAME"); } }
/** Derive a fixed program only from the immutable original expression and its
 * explicitly reviewed F5-free partner. Every other operand is copied exactly. */
function frame(originalExpression: string, rawExpression: string, legacySize: number, utilIndex: number): Readonly<Frame> {
  need(/^\[[\w.$,]+\]$/u.test(originalExpression)); const operands = originalExpression.slice(1, -1).split(","); need(operands.length === legacySize && operands.filter(value => value === "F5").length === 1 && operands[utilIndex] === "F5" && `[${operands.filter(value => value !== "F5").join(",")}]` === rawExpression);
  const checks: string[] = []; const selected = new Map([["sc", "z.sc"], ["sc.Database", 'own(z.sc,"Database")'], ["sc.Statement", 'own(z.sc,"Statement")'], ["Date", "z.date"], ["Date.now", "z.now"], ["Date.prototype", 'own(z.date,"prototype")'], ["Date.prototype.getTime", 'own(own(z.date,"prototype"),"getTime")']]);
  const values = operands.map((value, index) => { if (value === "F5") { return "z.util"; } const expected = selected.get(value), rawIndex = index < utilIndex ? index : index - 1; if (expected !== undefined) { checks.push(`if(own(this,"${String(rawIndex)}")!==${expected})bad();`); } return `own(this,"${String(rawIndex)}")`; });
  if (operands.includes("Date")) { checks.push('if(own(globalThis,"Date")!==z.date||own(z.date,"now")!==z.now)bad();'); }
  const program = `function(capture){${JOIN}\nconst z=original(capture);verify();const proxy=z.proxy;if(typeof proxy!=="function"||proxy!==own(own(z.util,"types"),"isProxy"))bad();verify();if(proxy(this))bad();arr(this,${String(legacySize - 1)});const length=Object.getOwnPropertyDescriptor(this,"length");if(!length||!Object.hasOwn(length,"value")||!length.writable||length.enumerable||length.configurable)bad();for(let i=0;i<${String(legacySize - 1)};i++){const d=Object.getOwnPropertyDescriptor(this,String(i));if(!d||!Object.hasOwn(d,"value")||!d.writable||!d.enumerable||!d.configurable)bad();const v=own(this,String(i));if((v!==null&&typeof v==="object"||typeof v==="function")&&proxy(v))bad();}${checks.join("")}const result=[${values.join(",")}];original(capture);verify();return result;}`;
  return Object.freeze({ originalExpression, rawExpression, legacySize, utilIndex, program });
}
export const CURRENT_MAIN_CAPTURED_SCOPE_FRAME_ROLES = Object.freeze(["driver", "registrationBind", "registrationAfterExec", "registrationOpened", "beginCallback", "beginRun", "historyCallback", "historyRun", "structureCallback", "structureRun"] as const);
export type CurrentMainCapturedScopeFrameRole = typeof CURRENT_MAIN_CAPTURED_SCOPE_FRAME_ROLES[number];
export const CURRENT_MAIN_CAPTURED_SCOPE_FRAMES = freezeDeep({
  driver: frame(DRIVER, "[this,r,i,sc,BL,zL]", 7, 4),
  registrationBind: frame(REGISTRATION.bind.expression, "[this,e,r,i,ca,vu,sd,Q,Jr,_,sc,Date,Date.now,Date.prototype.getTime,Date.prototype,I.systemLibName]", 17, 11),
  registrationAfterExec: frame(REGISTRATION.afterExec.expression, "[this,e,r,i,sc,Date,Date.now]", 8, 5),
  registrationOpened: frame(REGISTRATION.opened.expression, "[this,e,i,sc,Date,Date.now]", 7, 4),
  beginCallback: frame("[this,o,e,r,a,n,sc,F5]", "[this,o,e,r,a,n,sc]", 8, 7),
  beginRun: frame("[this,e,r,a,n,sc,F5]", "[this,e,r,a,n,sc]", 7, 6),
  historyCallback: frame("[this,o,e,r,a,n,sc,F5]", "[this,o,e,r,a,n,sc]", 8, 7),
  historyRun: frame("[this,e,r,a,n,sc,F5]", "[this,e,r,a,n,sc]", 7, 6),
  structureCallback: frame(STRUCTURE.callback.expression, "[this,o,e,r,a,n,sc]", 8, 7),
  structureRun: frame(STRUCTURE_CALLERS.run.expression, "[this,e,r,a,n,sc]", 7, 6),
} as const);
