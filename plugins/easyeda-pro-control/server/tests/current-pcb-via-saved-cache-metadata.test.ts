/** Source-program fixtures with explicit fake-native implementations. They do
 * not qualify the functions, create a native owner or grant cache deletion. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_NATIVE_CACHE_RESPONSE_INTRINSIC_CALLS as CACHE } from "../src/current-native-cache-response-intrinsics.ts";
import { CURRENT_NATIVE_REQUEST_METADATA_OPTIONAL_GETTERS as OPTIONAL, CURRENT_NATIVE_REQUEST_METADATA_INTRINSIC_CALLS as REQUEST,
  CURRENT_NATIVE_REQUEST_METADATA_REQUIRED_GETTERS as REQUIRED, decodeCurrentNativeRequestMetadataCatalogue } from "../src/current-native-request-metadata-intrinsics.ts";
import { CURRENT_PCB_VIA_SAVED_CACHE_METADATA_CALLS as CALLS, CURRENT_PCB_VIA_SAVED_CACHE_METADATA_HELPERS as HELPERS, CURRENT_PCB_VIA_SAVED_CACHE_METADATA_REQUESTS as REQUESTS,
  decodeCurrentPcbViaSavedCacheMetadata, qualifyCurrentPcbViaSavedCacheMetadataHelper } from "../src/current-pcb-via-saved-cache-metadata-programs.ts";

const uuid = "a".repeat(64);
function fixture(): Readonly<{ observe: (ordinal: number) => Promise<unknown>; decode: (packet: unknown) => ReturnType<typeof decodeCurrentPcbViaSavedCacheMetadata>; run: (code: string) => unknown }> {
  const context = vm.createContext({ getterKeys: [...REQUIRED, ...OPTIONAL], projectUuid: uuid });
  vm.runInContext(`const calls=[];let mutations=0,keyGate=null;function Cache(entries){this.data=entries}function CacheStorage(){this.data=new Map()}function Request(url){this.urlValue=url}function Response(){}function Headers(pairs){this.pairs=pairs}function AbortSignal(){}
const define=(p,key,value)=>Object.defineProperty(p,key,{value,writable:true,enumerable:true,configurable:true}),get=(p,key,fn)=>Object.defineProperty(p,key,{get:fn,enumerable:true,configurable:true});
define(Cache.prototype,"put",()=>{mutations++;throw Error("mutation")});define(Cache.prototype,"delete",()=>{mutations++;throw Error("mutation")});
define(Cache.prototype,"keys",async function(){return this.data.map(value=>new Request(value.url))});define(Cache.prototype,"match",async function(key){calls.push("match:"+key.urlValue);const row=this.data.find(value=>value.url===key.urlValue);const result=new Response();result.row=row;return result});
define(CacheStorage.prototype,"keys",async function(){if(keyGate)await keyGate;return [...this.data.keys()]});define(CacheStorage.prototype,"has",async function(name){return this.data.has(name)});define(CacheStorage.prototype,"open",async function(name){calls.push("open:"+name);if(!this.data.has(name)){mutations++;this.data.set(name,new Cache([]))}return this.data.get(name)});define(CacheStorage.prototype,"delete",()=>{mutations++;throw Error("mutation")});
define(Response.prototype,"clone",()=>{throw Error("not used")});define(Response.prototype,"arrayBuffer",()=>{throw Error("body not consumed")});
define(Headers.prototype,"forEach",function(callback){for(const[name,value]of this.pairs)callback(value,name,this)});define(Headers.prototype,"getSetCookie",()=>[]);
get(AbortSignal.prototype,"aborted",()=>false);get(AbortSignal.prototype,"reason",()=>undefined);
const requestDefaults={method:"GET",destination:"",referrer:"about:client",referrerPolicy:"",mode:"cors",credentials:"same-origin",cache:"default",redirect:"follow",integrity:"",keepalive:false,body:null,bodyUsed:false,duplex:"half",isHistoryNavigation:false,isReloadNavigation:false,targetAddressSpace:"unknown",priority:"auto"};
for(const key of getterKeys)get(Request.prototype,key,function(){if(key==="url")return this.urlValue;if(key==="headers")return new Headers([]);if(key==="signal")return new AbortSignal();return requestDefaults[key]});
const responseDefaults={url:"",redirected:false,type:"default",status:200,statusText:"",ok:true,bodyUsed:false};for(const key of ["url","redirected","type","status","statusText","ok","headers","body","bodyUsed"])get(Response.prototype,key,function(){if(key==="headers")return new Headers(this.row.headers);if(key==="body")return {};return responseDefaults[key]});
const storage=new CacheStorage();storage.data.set("project_"+projectUuid+"_v6",new Cache([{url:"https://pro.lceda.cn/index/v1/branch",headers:[["content-type","application/json"]]}]));storage.data.set("localProject_"+projectUuid+"_v1",new Cache([{url:"https://pro.lceda.cn/localSave/branch",headers:[["content-type","text/plain;charset=UTF-8"]]}]));storage.data.set("peer",new Cache([{url:"https://peer.example/private",headers:[]} ]));
Object.defineProperty(globalThis,"caches",{get:function(){return storage},enumerable:true,configurable:true});
const cacheCtor=(${CACHE.constructors.program})();const cacheNative=(${CACHE.members.program}).call(cacheCtor);const requestCtor=(${REQUEST.constructors.program})();const requestNative=(${REQUEST.members.program}).call(requestCtor);const state=(${CALLS.bind.program}).call(cacheNative,requestNative,projectUuid);`, context);
  const catalogue = decodeCurrentNativeRequestMetadataCatalogue(structuredClone(vm.runInContext(`(${REQUEST.catalogue.program}).call(requestNative)`, context)));
  return Object.freeze({ observe: async (ordinal: number): Promise<unknown> => { const value: unknown = await vm.runInContext(`(${CALLS.observe.program}).call(state,${String(ordinal)})`, context); return structuredClone(value); },
    decode: (packet: unknown): ReturnType<typeof decodeCurrentPcbViaSavedCacheMetadata> => decodeCurrentPcbViaSavedCacheMetadata(packet, catalogue), run: (code: string): unknown => vm.runInContext(code, context) });
}
void test("fixed sampler captures full native key/Response metadata for both exact namespaces without body consumption or mutation", async () => {
  const f = fixture();
  for (const ordinal of [0, 1]) { const value = f.decode(await f.observe(ordinal)); assert.equal(value.ordinal, ordinal); assert.equal(value.entries.length, 1); assert.equal(value.requestGetterNames.length, 20); assert.equal(value.executionAuthorized, false); assert.equal(value.entries[0]?.response.bodyPresent, true); }
  assert.equal(f.run("mutations"), 0); assert.equal(f.run('calls.some(value=>value.includes("peer"))'), false);
  assert.equal(REQUESTS.nativeProperties, 50); assert.equal(REQUESTS.helperSources, 12); assert.equal(REQUESTS.normal, 78); assert.equal(REQUESTS.cleanup, 1); assert.equal(REQUESTS.total, 79);
});
void test("only the exact fixed helper scripts can drain empty-url scriptParsed events", () => {
  for (const role of Object.keys(HELPERS)) {
    assert.ok(Object.hasOwn(HELPERS, role));
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Own keys of this frozen fixed source catalogue are exactly its declared role union.
    const key = role as keyof typeof HELPERS;
    const source = `(${HELPERS[key].program})`; qualifyCurrentPcbViaSavedCacheMetadataHelper({ scriptSource: source }, key);
    assert.throws(() => { qualifyCurrentPcbViaSavedCacheMetadataHelper({ scriptSource: `${source}\n` }, key); });
  }
  let touched = false; const getter = Object.defineProperty({}, "scriptSource", { enumerable: true, get: (): string => { touched = true; return "foreign"; } });
  assert.throws(() => { qualifyCurrentPcbViaSavedCacheMetadataHelper(getter, "observe"); }); assert.equal(touched, false);
});
void test("absent namespaces are not opened and non-default or changed native metadata refuses before a deletion grant", async () => {
  const f = fixture(); f.run('storage.data.delete("project_"+projectUuid+"_v6")'); const missing = f.decode(await f.observe(0)); assert.equal(missing.existed, false); assert.deepEqual(missing.entries, []); assert.equal(f.run("mutations"), 0);
  const g = fixture(); g.run('requestDefaults.mode="no-cors"');
  // A fabricated completion flag cannot replace the full source profile.
  const packet = await g.observe(0); assert.throws(() => g.decode(packet)); assert.equal(g.run("mutations"), 0);
});
void test("descriptor drift while the original Cache API Promise is pending refuses its original request", async () => {
  const f = fixture(); f.run('let finish;keyGate=new Promise(resolve=>finish=resolve)'); const original = f.observe(0);
  f.run('Object.defineProperty(Response.prototype,"url",{get:function(){return ""},enumerable:true,configurable:true})'); f.run("finish()");
  await assert.rejects(original); assert.equal(f.run("mutations"), 0);
});
