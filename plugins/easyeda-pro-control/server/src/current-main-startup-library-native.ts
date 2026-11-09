/** Fixed native rows extend only the private stock origin. Historical Node
 * SQL grammar still rejects these phases, and all original rows remain exact. */
import { CURRENT_MAIN_STARTUP_LIBRARY_LIVE as LIVE } from "./current-main-startup-library-live-profile.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_CALLS as CALLS, CURRENT_MAIN_STARTUP_LIBRARY_FRAME_EXPRESSION as EXPRESSION } from "./current-main-startup-library-programs.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_RETURN_PROGRAM as RETURN } from "./current-main-startup-library-return-program.ts";
import { validateCurrentMainStartupLibraryCommand } from "./current-main-startup-library-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FRAME } from "./current-selected-file-main-sql-fence-protocol.ts";
import type { CurrentMainStartupLibraryCommand as Command } from "./current-main-startup-library-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CAPTURED, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as RAW, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";

const marker = (name: string): string => `__selectedsql_${name}__`;
export function currentMainStartupLibraryWire(input: unknown, id: number): Readonly<{ command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("MAIN_STARTUP_LIBRARY_REQUEST_ID"); }
  const command = validateCurrentMainStartupLibraryCommand(input), request: Record<string, string | number> = { action: "main-send", requestId: id, phase: command.phase, method: command.method };
  if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Debugger.getPossibleBreakpoints") { request["scriptId"] = command.params.start.scriptId; }
  else if (command.method === "Debugger.setBreakpoint") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Runtime.getProperties") { request["objectId"] = command.params.objectId; }
  else if (command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
      else if (command.phase === "sql-stock-bind") { request["path"] = argument.value; }
    }
  }
  return { command: { ...command, id }, request };
}
export function currentMainStartupLibraryNativeCases(): readonly Command[] {
  const callFrameId = marker("callFrameId"), objectId = marker("objectId"), scriptId = marker("scriptId");
  const ref = (index: number): Readonly<{ objectId: string }> => ({ objectId: marker(`argument${String(index)}`) });
  const call = { ...CALL, throwOnSideEffect: false as const, objectId };
  return [
    { phase: "sql-stock-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: EXPRESSION } },
    { phase: "sql-stock-bind", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: CALLS.bind, arguments: [ref(0), { value: marker("path") }], returnByValue: false } },
    { phase: "sql-stock-points", method: "Debugger.getPossibleBreakpoints", params: { start: { scriptId, ...LIVE.functionStart }, end: { scriptId, ...LIVE.functionEnd }, restrictToFunction: true } },
    { phase: "sql-stock-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId, ...LIVE.returnPoint }, condition: "true" } },
    { phase: "sql-stock-raw", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: RAW.run } },
    { phase: "sql-stock-captured", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: CAPTURED, arguments: [ref(0), { value: "run" }], returnByValue: false } },
    { phase: "sql-stock-select", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: CALLS.select, arguments: [ref(0), ref(1)], returnByValue: true } },
    { phase: "sql-stock-require", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: REQUIRE, arguments: [], returnByValue: true } },
    { phase: "sql-stock-resume", method: "Debugger.resume", params: {} },
    { phase: "sql-stock-return-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: "[t]" } },
    { phase: "sql-stock-return-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "sql-stock-return", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: RETURN, arguments: [ref(0), ref(1), ref(2), ref(3)], returnByValue: true } },
    { phase: "sql-stock-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } },
  ];
}
export function currentMainStartupLibraryNativeRows(): readonly string[] {
  return currentMainStartupLibraryNativeCases().map(command => {
    const wire = currentMainStartupLibraryWire(command, 1); const fields = Object.keys(wire.request).filter(key => !["action", "requestId", "phase", "method"].includes(key));
    const template = JSON.stringify({ method: command.method, params: command.params });
    if (fields.some(name => wire.request[name] !== marker(name) || !template.includes(JSON.stringify(marker(name)))) || Buffer.byteLength(template) > 16_384) { throw new Error("MAIN_STARTUP_LIBRARY_NATIVE_ROW"); }
    return [command.phase, command.method, fields.join(","), template].join("\t");
  });
}
/** Separate native phase ledger and transport counter. Legacy normal and
 * cleanup reservations remain exact and cannot spend this origin's quota. */
export function currentMainStartupLibraryNativeFragment(): string {
  return `internal sealed partial class EasyedaOriginalMainTransport {
int stockRequests;
internal void SendStock(string text){Budget(false);AssertConnection();Need(stockRequests<${String(LIVE.requests)}&&text!=null&&text.Length>0&&text.IndexOf('\\0')<0&&utf8.GetByteCount(text)<=65536,"stock-command");stockRequests++;WriteFrame(1,utf8.GetBytes(text));AssertConnection();}
}
public sealed partial class EasyedaDiagnosticOwner {
bool stockMainEligible;int stockMainRequests,stockMainStage,stockMainCalls;
void SendStockMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(!stockMainEligible||id!=mainRequest+1||stockMainRequests>=${String(LIVE.requests)})throw Error("stock-original-owner");string[] first={"sql-stock-raw","sql-stock-captured","sql-stock-frame","sql-stock-bind","sql-stock-points","sql-stock-arm"},next={"sql-stock-select","sql-stock-require","sql-stock-resume","sql-stock-raw","sql-stock-captured","sql-stock-return-frame","sql-stock-return-properties","sql-stock-return","sql-stock-remove","sql-stock-require","sql-stock-resume"};string expected=stockMainStage<6?first[stockMainStage]:stockMainStage<17?next[stockMainStage-6]:null;if(phase!=expected)throw Error("stock-phase-order");string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);stockMainRequests++;mainRequest=id;if(stockMainStage==8){stockMainCalls++;stockMainStage=stockMainCalls==332?11:9;}else if(stockMainStage==10)stockMainStage=6;else stockMainStage++;originalMain.SendStock(text);AssertLive();}
}
`;
}
