/** Seventeen fixed source holds for the three original service invocations.
 * Complete source qualification remains in the original closed manifests. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply as capture } from "./current-pcb-string-clock-reply.ts";
import { compareCurrentSchematicWireFunctionMetadata as compare } from "./current-schematic-wire-completion-source.ts";
import type { CurrentSchematicWireFunctionMetadataProfile } from "./current-schematic-wire-completion-source.ts";
import { currentSchematicWireClassicRpcSourceRow as sourceRow } from "./current-schematic-wire-classic-rpc-source.ts";

export const CURRENT_SCHEMATIC_WIRE_SERVICE_REJECTED_SOURCE={
  "start": 1_650_266,
  "end": 1_650_319,
  "bytes": 53,
  "sha256": "9de1d5b647f1b46f8b5bf444efbd8c1e2f2b60f0a561e4b34b562e59873b87ae",
  "name": "",
  "arity": 1,
  "constructible": false,
  "className": "Function",
  "lineNumber": 1033,
  "columnNumber": 29_963,
  "parentType": "function",
  "parentClassName": "Function",
  "parentDescription": "function () { [native code] }",
  "points": {
    "entry": {
      "lineNumber": 1033,
      "columnNumber": 29_967
    },
    "returned": {
      "lineNumber": 1033,
      "columnNumber": 30_015,
      "type": "return"
    }
  }
} as const;
export const CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_POINTS=freezeDeep([
  {
    "variant": 0,
    "points": {
      "serviceEntry": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 29_858,
        "stage": "entry"
      },
      "servicePost": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 29_902,
        "stage": "entry"
      },
      "serviceReturned": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 30_100,
        "stage": "returned"
      },
      "closingEntry": {
        "realm": "ui",
        "functionRole": "uiClosing",
        "lineNumber": 2181,
        "columnNumber": 1109,
        "stage": "entry"
      },
      "closingReturned": {
        "realm": "ui",
        "functionRole": "uiClosing",
        "lineNumber": 2181,
        "columnNumber": 1175,
        "stage": "returned"
      },
      "languageEntry": {
        "realm": "ui",
        "functionRole": "uiLocale_i18n",
        "lineNumber": 1172,
        "columnNumber": 1_834_430,
        "stage": "entry"
      },
      "languageReturned": {
        "realm": "ui",
        "functionRole": "uiLocale_i18n",
        "lineNumber": 1172,
        "columnNumber": 1_834_803,
        "stage": "returned"
      },
      "titleEntry": {
        "realm": "sch",
        "functionRole": "titleService",
        "lineNumber": 3831,
        "columnNumber": 40_847,
        "stage": "entry"
      },
      "titleReturned": {
        "realm": "sch",
        "functionRole": "titleService",
        "lineNumber": 3831,
        "columnNumber": 40_858,
        "stage": "returned"
      },
      "queryEntry": {
        "realm": "sch",
        "functionRole": "titleQuery",
        "lineNumber": 3697,
        "columnNumber": 41_833,
        "stage": "entry"
      },
      "queryReturned": {
        "realm": "sch",
        "functionRole": "titleQuery",
        "lineNumber": 3697,
        "columnNumber": 42_986,
        "stage": "returned"
      },
      "publishedEntry": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child1",
        "lineNumber": 1033,
        "columnNumber": 29_935,
        "stage": "entry"
      },
      "publishedReturned": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child1",
        "lineNumber": 1033,
        "columnNumber": 29_961,
        "stage": "returned"
      },
      "replyEntry": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcReply",
        "lineNumber": 1033,
        "columnNumber": 30_360,
        "stage": "entry"
      },
      "replyReturned": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcReply",
        "lineNumber": 1033,
        "columnNumber": 30_390,
        "stage": "returned"
      },
      "caught": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 30_055,
        "stage": "entry"
      },
      "rejected": {
        "realm": "ui",
        "functionRole": "serviceRejected",
        "lineNumber": 1033,
        "columnNumber": 29_967,
        "stage": "entry"
      }
    }
  },
  {
    "variant": 1,
    "points": {
      "serviceEntry": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 29_858,
        "stage": "entry"
      },
      "servicePost": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 29_902,
        "stage": "entry"
      },
      "serviceReturned": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 30_100,
        "stage": "returned"
      },
      "closingEntry": {
        "realm": "ui",
        "functionRole": "uiClosing",
        "lineNumber": 2181,
        "columnNumber": 1109,
        "stage": "entry"
      },
      "closingReturned": {
        "realm": "ui",
        "functionRole": "uiClosing",
        "lineNumber": 2181,
        "columnNumber": 1175,
        "stage": "returned"
      },
      "languageEntry": {
        "realm": "ui",
        "functionRole": "uiLocale_i18n",
        "lineNumber": 1172,
        "columnNumber": 1_834_430,
        "stage": "entry"
      },
      "languageReturned": {
        "realm": "ui",
        "functionRole": "uiLocale_i18n",
        "lineNumber": 1172,
        "columnNumber": 1_834_803,
        "stage": "returned"
      },
      "titleEntry": {
        "realm": "sch",
        "functionRole": "titleService",
        "lineNumber": 4329,
        "columnNumber": 40_848,
        "stage": "entry"
      },
      "titleReturned": {
        "realm": "sch",
        "functionRole": "titleService",
        "lineNumber": 4329,
        "columnNumber": 40_859,
        "stage": "returned"
      },
      "queryEntry": {
        "realm": "sch",
        "functionRole": "titleQuery",
        "lineNumber": 4331,
        "columnNumber": 238_351,
        "stage": "entry"
      },
      "queryReturned": {
        "realm": "sch",
        "functionRole": "titleQuery",
        "lineNumber": 4331,
        "columnNumber": 239_504,
        "stage": "returned"
      },
      "publishedEntry": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child1",
        "lineNumber": 1033,
        "columnNumber": 29_935,
        "stage": "entry"
      },
      "publishedReturned": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child1",
        "lineNumber": 1033,
        "columnNumber": 29_961,
        "stage": "returned"
      },
      "replyEntry": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcReply",
        "lineNumber": 1033,
        "columnNumber": 30_360,
        "stage": "entry"
      },
      "replyReturned": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcReply",
        "lineNumber": 1033,
        "columnNumber": 30_390,
        "stage": "returned"
      },
      "caught": {
        "realm": "ui",
        "functionRole": "MessageBus_rpcService_child0",
        "lineNumber": 1033,
        "columnNumber": 30_055,
        "stage": "entry"
      },
      "rejected": {
        "realm": "ui",
        "functionRole": "serviceRejected",
        "lineNumber": 1033,
        "columnNumber": 29_967,
        "stage": "entry"
      }
    }
  }
] as const);
export const CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_KINDS=Object.freeze(["serviceEntry", "servicePost", "serviceReturned", "closingEntry", "closingReturned", "languageEntry", "languageReturned", "titleEntry", "titleReturned", "queryEntry", "queryReturned", "publishedEntry", "publishedReturned", "replyEntry", "replyReturned", "caught", "rejected"]as const);
export type CurrentSchematicWireServiceInvocationPoint=keyof typeof CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_POINTS[0]["points"];
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:handle,location,functionLocation:location.optional(),returnValue:z.unknown().optional()});
const paused=z.object({reason:z.literal("other"),hitBreakpoints:z.array(handle).length(1),callFrames:z.array(frame).min(1).max(64)});
function need(value:boolean):asserts value{if(!value){throw new Error("WIRE_SERVICE_INVOCATION_SOURCE");}}
export function decodeCurrentSchematicWireServiceInvocationPause(input:unknown,variant:0|1,point:CurrentSchematicWireServiceInvocationPoint,scriptId:string,breakpointId:string):Readonly<{frame:string;returnValue:unknown;originalNativeEventJoined:false}>{
 need((variant===0||variant===1)&&!Object.is(variant,-0));handle.parse(scriptId);handle.parse(breakpointId);
 const selected=CURRENT_SCHEMATIC_WIRE_SERVICE_INVOCATION_POINTS[variant].points[point];need(selected!==undefined);
 const profile=selected.functionRole==="serviceRejected"?CURRENT_SCHEMATIC_WIRE_SERVICE_REJECTED_SOURCE:sourceRow(selected.realm==="ui"?2:variant,selected.functionRole);
 const packet=paused.parse(capture(input).value),top=packet.callFrames[0];need(top!==undefined);
 need(packet.hitBreakpoints[0]===breakpointId&&top.location.scriptId===scriptId&&top.location.lineNumber===selected.lineNumber&&top.location.columnNumber===selected.columnNumber&&
 top.functionLocation?.scriptId===scriptId&&top.functionLocation.lineNumber===profile.lineNumber&&top.functionLocation.columnNumber===profile.columnNumber);
 if(selected.stage==="entry"){need(top.returnValue===undefined);}
 return Object.freeze({frame:top.callFrameId,returnValue:top.returnValue,originalNativeEventJoined:false});
}


/** A rejected continuation retains its actual original function metadata. */
export function decodeCurrentSchematicWireServiceRejectedFunction(input:unknown,actual:unknown,scriptId:string):ReturnType<typeof compare>{
 const profile:CurrentSchematicWireFunctionMetadataProfile=CURRENT_SCHEMATIC_WIRE_SERVICE_REJECTED_SOURCE;return compare(input,actual,profile,scriptId);
}
