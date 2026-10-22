/** Private pre-bootstrap contract. Existing diagnostic purposes deliberately do
 * not admit these pauses. There is no public caller-selected breakpoint/code. */
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE = Object.freeze({
  bytes: 2_181_284, sha256: "b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928",
  group: "easyeda-pro-control-worker-construction-v1",
});

/** UTF-16 offsets and zero-based CDP locations in the complete pinned asset.
 * Constructor-end pauses retain the actual receiver. Factory-entry pauses
 * retain the arrow argument while its constructing caller is still on stack. */
export const CURRENT_PCB_WORKER_CONSTRUCTION_SITES = freezeDeep({
  channel: { name: "JP", start: 11_689, end: 11_813, offset: 11_812, lineNumber: 0, columnNumber: 11_812,
    bytes: 124, sha256: "1f1e941adc6960fcb594284ad2c3cc71c339d0649cfadb5f8dc401f383511ab1" },
  base: { name: "Gd", start: 2_011_468, end: 2_012_635, offset: 2_012_634, lineNumber: 109, columnNumber: 165_345,
    bytes: 1167, sha256: "a312e0fe696ec2ddab8f60124aeb72684da65046731ca0f5f23bb60f9e283842" },
  project: { name: "Lg", start: 2_103_264, end: 2_107_636, offset: 2_107_635, lineNumber: 110, columnNumber: 93_449,
    bytes: 4372, sha256: "1aac1292d0d86688476aaf3299417cad64c01a2e0d1d9226e029f1aa4bb0a014" },
  serial: { name: "Nd", start: 1_847_033, end: 1_847_224, offset: 1_847_054, lineNumber: 108, columnNumber: 145_558,
    bytes: 191, sha256: "99fca9f1568807ff06f32f3fba55b490def72b5b07d9325974dc153db217909e" },
  cooperation: { name: "ZA", start: 1_856_028, end: 1_856_195, offset: 1_856_051, lineNumber: 109, columnNumber: 8762,
    bytes: 167, sha256: "1de1846330650da2945eb6b280c1309feae47df438902a4c67370f3976f9b3d3" },
  debounce: { name: "QA", start: 2_011_134, end: 2_011_354, offset: 2_011_160, lineNumber: 109, columnNumber: 163_871,
    bytes: 220, sha256: "e44cd89d5dd9cc4c851c01a55247782eacd16b97d057add3b1cd472ad31a97db" },
  upload: { name: "bufferedStream", start: 2_029_648, end: 2_030_057, offset: 2_029_674, lineNumber: 110, columnNumber: 15_488,
    bytes: 409, sha256: "ab5308d9747401e42204794c3a3d8eb7dfa99af4a34bcb90481c7761752f83a7" },
  bootstrap: { name: "", offset: 2_177_118, lineNumber: 110, columnNumber: 162_932 },
});
export type CurrentPcbWorkerConstructionSite = keyof typeof CURRENT_PCB_WORKER_CONSTRUCTION_SITES;
export const CURRENT_PCB_WORKER_CONSTRUCTION_SEQUENCE = Object.freeze([
  "channel", "upload", "base", "cooperation", "serial", "debounce", "serial", "project", "bootstrap",
] as const);

export type CurrentPcbWorkerConstructionExpression = "this" | "e" | "t" | "this.bc" | "this.bc.onmessage";
export const CURRENT_PCB_WORKER_CONSTRUCTION_SAME = "function(other){\"use strict\";return this===other;}";
export const CURRENT_PCB_WORKER_CONSTRUCTION_PROJECT = "function(bus){\"use strict\";const own=(o,k)=>{const d=Object.getOwnPropertyDescriptor(o,k);if(!d||!Object.hasOwn(d,\"value\"))throw new Error(\"WORKER_CONSTRUCTION_MEMBER\");return d.value;};return own(globalThis,\"PROJECT\")===this&&own(this,\"workerBus\")===bus;}";
export type CurrentPcbWorkerConstructionCommand =
  | Readonly<{ method: "Debugger.setBreakpoint"; params: Readonly<{ location: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }> }> }>
  | Readonly<{ method: "Debugger.removeBreakpoint"; params: Readonly<{ breakpointId: string }> }>
  | Readonly<{ method: "Debugger.resume"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.evaluateOnCallFrame"; params: Readonly<{ callFrameId: string; expression: CurrentPcbWorkerConstructionExpression;
    objectGroup: typeof CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group; silent: true; returnByValue: false;
    generatePreview: false; throwOnSideEffect: true; includeCommandLineAPI: false }> }>
  | Readonly<{ method: "Runtime.getProperties"; params: Readonly<{ objectId: string; ownProperties: true; generatePreview: false }> }>
  | Readonly<{ method: "Runtime.callFunctionOn"; params: Readonly<{ objectId: string;
    /** Only the fixed construction and construction-assignment programs. The
     * native boundary must reject every other string before forwarding. */
    functionDeclaration: string;
    arguments: readonly Readonly<{ objectId: string }>[]; objectGroup: typeof CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group;
    silent: true; returnByValue: boolean; generatePreview: false; throwOnSideEffect: true; awaitPromise: false; userGesture: false }> }>
  | Readonly<{ method: "Runtime.releaseObjectGroup"; params: Readonly<{ objectGroup: typeof CURRENT_PCB_WORKER_CONSTRUCTION_SOURCE.group }> }>;

/** This transport is a trusted, original single-worker owner dependency, not an
 * MCP argument or historical receipt. Native integration must attest complete
 * source, execution context, target and retained process on every check. The
 * separate resume channel must remain bound to the same session during source
 * refusal, and must never detach a possibly paused worker. */
export interface CurrentPcbWorkerConstructionTransport {
  readonly scriptId: string;
  readonly assertOriginalPinnedWorker: () => Promise<void>;
  readonly request: (command: CurrentPcbWorkerConstructionCommand) => Promise<unknown>;
  readonly subscribe: (events: Readonly<{ paused: (parameters: unknown) => void; resumed: () => void;
    lost: () => void }>) => () => void;
}
