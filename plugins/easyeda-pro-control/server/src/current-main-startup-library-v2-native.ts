/** Fixed native rows extend only the private stock origin. Historical Node
 * SQL grammar still rejects these phases, and all original rows remain exact. */
import { CURRENT_MAIN_STARTUP_LIBRARY_V2 as LIVE } from "./current-main-startup-library-v2-profile.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLER_EXPRESSION as CALLER_EXPRESSION, CURRENT_MAIN_STARTUP_LIBRARY_V2_CALLS as CALLS } from "./current-main-startup-library-v2-programs.ts";
import { CURRENT_MAIN_STARTUP_LIBRARY_FRAME_EXPRESSION as EXPRESSION } from "./current-main-startup-library-programs.ts";
import { validateCurrentMainStartupLibraryV2Command } from "./current-main-startup-library-v2-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_CALL_FLAGS as CALL, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_FRAME_FLAGS as FRAME } from "./current-selected-file-main-sql-fence-protocol.ts";
import type { CurrentMainStartupLibraryV2Command as Command } from "./current-main-startup-library-v2-protocol.ts";
import { CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_PROGRAM as CAPTURED, CURRENT_SELECTED_FILE_MAIN_SQL_CAPTURED_FRAME_EXPRESSIONS as RAW, CURRENT_SELECTED_FILE_MAIN_SQL_FENCE_REQUIRE_PROGRAM as REQUIRE } from "./current-selected-file-main-sql-fence-programs.ts";

const RETURN = CALLS.returned;
const marker = (name: string): string => `__selectedsql_${name}__`;
export function currentMainStartupLibraryV2Wire(input: unknown, id: number): Readonly<{ command: Command & Readonly<{ id: number }>; request: Readonly<Record<string, string | number>> }> {
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) { throw new Error("MAIN_STARTUP_LIBRARY_REQUEST_ID"); }
  const command = validateCurrentMainStartupLibraryV2Command(input), request: Record<string, string | number> = { action: "main-send", requestId: id, phase: command.phase, method: command.method };
  if (command.method === "Debugger.evaluateOnCallFrame") { request["callFrameId"] = command.params.callFrameId; }
  else if (command.method === "Debugger.getPossibleBreakpoints") { request["scriptId"] = command.params.start.scriptId; }
  else if (command.method === "Debugger.setBreakpoint") { request["scriptId"] = command.params.location.scriptId; }
  else if (command.method === "Debugger.removeBreakpoint") { request["breakpointId"] = command.params.breakpointId; }
  else if (command.method === "Runtime.getProperties") { request["objectId"] = command.params.objectId; }
  else if (command.method === "Runtime.callFunctionOn") {
    request["objectId"] = command.params.objectId;
    for (const [index, argument] of command.params.arguments.entries()) {
      if ("objectId" in argument) { request[`argument${String(index)}`] = argument.objectId; }
      else if (command.phase === "sql-stock-v2-bind") { request["path"] = argument.value; }
    }
  }
  return { command: { ...command, id }, request };
}
export function currentMainStartupLibraryV2NativeCases(): readonly Command[] {
  const callFrameId = marker("callFrameId"), objectId = marker("objectId"), scriptId = marker("scriptId");
  const ref = (index: number): Readonly<{ objectId: string }> => ({ objectId: marker(`argument${String(index)}`) });
  const call = { ...CALL, throwOnSideEffect: false as const, objectId };
  return [
    { phase: "sql-stock-v2-caller", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: CALLER_EXPRESSION } },
    { phase: "sql-stock-v2-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: EXPRESSION } },
    { phase: "sql-stock-v2-bind", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: CALLS.bind, arguments: [ref(0), { value: marker("path") }, ref(2)], returnByValue: false } },
    { phase: "sql-stock-v2-points", method: "Debugger.getPossibleBreakpoints", params: { start: { scriptId, ...LIVE.functionStart }, end: { scriptId, ...LIVE.functionEnd }, restrictToFunction: true } },
    { phase: "sql-stock-v2-arm", method: "Debugger.setBreakpoint", params: { location: { scriptId, ...LIVE.returnPoint }, condition: "true" } },
    { phase: "sql-stock-v2-raw", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: RAW.run } },
    { phase: "sql-stock-v2-captured", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: CAPTURED, arguments: [ref(0), { value: "run" }], returnByValue: false } },
    { phase: "sql-stock-v2-select", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: CALLS.select, arguments: [ref(0), ref(1), ref(2)], returnByValue: true } },
    { phase: "sql-stock-v2-require", method: "Runtime.callFunctionOn", params: { ...CALL, objectId, functionDeclaration: REQUIRE, arguments: [], returnByValue: true } },
    { phase: "sql-stock-v2-resume", method: "Debugger.resume", params: {} },
    { phase: "sql-stock-v2-return-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FRAME, callFrameId, expression: "[t]" } },
    { phase: "sql-stock-v2-return-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } },
    { phase: "sql-stock-v2-return", method: "Runtime.callFunctionOn", params: { ...call, functionDeclaration: RETURN, arguments: [ref(0), ref(1), ref(2), ref(3)], returnByValue: true } },
    { phase: "sql-stock-v2-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: marker("breakpointId") } },
  ];
}
export function currentMainStartupLibraryV2NativeRows(): readonly string[] {
  return currentMainStartupLibraryV2NativeCases().map(command => {
    const wire = currentMainStartupLibraryV2Wire(command, 1); const fields = Object.keys(wire.request).filter(key => !["action", "requestId", "phase", "method"].includes(key));
    const template = JSON.stringify({ method: command.method, params: command.params });
    if (fields.some(name => wire.request[name] !== marker(name) || !template.includes(JSON.stringify(marker(name)))) || Buffer.byteLength(template) > 16_384) { throw new Error("MAIN_STARTUP_LIBRARY_NATIVE_ROW"); }
    return [command.phase, command.method, fields.join(","), template].join("\t");
  });
}
/** Separate native phase ledger and transport counter. Legacy normal and
 * cleanup reservations remain exact and cannot spend this origin's quota. */
export function currentMainStartupLibraryV2NativeFragment(): string {
  return `internal sealed partial class EasyedaOriginalMainTransport {
int stockRequests;
internal void SendStock(string text){Budget(false);AssertConnection();Need(stockRequests<${String(LIVE.requests)}&&text!=null&&text.Length>0&&text.IndexOf('\\0')<0&&utf8.GetByteCount(text)<=65536,"stock-command");stockRequests++;WriteFrame(1,utf8.GetBytes(text));AssertConnection();}
}
public sealed partial class EasyedaDiagnosticOwner {
bool stockMainEligible;int stockMainRequests,stockMainStage,stockMainCalls;
void SendStockMain(int id,string phase,string method,System.Collections.IDictionary fields){MainPurpose();AssertLive();if(!stockMainEligible||id!=mainRequest+1||stockMainRequests>=${String(LIVE.requests)})throw Error("stock-original-owner");string[] phases={"raw","captured","caller","frame","bind","points","arm","select","require","resume","raw","captured","caller","return-frame","return-properties","return","remove","require","resume"};string expected=stockMainStage<19?"sql-stock-v2-"+phases[stockMainStage]:null;if(phase!=expected)throw Error("stock-phase-order");string text=EasyedaSelectedFileMainSqlFenceProtocol.Encode(id,phase,method,fields);stockMainRequests++;mainRequest=id;if(stockMainStage==9){stockMainCalls++;stockMainStage=stockMainCalls==332?13:10;}else if(stockMainStage==12)stockMainStage=7;else stockMainStage++;originalMain.SendStock(text);AssertLive();}
}
`;
}
