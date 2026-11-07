import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote = z.strictObject({ type: z.enum(["object", "function", "string", "number", "undefined", "boolean"]), subtype: z.string().optional(), className: z.string().optional(), description: z.string().optional(), objectId: handle.optional(), value: z.unknown().optional() });
function need(value:boolean):asserts value{if(!value){throw new Error("INVERSE_GET_CALLBACK_PAUSE");}}
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.strictObject({ callFrameId: handle, functionName: z.string(), functionLocation: point, location: point, url: z.string(), scopeChain: z.array(z.unknown()).max(16), this: remote, returnValue: remote.optional(), canBeRestarted: z.boolean().optional() });
export function currentFootprintInverseGetCallbackPause(input: unknown, sessionId: string, uiScriptId: string, managerScriptId: string, apiScriptId: string, breakpointId: string, profile: "ui" | "manager"): Readonly<{callback:string;caller:string}> {
  const raw = z.strictObject({ method: z.literal("Debugger.paused"), sessionId: handle, params: z.strictObject({ callFrames: z.array(frame).min(10).max(64), reason: z.enum(["other", "debugCommand"]), hitBreakpoints: z.tuple([handle]), asyncStackTrace: z.unknown().optional(), asyncStackTraceId: z.unknown().optional() }) }).parse(capture(input)); need(raw.sessionId === sessionId && raw.params.hitBreakpoints[0] === breakpointId);
  const expected = [
    ...(profile === "ui" ? [{name:"",line:1033,column:29_836,pc:29_858,script:uiScriptId},{name:"execute",line:1033,column:28_690,pc:28_722,script:uiScriptId},{name:"publish",line:1033,column:29_000,pc:29_076,script:uiScriptId},{name:"",line:1033,column:30_140,pc:30_178,script:uiScriptId}] : [{name:"",line:0,column:7139,pc:7161,script:managerScriptId},{name:"execute",line:0,column:6004,pc:6035,script:managerScriptId},{name:"publish",line:0,column:6311,pc:6387,script:managerScriptId},{name:"",line:0,column:7441,pc:7479,script:managerScriptId}]),
    profile === "ui" ? { name: "rpcCall", line: 1033, column: 30_110, pc: 30_128, script: uiScriptId } : { name: "rpcCall", line: 0, column: 7412, pc: 7429, script: managerScriptId },
    { name: "getFootprint", line: 1171, column: 113_048, pc: 113_106, script: uiScriptId },
    { name: "getFootprint", line: 1171, column: 125_106, pc: 125_183, script: uiScriptId },
    { name: "tw", line: 1326, column: 1619, pc: 1733, script: uiScriptId },
    { name: "delete", line: 2657, column: 140_826, pc: 140_960, script: uiScriptId },
    { name: "i", line: 1, column: 99_812, pc: 99_860, script: apiScriptId },
  ];
  for (const [index, row] of expected.entries()) { const actual = raw.params.callFrames[index]; need(actual !== undefined && actual.functionName === row.name && actual.functionLocation.scriptId === row.script && actual.functionLocation.lineNumber === row.line && actual.functionLocation.columnNumber === row.column && actual.location.scriptId === row.script && actual.location.lineNumber === row.line && actual.location.columnNumber === row.pc); } const top = raw.params.callFrames[0];const caller=raw.params.callFrames[4]; need(top !== undefined&&caller!==undefined);return Object.freeze({callback:top.callFrameId,caller:caller.callFrameId});
}
