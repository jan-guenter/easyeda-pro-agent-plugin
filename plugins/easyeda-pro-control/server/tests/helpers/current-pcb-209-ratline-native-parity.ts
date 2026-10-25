/** Compiled test vectors only. Never embed this class in the native owner. */
import { CURRENT_PCB_209_RATLINE_NATIVE_CASES } from "../../src/current-pcb-209-ratline-native-cases.ts";
import { currentPcb209RatlineNativeWire } from "../../src/current-pcb-209-ratline-native-wire.ts";

function literal(value: string): string { return `@"${value.replaceAll('"', '""')}"`; }

export function currentPcb209RatlineNativeParitySource(): string {
  const cases = CURRENT_PCB_209_RATLINE_NATIVE_CASES.map((entry, index) => {
    const id = 301 + index, wire = currentPcb209RatlineNativeWire(entry.role, entry.command, id);
    const fields = Object.entries(wire.request).filter(([key]) => !["action", "requestId", "method", "role", "phase"].includes(key));
    const { navigationPhase: _privatePhase, loaderPhase: _loaderPhase, ...nativeCommand } = { navigationPhase: undefined, loaderPhase: undefined, ...entry.command };
    return `    fields.Clear();\n${fields.map(([key, value]) => `    fields.Add(${literal(key)},${literal(String(value))});`).join("\n")}\n` +
      `    Need(EasyedaRatline209Protocol.Encode(${String(id)},${literal(entry.role)},${literal(entry.phase)},${literal(entry.command.method)},fields)==${literal(JSON.stringify({ id, ...nativeCommand }))}+"\\0","parity-${String(index)}");\n` +
      `    Refused(${String(id)},${literal(entry.role)},${literal(entry.phase)},"foreign",fields);\n` +
      `    fields.Add("expression","arbitrary");Refused(${String(id)},${literal(entry.role)},${literal(entry.phase)},${literal(entry.command.method)},fields);`;
  });
  return `public static class EasyedaRatline209ProtocolParity {
  static void Need(bool value,string code) { if(!value)throw new System.InvalidOperationException("ratline-test-"+code); }
  static void Refused(int id,string role,string phase,string method,System.Collections.IDictionary fields) {
    bool refused=false;try{EasyedaRatline209Protocol.Encode(id,role,phase,method,fields);}catch(System.InvalidOperationException){refused=true;}
    Need(refused,"expected-refusal");
  }
  public static void Main() {
    EasyedaRatline209Protocol.VerifySmoke();
    var fields=new System.Collections.Hashtable(System.StringComparer.Ordinal);
${cases.join("\n")}
    fields.Clear();fields.Add("sessionId","s");
    foreach(string role in new string[]{null,"","PCB","foreign"})Refused(1,role,"resume","Debugger.resume",fields);
    foreach(string phase in new string[]{null,"","Resume","foreign"})Refused(1,"pcb",phase,"Debugger.resume",fields);
    foreach(int id in new int[]{0,-1})Refused(id,"pcb","resume","Debugger.resume",fields);
    Refused(1,"pcb","resume","Debugger.resume",null);
    foreach(object handle in new object[]{null,1,"","bad\\n",new string('s',129)}) {
      fields["sessionId"]=handle;Refused(1,"pcb","resume","Debugger.resume",fields);
    }
    fields["sessionId"]="s";fields.Add("objectId","o");fields.Add("argument0","a");
    foreach(object handle in new object[]{null,1,"","bad\\n",new string('o',257)}) {
      fields["objectId"]=handle;Refused(1,"pcb","relation-same","Runtime.callFunctionOn",fields);
    }
    fields["objectId"]="__ratline209_argument0__";fields["argument0"]="original";
    string collision=EasyedaRatline209Protocol.Encode(2147483647,"worker","relation-same","Runtime.callFunctionOn",fields);
    Need(collision.Contains(@"""objectId"":""__ratline209_argument0__""") && collision.Contains(@"""objectId"":""original"""),"placeholder");
    var insensitive=new System.Collections.Hashtable(System.StringComparer.OrdinalIgnoreCase);insensitive.Add("SessionId","s");
    Refused(1,"worker","resume","Debugger.resume",insensitive);
    System.Console.WriteLine("ratline-native-parity:${String(cases.length)}");
  }
}`;
}
