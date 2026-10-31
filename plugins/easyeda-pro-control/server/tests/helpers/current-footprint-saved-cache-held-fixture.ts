/** Synthetic page and CDP rosters for the maintained held-cache programs.
 * These JS methods are not native CacheStorage functions, and the fixture cannot
 * establish Chromium qualification, replay exclusion or native ownership.
 */
import assert from "node:assert/strict";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_DESCRIPTORS as DESCRIPTORS } from "../../src/current-footprint-saved-cache-held-profile.ts";
import type { CurrentFootprintSavedCacheHeldCommand } from "../../src/current-footprint-saved-cache-held-protocol.ts";

export const heldCacheSyntheticTarget = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) });
type Data = Record<string, unknown>;

/** Form a complete own data descriptor, preserving observed native attributes. */
function property(name: string, value: Data, writable: boolean, enumerable: boolean, configurable: boolean): Data {
  return { name, value, writable, enumerable, configurable, isOwn: true };
}

/** Build one inert synthetic remote CacheStorage object descriptor. */
function object(objectId: string): Data { return { type: "object", className: "CacheStorage", description: "CacheStorage", objectId }; }

/** Build one inert synthetic remote native-function description. */
function native(name: string, objectId: string): Data {
  return { type: "function", className: "Function", description: `function ${name}() { [native code] }`, objectId };
}

/** Supply complete conforming synthetic metadata with deliberately different IDs
 * for repeated references to the same prototype. IDs are not JS identity proof.
 */
export function heldCacheSyntheticMetadata(role: "array" | "constructor" | "match" | "getter"): Data {
  if (role === "array") {
    return { result: [property("0", native("CacheStorage", "constructor"), true, true, true),
      property("1", object("tuple-prototype"), true, true, true), property("2", native("match", "match"), true, true, true),
      property("3", native("get caches", "getter"), true, true, true), property("4", { type: "string", value: JSON.stringify(DESCRIPTORS) }, true, true, true),
      property("length", { type: "number", value: 5, description: "5" }, true, false, false)],
    internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", description: "Array(0)", objectId: "array-prototype" } }] };
  }
  const arity = role === "match" ? 1 : 0;
  const name = { constructor: "CacheStorage", match: "match", getter: "get caches" }[role];
  return { result: [property("length", { type: "number", value: arity, description: String(arity) }, false, false, true),
    property("name", { type: "string", value: name }, false, false, true),
    ...(role === "constructor" ? [property("prototype", object("fresh-constructor-prototype-id"), false, false, false)] : [])],
  internalProperties: [{ name: "[[Prototype]]", value: native("", `${role}-function-prototype`) },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: `${role}-scopes` } }] };
}

export interface HeldCacheSyntheticPage {
  readonly evaluate: (program: string) => unknown;
  readonly run: (command: CurrentFootprintSavedCacheHeldCommand) => Promise<unknown>;
  readonly expire: () => void;
}

/** Execute the actual fixed programs in a synthetic current209 Start Page. Count
 * getter/RPC/match calls and expose controlled await/drift seams for negatives.
 */
export function createHeldCacheSyntheticPage(options: Readonly<{ afterNative?: string; pendingAt?: number; presentAt?: number; wrongReceiver?: boolean }> = {}): HeldCacheSyntheticPage {
  let timeout: (() => void) | undefined;
  const context = createContext({
    setTimeout(callback: () => void, milliseconds: number): number { assert.equal(milliseconds, 10_000); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); },
  });
  const evaluate = (program: string): unknown => runInContext(program, context, { timeout: 1000 }) as unknown;
  evaluate(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.getterCalls=0;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.209';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}}
const native=async(kind,args)=>{calls.push({kind,args});const index=calls.length;if(index===${String(options.pendingAt ?? 0)})await new Promise(resolve=>{globalThis.releasePending=resolve;});await Promise.resolve();${options.afterNative ?? ""}
if(kind==='rpc')return{message:index===${String(options.presentAt ?? 0)}};return index===${String(options.presentAt ?? 0)}?{}:undefined;};
class Registry{rpcCall(...args){if(this!==gVars.messageBus)throw Error('RPC_RECEIVER');return native('rpc',args);}}
const ctor=class CacheStorage{match(...args){if(this!==originalStorage)throw Error('CACHE_RECEIVER');return native('match',args);}open(){throw Error('FORBIDDEN_OPEN');}keys(){throw Error('FORBIDDEN_KEYS');}delete(){throw Error('FORBIDDEN_DELETE');}};
Object.defineProperty(ctor.prototype,'match',{...Object.getOwnPropertyDescriptor(ctor.prototype,'match'),enumerable:true});
Object.defineProperty(globalThis,'CacheStorage',{value:ctor,writable:true,enumerable:false,configurable:true});
globalThis.originalStorage=new ctor();Object.defineProperty(globalThis,'caches',{get(){getterCalls++;return ${options.wrongReceiver === true ? "Object.create(null)" : "originalStorage"};},enumerable:true,configurable:true});
globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''},isHistoryMode:false,messageBus:new Registry(),sessionStorageTabs:new Set(),urlCmd:null};globalThis.UI={gVars,tabBar:Tabs};`);
  return {
    evaluate,
    run: async (command): Promise<unknown> => {
      if (command.method === "Runtime.releaseObjectGroup") { evaluate("delete globalThis.heldTuple"); return {}; }
      if (command.method === "Runtime.getProperties") {
        const roles = { "array-properties": "array", "constructor-properties": "constructor", "match-properties": "match", "getter-properties": "getter" } as const;
        return heldCacheSyntheticMetadata(roles[command.heldCachePhase]);
      }
      if (command.heldCachePhase === "capture") {
        evaluate(`globalThis.heldTuple=(${command.params.functionDeclaration})();`);
        return { result: { type: "object", subtype: "array", className: "Array", description: "Array(5)", objectId: "held-array" } };
      }
      const args = JSON.stringify(command.params.arguments.map(argument => "value" in argument ? argument.value : undefined));
      const value = await Promise.resolve(evaluate(`(${command.params.functionDeclaration}).apply(heldTuple,${args})`));
      return { result: { type: typeof value, value } };
    },
    expire: (): void => { assert.ok(timeout !== undefined); timeout(); },
  };
}
