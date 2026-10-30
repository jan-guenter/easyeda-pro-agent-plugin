/** Unmounted fixed C#5 encoder. Its table is code generated from the closed
 * protocol; it forwards no caller JavaScript, session, URL or callback. */
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import { CURRENT_FOOTPRINT_DELETE_TRIGGER_GROUP as GROUP, CURRENT_FOOTPRINT_DELETE_TRIGGER_PROGRAMS as PROGRAMS } from "./current-footprint-delete-trigger-programs.ts";
import type { CurrentFootprintDeleteTriggerCommand as Command } from "./current-footprint-delete-trigger-protocol.ts";
import { currentFootprintDeleteTriggerWire } from "./current-footprint-delete-trigger-wire.ts";

const marker = (name: string): string => `__deletetrigger_${name}__`;
const literal = (value: string): string => `@"${value.replaceAll('"', '""')}"`;
const ticket = 123_450_987_654_321;
export function currentFootprintDeleteTriggerNativeCases(): readonly Command[] {
  const owner = [0, 1, 2, 3].map(index => ({ objectId: `delete_argument${String(index)}` }));
  const expected = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), targetUuid: "c".repeat(16), client: "d".repeat(16), maximumTicket: ticket };
  return Object.freeze((["capture", "preflight", "invoke"] as const).map(role => {
    const program = PROGRAMS[role];
    const { id: _id, ...command } = currentFootprintDeleteTriggerWire({ role, method: "Runtime.callFunctionOn", sessionId: "delete_sessionId", params: {
      objectId: "delete_objectId", functionDeclaration: program.program,
      arguments: role === "capture" ? owner : [...owner, { objectId: "delete_argument4" }, { value: expected }],
      objectGroup: GROUP, silent: true, generatePreview: false, userGesture: false,
      returnByValue: program.returnByValue, throwOnSideEffect: program.throwOnSideEffect, awaitPromise: program.awaitPromise,
    } }, 1).command;
    return Object.freeze(command);
  }));
}
export function currentFootprintDeleteTriggerNativeSource(): string {
  const cases = currentFootprintDeleteTriggerNativeCases();
  const rows = cases.map(command => {
    const wire = currentFootprintDeleteTriggerWire(command, 1);
    const names = ["sessionId", ...Object.keys(wire.request).filter(name => !["action", "role", "requestId"].includes(name))];
    const native = { method: command.method, sessionId: command.sessionId, params: command.params }; let template = JSON.stringify(native);
    for (const name of names) {
      const value = name === "sessionId" ? command.sessionId : wire.request[name];
      if (value === undefined || !template.includes(JSON.stringify(value))) { throw new Error("FOOTPRINT_DELETE_TRIGGER_NATIVE_FIELD"); }
      template = template.replaceAll(JSON.stringify(value), JSON.stringify(marker(name)));
    }
    return `${command.role}\t${names.filter(name => name !== "sessionId").join(",")}\t${template}`;
  });
  const bytes = Buffer.from(rows.join("\0"));
  // oxlint-disable-next-line node/no-sync -- Deterministic in-memory packing of three finite fixed command templates.
  const packed = gzipSync(bytes, { level: 9 });
  return `public static class EasyedaFootprintDeleteTriggerProtocol {
static void Need(bool value){if(!value)throw new System.InvalidOperationException("footprint-delete-trigger-protocol");}
static string[][] Load(){return EasyedaDiagnosticFixedTable.Load(${literal(packed.toString("base64"))},${String(bytes.length)},${literal(createHash("sha256").update(bytes).digest("hex"))},${literal(createHash("sha256").update(packed).digest("hex"))},3,3);}
static readonly string[][] Cases=Load();
static string Field(string name,object input){if(name=="maximumTicket"){Need(input is int||input is long);long number=System.Convert.ToInt64(input,System.Globalization.CultureInfo.InvariantCulture);Need(number>=0&&number<=9007199254740990L);return number.ToString(System.Globalization.CultureInfo.InvariantCulture);}string value=input as string;Need(value!=null);string pattern=name=="sessionId"?@"\\A[A-Za-z0-9_.:-]{1,128}\\z":name=="projectUuid"?@"\\A(?:[a-f0-9]{32}|[a-f0-9]{64})\\z":name=="targetUuid"?@"\\A(?:[a-f0-9]{16}|[a-f0-9]{32})\\z":name=="branchUuid"?@"\\A[a-f0-9]{32}\\z":name=="client"?@"\\A[a-f0-9]{16}\\z":@"\\A[A-Za-z0-9_.:-]{1,256}\\z";Need(System.Text.RegularExpressions.Regex.IsMatch(value,pattern));return "\\""+value+"\\"";}
public static string Encode(int id,string originalWorkerSession,string role,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] selected=null;foreach(string[] row in Cases)if(row[0]==role){Need(selected==null);selected=row;}Need(selected!=null);string[] names=selected[1].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string template=selected[2];var output=new System.Text.StringBuilder();int previous=0;foreach(System.Text.RegularExpressions.Match match in System.Text.RegularExpressions.Regex.Matches(template,"\\"__deletetrigger_([A-Za-z0-9]+)__\\"")){string name=match.Groups[1].Value;output.Append(template,previous,match.Index-previous);output.Append(Field(name,name=="sessionId"?(object)originalWorkerSession:fields[name]));previous=match.Index+match.Length;}output.Append(template,previous,template.Length-previous);string text="{\\"id\\":"+id.ToString(System.Globalization.CultureInfo.InvariantCulture)+","+output.ToString().Substring(1);Need(System.Text.Encoding.UTF8.GetByteCount(text)<=16384);return text+"\\0";}
}`;
}
