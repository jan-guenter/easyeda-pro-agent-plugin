/** Private fixed Date observation compilers. No transport or execution grant. */
import { SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE, validateActorProjection } from "./symbol-dual-actor.ts";

type Bag = Record<string, unknown>;
export interface ClockControlScope { readonly createdAtLiteral: string; readonly referenceUtcMs: number }
export interface DateVector { readonly input: string | number; readonly epochMs: number; readonly iso: string; readonly offsetMinutes: number; readonly local: readonly number[] }
export interface ClockControls {
  readonly profile: "private.clock-controls.v1"; readonly role: "renderer" | "main-reference"; readonly scope: ClockControlScope;
  readonly clockBefore: DateVector; readonly clockAfter: DateVector; readonly epochs: readonly DateVector[]; readonly sql: readonly DateVector[];
  readonly environmentTzAbsent: true | null; readonly producerBindingVerified: false; readonly appClockVerified: false; readonly executionAuthorized: false;
}
function bad(): never { throw new Error("CLOCK_CONTROLS_REFUSED"); }
export function exact(input: unknown, keys: readonly string[]): Bag {
  if (input === null || typeof input !== "object" || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== keys.length) { bad(); }
  const value: Bag = {};
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { bad(); }
    value[key] = descriptor.value as unknown;
  }
  return value;
}
function integer(input: unknown, low: number, high: number): number {
  if (typeof input !== "number" || !Number.isSafeInteger(input) || input < low || input > high) { bad(); } return input;
}
function calendar(input: unknown): readonly number[] {
  if (!Array.isArray(input) || input.length !== 7 || Reflect.ownKeys(input).length !== 8) { bad(); }
  const limits = [[1000, 9999], [1, 12], [1, 31], [0, 23], [0, 59], [0, 59], [0, 999]] as const;
  const value: number[] = [];
  for (const [index, limit] of limits.entries()) {
    const item = Object.getOwnPropertyDescriptor(input, String(index));
    if (item === undefined || !Object.hasOwn(item, "value")) { bad(); }
    value.push(integer(item.value, limit[0], limit[1]));
  }
  const [year, month, day, hour, minute, second, ms] = value;
  if (year === undefined || month === undefined || day === undefined || hour === undefined || minute === undefined || second === undefined || ms === undefined) { bad(); }
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second, ms));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) { bad(); }
  return value;
}
function utcCalendar(value: readonly number[]): number {
  const [year, month, day, hour, minute, second, ms] = value;
  if (year === undefined || month === undefined || day === undefined || hour === undefined || minute === undefined || second === undefined || ms === undefined) { bad(); }
  return Date.UTC(year, month - 1, day, hour, minute, second, ms);
}
export function validateClockControlScope(input: unknown): ClockControlScope {
  const value = exact(input, ["createdAtLiteral", "referenceUtcMs"]);
  const text = value["createdAtLiteral"];
  if (typeof text !== "string" || !/^(?:19[7-9]\d|[2-9]\d{3})-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u.test(text)) { bad(); }
  calendar([...text.split(/[- :]/u).map(Number), 0]);
  return Object.freeze({ createdAtLiteral: text, referenceUtcMs: integer(value["referenceUtcMs"], 0, 253_402_214_399_999) });
}
export function controlInputs(scope: ClockControlScope): Readonly<{ epochs: readonly number[]; sql: readonly string[] }> {
  return { epochs: [scope.referenceUtcMs, Date.UTC(2026, 0, 15, 12), Date.UTC(2026, 6, 15, 12), Date.UTC(1999, 0, 15, 12), Date.UTC(1999, 6, 15, 12)],
    sql: [scope.createdAtLiteral, "2026-01-15 12:34:56", "2026-07-15 12:34:56", "1999-01-15 12:34:56", "1999-07-15 12:34:56"] };
}
const SHARED = String.raw`
const nativeDate=own(root,'Date'),prototype=own(nativeDate,'prototype');
const names=['getTime','toISOString','getTimezoneOffset','getFullYear','getMonth','getDate','getHours','getMinutes','getSeconds','getMilliseconds'];
const methods=names.map(name=>own(prototype,name)),now=own(nativeDate,'now');
if(typeof nativeDate!=='function'||typeof now!=='function'||methods.some(value=>typeof value!=='function'))bad();
const check=()=>{
 context();
 if(own(root,'Date')!==nativeDate||own(nativeDate,'prototype')!==prototype||own(nativeDate,'now')!==now)bad();
 for(let i=0;i<names.length;i++)if(own(prototype,names[i])!==methods[i])bad();
};
const call=(fn,receiver,args)=>{check();try{return apply(fn,receiver,args);}finally{check();}};
const projectDate=input=>{
 check();let date;try{date=new nativeDate(input);}finally{check();}
 const values=methods.map(fn=>call(fn,date,[]));
 const epochMs=values[0],iso=values[1],offsetMinutes=values[2],local=[values[3],values[4]+1,...values.slice(5)];
 if(!Number.isSafeInteger(epochMs)||typeof iso!=='string'||!Number.isInteger(offsetMinutes)||Math.abs(offsetMinutes)>840||local.some(value=>!Number.isSafeInteger(value)))bad();
 return{input,epochMs,iso,offsetMinutes,local};
};
const same=(a,b)=>a.input===b.input&&a.epochMs===b.epochMs&&a.iso===b.iso&&a.offsetMinutes===b.offsetMinutes&&a.local.length===b.local.length&&a.local.every((value,index)=>value===b.local[index]);
const before=call(now,nativeDate,[]),clockBefore=projectDate(before);
const epochs=inputs.epochs.map(projectDate),sql=inputs.sql.map(projectDate);
const secondEpochs=inputs.epochs.map(projectDate),secondSql=inputs.sql.map(projectDate);
if(epochs.some((value,index)=>!same(value,secondEpochs[index]))||sql.some((value,index)=>!same(value,secondSql[index])))bad();
const after=call(now,nativeDate,[]),clockAfter=projectDate(after);check();
if(!Number.isSafeInteger(before)||before<0||!Number.isSafeInteger(after)||after<before||after-before>10000||clockBefore.offsetMinutes!==clockAfter.offsetMinutes)bad();
return{profile:'private.clock-controls.v1',role,scope,clockBefore,clockAfter,epochs,sql,environmentTzAbsent:role==='main-reference'?true:null,producerBindingVerified:false,appClockVerified:false,executionAuthorized:false};
`;
const BOOT = String.raw`
const root=globalThis,apply=Reflect.apply;
const bad=()=>{throw new Error('CLOCK_CONTROL_READ_REFUSED');};
const own=(owner,key)=>{
 if(owner===null||(typeof owner!=='object'&&typeof owner!=='function'))bad();
 const d=Object.getOwnPropertyDescriptor(owner,key);if(!d||!Object.hasOwn(d,'value'))bad();return d.value;
};
`;
function program(input: unknown, role: "renderer" | "main-reference", actor?: unknown): string {
  const scope = validateClockControlScope(input);
  const inputs = controlInputs(scope);
  let context: string;
  if (role === "renderer") {
    const expected = validateActorProjection(actor);
    context = [String.raw`
if(root.top!==root||root.window!==root)bad();
const ui=own(root,'UI'),host=own(root,'gVars'),project=own(host,'currentProject');
if(own(ui,'gVars')!==host)bad();
const location=root.location,href=location?.href,document=root.document,mode=own(root,'PRO_EDITOR_MODE');
if(typeof href!=='string'||!/^https:\/\/client\/editor\?cll=(?:trace|debug|info|warn|error)#?$/.test(href)||location.origin!=='https://client'||!document||document.nodeType!==9||document.defaultView!==root||document.URL!==href)bad();
if(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')bad();
`, SYMBOL_DUAL_ACTOR_CAPTURE_SOURCE, `
const expected=${JSON.stringify(expected)};
if(startupActorProjection.uuid!==expected.uuid||startupActorProjection.username!==expected.username||startupActorProjection.nickname!==expected.nickname)bad();
const context=()=>{
 if(root.top!==root||root.window!==root||root.document!==document||document.nodeType!==9||document.defaultView!==root||document.URL!==href||root.location!==location||location.href!==href||location.origin!=='https://client'||own(root,'PRO_EDITOR_MODE')!==mode)bad();
 if(own(root,'UI')!==ui||own(root,'gVars')!==host||own(ui,'gVars')!==host||own(host,'currentProject')!==project)bad();
 checkDualActor();
};
`].join("\n");
  } else {
    context = String.raw`
const process=own(root,'process'),env=own(process,'env');
const context=()=>{
 if(own(root,'process')!==process||own(process,'env')!==env)bad();
 if(Reflect.ownKeys(env).some(key=>typeof key!=='string'||key.toUpperCase()==='TZ'))bad();
};
`;
  }
  return `(()=>{try{${BOOT}\nconst scope=${JSON.stringify(scope)},inputs=${JSON.stringify(inputs)},role=${JSON.stringify(role)};\n${context}\n${SHARED}\n}catch{throw new Error('CLOCK_CONTROL_READ_REFUSED');}})()`;
}
export function buildRendererClockControls(input: unknown, expectedActor: unknown): string { return program(input, "renderer", expectedActor); }
export function buildMainClockReference(input: unknown): string { return program(input, "main-reference"); }

