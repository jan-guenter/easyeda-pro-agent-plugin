/** The closed inverse driver cannot select a schematic birth. Omit that
 * runtime and keep throwing compatibility entries for shared main dispatch. */
const blocks = [
  ["// BEGIN ORIGINAL SCHEMATIC ACTION REFUSAL GUARDS", "// END ORIGINAL SCHEMATIC ACTION REFUSAL GUARDS"],
  ["// BEGIN GENERATED SCHEMATIC ORIGINAL ACTION OBSERVER", "// END GENERATED SCHEMATIC ORIGINAL ACTION OBSERVER"],
  ["// BEGIN GENERATED SCHEMATIC ORIGINAL ACCESSOR OBSERVER", "// END GENERATED SCHEMATIC ORIGINAL ACCESSOR OBSERVER"],
  ["// BEGIN GENERATED SCHEMATIC ORIGINAL CLOCK OBSERVER", "// END GENERATED SCHEMATIC ORIGINAL CLOCK OBSERVER"],
  ["// BEGIN GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", "// END GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH"],
] as const;
const closed = `// BEGIN CLOSED INVERSE SCHEMATIC ENTRIES
public sealed partial class EasyedaDiagnosticOwner {
readonly bool schematicDisplayWrite209=false;
bool schematicDisplayAbort,schematicProducerModeRequested,schematicStructureBootstrapResumed,schematicWorkerInstrumentRemoved,schematicWorkerSourceRead;
int schematicWorkerStage;string schematicWorkerSession,schematicWorkerProjectScript;
readonly bool[] schematicDisplayStages=new bool[7];
readonly System.Collections.Generic.HashSet<string> schematicStructurePoints=new System.Collections.Generic.HashSet<string>();
public static EasyedaDiagnosticOwner CreateSchematicDisplayWrite209(){throw Error("inverse-schematic-birth-closed");}
public void AdmitSchematicDisplayAction(string action){throw Error("inverse-schematic-action-closed");}
void SchematicDisplayDiscovery(string method,string session){throw Error("inverse-schematic-discovery-closed");}
void SendSchematicDisplayMain(int id,string phase,string method,System.Collections.IDictionary fields){throw Error("inverse-schematic-main-closed");}
}
// END CLOSED INVERSE SCHEMATIC ENTRIES`;
const shared = ["SHARED STRUCTURE TRANSPORT", "SHARED PRODUCER GUARDS", "SHARED PRODUCER OBSERVATION", "GENERATED INITIAL CACHE", "GENERATED INITIAL SYNC", "GENERATED PERIODIC SYNC"] as const;
function sharedCode(source: string): string {
  const markers = [...source.matchAll(/^\/\/ BEGIN (.+)$/gmu)].map(match => match[1]);
  const expected = ["GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH", "GENERATED SCHEMATIC ORIGINAL WORKER OBSERVER", ...shared.map(name => `ORIGINAL ${name}`)];
  if (markers.length !== expected.length || markers.some((name, index) => name !== expected[index])) { throw new Error("INVERSE_SCHEMATIC_NESTED_ROSTER"); }
  return shared.map(name => {
    const begin = `// BEGIN ORIGINAL ${name}`, end = `// END ORIGINAL ${name}`;
    const first = source.indexOf(begin), last = source.indexOf(end);
    if (first === -1 || last < first || source.includes(begin, first + begin.length) || source.includes(end, last + end.length)) { throw new Error("INVERSE_SCHEMATIC_SHARED_ROSTER"); }
    return source.slice(first, last + end.length);
  }).join("\n");
}
const actions = ["schematic-display-action-guard-bind", "schematic-display-action-guard", "schematic-display-action", "schematic-display-accessor", "schematic-display-clock-bind", "schematic-display-clock", "schematic-display-worker-prepare", "schematic-display-worker-bind", "schematic-display-worker-parent", "schematic-display-worker", "schematic-display-native", "schematic-display-abort"] as const;
const smokes = ["[EasyedaDiagnosticOwner]::VerifySchematicActionGuardSmoke()", "[EasyedaSchematicDisplayActionProtocol]::VerifySmoke()", "[EasyedaSchematicDisplayAccessorProtocol]::VerifySmoke()", "[EasyedaDiagnosticOwner]::VerifySchematicDisplayClockSmoke()", "[EasyedaDiagnosticOwner]::VerifySchematicDisplaySmoke()", "[EasyedaDiagnosticOwner]::VerifySchematicDisplayWorkerSmoke()"] as const;
export function projectCurrentFootprintInverseSchematicRuntime(input: string): string {
  let source = input;
  for (const [begin, end] of blocks) {
    const first = source.indexOf(begin), last = source.indexOf(end);
    if (first === -1 || last < first || source.includes(begin, first + begin.length) || source.includes(end, last + end.length)) { throw new Error("INVERSE_SCHEMATIC_BLOCK_ROSTER"); }
    const replacement = begin === "// BEGIN GENERATED ORIGINAL SCHEMATIC DISPLAY MAIN BIRTH" ? `${begin}\n${closed}\n${sharedCode(source.slice(first, last))}\n${end}` : "";
    source = source.slice(0, first) + replacement + source.slice(last + end.length);
  }
  for (const action of actions) {
    const begin = `        '${action}' {\n`, first = source.indexOf(begin);
    if (first === -1 || source.includes(begin, first + begin.length)) { throw new Error("INVERSE_SCHEMATIC_DISPATCH_ROSTER"); }
    const last = source.indexOf("\n        '", first + begin.length);
    if (last < first || !source.slice(first, last).endsWith("        }")) { throw new Error("INVERSE_SCHEMATIC_DISPATCH_BOUNDARY"); }
    source = source.slice(0, first) + source.slice(last + 1);
  }
  for (const smoke of smokes) {
    const line = `    ${smoke}\n`;
    if (source.split(line).length !== 2) { throw new Error("INVERSE_SCHEMATIC_SMOKE_ROSTER"); }
    source = source.replace(line, "");
  }
  return source;
}
