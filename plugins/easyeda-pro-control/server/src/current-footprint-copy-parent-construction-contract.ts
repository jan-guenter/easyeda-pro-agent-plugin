/** Native execution-purpose parent pause vocabulary. Only the exact local
 * manager open path is admitted; alternate project constructors remain refused. */
import type { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES as SITES } from "./current-footprint-copy-parent-worker-source.ts";

export const CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_GROUP = "easyeda-footprint-parent-construction-v1";
export const CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_REQUESTS = Object.freeze({ arm: 3, capture: 7, resume: 2, release: 1 });
export const CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_LIMITS = Object.freeze({ requestMs: 2000, ownerMs: 10_000, pauseMs: 30_000, holdMs: 360_000 });
const helpers = String.raw`"use strict";const bad=()=>{throw new Error("FOOTPRINT_PARENT_CONSTRUCTION_BINDING");};
const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,"value"))bad();return d.value;};
const absent=(o,k)=>{for(let i=0;i<5;i++){if(o===null)return;if(Object.getOwnPropertyDescriptor(o,k)!==undefined)bad();o=Object.getPrototypeOf(o);}bad();};
const check=(o,path,tab)=>{if(own(o,"uuid")!==path||own(globalThis,"_TAB_ID_")!==tab||own(o,"isReady")!==false||own(o,"_isOpening")!==true||own(o,"_isClosing")!==false)bad();absent(o,"workerBus");absent(o,"mainBus");};`;
export const CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_PROGRAMS = Object.freeze({
  before: `function(path,tab){${helpers}check(this,path,tab);absent(this,"worker");return true;}`,
  after: `function(original,path,tab){${helpers}check(this,path,tab);if(this!==original)bad();const worker=own(this,"worker"),prototype=own(own(globalThis,"Worker"),"prototype");if(Object.getPrototypeOf(worker)!==prototype)bad();return true;}`,
});
export interface CurrentFootprintParentConstructionBinding {
  readonly sessionId: string;
  readonly uniqueContextId: string;
  readonly managerScriptId: string;
  readonly projectUuid: string;
  readonly windowTabId: string;
}
export type CurrentFootprintParentConstructionCommand = Readonly<{ sessionId: string }> & (
  | Readonly<{ phase: "source"; method: "Debugger.getScriptSource"; params: Readonly<{ scriptId: string }> }>
  | Readonly<{ phase: "breakpoint-before" | "breakpoint-after"; method: "Debugger.setBreakpoint";
    params: Readonly<{ location: Readonly<{ scriptId: string; lineNumber: 104; columnNumber: typeof SITES.before.columnNumber | typeof SITES.after.columnNumber }> }> }>
  | Readonly<{ phase: "remove"; method: "Debugger.removeBreakpoint"; params: Readonly<{ breakpointId: string }> }>
  | Readonly<{ phase: "resume"; method: "Debugger.resume"; params: Readonly<Record<string, never>> }>
  | Readonly<{ phase: "receiver"; method: "Debugger.evaluateOnCallFrame"; params: Readonly<{ callFrameId: string; expression: "this";
    objectGroup: typeof CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_GROUP; returnByValue: false; silent: true; generatePreview: false; throwOnSideEffect: true; includeCommandLineAPI: false }> }>
  | Readonly<{ phase: "before" | "after"; method: "Runtime.callFunctionOn"; params: Readonly<{ objectId: string;
    functionDeclaration: typeof CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_PROGRAMS[keyof typeof CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_PROGRAMS];
    arguments: readonly Readonly<{ objectId: string } | { value: string }>[]; objectGroup: typeof CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_GROUP;
    returnByValue: true; awaitPromise: false; silent: true; generatePreview: false; userGesture: false; throwOnSideEffect: true }> }>
  | Readonly<{ phase: "release"; method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_GROUP }> }>
);
export interface CurrentFootprintParentConstructionTransport {
  readonly assertOriginalOwner: () => Promise<void>;
  readonly request: (command: CurrentFootprintParentConstructionCommand) => Promise<unknown>;
  readonly subscribe: (listener: Readonly<{ paused: (parameters: unknown) => void; resumed: () => void; lost: () => void }>) => () => void;
  readonly assertOriginalGenerationExited: () => Promise<void>;
}
export interface CurrentFootprintParentConstructionHeld {
  readonly parentSessionId: string;
  readonly parentUniqueContextId: string;
  readonly projectObjectId: string;
}
