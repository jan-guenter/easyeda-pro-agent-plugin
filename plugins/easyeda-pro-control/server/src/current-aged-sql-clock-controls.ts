/** Fixed current-profile Date observations. No execution or producer authority. */
import { buildMainClockReference, buildRendererClockControls, exact, validateClockControlScope, validateClockControls } from "./symbol-clock-controls.ts";
import type { ClockControlScope, ClockControls } from "./symbol-clock-controls.ts";
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE } from "./symbol-dual-actor.ts";

export const CURRENT_AGED_SQL_DATE_PARSER_SOURCE = Object.freeze({
  file: "app.js", bytes: 2_657_192,
  sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c",
  utf16Offset: 1_322_261, functionName: "rl",
  source: "function rl(t){let e=new Date(t).getTime(),r=new Date().getTimezoneOffset()*1e3*60;return new Date(e-r)}",
});
const MAX_OFFSET_MINUTES = 840;
const CANDIDATE_COUNT = MAX_OFFSET_MINUTES * 2 + 1;
type Role = "renderer" | "main-reference";
interface Scan { readonly offsets: readonly number[]; readonly matchingParsedLocalMs: number }
export interface CurrentAgedSqlClockControls {
  readonly profile: "private.current-aged-sql-clock-controls.v1";
  readonly role: Role; readonly scope: ClockControlScope;
  readonly controlsBefore: ClockControls; readonly controlsAfter: ClockControls;
  readonly scanBefore: Scan; readonly scanAfter: Scan;
  readonly producerBindingVerified: false; readonly executionAuthorized: false;
}
function bad(): never { throw new Error("CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED"); }
function wallTime(scope: ClockControlScope): number {
  // The literal has already passed exact calendar validation. This explicit UTC
  // Conversion is only the exhaustive candidate origin, never the native parse.
  return Date.parse(`${scope.createdAtLiteral.replace(" ", "T")}Z`);
}
function contextSource(role: Role): string {
  if (role === "main-reference") {
    return `const process=own(root,'process'),env=own(process,'env');
const context=()=>{if(own(root,'process')!==process||own(process,'env')!==env||Reflect.ownKeys(env).some(key=>typeof key!=='string'||key.toUpperCase()==='TZ'))bad();};`;
  }
  return `const ui=own(root,'UI'),host=own(root,'gVars'),project=own(host,'currentProject');
const document=root.document,location=root.location,href=location?.href,mode=own(root,'PRO_EDITOR_MODE');
${SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE}
const context=()=>{
 if(root.top!==root||root.window!==root||own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(host,'currentProject')!==project)bad();
 if(root.document!==document||document.nodeType!==9||document.defaultView!==root||document.URL!==href||root.location!==location||location.href!==href||location.origin!=='https://client'||own(root,'PRO_EDITOR_MODE')!==mode)bad();
 checkDualActor();
};`;
}

/** There is deliberately no transport or caller-selectable Date program. The
 * existing renderer compiler binds UI/dual actor; the scratch compiler excludes
 * inherited TZ. Original current-generation owners must still collect these.
 */
