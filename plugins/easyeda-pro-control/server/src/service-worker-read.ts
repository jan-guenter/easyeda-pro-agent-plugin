/** Internal, data-only observer; not a transport or completion authority. */
export const SERVICE_WORKER_READ_PROFILE = "easyeda-pro-control.main-service-worker-absence.v1";

/** One native registration-list read in the captured main renderer storage key.
 * No caller origin, scope, method, script, options, or callback is accepted.
 */
export function buildServiceWorkerReadExpression(): string {
  return `(async()=>{
let stage='HOST',expired=false,timer,clear;
const root=globalThis,apply=Reflect.apply;
const fail=()=>{throw new Error('SERVICE_WORKER_READ_REFUSED:'+stage);};
const object=value=>value!==null&&(typeof value==='object'||typeof value==='function')&&!Array.isArray(value);
const descriptor=(owner,key)=>{
 if(!object(owner))fail();const value=Object.getOwnPropertyDescriptor(owner,key);
 if(!value)fail();return value;
};
const data=(owner,key)=>{const value=descriptor(owner,key);if(!Object.hasOwn(value,'value'))fail();return value.value;};
const getter=(owner,key)=>{const value=descriptor(owner,key);if(typeof value.get!=='function'||value.set!==undefined)fail();return value.get;};
try{
 const deadlineSet=root.setTimeout;clear=root.clearTimeout;
 if(typeof deadlineSet!=='function'||typeof clear!=='function')fail();
 const location=root.location,href=location?.href,document=root.document;
 const mode=data(root,'PRO_EDITOR_MODE');
 if(mode!=='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM'&&mode!=='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM')fail();
 if(typeof href!=='string'||!new RegExp(${JSON.stringify(String.raw`^https://client/editor\?cll=(?:trace|debug|info|warn|error)#?$`)}).test(href))fail();
 const navigator=root.navigator,navigatorConstructor=root.Navigator,navigatorPrototype=navigatorConstructor?.prototype;
 const containerConstructor=root.ServiceWorkerContainer,containerPrototype=containerConstructor?.prototype;
 if(typeof navigatorConstructor!=='function'||typeof containerConstructor!=='function'||!object(navigator)||Object.getPrototypeOf(navigator)!==navigatorPrototype)fail();
 const getContainer=getter(navigatorPrototype,'serviceWorker');
 const container=apply(getContainer,navigator,[]);
 if(!object(container)||Object.getPrototypeOf(container)!==containerPrototype)fail();
 const getController=getter(containerPrototype,'controller'),getRegistrations=data(containerPrototype,'getRegistrations');
 if(typeof getRegistrations!=='function')fail();
 const check=()=>{
  if(expired){stage='TIMEOUT';fail();}
  if(root.top!==root||root.window!==root||root.location!==location||location.href!==href||location.origin!=='https://client'||root.document!==document||!object(document)||document.defaultView!==root||document.nodeType!==9||document.URL!==href||data(root,'PRO_EDITOR_MODE')!==mode)fail();
  if(root.navigator!==navigator||root.Navigator!==navigatorConstructor||navigatorConstructor.prototype!==navigatorPrototype||Object.getPrototypeOf(navigator)!==navigatorPrototype||getter(navigatorPrototype,'serviceWorker')!==getContainer||Object.hasOwn(navigator,'serviceWorker')||apply(getContainer,navigator,[])!==container)fail();
  if(root.ServiceWorkerContainer!==containerConstructor||containerConstructor.prototype!==containerPrototype||Object.getPrototypeOf(container)!==containerPrototype||getter(containerPrototype,'controller')!==getController||Object.hasOwn(container,'controller')||apply(getController,container,[])!==null)fail();
  if(data(containerPrototype,'getRegistrations')!==getRegistrations||Object.hasOwn(container,'getRegistrations')||root.setTimeout!==deadlineSet||root.clearTimeout!==clear)fail();
 };
 const run=async()=>{
  check();stage='REGISTRATIONS';
  const registrations=await apply(getRegistrations,container,[]);
  check();
  if(!Array.isArray(registrations)||Object.getPrototypeOf(registrations)!==Array.prototype)fail();
  const length=Object.getOwnPropertyDescriptor(registrations,'length');
  if(!length||!Object.hasOwn(length,'value')||length.value!==0||Reflect.ownKeys(registrations).length!==1)fail();
  stage='RESULT';check();
  return{profile:${JSON.stringify(SERVICE_WORKER_READ_PROFILE)},origin:'https://client',controllerAbsent:true,registrationsAbsent:true,scope:'point-in-time-main-storage-key'};
 };
 const timeout=new Promise((resolve,reject)=>{timer=apply(deadlineSet,root,[()=>{expired=true;stage='TIMEOUT';reject(new Error('SERVICE_WORKER_READ_REFUSED:TIMEOUT'));},10000]);});
 return await Promise.race([run(),timeout]);
}catch{throw new Error('SERVICE_WORKER_READ_REFUSED:'+stage);}
finally{if(timer!==undefined&&typeof clear==='function')apply(clear,root,[timer]);}
})()`;
}

/** Parsing this record cannot establish a runtime generation or grant replay. */
export function validateServiceWorkerReadResult(input: unknown): Readonly<Record<string, unknown>> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) { throw new Error("SERVICE_WORKER_RESULT"); }
  const prototype: unknown = Object.getPrototypeOf(input);
  if ((prototype !== Object.prototype && prototype !== null) || Reflect.ownKeys(input).length !== 5) { throw new Error("SERVICE_WORKER_RESULT"); }
  const expected: Record<string, unknown> = { profile: SERVICE_WORKER_READ_PROFILE, origin: "https://client", controllerAbsent: true, registrationsAbsent: true, scope: "point-in-time-main-storage-key" };
  for (const [name, value] of Object.entries(expected)) {
    const field = Object.getOwnPropertyDescriptor(input, name);
    if (field === undefined || !Object.hasOwn(field, "value") || field.value !== value) { throw new Error("SERVICE_WORKER_RESULT"); }
  }
  return Object.freeze(expected);
}
