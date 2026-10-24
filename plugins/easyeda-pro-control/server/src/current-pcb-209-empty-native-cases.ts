/** Finite generation209 baseline grammar. Dynamic values are original remote
 * handles only. These inert templates neither issue ownership nor select code. */
import { CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP } from "./current-pcb-209-common-baseline-runner.ts";
import { CURRENT_PCB_209_COMMON_CONSTRUCTOR_FUNCTION, CURRENT_PCB_209_COMMON_EMPTY_ASSETS_FUNCTION,
  CURRENT_PCB_209_COMMON_METADATA_FUNCTION, CURRENT_PCB_209_COMMON_PACKET_SEEDS } from "./current-pcb-209-common-program.ts";
import type { CurrentPcb209EmptyBaselineCommand } from "./current-pcb-209-empty-baseline-session.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_FUNCTION } from "./current-pcb-209-empty-root-program.ts";
import { CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP } from "./current-pcb-209-empty-root-runner.ts";
import { CURRENT_PCB_COMMON_PACKET_ADVANCE, CURRENT_PCB_COMMON_PACKET_READ, CURRENT_PCB_COMMON_PACKET_RESULT } from "./current-pcb-common-packet-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION } from "./current-pcb-diagnostic-model-program.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export type CurrentPcb209EmptyBaselineNativeCommand = CurrentPcb209EmptyBaselineCommand & Readonly<{ sessionId: string }>;
export const currentPcb209EmptyNativePlaceholder = (name: string): string => `__empty209_${name}__`;
const placeholder = currentPcb209EmptyNativePlaceholder;
const objectId = placeholder("objectId"), sessionId = placeholder("sessionId"), uniqueContextId = placeholder("uniqueContextId");
const argument0 = { objectId: placeholder("argument0") }, argument1 = { objectId: placeholder("argument1") };
const effects = { throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false } as const;
const wrapper = { ...effects, expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId,
  returnByValue: false, timeout: 1000, includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false } as const;
const properties = { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } as const;
const handler = { ...effects, objectId, functionDeclaration: CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, returnByValue: false } as const;
const commonGroup = CURRENT_PCB_209_COMMON_BASELINE_OBJECT_GROUP, rootGroup = CURRENT_PCB_209_EMPTY_ROOT_OBJECT_GROUP;
const cases: CurrentPcb209EmptyBaselineNativeCommand[] = [
  { commonPhase: "wrapper", method: "Runtime.evaluate", sessionId, params: { ...wrapper, objectGroup: commonGroup } },
  { commonPhase: "properties", method: "Runtime.getProperties", sessionId, params: properties },
  { commonPhase: "handler", method: "Runtime.callFunctionOn", sessionId, params: handler },
  { commonPhase: "constructors", method: "Runtime.callFunctionOn", sessionId, params: { ...effects, objectId,
    functionDeclaration: CURRENT_PCB_209_COMMON_CONSTRUCTOR_FUNCTION, returnByValue: false, arguments: [argument0] } },
  { commonPhase: "metadata", method: "Runtime.callFunctionOn", sessionId, params: { ...effects, objectId,
    functionDeclaration: CURRENT_PCB_209_COMMON_METADATA_FUNCTION, returnByValue: true, arguments: [argument0] } },
  { commonPhase: "assets", method: "Runtime.callFunctionOn", sessionId, params: { ...effects, objectId,
    functionDeclaration: CURRENT_PCB_209_COMMON_EMPTY_ASSETS_FUNCTION, returnByValue: true, arguments: [argument0, argument1] } },
  { commonPhase: "release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: commonGroup } },
  { rootPhase: "wrapper", method: "Runtime.evaluate", sessionId, params: { ...wrapper, objectGroup: rootGroup } },
  { rootPhase: "properties", method: "Runtime.getProperties", sessionId, params: properties },
  { rootPhase: "handler", method: "Runtime.callFunctionOn", sessionId, params: handler },
  { rootPhase: "before", method: "Runtime.callFunctionOn", sessionId, params: { ...effects, objectId,
    functionDeclaration: CURRENT_PCB_209_EMPTY_ROOT_FUNCTION, returnByValue: true, arguments: [argument0] } },
  { rootPhase: "after", method: "Runtime.callFunctionOn", sessionId, params: { ...effects, objectId,
    functionDeclaration: CURRENT_PCB_209_EMPTY_ROOT_FUNCTION, returnByValue: true, arguments: [argument0] } },
  { rootPhase: "release", method: "Runtime.releaseObjectGroup", sessionId, params: { objectGroup: rootGroup } },
];
for (const leaf of ["presentation", "rules", "preference"] as const) {
  cases.push({ commonPhase: `${leaf}-seed`, method: "Runtime.callFunctionOn", sessionId, params: { ...effects, objectId,
    functionDeclaration: CURRENT_PCB_209_COMMON_PACKET_SEEDS[leaf], objectGroup: commonGroup, returnByValue: false,
    arguments: [argument0, argument1] } });
}
for (const [commonPhase, functionDeclaration, returnByValue] of [
  ["packet-advance", CURRENT_PCB_COMMON_PACKET_ADVANCE, false], ["packet-read", CURRENT_PCB_COMMON_PACKET_READ, true],
  ["packet-result", CURRENT_PCB_COMMON_PACKET_RESULT, true],
] as const) {
  cases.push({ commonPhase, method: "Runtime.callFunctionOn", sessionId,
    params: { ...effects, objectId, functionDeclaration, objectGroup: commonGroup, returnByValue } });
}
export const CURRENT_PCB_209_EMPTY_NATIVE_CASES: readonly CurrentPcb209EmptyBaselineNativeCommand[] = freezeDeep(cases);
