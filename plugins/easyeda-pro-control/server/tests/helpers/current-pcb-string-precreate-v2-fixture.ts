/** Synthetic inspector metadata and independent VM leaves. This does not
 * establish live ownership, source admission or native channel identity. */
import { runInContext } from "node:vm";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS } from "../../src/current-pcb-diagnostic-model-scope.ts";
import type { CurrentPcbStringObservationCommand } from "../../src/current-pcb-string-precreate-runner.ts";
import { constructorReplies } from "./current-pcb-constructor-replies.ts";
import { rawStringsModelReply, rootInventoryModelReply } from "./current-pcb-diagnostic-model-replies.ts";
import { pcbLazyOwnerFixture, pcbLazyOwnerReply } from "./current-pcb-lazy-owner-fixture.ts";
import { pcbStringObservationFixture, pcbStringReply } from "./current-pcb-string-observation-fixture.ts";
import { teardropArgumentsReply, teardropBoundReply, teardropCallbacksReply, teardropProofReply,
  teardropTargetReply, teardropTupleReply } from "./current-pcb-teardrop-replies.ts";

function property(name: string, value: unknown): unknown {
  return { name, value, writable: false, configurable: true, enumerable: false, isOwn: true };
}
function functionProperties(kind: "rpc-wrapper" | "save-handler", scopes: string): unknown {
  const location = CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS[kind];
  return { result: [property("length", { type: "number", value: location.parameterCount }),
    property("name", { type: "string", value: "" })], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location",
      value: { scriptId: "pcb", lineNumber: location.lineNumber, columnNumber: location.columnNumber }, description: "Object" } },
    { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: scopes } },
  ] };
}
function scopesReply(kind: "rpc-wrapper" | "save-handler", objectId: string): unknown {
  return { result: [kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => ({
    name: String(index), value: { type: "object", subtype: "internal#scope", className: "Object", description,
      objectId: index === 0 ? objectId : "global" }, writable: true, configurable: true, enumerable: true, isOwn: true,
  })) };
}
function prefixReplies(): readonly unknown[] {
  return [
    { result: { type: "function", className: "Function", description: "original wrapper", objectId: "wrapper" } },
    functionProperties("rpc-wrapper", "wrapper-scopes"), scopesReply("rpc-wrapper", "wrapper-scope"),
    { result: { type: "function", className: "AsyncFunction", description: "original handler", objectId: "handler" } },
    functionProperties("save-handler", "handler-scopes"), scopesReply("save-handler", "handler-scope"),
    teardropCallbacksReply(), teardropTupleReply(),
    ...Array.from({ length: 6 }, (_, index) => [teardropBoundReply(index), teardropTargetReply(index, "pcb"), teardropArgumentsReply()]).flat(),
    teardropProofReply(), ...constructorReplies("precreate", "pcb"),
  ];
}
export function currentPcbStringPrecreateV2Fixture(change = "FP.manager=null;MI.manager=null;"):
Readonly<{ reply: (command: CurrentPcbStringObservationCommand) => unknown; untouched: () => boolean }> {
  const context = pcbLazyOwnerFixture(change), prefix = prefixReplies(), worker = pcbStringObservationFixture(true);
  let index = 0;
  return {
    reply: (command): unknown => {
      if (command.method === "Runtime.releaseObjectGroup") { return {}; }
      if (index < prefix.length) { const reply = prefix[index]; index += 1; return reply; }
      if ("modelPhase" in command) {
        if (command.modelPhase === "raw-strings") { return rawStringsModelReply("d".repeat(16)); }
        if (command.modelPhase === "root-inventory") { return rootInventoryModelReply("d".repeat(16)); }
        if (command.modelPhase === "snapshot-v2" || command.modelPhase === "pending-v2") {
          return pcbLazyOwnerReply(command.params.functionDeclaration, context);
        }
      } else {
        if (command.stringPhase === "worker-association") {
          return pcbStringReply(runInContext(command.params.expression, worker, { timeout: 1000 }) as unknown);
        }
        return pcbLazyOwnerReply(command.params.functionDeclaration, context);
      }
      throw new Error("Unexpected synthetic precreate command.");
    },
    untouched: (): boolean => [context, worker].every(selected => runInContext("vendorCalls+getterReads", selected) === 0),
  };
}
