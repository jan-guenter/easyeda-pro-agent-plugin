/** Private fixed composite read. No dispatch, original-token issuer or write. */
import { buildSymbolWitnessReadExpression, validateSymbolWitnessReadResult } from "./symbol-predispatch-witness.ts";
import type { SymbolPredispatchWitnessScope } from "./symbol-predispatch-witness.ts";
import { buildRendererClockControls, exact, validateClockControlScope, validateClockControls } from "./symbol-clock-controls.ts";
import type { ClockControls } from "./symbol-clock-controls.ts";

export const AGED_WITNESS_PROFILE = "private.aged-symbol-witness-observation.v1";
function need(value: boolean): asserts value { if (!value) { throw new Error("AGED_WITNESS_OBSERVATION_REFUSED"); } }

export function buildAgedSymbolWitnessReadExpression(scope: SymbolPredispatchWitnessScope, controlScopeInput: unknown, actor: unknown): string {
  const controlScope = validateClockControlScope(controlScopeInput), witness = buildSymbolWitnessReadExpression(scope);
  need(scope.createdAtLiteral === controlScope.createdAtLiteral);
  const controls = buildRendererClockControls(controlScope, actor);
  // These retained references span the existing witness reader's native awaits.
  // Each control program also retains its own host, actor and Date receivers.
  return `(async()=>{try{
const root=globalThis;
const bad=()=>{throw new Error('AGED_WITNESS_OBSERVATION_REFUSED');};
const own=(owner,key)=>{if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;};
const date=own(root,'Date'),prototype=own(date,'prototype'),now=own(date,'now');
const names=['getTime','toISOString','getTimezoneOffset','getFullYear','getMonth','getDate','getHours','getMinutes','getSeconds','getMilliseconds'];
const methods=names.map(name=>own(prototype,name));
const check=()=>{if(root.top!==root||root.window!==root||own(root,'Date')!==date||own(date,'prototype')!==prototype||own(date,'now')!==now)bad();for(let i=0;i<names.length;i++)if(own(prototype,names[i])!==methods[i])bad();};
check();const controlsBefore=${controls};check();
let witness;try{witness=await ${witness};}finally{check();}
const controlsAfter=${controls};check();
return{profile:${JSON.stringify(AGED_WITNESS_PROFILE)},witness,controlsBefore,controlsAfter,executionAuthorized:false,producerBindingVerified:false};
}catch{throw new Error('AGED_WITNESS_OBSERVATION_REFUSED');}})()`;
}

export function validateAgedSymbolWitnessReadResult(input: unknown, scope: SymbolPredispatchWitnessScope, controlScopeInput: unknown): Readonly<{
  witness: Readonly<Record<string, unknown>>; controlsBefore: ClockControls; controlsAfter: ClockControls;
}> {
  const value = exact(input, ["profile", "witness", "controlsBefore", "controlsAfter", "executionAuthorized", "producerBindingVerified"]);
  need(value["profile"] === AGED_WITNESS_PROFILE && value["executionAuthorized"] === false && value["producerBindingVerified"] === false);
  const controlScope = validateClockControlScope(controlScopeInput);
  need(controlScope.createdAtLiteral === scope.createdAtLiteral);
  const witness = validateSymbolWitnessReadResult(value["witness"], scope);
  const controlsBefore = validateClockControls(value["controlsBefore"], controlScope, "renderer");
  const controlsAfter = validateClockControls(value["controlsAfter"], controlScope, "renderer");
  const after = controlsAfter.sql[0], before = controlsBefore.sql[0];
  const end = witness["rendererClockAfterMs"], offset = witness["rendererTimezoneOffsetMinutes"], start = witness["rendererClockBeforeMs"];
  need(before !== undefined && after !== undefined && typeof start === "number" && typeof end === "number" &&
    controlsBefore.clockAfter.epochMs <= start && end <= controlsAfter.clockBefore.epochMs &&
    controlsAfter.clockAfter.epochMs - controlsBefore.clockBefore.epochMs <= 10_000 &&
    before.epochMs === witness["rendererParsedCreatedAtMs"] && after.epochMs === before.epochMs &&
    controlsBefore.clockBefore.offsetMinutes === offset && controlsBefore.clockAfter.offsetMinutes === offset &&
    controlsAfter.clockBefore.offsetMinutes === offset && controlsAfter.clockAfter.offsetMinutes === offset &&
    JSON.stringify(controlsBefore.epochs) === JSON.stringify(controlsAfter.epochs) && JSON.stringify(controlsBefore.sql) === JSON.stringify(controlsAfter.sql));
  return Object.freeze({ witness, controlsBefore, controlsAfter });
}