export function buildCurrentAgedSqlClockControls(input: unknown, role: Role, expectedActor?: unknown): string {
  if (role !== "renderer" && role !== "main-reference") { bad(); }
  const scope = validateClockControlScope(input);
  const controls = role === "renderer" ? buildRendererClockControls(scope, expectedActor) : buildMainClockReference(scope);
  return `(()=>{try{
const bad=()=>{throw new Error('CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED');};
const own=(owner,key)=>{const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const root=globalThis,apply=Reflect.apply,nativeDate=own(root,'Date'),prototype=own(nativeDate,'prototype');
const names=['getTime','getTimezoneOffset','getFullYear','getMonth','getDate','getHours','getMinutes','getSeconds','getMilliseconds'];
const methods=names.map(name=>own(prototype,name)),now=own(nativeDate,'now');
if(typeof nativeDate!=='function'||typeof now!=='function'||methods.some(method=>typeof method!=='function'))bad();
${contextSource(role)}
const check=()=>{context();if(own(root,'Date')!==nativeDate||own(nativeDate,'prototype')!==prototype||own(nativeDate,'now')!==now)bad();for(let i=0;i<names.length;i++)if(own(prototype,names[i])!==methods[i])bad();};
const controlsBefore=${controls};check();
const selected=controlsBefore.sql[0],wallMs=${wallTime(scope)},target=selected.local.join(',');
const scan=()=>{
 const offsets=[];let match=null;
 for(let candidateOffset=-840;candidateOffset<=840;candidateOffset++){
  check();const epochMs=wallMs+candidateOffset*60000;let date;try{date=new nativeDate(epochMs);}finally{check();}
  const values=methods.map(method=>{check();let value;try{value=apply(method,date,[]);}finally{check();}return value;});
  const offset=values[1],local=[values[2],values[3]+1,...values.slice(4)];
  if(values[0]!==epochMs||!Number.isSafeInteger(offset)||Math.abs(offset)>840||Object.is(offset,-0)||local.some(value=>!Number.isSafeInteger(value)))bad();
  // This first profile refuses any transition within every possible parse of
  // the literal, including folds/gaps. Seasonal offsets outside it may differ.
  if(offset!==selected.offsetMinutes)bad();offsets.push(offset);
  const sameLocal=local.join(',')===target;
  if(sameLocal!==(candidateOffset===offset))bad();
  if(sameLocal){if(match!==null)bad();match=epochMs;}
 }
 if(match!==selected.epochMs)bad();return{offsets,matchingParsedLocalMs:match};
};
const scanBefore=scan(),scanAfter=scan();check();
const controlsAfter=${controls};check();
return{profile:'private.current-aged-sql-clock-controls.v1',role:${JSON.stringify(role)},scope:${JSON.stringify(scope)},controlsBefore,controlsAfter,scanBefore,scanAfter,producerBindingVerified:false,executionAuthorized:false};
}catch{throw new Error('CURRENT_AGED_SQL_CLOCK_CONTROLS_REFUSED');}})()`;
}

function scan(input: unknown, controls: ClockControls): Scan {
  const value = exact(input, ["offsets", "matchingParsedLocalMs"]);
  const offsets = value["offsets"], selected = controls.sql[0];
  if (selected === undefined || !Array.isArray(offsets) || offsets.length !== CANDIDATE_COUNT ||
      Reflect.ownKeys(offsets).length !== CANDIDATE_COUNT + 1 || value["matchingParsedLocalMs"] !== selected.epochMs) { bad(); }
  const result: number[] = [];
  for (let index = 0; index < CANDIDATE_COUNT; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(offsets, String(index));
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || descriptor.value !== selected.offsetMinutes || Object.is(descriptor.value, -0)) { bad(); }
    result.push(selected.offsetMinutes);
  }
  if (selected.epochMs !== wallTime(controls.scope) + selected.offsetMinutes * 60_000) { bad(); }
  return Object.freeze({ offsets: Object.freeze(result), matchingParsedLocalMs: selected.epochMs });
}

export function validateCurrentAgedSqlClockControls(input: unknown, expectedScope: unknown, role: Role): CurrentAgedSqlClockControls {
  if (role !== "renderer" && role !== "main-reference") { bad(); }
  const value = exact(input, ["profile", "role", "scope", "controlsBefore", "controlsAfter", "scanBefore", "scanAfter", "producerBindingVerified", "executionAuthorized"]);
  const scope = validateClockControlScope(expectedScope), suppliedScope = validateClockControlScope(value["scope"]);
  if (value["profile"] !== "private.current-aged-sql-clock-controls.v1" || value["role"] !== role ||
      suppliedScope.createdAtLiteral !== scope.createdAtLiteral || suppliedScope.referenceUtcMs !== scope.referenceUtcMs ||
      value["producerBindingVerified"] !== false || value["executionAuthorized"] !== false) { bad(); }
  const after = validateClockControls(value["controlsAfter"], scope, role), before = validateClockControls(value["controlsBefore"], scope, role);
  if (JSON.stringify(before.epochs) !== JSON.stringify(after.epochs) || JSON.stringify(before.sql) !== JSON.stringify(after.sql) ||
      before.clockAfter.epochMs > after.clockBefore.epochMs || after.clockAfter.epochMs - before.clockBefore.epochMs > 10_000 ||
      before.clockBefore.offsetMinutes !== after.clockAfter.offsetMinutes) { bad(); }
  return Object.freeze({ profile: "private.current-aged-sql-clock-controls.v1", role, scope, controlsBefore: before, controlsAfter: after,
    scanBefore: scan(value["scanBefore"], before), scanAfter: scan(value["scanAfter"], after),
    producerBindingVerified: false, executionAuthorized: false });
}
