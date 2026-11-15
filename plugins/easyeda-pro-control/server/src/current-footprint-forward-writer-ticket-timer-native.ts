/** Complete-only closed timer codebook and original instance accounting.
 * No native control accepts an observed timer, completion bool or code. */
import {createHash} from "node:crypto";
import {gzipSync} from "node:zlib";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as PROGRAMS} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
import {currentFootprintForwardWriterTicketTimerCases,currentFootprintForwardWriterTicketTimerTemplate} from "./current-footprint-forward-writer-ticket-timer-protocol.ts";

const hash=(value:Uint8Array):string=>createHash("sha256").update(value).digest("hex");
function load(text:string,rows:number,columns:number):string{
 const bytes=Buffer.from(text);if(bytes.length>60_000){throw new Error("FORWARD_TICKET_TIMER_TABLE_BOUND");}
 // oxlint-disable-next-line node/no-sync -- This fixed source table is packed only by source composition, never a runtime owner request.
 const packed=gzipSync(bytes,{level:9});return `EasyedaDiagnosticFixedTable.Load("${packed.toString("base64")}",${String(bytes.length)},"${hash(bytes)}","${hash(packed)}",${String(rows)},${String(columns)})`;
}
export function currentFootprintForwardWriterTicketTimerNativeSource():string{
 const cases=currentFootprintForwardWriterTicketTimerCases(),rows=cases.map(command=>currentFootprintForwardWriterTicketTimerTemplate(command));
 if(rows.length!==49){throw new Error("FORWARD_TICKET_TIMER_NATIVE_ROSTER");}
 const table=rows.map(row=>{let template=row.template;for(const[role,program]of Object.entries(PROGRAMS)){template=template.replace(JSON.stringify(program),JSON.stringify(`__ticket_program_${role}__`));}return[row.phase,row.method,row.fields.join(","),template].join("\t");}).join("\0");
 const programRows=Object.entries(PROGRAMS).map(([role,program])=>`new string[]{"${role}",${load(program,1,1)}[0][0]}`);
 return `internal static class EasyedaForwardWriterTicketTimerProtocol{
static void Need(bool value){if(!value)throw new InvalidOperationException("forward-ticket-timer-codec");}
static readonly string[][] Rows=${load(table,49,4)};
static readonly string[][] Programs=new string[][]{${programRows.join(",")}};
static string Handle(object input){string value=input as string;Need(value!=null&&System.Text.RegularExpressions.Regex.IsMatch(value,@"\\A[A-Za-z0-9_.:-]{1,256}\\z"));return EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(value);}
internal static string Encode(int id,string session,string phase,string method,System.Collections.IDictionary fields){Need(id>0&&fields!=null);string[] row=null;foreach(var candidate in Rows)if(candidate[0]==phase){Need(row==null);row=candidate;}Need(row!=null&&row[1]==method);string[] names=row[2].Length==0?new string[0]:row[2].Split(',');Need(fields.Count==names.Length);foreach(string name in names)Need(fields.Contains(name));string text=row[3];foreach(var program in Programs)text=text.Replace("\\"__ticket_program_"+program[0]+"__\\"",EasyedaDiagnosticOwner.ForwardWriterCopyLocalQuote(program[1]));text=System.Text.RegularExpressions.Regex.Replace(text,"\\"__ticket_timer_([A-Za-z0-9]+)__\\"",match=>Handle(fields[match.Groups[1].Value]));text="{\\"id\\":"+id.ToString(CultureInfo.InvariantCulture)+","+text.Substring(1,text.Length-2)+",\\"sessionId\\":"+Handle(session)+"}\\0";Need(System.Text.Encoding.UTF8.GetByteCount(text)<=65536);return text;}
internal static string Phase(int step){Need(step>=0&&step<Rows.Length);return Rows[step][0];}
internal static void VerifySmoke(){foreach(var row in Rows){var fields=new System.Collections.Hashtable();foreach(string name in row[2].Split(','))if(name.Length>0)fields.Add(name,"original27");string text=Encode(79,"session29",row[0],row[1],fields);Need(text.StartsWith("{\\"id\\":79,",StringComparison.Ordinal)&&text.EndsWith(",\\"sessionId\\":\\"session29\\"}\\0",StringComparison.Ordinal)&&!text.Contains("__ticket_"));bool refused=false;try{Encode(79,"session29",row[0],"Runtime.evaluate",fields);}catch(InvalidOperationException){refused=true;}Need(refused);}}
}
public sealed partial class EasyedaDiagnosticOwner{
int fullTicketSetup,fullTicketHolds,fullTicketHeldStep,fullTicketSlots;bool fullTicketBound,fullTicketReady,fullTicketFailed;string fullTicketRole;
static readonly string[] FullTicketRoles={"entry","returned","selfReturned"};
public void ControlForwardWriterTicketTimer(string operation,string role,int ordinal){RequireForwardWriterCompleteBase();
if(operation=="bind"){if(role!=null||ordinal!=0||footprintCreateClockBegun||!fullStartupWsConsumed||!fullOwnDataReady||fullTicketBound)throw Error("forward-ticket-bind");fullTicketBound=true;return;}
if(!fullTicketBound)throw Error("forward-ticket-original");
if(operation=="ready"){if(role!=null||ordinal!=0||footprintCreateClockBegun||fullTicketReady||fullTicketSetup!=37||forwardWriterCompleteTimerArms!=3)throw Error("forward-ticket-ready");fullTicketReady=true;}
else if(operation=="held"){RequireForwardWriterCompleteCreated();if(!fullTicketReady||!forwardWriterCompleteTimerBaseline||fullTicketRole!=null||fullTicketHolds>=6||role!=FullTicketRoles[fullTicketHolds%3]||ordinal!=fullTicketHolds/3+1)throw Error("forward-ticket-held");fullTicketRole=role;fullTicketHeldStep=0;}
else if(operation=="complete"){RequireForwardWriterCompleteCreated();if(role!=null||ordinal!=0||forwardWriterCompletePublishTimerComplete||fullTicketRole!=null||fullTicketHolds<3||fullTicketHolds%3!=0||fullTicketSlots<1||fullTicketSlots>3||!fullPublicationComplete||!fullDrainComplete||!fullPostComplete)throw Error("forward-ticket-complete");forwardWriterCompletePublishTimerComplete=true;}
else throw Error("forward-ticket-control");
}
public void SendForwardWriterTicketTimer(int id,string phase,string method,System.Collections.IDictionary fields){RequireForwardWriterCompleteBase();if(!fullTicketBound||forwardWriterCompletePublishTimerComplete)throw Error("forward-ticket-owner");
int index=-1;if(!fullTicketReady){if(footprintCreateClockBegun||fullTicketSetup>=37)throw Error("forward-ticket-setup");index=fullTicketSetup;}
else if(phase=="ticket-timer-call-before"){if(footprintCreateClockBegun||forwardWriterCompleteTimerBaseline)throw Error("forward-ticket-precreate");index=37;}
else{RequireForwardWriterCompleteCreated();if(!forwardWriterCompleteTimerBaseline)throw Error("forward-ticket-before-required");if(phase=="ticket-timer-call-slot"){if(fullTicketRole!=null||fullTicketSlots>=3||!fullPublicationComplete||!fullPostComplete||!fullDrainComplete)throw Error("forward-ticket-slot");index=48;}else{if(fullTicketRole==null)throw Error("forward-ticket-held-required");int start=fullTicketRole=="entry"?38:fullTicketRole=="returned"?42:45;int size=fullTicketRole=="entry"?4:3;if(fullTicketHeldStep>=size)throw Error("forward-ticket-held-bound");index=start+fullTicketHeldStep;}}
if(phase!=EasyedaForwardWriterTicketTimerProtocol.Phase(index))throw Error("forward-ticket-fixed-order");if(phase.StartsWith("ticket-timer-arm-",StringComparison.Ordinal)&&(fields==null||fields["scriptId"] as string!=forwardWriterProducerScript))throw Error("forward-ticket-script");
string text=EasyedaForwardWriterTicketTimerProtocol.Encode(id,footprintCopyWorkerSession,phase,method,fields);
if(index<37){fullTicketSetup++;if(phase.StartsWith("ticket-timer-arm-",StringComparison.Ordinal))forwardWriterCompleteTimerArms++;}
else if(index==48)fullTicketSlots++;
else if(index!=37){fullTicketHeldStep++;if(method=="Debugger.resume"){fullTicketRole=null;fullTicketHolds++;}}
try{SendForwardWriterNormalMessage(id,text);}catch{fullTicketFailed=true;throw;}
if(index==37)forwardWriterCompleteTimerBaseline=true;
}
public static void VerifyForwardWriterTicketTimerSmoke(){EasyedaForwardWriterTicketTimerProtocol.VerifySmoke();var owner=CreateFootprintForwardWriter209();try{bool refused=false;try{owner.ControlForwardWriterTicketTimer("bind",null,0);}catch(InvalidOperationException){refused=true;}if(!refused||owner.fullTicketBound||owner.forwardWriterCompletePublishTimerComplete)throw Error("forward-ticket-unissued");}finally{owner.originalMain.Release();}}
}
`;
}
export function currentFootprintForwardWriterTicketTimerControlDispatch():string{return String.raw`        'footprint-forward-ticket-timer-control' {
          if(-not $WorkerStartupFootprintForwardWriterComplete209 -or -not $launched -or $request.operation -isnot [string]){throw 'forward-ticket-control'}
          $base=@('action','helperInstance','id','jobId','rootCreated','rootPid','operation');$role=[System.Management.Automation.Language.NullString]::Value;$ordinal=0
          if($request.operation -ceq 'held'){$base+=@('role','timerOrdinal');if($request.role -isnot [string] -or ($request.timerOrdinal -isnot [int] -and $request.timerOrdinal -isnot [long]) -or $request.timerOrdinal -lt 1 -or $request.timerOrdinal -gt 2){throw 'forward-ticket-held'};$role=$request.role;$ordinal=[int]$request.timerOrdinal}
          elseif(@('bind','ready','complete') -cnotcontains $request.operation){throw 'forward-ticket-operation'}
          if((@($request.PSObject.Properties.Name | Sort-Object) -join ',') -cne (@($base | Sort-Object) -join ',')){throw 'forward-ticket-shape'}
          $owner.ControlForwardWriterTicketTimer($request.operation,$role,$ordinal);$result=@{written=$true}
        }
`;}
