/** Explicit synthetic transport receipts; the production cursor retains and
 * consumes the actual pending request, pause, source and callback ledger. */
import type { CurrentPcbViaMainStructureCommand as Command } from "../../src/current-pcb-via-main-structure-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_PROGRAMS as PROGRAMS, currentPcbViaMainStructureFrame } from "../../src/current-pcb-via-main-structure-protocol.ts";
import { CURRENT_PCB_VIA_MAIN_STRUCTURE_FINAL_FUNCTION as FINAL } from "../../src/current-pcb-via-main-structure-source.ts";
import { historyBaseline } from "./via-main-history-replies.ts";

type Data = Record<string, unknown>;
const property = (name: string, value: Data, writable = false, enumerable = false, configurable = true): Data => ({ name, value, writable, enumerable, configurable, isOwn: true });
const parent = { name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-parent" } };
const arrayProperties = (length: number, special: Data): Data => ({ result: [...Array.from({ length }, (_, index) => property(String(index), index === length - 1 ? special : { type: "object", objectId: `structure-member-${String(index)}` }, true, true)), property("length", { type: "number", value: length }, true, false, false)], internalProperties: [parent] });
export function viaMainStructureReply(command: Command, id: number, project: string): unknown {
  const array = (length: number): Data => ({ result: { type: "object", subtype: "array", className: "Array", description: `Array(${String(length)})`, objectId: `structure-packet-${String(id)}` } });
  if (command.phase === "via-main-structure-arm") { return { breakpointId: `structure-${command.role}`, actualLocation: command.params.location }; }
  if (command.phase === "via-main-structure-final-arm") { return { breakpointId: "structure-finalEntry" }; }
  if (command.phase === "via-main-structure-frame") { return array(currentPcbViaMainStructureFrame(command.role).length); }
  if (command.phase === "via-main-structure-properties") {
    if (command.role === "query") { return arrayProperties(7, { type: "object", subtype: "promise", className: "Promise", objectId: "structure-db-promise" }); }
    if (command.role === "promise") { return { result: [], internalProperties: [{ name: "[[PromiseState]]", value: { type: "string", value: "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "object", className: "yo", objectId: "structure-yo" } }, { name: "[[Prototype]]", value: { type: "object", className: "Promise", objectId: "promise-parent" } }] }; }
    if (command.role === "final") { return arrayProperties(4, { type: "function", className: "Function", description: FINAL.source, objectId: "structure-final-function" }); }
    return { result: [property("name", { type: "string", value: FINAL.name }), property("length", { type: "number", value: FINAL.length })], internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "app", lineNumber: FINAL.functionLine, columnNumber: FINAL.functionColumn } } },
      { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-parent" } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", objectId: "scopes", description: "Scopes[5]" } }] };
  }
  if (command.phase === "via-main-structure-join") { const fixed = PROGRAMS[command.role]; if (!fixed.returnByValue) { return array(fixed.length); }
    if (command.role === "contextJoin" || command.role === "connection") { return { result: { type: "boolean", value: true } }; }
    let value: Data;
    if (command.role === "selectedValue") { value = { ticket: 1, structureText: historyBaseline.structure.structure }; }
    else if (command.role === "rowsValue") { value = { ticket: 1, structureText: historyBaseline.structure.structure, rows: 1 }; }
    else if (command.role === "runValue") { value = { ticket: 3, structureText: '{"saved":true}', branchUuid: "b".repeat(32) }; }
    else if (command.role === "callbackValue") { value = { changes: 1, lastID: 1 }; }
    else if (command.role === "responseValue") { value = { projectUuid: project, branchUuid: "b".repeat(32), ticket: 3, structureText: '{"saved":true}', projectPath: String.raw`C:\Synthetic\fixture.eprj2`, selectedTicket: 1, selectedRows: 1 }; }
    else { value = { originalResponseFinalizerReturned: true, statusCode: 200 }; } return { result: { type: "object", value } };
  } return {};
}
export function viaMainStructureWindow(role: string): Readonly<{ beforeEpochMs: number; afterEpochMs: number }> | null { return role === "run" || role === "callback" ? { beforeEpochMs: 1_793_920_000_000, afterEpochMs: role === "callback" ? 1_793_920_000_001 : 0 } : null; }