function vector(input: unknown, expected: string | number): DateVector {
  const value = exact(input, ["input", "epochMs", "iso", "offsetMinutes", "local"]);
  if (value["input"] !== expected) { bad(); }
  const epochMs = integer(value["epochMs"], -86_400_000, 253_402_300_799_999), offsetMinutes = integer(value["offsetMinutes"], -840, 840);
  const iso = value["iso"], local = calendar(value["local"]);
  if (typeof iso !== "string" || iso !== new Date(epochMs).toISOString() || utcCalendar(local) + offsetMinutes * 60_000 !== epochMs ||
      (typeof expected === "number" && epochMs !== expected)) { bad(); }
  if (typeof expected === "string" && local.join(",") !== [...expected.split(/[- :]/u).map(Number), 0].join(",")) { bad(); }
  return Object.freeze({ input: expected, epochMs, iso, offsetMinutes, local: Object.freeze(local) });
}
function rows(value: unknown, expected: readonly (string | number)[]): readonly DateVector[] {
  if (!Array.isArray(value) || value.length !== expected.length || Reflect.ownKeys(value).length !== expected.length + 1) { bad(); }
  return Object.freeze(expected.map((item, index) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value")) { bad(); }
    return vector(descriptor.value, item);
  }));
}
export function validateClockControls(input: unknown, expectedScope: unknown, role: "renderer" | "main-reference"): ClockControls {
  const scope = validateClockControlScope(expectedScope);
  const inputs = controlInputs(scope);
  const v = exact(input, ["profile", "role", "scope", "clockBefore", "clockAfter", "epochs", "sql", "environmentTzAbsent", "producerBindingVerified", "appClockVerified", "executionAuthorized"]);
  const declaredScope = validateClockControlScope(v["scope"]);
  if (v["profile"] !== "private.clock-controls.v1" || v["role"] !== role || v["environmentTzAbsent"] !== (role === "main-reference" ? true : null) ||
      declaredScope.createdAtLiteral !== scope.createdAtLiteral || declaredScope.referenceUtcMs !== scope.referenceUtcMs) { bad(); }
  for (const name of ["producerBindingVerified", "appClockVerified", "executionAuthorized"]) { if (v[name] !== false) { bad(); } }
  const current = (value: unknown): DateVector => { const row = exact(value, ["input", "epochMs", "iso", "offsetMinutes", "local"]); return vector(value, integer(row["input"], 0, 253_402_214_399_999)); };
  const clockAfter = current(v["clockAfter"]), clockBefore = current(v["clockBefore"]);
  if (clockAfter.epochMs < clockBefore.epochMs || clockAfter.epochMs - clockBefore.epochMs > 10_000 || clockBefore.offsetMinutes !== clockAfter.offsetMinutes) { bad(); }
  return Object.freeze({ profile: "private.clock-controls.v1", role, scope, clockBefore, clockAfter, epochs: rows(v["epochs"], inputs.epochs), sql: rows(v["sql"], inputs.sql),
    environmentTzAbsent: role === "main-reference" ? true : null, producerBindingVerified: false, appClockVerified: false, executionAuthorized: false });
}
